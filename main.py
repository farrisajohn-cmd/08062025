from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import openai

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Define request schema
class ChatRequest(BaseModel):
    message: str

# Initialize app
app = FastAPI()

# Enable CORS for frontend on Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with ["https://your-vercel-url.vercel.app"] in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend running."}

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": req.message}
            ]
        )
        return {"response": response.choices[0].message["content"]}
    except Exception as e:
        return {"response": f"Error: {str(e)}"}
