from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import openai
import os

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For now, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Backend running."}

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_input = data.get("message")

    if not user_input:
        return {"error": "No message provided."}

    try:
        openai.api_key = os.getenv("OPENAI_API_KEY")

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_input}
            ]
        )

        return {"response": response.choices[0].message["content"]}
    
    except Exception as e:
        return {"error": f"OpenAI error: {str(e)}"}
