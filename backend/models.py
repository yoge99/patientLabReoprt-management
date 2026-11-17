from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import uuid, datetime, enum

class GenderEnum(str, enum.Enum):
    Male = "Male"
    Female = "Female"
    Other = "Other"

class ReportTypeEnum(str, enum.Enum):
    Blood_Test = "Blood Test"
    Urine_Test = "Urine Test"
    Lipid_Panel = "Lipid Panel"
    Custom = "Custom"

class StatusEnum(str, enum.Enum):
    Normal = "Normal"
    Abnormal = "Abnormal"
    Pending = "Pending"

class Patient(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True, default=lambda: f"PAT-{uuid.uuid4().hex[:6].upper()}")
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(Enum(GenderEnum), nullable=False)
    contact = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    reports = relationship("LabReport", back_populates="patient", cascade="all, delete")

class LabReport(Base):
    __tablename__ = "reports"
    id = Column(String, primary_key=True, default=lambda: f"RPT-{uuid.uuid4().hex[:6].upper()}")
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    report_type = Column(Enum(ReportTypeEnum), nullable=False)
    report_date = Column(Date, nullable=False)
    result_value = Column(String, nullable=True)
    unit = Column(String, nullable=True)
    ref_min = Column(Float, nullable=True)
    ref_max = Column(Float, nullable=True)
    status = Column(Enum(StatusEnum), default=StatusEnum.Pending)
    file_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    patient = relationship("Patient", back_populates="reports")
    items = relationship("ReportItem", back_populates="report", cascade="all, delete-orphan")

    @property
    def patient_name(self):
        return self.patient.name if self.patient else "Unknown"

class ReportItem(Base):
    __tablename__ = "report_items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(String, ForeignKey("reports.id"), nullable=False)
    name = Column(String, nullable=False)
    result_value = Column(String, nullable=False)
    unit = Column(String, nullable=True, default="")
    ref_min = Column(Float, nullable=True)
    ref_max = Column(Float, nullable=True)
    status = Column(String, default="Normal")
    report = relationship("LabReport", back_populates="items")
