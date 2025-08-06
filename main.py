from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os

app = FastAPI()

# Allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sanity check
@app.get("/")
def read_root():
    return {"message": "Backend running."}

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    message = data.get("message")

    if not message:
        return {"response": "⚠️ No message provided."}

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    try:
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": message},
            ]
        )
        reply = completion.choices[0].message.content
        return {"response": reply}
    except Exception as e:
        print("❌ OpenAI error:", e)
        return {"response": "⚠️ error: OpenAI request failed."}
