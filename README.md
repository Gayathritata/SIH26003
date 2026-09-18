# MINDMATE NER

## AI-Powered Cognitive Companion for Elderly Dementia Care (North Eastern Region of India)

> **Tagline**: *"An AI-powered cognitive companion that adapts to every elderly user, works offline, supports voice and regional languages, and keeps caregivers connected."*

---

> [!IMPORTANT]
> **Medical Disclaimer**: MINDMATE NER is a supportive cognitive assistance and engagement prototype designed for caregivers and elderly users. It is **NOT** a medical diagnostic tool and does **NOT** diagnose dementia, Alzheimer's disease, or any neurological disorder. All metrics are presented strictly as **Cognitive Performance Indicators** and activity trends.

---

## 1. Problem Statement & Core Innovation

### Problem Statement
The North Eastern Region (NER) of India faces distinct healthcare accessibility challenges in remote and rural areas. Elderly individuals experiencing age-related cognitive decline or memory loss often lack continuous access to specialized neurological care, structured cognitive exercises, and real-time caregiver monitoring.

### Core Innovation: Adaptive Cognitive Engine
Unlike static memory game apps, MINDMATE NER features an **AI-driven Adaptive Cognitive Engine**. Powered by a trained **XGBoost Classifier** model, the engine dynamically analyzes session performance metrics (accuracy, reaction time, mistake count, previous level, mood) to recommend an optimized difficulty level for the next session along with **Explainable AI (XAI)** rationale.

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Mobile Frontend** | React Native / Vite Mobile-First PWA, TypeScript, Web Speech API (TTS/STT), High-Contrast Elderly UI System |
| **Authentication** | Firebase Authentication & Firebase Admin SDK Token Verification (with Hackathon Demo Fallback) |
| **Backend API** | Node.js, Express, TypeScript, Mongoose ODM |
| **Database** | MongoDB (`users`, `patientProfiles`, `caregiverPatients`, `gameSessions`, `gameContent`, `reminders`, `moodLogs`, `alerts`) |
| **AI / ML Service** | Python, FastAPI, XGBoost, Scikit-learn, Pandas, NumPy, Joblib |
| **Offline Engine** | Local Storage / SQLite Sync Queue with Idempotent `/sync` payload processing |
| **Localization** | Multilingual Translation Engine: English (`en`), Hindi (`hi`), Assamese (`as`) |

---

## 3. System Architecture

```mermaid
graph TD
    subgraph Mobile Frontend [React Native / Vite App]
        EUI[Elderly High-Contrast UI]
        VA[Voice Assistant Engine TTS/STT]
        CD[Caregiver Dashboard]
        Queue[(Offline Sync Queue)]
        SyncEngine[Sync Manager]
    end

    subgraph Auth [Authentication]
        FA[Firebase Auth Engine]
    end

    subgraph NodeBackend [Node.js Express Backend :5000]
        MW[Firebase Token Verification]
        PatientAPI[Patient & Dashboard APIs]
        GameAPI[Game Session Engine]
        SyncAPI[Idempotent Sync Engine /sync]
        AlertAPI[Performance Alert Engine]
    end

    subgraph MLService [Python FastAPI Service :8000]
        FastAPI[FastAPI Router]
        XGBoostModel[XGBoost Adaptive Classifier]
        RuleEngine[Explainable Rule Fallback]
    end

    subgraph Database
        MongoDB[(MongoDB Database)]
    end

    EUI --> Queue
    SyncEngine -->|Network Restored| SyncAPI
    EUI -->|Bearer Token| MW
    CD -->|Caregiver Authorization| MW
    MW --> PatientAPI
    PatientAPI --> MongoDB
    GameAPI -->|axios POST| MLService
    FastAPI --> XGBoostModel
    XGBoostModel --> RuleEngine
    SyncAPI --> MongoDB
```

---

## 4. Installed Monorepo Structure

```
mindmate-ner/
├── mobile/                   # React Native / Vite Mobile-First Frontend
│   ├── src/
│   │   ├── components/       # Memory, Pattern, Routine & Object Rec Games, Caregiver Dashboard
│   │   ├── services/         # API Client, Voice Service (TTS/STT), Offline Sync Queue
│   │   ├── i18n/             # English, Hindi, Assamese Translation Dictionaries
│   │   ├── App.tsx           # Main Mobile Shell & Navigation
│   │   └── index.css         # High-Contrast Elderly Design System
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Node.js Express Backend
│   ├── src/
│   │   ├── config/           # Database & Firebase Admin Setup
│   │   ├── models/           # 8 Mongoose Schemas
│   │   ├── middleware/       # Firebase Auth & Role Authorization
│   │   ├── controllers/      # Auth, Patient, Game, Reminder, Mood, Sync, Dashboard
│   │   ├── services/         # ML Client, Analytics Calculator, Alert Engine
│   │   ├── utils/            # Seed script for "Asha Devi" & "Demo Caregiver"
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── ml-service/               # Python FastAPI AI/ML Service
│   ├── app/
│   │   ├── main.py           # FastAPI Application Endpoints
│   │   ├── services.py       # ML Model Container & Analytics Engine
│   │   ├── fallback.py       # Deterministic Rule Fallback & Explainable AI
│   │   └── schemas.py        # Pydantic Input/Output Schemas
│   ├── scripts/
│   │   ├── generate_dataset.py # Synthetic 5,500 record dataset generator
│   │   └── train_model.py    # XGBoost vs Random Forest Training Script
│   ├── models/               # Exported adaptive_model.pkl binary
│   └── requirements.txt
│
└── README.md
```

---

## 5. ML Model Metrics & Dataset Generation

- **Dataset**: 5,500 synthetic session records (`synthetic_cognitive_dataset.csv`).
- **Model Comparison**:
  - **Random Forest**: Accuracy `93.55%` | F1 Macro `0.9358`
  - **XGBoost Classifier (Winner)**: Accuracy `93.91%` | F1 Macro `0.9392`
- **Model Export**: Saved as `ml-service/models/adaptive_model.pkl`.

---

## 6. Quick Start & Startup Commands

### 1. Start Python FastAPI ML Service (Port 8000)
```bash
cd ml-service
python -m pip install -r requirements.txt
python scripts/generate_dataset.py
python scripts/train_model.py
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Start Node.js Express Backend (Port 5000)
```bash
cd backend
npm install
npm run seed   # Seeds "Asha Devi" & "Demo Caregiver" demo data
npx ts-node src/server.ts
```

### 3. Start Mobile Application (Port 3000)
```bash
cd mobile
npm install
npx vite --host --port 3000
```

---

## 7. 5-Minute Hackathon Demo Script

1. **0:00 - 0:30 (Introduction & Problem Statement)**:
   - Introduce MINDMATE NER as an offline-capable, AI-powered cognitive companion built specifically for elderly users in North Eastern India.

2. **0:30 - 1:15 (Elderly Experience & Multilingual Voice)**:
   - Open app at `http://localhost:3000`. Switch language to Assamese (`AS`) or Hindi (`HI`).
   - Hear voice greeting: *"Good Morning Asha Devi"*. Select mood check-in (😊 *Happy*).

3. **1:15 - 2:00 (Interactive Cognitive Games & AI Difficulty Adaptation)**:
   - Click **Memory Match** or **Object Recognition** (featuring Jhapi, Eri Silk, Kaziranga Rhino).
   - Complete session with 95% accuracy and fast reaction time.
   - View **Game Result Modal**: Displays accuracy (95%), reaction time (2.8s), **AI Recommended Level 4**, and Explainable AI rationale: *"Level raised from 3 to 4 for cognitive stimulation."*

4. **2:00 - 2:40 (Offline Capability & Idempotent Synchronization)**:
   - Toggle **"Simulate Offline Mode"**. Play activity offline -> `"Progress saved locally in offline mode."`
   - Click **"Go Online"** -> Click **"Sync Now"** -> Receive notification: `"3 records synchronized successfully."`

5. **2:40 - 4:10 (Caregiver Dashboard & Performance Drop Alerts)**:
   - Click **Caregiver Dashboard** -> Inspect assigned patient *"Asha Devi"* (74 yrs).
   - View real-time **Cognitive Performance Indicators** (Memory: 85%, Attention: 90%, Overall Index: 82%).
   - Review actionable **Performance Change Alert** banner triggered when daily scores deviate significantly from baseline.

6. **4:10 - 5:00 (Conclusion)**:
   - Highlight offline resilience, regional cultural accessibility, non-diagnostic caregiver alerts, and end-to-end hackathon implementation.

---

## 8. Hackathon Quality Audit Checklist

| Requirement | Implemented | Status | Module / Location |
| :--- | :---: | :---: | :--- |
| **Adaptive Cognitive Engine** | ✅ | Working | `ml-service/app/services.py`, XGBoost classifier |
| **Memory Match Game** | ✅ | Working | `mobile/src/components/games/MemoryMatchGame.tsx` |
| **Pattern Recognition Game** | ✅ | Working | `mobile/src/components/games/PatternRecognitionGame.tsx` |
| **Daily Routine Recall Game** | ✅ | Working | `mobile/src/components/games/RoutineRecallGame.tsx` |
| **Object Recognition Game** | ✅ | Working | `mobile/src/components/games/ObjectRecognitionGame.tsx` |
| **NE India Cultural Content** | ✅ | Working | `backend/src/utils/seed.ts` (Jhapi, Eri Silk, Rhino, Loktak Lake) |
| **Multilingual (EN, HI, AS)** | ✅ | Working | `mobile/src/i18n/translations.ts` |
| **Voice Assistant System** | ✅ | Working | `mobile/src/services/voiceService.ts` (Web Speech TTS/STT) |
| **Offline-First Storage Queue** | ✅ | Working | `mobile/src/services/offlineService.ts` |
| **Idempotent Sync Engine** | ✅ | Working | `backend/src/controllers/syncController.ts` (`/sync`) |
| **Medication & Hydration Reminders** | ✅ | Working | `backend/src/controllers/reminderController.ts` |
| **Mood & Engagement Logger** | ✅ | Working | `backend/src/controllers/moodController.ts` |
| **Caregiver Dashboard** | ✅ | Working | `mobile/src/components/CaregiverDashboard.tsx` |
| **Cognitive Indicators (Non-Diagnostic)** | ✅ | Working | `backend/src/services/analyticsService.ts` |
| **Performance Change Alert Engine** | ✅ | Working | `backend/src/services/alertService.ts` |
| **Firebase Auth & Token Verifier** | ✅ | Working | `backend/src/middleware/authMiddleware.ts` |
| **Elderly High-Contrast UI/UX** | ✅ | Working | `mobile/src/index.css` (20pt+ fonts, 60px+ touch targets) |
