<<<<<<< HEAD
# SarkarSetu AI
### "No Citizen Left Behind"

An AI-powered citizen welfare platform that connects every eligible citizen to every government scheme, scholarship, pension, and benefit they deserve — before they have to ask.

---

## What It Does

SarkarSetu AI builds a **Citizen Digital Twin** from a 4-minute onboarding form, then runs a multi-agent AI system that:

1. **Discovers** all schemes the citizen qualifies for (15+ pre-seeded central + state schemes)
2. **Detects missed benefits** — schemes the citizen was eligible for months or years ago but never claimed
3. **Guides applications** — document checklists, pre-filled forms, submission tracking
4. **Advocates on rejections** — parses rejection reasons and generates formal appeal letters
5. **Provides government intelligence** — anonymized welfare gap analytics by state/district

---

## Demo

| Credential | Value |
|---|---|
| Demo phone | `+919876543210` |
| OTP | `123456` |
| Demo profile | Meera Patil — 34F, widowed, Maharashtra, BPL |

**Quickest demo path:**
1. Log in → onboarding is pre-seeded, skip to twin creation
2. Watch the twin creation animation + agent stream
3. Dashboard → see the missed benefit banner (₹1L+ unclaimed)
4. Missed Benefits page → emotional reveal
5. Benefit detail → apply → advocate
6. Agent Log → see tool calls
7. `/government/dashboard` → welfare gap table

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Next.js 14                        │
│  Landing | Onboarding | Dashboard | Benefits |       │
│  Missed | Detail | Applications | Advocate | Agents │
│  Government Dashboard                                │
└─────────────────┬────────────────────────────────────┘
                  │ REST + SSE streaming
┌─────────────────▼────────────────────────────────────┐
│                   FastAPI                            │
│  /auth  /citizen  /benefits  /agents  /government   │
└──────┬─────────────────────────────────────┬─────────┘
       │                                     │
┌──────▼──────────┐               ┌──────────▼────────┐
│  4 AI Agents    │               │   PostgreSQL       │
│  (Anthropic)    │               │   (Supabase/       │
│                 │               │    Docker)         │
│ Profile Agent   │               │                   │
│ Discovery Agent │               │  citizens          │
│ Missed Benefits │               │  citizen_profiles  │
│ Advocate Agent  │               │  schemes (15)      │
│                 │               │  citizen_benefits  │
│ LangGraph       │               │  agent_executions  │
│ Orchestrator    │               │  welfare_gaps      │
└─────────────────┘               └───────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI (Python 3.11) |
| AI | Anthropic Claude claude-sonnet-4-6, LangGraph |
| Database | PostgreSQL |
| Streaming | Server-Sent Events (SSE) |
| Auth | JWT (phone + OTP) |
| Deployment | Docker Compose |

---

## Quick Start

### Prerequisites
- Docker + Docker Compose
- Anthropic API key

### 1. Clone and configure

```bash
git clone https://github.com/Tanishwankhede-source/SarkarSetuAI.git
cd SarkarSetu-AI
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 2. Start everything

```bash
docker-compose up --build
```

This starts:
- PostgreSQL on port 5432
- FastAPI backend on port 8000
- Next.js frontend on port 3000

### 3. Seed the database

```bash
# Wait for containers to start, then:
docker-compose exec backend python /app/data/seed.py
```

### 4. Open the app

```
http://localhost:3000
```

---

## Deploying to Netlify

1. Create a new Netlify site from GitHub.
2. Set the repository to `Tanishwankhede-source/SarkarSetuAI`.
3. In Netlify build settings, no extra configuration is needed because `netlify.toml` is included.
4. Add environment variables:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
   - `SECRET_KEY` = any secure string
5. Deploy.

> Note: This repo uses a frontend-only Netlify deploy. The backend still runs locally or via Docker Compose.

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql+asyncpg://sarkarsetu:sarkarsetu_pass@localhost/sarkarsetu"
export ANTHROPIC_API_KEY="sk-ant-..."

uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

### Database setup

```bash
# Start just PostgreSQL
docker-compose up -d db

# Run schema
psql postgresql://sarkarsetu:sarkarsetu_pass@localhost/sarkarsetu < database/init.sql

# Seed data
cd data && python seed.py
```

---

## Project Structure

```
SarkarSetu-AI/
├── frontend/               # Next.js 14 app
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── (auth)/login/   # Phone + OTP login
│   │   ├── (citizen)/      # Citizen-facing app
│   │   │   ├── onboarding/ # 2-step profile form
│   │   │   ├── dashboard/  # Main hub
│   │   │   ├── benefits/   # Discovery + missed + detail
│   │   │   ├── advocate/   # Rejection handling
│   │   │   └── agents/     # Agent activity log
│   │   └── (government)/   # Gov dashboard
│   └── components/         # UI components
│
├── backend/                # FastAPI
│   ├── agents/             # 4 AI agents
│   │   ├── profile_agent.py
│   │   ├── discovery_agent.py
│   │   ├── missed_benefits_agent.py
│   │   └── advocate_agent.py
│   ├── routers/            # API endpoints
│   ├── services/           # Business logic
│   └── main.py
│
├── data/
│   ├── schemes.json        # 15 real government schemes
│   └── seed.py             # Database seeder
│
├── database/
│   └── init.sql            # PostgreSQL schema
│
└── docker-compose.yml      # Full stack setup
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/request-otp` | Send OTP to phone |
| POST | `/api/v1/auth/verify-otp` | Verify OTP, get JWT |
| POST | `/api/v1/citizen/onboard` | Create/update profile |
| GET | `/api/v1/citizen/twin` | Get Digital Twin |
| GET | `/api/v1/citizen/summary` | Dashboard stats |
| GET | `/api/v1/benefits/eligible` | All matched schemes |
| GET | `/api/v1/benefits/missed` | Unclaimed benefits |
| GET | `/api/v1/benefits/:id` | Benefit detail |
| POST | `/api/v1/benefits/:id/apply` | Submit application |
| POST | `/api/v1/agents/run-discovery` | **SSE** — run all agents |
| POST | `/api/v1/agents/advocate` | **SSE** — run advocate |
| GET | `/api/v1/agents/log` | Agent execution history |
| GET | `/api/v1/government/overview` | Welfare KPIs |
| GET | `/api/v1/government/welfare-gaps` | Gap analysis by district |

---

## AI Agents

| Agent | Purpose | Key Tools |
|---|---|---|
| **Profile Agent** | Builds Digital Twin from onboarding | `infer_context`, `update_twin`, `score_confidence` |
| **Discovery Agent** | Matches profile against all schemes | `get_all_schemes`, `evaluate_eligibility`, `save_results` |
| **Missed Benefits Agent** | Finds historically unclaimed benefits | `get_benefit_history`, `calculate_missed_value` |
| **Advocate Agent** | Turns rejections into actionable appeals | `parse_rejection`, `generate_appeal`, `find_alternatives` |

All agents stream reasoning via **Server-Sent Events** — visible in the Agent Activity Log and Twin Creation screens.

---

## Schemes Database

15 real Indian government schemes pre-seeded, including:

- Ayushman Bharat PM-JAY (health cover up to ₹5L/year)
- PM Awas Yojana Urban & Gramin (housing)
- PM Kisan Samman Nidhi (₹6,000/year for farmers)
- NSAP Widow Pension (monthly support)
- PM Scholarship for SC/ST students
- PM MUDRA Yojana (business loans up to ₹10L)
- PMSBY + PMJJBY (accident + life insurance)
- PM Ujjwala Yojana (free LPG connection)
- Atal Pension Yojana
- PM Vishwakarma Yojana (artisan support)

New schemes can be added by inserting into the `schemes` table with proper `eligibility_criteria` JSON.

---

## Hackathon

Built for **Agentic Arena 2026** · Round 2 Submission  
Round 1 PDF: `/docs/round1-submission.pdf`

Design decisions: See `SARKARSETU_REVISED_ARCHITECTURE.md`

---

## License

MIT
