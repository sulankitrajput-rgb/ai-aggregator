# AI Aggregator (Flask)

POST `/ask` with `{"question": "..."}` → returns `{"gemini": "...", "groq": "...", "deepseek": "..."}`.

## Local
```
pip install -r requirements.txt
export GEMINI_API_KEY=... GROQ_API_KEY=... DEEPSEEK_API_KEY=...
python app.py
```

## Deploy to Render
1. Push these files to a GitHub repo.
2. On Render: New → Web Service → connect the repo.
3. Build: `pip install -r requirements.txt`  Start: `gunicorn app:app`
4. Add env vars: `GEMINI_API_KEY`, `GROQ_API_KEY`, `DEEPSEEK_API_KEY`.
5. Deploy. Call `https://<your-service>.onrender.com/ask` from Thunkable.

CORS is enabled for all origins so Thunkable can call it directly.
