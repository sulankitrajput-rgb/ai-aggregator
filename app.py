import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")

REQUEST_TIMEOUT = 60


def _cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }


@app.after_request
def add_cors(response):
    for k, v in _cors_headers().items():
        response.headers[k] = v
    return response


def ask_gemini(question: str) -> str:
    if not GEMINI_API_KEY:
        return "Error: GEMINI_API_KEY not configured"
    try:
        url = (
            "https://generativelanguage.googleapis.com/v1/models/"
            "gemini-2.5-flash:generateContent?key="+GEMINI_API_KEY
        )
        payload = {"contents": [{"parts": [{"text": question}]}]}
        r = requests.post(url, json=payload, timeout=REQUEST_TIMEOUT)
        r.raise_for_status()
        data = r.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except requests.exceptions.RequestException as e:
        return f"Error calling Gemini: {e}"
    except (KeyError, IndexError, ValueError) as e:
        return f"Error parsing Gemini response: {e}"


def ask_groq(question: str) -> str:
    if not GROQ_API_KEY:
        return "Error: GROQ_API_KEY not configured"
    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": question}],
        }
        r = requests.post(url, headers=headers, json=payload, timeout=REQUEST_TIMEOUT)
        r.raise_for_status()
        data = r.json()
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        return f"Error calling Groq: {e}"
    except (KeyError, IndexError, ValueError) as e:
        return f"Error parsing Groq response: {e}"


def ask_deepseek(question: str) -> str:
    if not DEEPSEEK_API_KEY:
        return "Error: DEEPSEEK_API_KEY not configured"
    try:
        url = "https://api.deepseek.com/chat/completions"
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": question}],
        }
        r = requests.post(url, headers=headers, json=payload, timeout=REQUEST_TIMEOUT)
        r.raise_for_status()
        data = r.json()
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        return f"Error calling DeepSeek: {e}"
    except (KeyError, IndexError, ValueError) as e:
        return f"Error parsing DeepSeek response: {e}"


@app.route("/ask", methods=["POST", "OPTIONS"])
def ask():
    if request.method == "OPTIONS":
        return ("", 204, _cors_headers())
    try:
        body = request.get_json(silent=True) or {}
        question = (body.get("question") or "").strip()
        if not question:
            return jsonify({"error": "Missing 'question' in request body"}), 400
        return jsonify({
            "gemini": ask_gemini(question),
            "groq": ask_groq(question),
            "deepseek": ask_deepseek(question),
        })
    except Exception as e:
        return jsonify({"error": f"Server error: {e}"}), 500


@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ai-aggregator"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
