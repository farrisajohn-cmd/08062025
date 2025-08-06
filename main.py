from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://your-vercel-app.vercel.app",
    "https://govies.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = os.getenv("OPENAI_API_KEY")
ASSISTANT_ID = os.getenv("ASSISTANT_ID")

@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    thread_id = body.get("thread_id")
    user_input = body.get("message")

    if not thread_id:
        thread = openai.beta.threads.create()
        thread_id = thread.id

    openai.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=user_input
    )

    run = openai.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=ASSISTANT_ID
    )

    return { "thread_id": thread_id, "run_id": run.id }
