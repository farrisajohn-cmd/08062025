from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import openai
import os

app = FastAPI()

# Allow all CORS for now (you can lock this down later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace * with your Vercel frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# POST endpoint to handle chat requests
@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    user_message = body.get("message", "")

    # Load OpenAI API key
    openai.api_key = os.getenv("OPENAI_API_KEY")

    if not user_message:
        return {"response": "⚠️ no message received."}

    try:
        completion = openai.ChatCompletion.create(
            model="gpt-4",  # or "gpt-3.5-turbo"
            messages=[
                {"role": "system", "content": "you are a helpful assistant."},
                {"role": "user", "content": user_message}
            ]
        )
        reply = completion.choices[0].message["content"]
        return {"response": reply}
    
    except Exception as e:
        return {"response": f"⚠️ error: {str(e)}"}
