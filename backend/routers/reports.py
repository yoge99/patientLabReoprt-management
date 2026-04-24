from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from database import get_db
from models import LabReport
from schemas.report import ReportOut, ReportUpdate
from services.report_service import compute_status
from typing import Optional, List
import shutil, os, uuid
from datetime import date

router = APIRouter(prefix="/reports", tags=["reports"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=ReportOut)
async def create_report(
    patient_id: str = Form(...),
    report_type: str = Form(...),
    report_date: date = Form(...),
    result_value: float = Form(...),
    unit: str = Form(...),
    ref_min: float = Form(...),
    ref_max: float = Form(...),
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

    status = compute_status(result_value, ref_min, ref_max)
    report = LabReport(
        patient_id=patient_id, report_type=report_type,
        report_date=report_date, result_value=result_value,
        unit=unit, ref_min=ref_min, ref_max=ref_max,
        status=status, file_path=file_path
    )
    db.add(report); db.commit(); db.refresh(report)
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
        setattr(r, k, v)
    r.status = compute_status(r.result_value, r.ref_min, r.ref_max)
    db.commit(); db.refresh(r)
    return r

@router.delete("/{report_id}")
def delete_report(report_id: str, db: Session = Depends(get_db)):
    r = db.query(LabReport).filter(LabReport.id == report_id).first()
    if not r: raise HTTPException(404, "Report not found")
    db.delete(r); db.commit()
    return {"message": "Deleted"}