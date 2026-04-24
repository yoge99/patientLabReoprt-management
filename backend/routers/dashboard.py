from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import LabReport, Patient
from datetime import date

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    today = date.today()
    return {
        "total_patients": db.query(Patient).count(),
        "total_reports": db.query(LabReport).count(),
        "abnormal_reports": db.query(LabReport).filter(LabReport.status == "Abnormal").count(),
        "reports_today": db.query(LabReport).filter(LabReport.report_date == today).count(),
    }

@router.get("/recent-reports")
def recent_reports(status: str = None, db: Session = Depends(get_db)):
    q = db.query(LabReport)
    if status: q = q.filter(LabReport.status == status)
    reports = q.order_by(LabReport.created_at.desc()).limit(10).all()
    result = []
    for r in reports:
        result.append({
            "id": r.id, "patient_name": r.patient.name,
            "report_type": r.report_type, "report_date": str(r.report_date),
            "status": r.status
        })
    return result