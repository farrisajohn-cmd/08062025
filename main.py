from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

assistant_id = "asst_LBHxsIUjpmOospLal5LOKo8L"  # replace with your real assistant ID

# Quote flow memory
user_states = {}

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
    user_id = body.get("user_id", "default_user")

    # If user is in the middle of a quote flow
    if user_id in user_states:
        state = user_states[user_id]
        state["answers"].append(user_input)

        if len(state["answers"]) < len(quote_questions):
            next_q = quote_questions[len(state["answers"])]
            return {"response": f"{next_q}", "typing": True}
        else:
            inputs = state["answers"]
            user_states.pop(user_id)
            # insert quote logic here later
            return {
                "response": f"""your actual rate, payment, and costs could be higher. get an official loan estimate before choosing a loan.

**purchase price:** $350,000  
**loan amount:** $320,512.50  
**interest rate:** 6.125%  
**monthly payment (PITIA):** $2,182.85  
**estimated cash to close:** $50,323.91  

**down payment:** $35,000.00  
**closing costs:** $15,323.91  

**box a – origination charges**  
$0  

**box b – services you cannot shop for**  
appraisal $650  
credit report $100  
flood cert $30  
ufmip $5,512.50  

**box c – services you can shop for**  
title $500  
survey $300  
lender title policy $1,762.82  

**box e – taxes and gov fees**  
recording $299  
transfer tax $1,762.82  

**box f – prepaid items**  
homeowners insurance (12mo) $2,400.00  
interim interest (15 days) $806.77  

**box g – initial escrow**  
taxes (3mo) $600.00  
insurance (3mo) $600.00  

**calculating cash to close**  
please review this estimate and consult with us if you'd like to move forward.

- [🔗 apply now](https://govies.com/apply)  
- [📅 book a consult](https://govies.com/consult)  
- [📞 1-800-YES-GOVIES](tel:1800937468437)  
- [✉️ team@govies.com](mailto:team@govies.com)
""",
                "typing": True
            }

    # Quote flow trigger
    if "quote" in user_input or "fha loan" in user_input or "rate" in user_input:
        user_states[user_id] = {
            "step": 0,
            "answers": []
        }
        return {
            "response": f"awesome. {quote_questions[0]}",
            "typing": True
        }

    # Default: use OpenAI Assistant
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

    while run.status not in ["completed", "failed"]:
        await asyncio.sleep(0.5)
        run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

    if run.status == "completed":
        messages = client.beta.threads.messages.list(thread_id=thread.id)
        reply = messages.data[0].content[0].text.value
        return {"response": reply, "typing": True}
    else:
        return {"response": "⚠️ assistant failed to respond. please try again."}
