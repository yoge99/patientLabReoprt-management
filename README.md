# PSS Lab Report Management System

Patient lab report management system built with React + FastAPI for PSS Automote assignment.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Axios
- **Backend**: FastAPI, SQLAlchemy, SQLite, Pydantic, Uvicorn

## Setup & Run

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# API runs at http://localhost:8000
# Swagger UI at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env        # set VITE_API_URL if needed
npm run dev
# App runs at http://localhost:5173
```

### Run Tests
```bash
cd backend
pytest tests/ -v
```

## Environment Variables
| Variable        | Location  | Default                    |
|-----------------|-----------|----------------------------|
| `VITE_API_URL`  | frontend  | `http://localhost:8000`    |
| `DATABASE_URL`  | backend   | `sqlite:///./lab_reports.db` |

## API Endpoints
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /patients/                      | Create patient           |
| GET    | /patients/                      | List / search patients   |
| GET    | /patients/{id}                  | Get patient profile      |
| DELETE | /patients/{id}                  | Delete patient           |
| POST   | /reports/                       | Upload report + file     |
| GET    | /reports/                       | Filter reports           |
| PATCH  | /reports/{id}                   | Edit report              |
| DELETE | /reports/{id}                   | Delete report            |
| GET    | /dashboard/summary              | Summary counts           |
| GET    | /dashboard/recent-reports       | Last 10 reports          |

## AI Usage Log

### Tools Used
- **Claude (claude.ai)** — primary tool throughout development

### What I used AI for
- **Initial architecture**: Prompted for the folder structure and separation of concerns (routers / schemas / services). Accepted the structure with minor adjustments.
- **FastAPI router scaffolding**: Generated all three routers. Manually fixed the `multipart/form-data` handling for file upload since the AI initially used a JSON body for the report endpoint.
- **SQLAlchemy models**: Generated Patient and LabReport models. Overrode the cascade delete behavior — AI initially didn't include `cascade="all, delete"` on the relationship.
- **Status auto-compute logic**: Prompted for boundary behavior. AI correctly identified that result == ref_min or result == ref_max should be Normal (not Abnormal). Confirmed and kept.
- **React pages**: Generated Dashboard, PatientList, PatientDetail pages. Manually refactored the filter state into a single `filters` object rather than separate `useState` calls.
- **Form validation**: AI generated validation functions. Added the ref_min < ref_max cross-field validation manually.
- **README template**: Generated the initial structure, then filled in real values.

### What I fixed / overrode manually
- File path handling: AI used `os.path.join` with forward slashes; tested and confirmed it works cross-platform.
- CORS origin: Changed from wildcard `*` to specific `http://localhost:5173` for better practice.
- Tailwind classes for StatusBadge: AI used hardcoded hex colors initially; replaced with Tailwind semantic classes stored in constants.
- Test isolation: AI-generated tests shared DB state; added `TestClient` per test and used a separate test DB URL.

## Architectural Decisions
- **SQLite over PostgreSQL**: No infra setup needed for a 3-day assignment. Schema is migration-ready.
- **Context API over Zustand**: Sufficient for the scope; Zustand would be added for more complex state.
- **No auth middleware yet**: Code structured with `Depends(get_db)` pattern so JWT middleware slots in cleanly later.
- **File storage local**: Stored under `/uploads`, served as static files. Cloud storage (S3) would replace this in production.
