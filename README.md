# Conversational AI for Instant Business Intelligence Dashboards

Transform natural language into interactive, data-rich dashboards in real-time.                                                

This project empowers non-technical executives to explore business data without writing SQL or navigating complex BI tools.

## 🎯 Overview

In today's fast-paced business environment, data-driven decisions are crucial, but accessing insights often requires technical expertise. This solution bridges the gap by allowing users to ask questions in plain English and receive fully functional, interactive dashboards instantly.

### Key Features
- **Natural Language Processing**: Convert plain English queries into SQL using Google's Gemini AI
- **Smart Visualization**: Automatically selects the most appropriate chart types based on data patterns
- **Real-time Dashboard Generation**: Interactive dashboards rendered instantly
- **Multi-query Support**: Handle progressively complex queries from simple aggregations to multi-dimensional analysis
- **Query History**: Track and reuse previous queries

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌─────────────┐
│   Next.js   │ ───▶ │    FastAPI   │ ───▶│    Gemini   │ ───▶ │ PostgreSQL  │
│  Frontend   │ ◀─── │   Backend    │ ◀───│      AI     │ ◀─── │  Database   │
└─────────────┘      └──────────────┘      └─────────────┘      └─────────────┘
       │                      │                       │
       ▼                      ▼                       ▼
┌─────────────┐      ┌──────────────┐      ┌───────────────────────────┐
│   Framer    │      │    Pandas    │      │     Sample Sales Data     │
│   Motion    │      │  Processing  │      │  - 10,000+ transactions   │
└─────────────┘      └──────────────┘      │  - 5 product categories   │
                                           │  - 4 regions              │
                                           └───────────────────────────┘
```


## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
- Google Gemini API Key

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/kartikkes02/GFG_Hackfest.git
cd GFG_Hackfest
## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
- Google Gemini API Key

```

---

2. **⚙️ Backend Setup**

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your **database credentials and Gemini API key**.

---

3. **🗄️ Database Setup**

Create PostgreSQL database

```bash
createdb bi_dashboard
```

Run initialization script

```bash
psql -d bi_dashboard -f database/init.sql
```

---

4. **💻 Frontend Setup**

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Add your **backend API URL** inside `.env.local`.

---

5. **▶️ Run the Application**

### Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm run dev
```

Visit:

```
http://localhost:3000
```

to access the application.

---

# 💡 Usage Examples

## Query 1: Simple Aggregation

**User Input**

```
Show me total sales by product category for the last month
```

**Output**

Bar chart with sales figures for each category.

---

## Query 2: Time-series Analysis

**User Input**

```
Display monthly revenue trend for Q3 2024, broken down by region
```

**Output**

Line chart with multiple series showing regional performance.

---

## Query 3: Complex Multi-dimensional Analysis

**User Input**

```
Compare profit margins across product categories and regions, highlight top 3 performing products in Electronics
```

**Output Dashboard**

- Heat map of profit margins by category and region
- Top products table
- Performance comparison charts

---

# 🛠️ Tech Stack

## Frontend

- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Recharts / D3.js
- **Icons:** Lucide Icons
- **State Management:** React Hooks + Context API

---

## Backend

- **API Framework:** FastAPI (Python)
- **Database ORM:** SQLAlchemy
- **Data Processing:** Pandas, NumPy
- **AI Integration:** Google Gemini API
- **SQL Generation:** LLM-powered text-to-SQL

---

## Database

- **Primary Database:** PostgreSQL
- **Data Warehouse Schema:** Star schema optimized for analytics
- **Sample Dataset:** 10,000+ sales transactions

---

# 📁 Project Structure

```
GFG_Hackfest/
│
├── frontend/
│   ├── components/
│   │   ├── ChatInterface.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ChartRenderer.jsx
│   │   └── QueryHistory.jsx
│   ├── pages/
│   │   ├── index.js
│   │   └── api/
│   ├── styles/
│   │   └── globals.css
│   └── utils/
│       └── api.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── query.py
│   │   │   └── data.py
│   │   └── services/
│   │       ├── llm_service.py
│   │       ├── query_processor.py
│   │       └── chart_generator.py
│   ├── models/
│   │   ├── database.py
│   │   └── schemas.py
│   └── utils/
│       └── data_processor.py
│
├── database/
│   ├── init.sql
│   └── sample_data.sql
│
├── tests/
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

# 🔧 Configuration

## Backend `.env`

```
DATABASE_URL=postgresql://user:password@localhost:5432/bi_dashboard
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_secret_key
DEBUG=True
```

---

## Frontend `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

# 📊 Sample Dashboard Outputs

### Dashboard Components

- **Natural Language Input** – Chat-like interface for query entry
- **Query Interpretation** – Shows generated SQL and chart types
- **Interactive Charts** – Zoom, pan, and hover interactions
- **Data Table** – Raw data for verification
- **Query History** – Access previously generated dashboards
- **Export Options** – Download charts as PNG or data as CSV

---

# 🧪 Testing Queries

## Progressive Complexity Examples

### Basic Query

```
Show total sales by region
```

### Time-based Query

```
What were the monthly sales trends for Q2 2024?
```

### Comparative Analysis

```
Compare profit margins between Electronics and Clothing categories across all regions for the last 6 months
```

### Predictive Query

```
Based on Q1 2024 data, forecast next quarter's top 5 products
```

---

# 🚢 Deployment

## Docker Deployment

```bash
docker-compose up --build
```

---

## Cloud Deployment

- **Frontend:** Vercel / Netlify  
- **Backend:** Render / Heroku / AWS EC2  
- **Database:** AWS RDS / Google Cloud SQL

---

# 🤝 Contributing

Contributions are welcome. Please submit a pull request or open an issue.

---

# 📝 License

This project is licensed under the **MIT License**.

---

# 🙏 Acknowledgments

- Google Gemini API for natural language processing
- FastAPI community for excellent documentation
- Next.js team for the React framework

---

# 📧 Contact

For questions or support, open an issue or contact:

```
kartikeyakesarwani@example.com
```

---

Built with ❤️ for non-technical executives who deserve instant access to their data.
