from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import uvicorn

app = FastAPI()

# CORS setup for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session state
chat_sessions: Dict[str, Dict] = {}

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"  # could be used to track per user in future

@app.post("/chat")
async def chat(request: ChatRequest):
    user_message = request.message.strip().lower()
    session_id = request.session_id

    if session_id not in chat_sessions:
        chat_sessions[session_id] = {
            "stage": "start",
            "quote_data": {}
        }

    session = chat_sessions[session_id]
    stage = session["stage"]
    quote_data = session["quote_data"]

    # Initial friendly greeting
    if stage == "start":
        session["stage"] = "awaiting_intent"
        return {
            "response": "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!"
        }

    # Detect user intent for quote
    if stage == "awaiting_intent":
        if "quote" in user_message or "mortgage" in user_message or "fha" in user_message:
            session["stage"] = "ask_price"
            return { "response": "awesome. what's the estimated home price?" }
        else:
            return {
                "response": "i can help with FHA purchase loans — quoting rates, breaking down monthly payments, or showing you how much cash to close. want me to run a quote for you?"
            }

    # Quote flow — one step at a time
    if stage == "ask_price":
        quote_data["price"] = user_message
        session["stage"] = "ask_down"
        return { "response": "how much are you putting down? (either dollar amount or %)" }

    if stage == "ask_down":
        quote_data["down"] = user_message
        session["stage"] = "ask_state"
        return { "response": "what state is the property located in?" }

    if stage == "ask_state":
        quote_data["state"] = user_message
        session["stage"] = "ask_credit"
        return { "response": "what's your estimated credit score?" }

    if stage == "ask_credit":
        quote_data["credit"] = user_message
        session["stage"] = "ask_taxes"
        return { "response": "what are the monthly property taxes? (if you're not sure, just say 'average')" }

    if stage == "ask_taxes":
        quote_data["taxes"] = user_message
        session["stage"] = "ask_insurance"
        return { "response": "what’s the monthly homeowners insurance cost? (or say 'average')" }

    if stage == "ask_insurance":
        quote_data["insurance"] = user_message
        session["stage"] = "ask_hoa"
        return { "response": "any HOA dues? if none, just say 0." }

    if stage == "ask_hoa":
        quote_data["hoa"] = user_message
        session["stage"] = "quote_ready"
        return {
            "response": "got it! working up your FHA quote now — give me just a moment… (this is where quote logic goes)"
        }

    # Fallback
    return {
        "response": "hmm, i didn't catch that. try rephrasing or say 'quote' to get started on a loan estimate."
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=10000)
