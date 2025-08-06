from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import openai
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Read OpenAI key from environment variable
openai.api_key = os.environ.get("OPENAI_API_KEY")

@app.get("/")
def root():
    return {"message": "Backend running."}

@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    user_message = body.get("message")

    if not user_message:
        return {"error": "No message provided."}

    try:
        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_message}
            ]
        )
        return {"response": completion.choices[0].message.content.strip()}

    except Exception as e:
        return {"error": str(e)}
