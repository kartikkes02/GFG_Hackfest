# AI Dashboard Generator — Backend

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Fill in DATABASE_URL and GEMINI_API_KEY in .env
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload-csv` | Upload a CSV file |
| GET | `/api/datasets` | List all uploaded datasets |
| GET | `/api/datasets/{id}` | Get dataset metadata + schema |
| POST | `/api/chat` | Run AI pipeline, get dashboard JSON |
| GET | `/api/sessions/{id}` | View conversation history |
| DELETE | `/api/sessions/{id}` | Clear session memory |
| GET | `/health` | Health check |

## Chat Request Example

```json
POST /api/chat
{
  "session_id": "user-abc-123",
  "dataset_id": "uuid-of-uploaded-dataset",
  "prompt": "Show monthly revenue by region"
}
```

## Chat Response

```json
{
  "session_id": "user-abc-123",
  "prompt": "Show monthly revenue by region",
  "sql": "SELECT DATE_TRUNC('month', date) AS month, region, SUM(revenue) AS total_revenue FROM sales_data GROUP BY month, region",
  "row_count": 36,
  "dashboard": {
    "title": "Show monthly revenue by region",
    "charts": [...],
    "data": [...]
  }
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
