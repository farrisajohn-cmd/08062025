from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

assistant_id = "asst_LBHxsIUjpmOospLal5LOKo8L"  # Replace with your actual Assistant ID

# Conversation memory
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
    user_id = "default_user"

    # Trigger greeting
    if user_input in ["hi", "hello", "hey"]:
        return {
            "response": "👋 hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!"
        }

    # Quote flow
    if user_id in user_states:
        state = user_states[user_id]
        state["answers"].append(user_input)

        if len(state["answers"]) < len(quote_questions):
            return {"response": quote_questions[len(state["answers"])]}
        else:
            inputs = state["answers"]
            user_states.pop(user_id)

            # Extract and parse inputs
            purchase_price = parse_amount(inputs[0])
            down = parse_percent_or_amount(inputs[1], purchase_price)
            state_code = inputs[2].upper()
            fico = int(inputs[3])
            taxes = parse_amount(inputs[4])
            insurance = parse_amount(inputs[5])
            hoa = parse_amount(inputs[6])

            loan_base = purchase_price - down
            ufmip = round(loan_base * 0.0175, 2)
            final_loan = round(loan_base + ufmip, 2)
            rate = 0.06125
            monthly_pi = round((final_loan * rate / 12), 2)
            mip = round(final_loan * 0.0055 / 12, 2)
            piti = round(monthly_pi + mip + taxes + insurance + hoa, 2)

            title_fee = round(final_loan * 0.0055, 2)
            transfer_tax = round(final_loan * 0.0055, 2)
            interim = round(final_loan * rate / 365 * 15, 2)

            # Estimate closing costs
            costs = {
                "box_a": 0,
                "box_b": 650 + 100 + 30 + ufmip,
                "box_c": 500 + 300 + title_fee,
                "box_e": 299 + transfer_tax,
                "box_f": insurance * 12 + interim,
                "box_g": taxes * 3 + insurance * 3,
            }

            total_costs = sum(costs.values())
            cash_to_close = round(down + total_costs, 2)

            # Response formatting
            response = f"""your actual rate, payment, and costs could be higher. get an official loan estimate before choosing a loan.

**purchase price:** ${purchase_price:,.2f}  
**loan amount:** ${final_loan:,.2f}  
**interest rate:** {rate * 100:.3f}%  
**monthly payment (PITIA):** ${piti:,.2f}  
**estimated cash to close:** ${cash_to_close:,.2f}  
**down payment:** ${down:,.2f}  
**closing costs:** ${total_costs:,.2f}

  
**box a – origination charges**  
$0  

**box b – services you cannot shop for**  
appraisal $650  
credit report $100  
flood cert $30  
ufmip ${ufmip:,.2f}  

**box c – services you can shop for**  
title $500  
survey $300  
lender title policy ${title_fee:,.2f}  

**box e – taxes and gov fees**  
recording $299  
transfer tax ${transfer_tax:,.2f}  

**box f – prepaid items**  
homeowners insurance (12mo) ${insurance*12:,.2f}  
interim interest (15 days) ${interim:,.2f}  

**box g – initial escrow**  
taxes (3mo) ${taxes*3:,.2f}  
insurance (3mo) ${insurance*3:,.2f}  

**calculating cash to close**  
please review this estimate and consult with us if you'd like to move forward.  
- [🔗 apply now](https://govies.com/apply)  
- [📅 book a consult](https://govies.com/consult)  
- [📞 1-800-YES-GOVIES](tel:1800937468437)  
- [✉️ team@govies.com](mailto:team@govies.com)
"""
            return {"response": response}

    # Start new quote
    if "quote" in user_input or "rate" in user_input or "fha loan" in user_input:
        user_states[user_id] = {"answers": []}
        return {"response": f"awesome. {quote_questions[0]}"}

    # General fallback to Assistant
    thread = client.beta.threads.create()
    client.beta.threads.messages.create(thread_id=thread.id, role="user", content=user_input)
    run = client.beta.threads.runs.create(thread_id=thread.id, assistant_id=assistant_id)

    while run.status not in ["completed", "failed"]:
        time.sleep(0.5)
        run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

    if run.status == "completed":
        messages = client.beta.threads.messages.list(thread_id=thread.id)
        reply = messages.data[0].content[0].text.value
        return {"response": reply}

    return {"response": "⚠️ assistant failed to respond. please try again."}


def parse_amount(val):
    val = val.replace("$", "").replace(",", "").strip()
    if val.lower() == "average":
        return 250
    if val.endswith("k"):
        return float(val[:-1]) * 1000
    return float(val)

def parse_percent_or_amount(val, base):
    val = val.replace("%", "").replace("$", "").strip()
    if val.endswith("k"):
        return float(val[:-1]) * 1000
    if float(val) <= 100:
        return round(base * float(val) / 100, 2)
    return float(val)
