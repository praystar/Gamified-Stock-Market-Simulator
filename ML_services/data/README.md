# data/

## 📥 Place your downloaded Kaggle datasets here.

### Download instructions:

1. Visit: https://www.kaggle.com/datasets/rohanrao/nifty50-stock-market-data
2. Sign in with your free Kaggle account
3. Click the Download button
4. Unzip the file — you'll get individual CSVs like:
   - RELIANCE.csv
   - TCS.csv
   - INFY.csv
   - HDFCBANK.csv
   - ... (50 total stocks)

5. Place all CSV files directly in this `data/` folder

### CSV Format Expected:
```
Date,Symbol,Series,Prev Close,Open,High,Low,Close,VWAP,Volume,Turnover,...
2000-01-03,RELIANCE,EQ,189.45,191.0,192.75,185.5,190.25,...
```

### This folder is in .gitignore
CSV files won't be committed to git (they're large).
Each team member should download and place them locally.
