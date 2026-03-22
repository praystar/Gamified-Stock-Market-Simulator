# saved_model/

This directory stores trained model artifacts.

## Files (auto-generated after training):
- `lstm_model.keras`  — Trained LSTM model
- `scaler.pkl`        — MinMaxScaler fitted on training data

## How to generate:
```bash
cd ML_services/price_prediction
python train.py --ticker RELIANCE.NS
```

## ⚠️ These files are in .gitignore
They are too large for GitHub (can be 50–200MB).
On Render, they are either:
1. Committed once (small models only), OR
2. Stored on Render's persistent disk, OR
3. Hosted on Hugging Face Hub and downloaded on startup

For this project, we recommend committing after training once locally.
