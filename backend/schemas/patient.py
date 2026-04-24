from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    contact: str

class PatientOut(PatientCreate):
    id: str
    created_at: datetime
    class Config: from_attributes = True