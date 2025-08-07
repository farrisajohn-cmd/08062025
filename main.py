from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

assistant_id = "asst_LBHxsIUjpmOospLal5LOKo8L"  # Replace with your real assistant ID

# Quote flow memory
user_states = {}

# FHA Quote Step Prompts
quote_questions = [
    "what’s the estimated home price?",
    "how much are you putting down? (either dollar amount or %)",
    "what state is the property located in?",
    "what’s your estimated credit score?",
    "what are the monthly property taxes? (if you're not sure, just say 'average')",
    "what’s the monthly homeowners insurance cost? (or say 'average')",
    "any HOA dues? if none, just say 0."
]

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    user_input = body.get("message", "").lower()
    user_id = "default_user"  # Use IP, session, or real user ID in prod

    # If user is in the middle of a quote flow
    if user_id in user_states:
        state = user_states[user_id]
        state["answers"].append(user_input)

        # Ask next question
        if len(state["answers"]) < len(quote_questions):
            next_q = quote_questions[len(state["answers"])]
            return {"response": f"{next_q}"}
        else:
            # All quote inputs collected — do quote logic here
            inputs = state["answers"]
            user_states.pop(user_id)
            return {
                "response": f"got it! working up your FHA quote now — give me just a moment…\n\n(this is where quote logic goes)\n\nInputs: {inputs}"
            }

    # New quote flow trigger
    if "quote" in user_input or "fha loan" in user_input or "rate" in user_input:
        user_states[user_id] = {
            "step": 0,
            "answers": []
        }
        return {"response": f"awesome. {quote_questions[0]}"}

    # Default to file-powered assistant for underwriting/guideline Qs
    thread = client.beta.threads.create()
    message = client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=user_input
    )

    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=assistant_id
    )

    # Wait until run is complete
    while run.status not in ["completed", "failed"]:
        run = client.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id
        )

    if run.status == "completed":
        messages = client.beta.threads.messages.list(thread_id=thread.id)
        reply = messages.data[0].content[0].text.value
        return {"response": reply}
    else:
        return {"response": "⚠️ assistant failed to respond. please try again."}
