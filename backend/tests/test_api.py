import pytest
from fastapi.testclient import TestClient
from main import app

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

def test_dashboard_summary():
    res = client.get("/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_patients" in data
    assert "abnormal_reports" in data