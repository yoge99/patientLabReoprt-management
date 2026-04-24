from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import Base, engine
from routers import patients, reports, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PSS Lab Report API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_methods=["*"], allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(patients.router)
app.include_router(reports.router)
app.include_router(dashboard.router)

@app.get("/")
def root(): return {"message": "PSS Lab Report API is running"}