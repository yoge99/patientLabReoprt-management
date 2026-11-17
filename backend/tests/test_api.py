import pytest
from fastapi.testclient import TestClient
from main import app
import json

client = TestClient(app)

def test_create_patient():
    res = client.post("/patients/", json={
        "name": "John Doe", "age": 35,
        "gender": "Male", "contact": "9876543210"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "John Doe"
    assert data["id"].startswith("PAT-")
    return data["id"]

def test_dashboard_summary():
    res = client.get("/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_patients" in data
    assert "abnormal_reports" in data

def test_multi_metric_report():
    # 1. Create a patient
    p_res = client.post("/patients/", json={
        "name": "Jane MultiMetric", "age": 42,
        "gender": "Female", "contact": "5551234567"
    })
    patient_id = p_res.json()["id"]

    # 2. Create multi-metric lipid panel
    items = [
        {"name": "Total Cholesterol", "result_value": "210", "unit": "mg/dL", "ref_min": 125, "ref_max": 200}, # Abnormal
        {"name": "HDL Cholesterol", "result_value": "50", "unit": "mg/dL", "ref_min": 40, "ref_max": 60},      # Normal
        {"name": "Triglycerides", "result_value": "130", "unit": "mg/dL", "ref_min": 50, "ref_max": 150},       # Normal
    ]
    r_res = client.post("/reports/", data={
        "patient_id": patient_id,
        "report_type": "Lipid Panel",
        "report_date": "2026-11-17",
        "items_json": json.dumps(items)
    })
    assert r_res.status_code == 200
    data = r_res.json()
    assert data["status"] == "Abnormal"  # Because Total Cholesterol is 210 > 200
    assert len(data["items"]) == 3
    assert data["items"][0]["status"] == "Abnormal"
    assert data["items"][1]["status"] == "Normal"

def test_qualitative_report():
    p_res = client.post("/patients/", json={
        "name": "Alex Qualitative", "age": 28,
        "gender": "Other", "contact": "5559876543"
    })
    patient_id = p_res.json()["id"]

    # Qualitative positive result
    items = [
        {"name": "Urine Pregnancy Test", "result_value": "Positive", "unit": ""}
    ]
    r_res = client.post("/reports/", data={
        "patient_id": patient_id,
        "report_type": "Urine Test",
        "report_date": "2026-11-17",
        "items_json": json.dumps(items)
    })
    assert r_res.status_code == 200
    data = r_res.json()
    assert data["status"] == "Abnormal"
    assert data["items"][0]["result_value"] == "Positive"
