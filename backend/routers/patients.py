from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Patient
from schemas.patient import PatientCreate, PatientOut
from typing import List, Optional

router = APIRouter(prefix="/patients", tags=["patients"])

@router.post("/", response_model=PatientOut)
def create_patient(data: PatientCreate, db: Session = Depends(get_db)):
    patient = Patient(**data.model_dump())
    db.add(patient); db.commit(); db.refresh(patient)
    return patient

@router.get("/", response_model=List[PatientOut])
def list_patients(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    q = db.query(Patient)
    if search:
        q = q.filter(Patient.name.ilike(f"%{search}%") | Patient.id.ilike(f"%{search}%"))
    return q.all()

@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p: raise HTTPException(404, "Patient not found")
    return p

@router.delete("/{patient_id}")
def delete_patient(patient_id: str, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p: raise HTTPException(404, "Patient not found")
    db.delete(p); db.commit()
    return {"message": "Deleted"}