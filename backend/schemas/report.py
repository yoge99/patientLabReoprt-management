from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ReportCreate(BaseModel):
    patient_id: str
    report_type: str
    report_date: date
    result_value: float
    unit: str
    ref_min: float
    ref_max: float

class ReportUpdate(BaseModel):
    report_type: Optional[str] = None
    report_date: Optional[date] = None
    result_value: Optional[float] = None
    unit: Optional[str] = None
    ref_min: Optional[float] = None
    ref_max: Optional[float] = None

class ReportOut(ReportCreate):
    id: str
    status: str
    file_path: Optional[str]
    created_at: datetime
    class Config: from_attributes = True