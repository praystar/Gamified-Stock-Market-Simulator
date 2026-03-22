# GamzStockz — ML Services

This folder contains the full machine learning backend for the Gamified Stock Market Simulator.

---

## 📁 Folder Structure

```
ML_services/
├── api/                          ← FastAPI server (deploy this on Render)
│   ├── app.py                    ← Main FastAPI entry point
│   ├── routes/
│   │   ├── prediction.py         ← POST /predict/
│   │   └── sentiment.py          ← POST /sentiment/
│   ├── requirements.txt
│   └── .env.example
│
├── price_prediction/             ← LSTM price forecasting model
│   ├── model.py                  ← LSTM architecture
│   ├── preprocess.py             ← Feature engineering + scaling
│   ├── train.py                  ← Run once to train
│   ├── predict.py                ← Called at runtime by FastAPI
│   └── saved_model/              ← .keras + .pkl go here after training
│
├── sentiment_analysis/           ← FinBERT sentiment pipeline
│   ├── model.py                  ← FinBERT inference
│   └── predict.py                ← Full pipeline (news fetch + analysis)
│
├── data/                         ← 📥 PUT YOUR KAGGLE DATASETS HERE
│   └── README.md
│
├── render.yaml                   ← One-click Render deploy config
└── .gitignore
```

---

## 📥 Step 1 — Download the Dataset

### ✅ Recommended: NIFTY-50 Stock Market Data (Kaggle)

1. Go to: https://www.kaggle.com/datasets/rohanrao/nifty50-stock-market-data
2. Click **Download** (you need a free Kaggle account)
3. Unzip the downloaded file
4. Place **all CSV files** inside: `ML_services/data/`

The dataset contains individual CSVs per stock (e.g., `RELIANCE.csv`, `TCS.csv`)  
Each file has columns: `Date, Symbol, Series, Prev Close, Open, High, Low, Close, VWAP, Volume, Turnover, Trades, Deliverable Volume, %Deliverble`

### Alternative Dataset
- **yfinance (no download needed)**: The model can also pull data live from Yahoo Finance.  
  Just run `train.py` with `--ticker RELIANCE.NS` and it auto-downloads.

---

## ⚙️ Step 2 — Set Up Locally

```bash
# 1. Create a Python virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r api/requirements.txt

# 3. Copy env file and add your NewsAPI key
cp api/.env.example api/.env
# Edit api/.env and paste your free key from https://newsapi.org
```

---

## 🏋️ Step 3 — Train the Model

### Option A — Train using yfinance (easiest, no CSV needed)
```bash
cd price_prediction
python train.py --ticker RELIANCE.NS --epochs 80
```

### Option B — Train using Kaggle CSV
```bash
cd price_prediction
python train.py --csv ../data/RELIANCE.csv --ticker RELIANCE --epochs 80
```

This saves two files:
- `price_prediction/saved_model/lstm_model.keras`
- `price_prediction/saved_model/scaler.pkl`

**Training time:** ~10–20 min on CPU, ~2–5 min on GPU (Google Colab recommended).

---

## 🚀 Step 4 — Run Locally

```bash
cd api
uvicorn app:app --reload --port 8000
```

Test endpoints:
```
GET  http://localhost:8000/
GET  http://localhost:8000/health
GET  http://localhost:8000/predict/supported-stocks
POST http://localhost:8000/predict/
     Body: {"ticker": "RELIANCE", "days": 7}

POST http://localhost:8000/sentiment/
     Body: {"ticker": "TCS", "company_name": "Tata Consultancy Services"}

GET  http://localhost:8000/sentiment/demo/INFY
```

Interactive docs: http://localhost:8000/docs

---

## ☁️ Step 5 — Deploy on Render

1. Push your entire repo (with `ML_services/` folder) to GitHub
2. Go to https://render.com → **New Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `ML_services/api`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Instance type:** Free (or Starter for faster cold start)
5. Add environment variable: `NEWS_API_KEY` = your key
6. Click **Deploy**

Your API will be live at: `https://gamzstockz-ml-api.onrender.com`

> ⚠️ **Important:** The trained `.keras` model file must be committed to the repo  
> OR you must re-train on Render startup. For small models (<100MB), just commit  
> the file (remove `saved_model/*.keras` from `.gitignore` temporarily).

---

## 🔌 Step 6 — Connect to Frontend

In your `frontend/` folder, create `.env.production`:

```
VITE_ML_API_URL=https://gamzstockz-ml-api.onrender.com
```

And `.env.local` for development:
```
VITE_ML_API_URL=http://localhost:8000
```

Then in your React app:
```jsx
// In App.jsx — add this route
import MLDashboard from './pages/MLDashboard';

<Route path="/ml-insights" element={<MLDashboard />} />
```

Add a link in your Navbar:
```jsx
<Link to="/ml-insights">🤖 AI Insights</Link>
```

The `StockPrediction` component can also be embedded directly in your existing  
Stocks page or Dashboard:
```jsx
import StockPrediction from '../components/StockPrediction';

// Inside your StocksPage component:
<StockPrediction ticker="RELIANCE" companyName="Reliance Industries" />
```

---

## 📊 API Response Examples

### POST /predict/
```json
{
  "ticker": "RELIANCE",
  "predictions": [
    {"date": "2025-01-06", "price": 1312.45},
    {"date": "2025-01-07", "price": 1318.20},
    ...
  ],
  "last_known_price": 1305.30,
  "change_percent": 2.15,
  "model": "LSTM"
}
```

### POST /sentiment/
```json
{
  "ticker": "TCS",
  "label": "positive",
  "score": 0.81,
  "signal": "BULLISH",
  "headlines_analyzed": 8,
  "top_headlines": [
    {"headline": "TCS wins $2B deal...", "label": "positive", "score": 0.94},
    ...
  ]
}
```

---

## 🆓 Free Tier Limits

| Service  | Limit           | Notes                              |
|----------|-----------------|------------------------------------|
| Render   | 750 hrs/month   | Spins down after 15min inactivity  |
| NewsAPI  | 500 req/day     | Free developer tier                |
| yfinance | Unlimited       | No API key needed                  |

---

## 🧪 Recommended Colab Training

If your laptop is slow, train for free on Google Colab:
1. Upload the Kaggle CSV to Colab
2. Run `train.py` there
3. Download `lstm_model.keras` and `scaler.pkl`
4. Place them in `price_prediction/saved_model/`
5. Commit and push
