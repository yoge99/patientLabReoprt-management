from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from database import get_db
from models import LabReport, ReportItem
from schemas.report import ReportOut, ReportUpdate
from services.report_service import evaluate_item_status, compute_overall_status
from typing import Optional, List
import shutil, os, uuid, json
from datetime import date

router = APIRouter(prefix="/reports", tags=["reports"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=ReportOut)
async def create_report(
    patient_id: str = Form(...),
    report_type: str = Form(...),
    report_date: date = Form(...),
    result_value: Optional[str] = Form(None),
    unit: Optional[str] = Form(None),
    ref_min: Optional[float] = Form(None),
    ref_max: Optional[float] = Form(None),
    items_json: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    file_path = None
    if file:
        ext = file.filename.split(".")[-1]
        fname = f"{uuid.uuid4().hex}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, fname)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

    child_items: List[ReportItem] = []

    # 1. Parse items_json if multiple metrics were provided
    if items_json:
        try:
            parsed = json.loads(items_json)
            for item in parsed:
                val = str(item.get("result_value", "")).strip()
                p_min = float(item["ref_min"]) if item.get("ref_min") not in [None, ""] else None
                p_max = float(item["ref_max"]) if item.get("ref_max") not in [None, ""] else None
                p_unit = str(item.get("unit", "")).strip()
                p_name = str(item.get("name", "Metric")).strip()
                st = evaluate_item_status(val, p_min, p_max)
                child_items.append(
                    ReportItem(
                        name=p_name,
                        result_value=val,
                        unit=p_unit,
                        ref_min=p_min,
                        ref_max=p_max,
                        status=st,
                    )
                )
        except Exception as e:
            print("Failed to parse items_json:", e)

    # 2. If no items_json was provided, fallback to top-level fields
    if not child_items and result_value is not None:
        val = str(result_value).strip()
        st = evaluate_item_status(val, ref_min, ref_max)
        child_items.append(
            ReportItem(
                name=report_type,
                result_value=val,
                unit=unit or "",
                ref_min=ref_min,
                ref_max=ref_max,
                status=st,
            )
        )

    # Calculate overall status
    item_statuses = [it.status for it in child_items]
    overall_status = compute_overall_status(item_statuses) if item_statuses else "Normal"

    # Set representative values for top-level backward compatibility
    rep_val = result_value if result_value is not None else (child_items[0].result_value if child_items else "")
    rep_unit = unit or (child_items[0].unit if child_items else "")
    rep_min = ref_min if ref_min is not None else (child_items[0].ref_min if child_items and child_items[0].ref_min is not None else 0.0)
    rep_max = ref_max if ref_max is not None else (child_items[0].ref_max if child_items and child_items[0].ref_max is not None else 0.0)

    report = LabReport(
        patient_id=patient_id,
        report_type=report_type,
        report_date=report_date,
        result_value=str(rep_val),
        unit=rep_unit,
        ref_min=rep_min,
        ref_max=rep_max,
        status=overall_status,
        file_path=file_path,
        items=child_items,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@router.get("/", response_model=List[ReportOut])
def list_reports(
    patient_id: Optional[str] = None,
    status: Optional[str] = None,
    report_type: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db)
):
    q = db.query(LabReport)
    if patient_id: q = q.filter(LabReport.patient_id == patient_id)
    if status: q = q.filter(LabReport.status == status)
    if report_type: q = q.filter(LabReport.report_type == report_type)
    if date_from: q = q.filter(LabReport.report_date >= date_from)
    if date_to: q = q.filter(LabReport.report_date <= date_to)
    return q.order_by(LabReport.created_at.desc()).all()

@router.patch("/{report_id}", response_model=ReportOut)
def update_report(report_id: str, data: ReportUpdate, db: Session = Depends(get_db)):
    r = db.query(LabReport).filter(LabReport.id == report_id).first()
    if not r: raise HTTPException(404, "Report not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        if k != "items":
            setattr(r, k, v)
    r.status = evaluate_item_status(str(r.result_value), r.ref_min, r.ref_max)
    db.commit()
    db.refresh(r)
    return r

@router.delete("/{report_id}")
def delete_report(report_id: str, db: Session = Depends(get_db)):
    r = db.query(LabReport).filter(LabReport.id == report_id).first()
    if not r: raise HTTPException(404, "Report not found")
    db.delete(r)
    db.commit()
    return {"message": "Deleted"}
