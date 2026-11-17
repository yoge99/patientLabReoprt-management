from pydantic import BaseModel
from typing import Optional, List, Union, Any
from datetime import date, datetime

class ReportItemCreate(BaseModel):
    name: str
    result_value: Union[str, float, int]
    unit: Optional[str] = ""
    ref_min: Optional[float] = None
    ref_max: Optional[float] = None

class ReportItemOut(BaseModel):
    id: Optional[int] = None
    name: str
    result_value: Any
    unit: Optional[str] = ""
    ref_min: Optional[float] = None
    ref_max: Optional[float] = None
    status: str
    class Config: from_attributes = True

class ReportCreate(BaseModel):
    patient_id: str
    report_type: str
    report_date: date
    result_value: Optional[Any] = None
    unit: Optional[str] = None
    ref_min: Optional[float] = None
    ref_max: Optional[float] = None
    items: Optional[List[ReportItemCreate]] = []

class ReportUpdate(BaseModel):
    report_type: Optional[str] = None
    report_date: Optional[date] = None
    result_value: Optional[Any] = None
    unit: Optional[str] = None
    ref_min: Optional[float] = None
    ref_max: Optional[float] = None
    items: Optional[List[ReportItemCreate]] = None

class ReportOut(BaseModel):
    id: str
    patient_id: str
    report_type: str
    report_date: date
    result_value: Optional[Any] = None
    unit: Optional[str] = None
    ref_min: Optional[float] = None
    ref_max: Optional[float] = None
    status: str
    file_path: Optional[str] = None
    created_at: datetime
    patient_name: Optional[str] = None
    items: List[ReportItemOut] = []
    class Config: from_attributes = True
