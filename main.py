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

# Use your real assistant ID here
assistant_id = "asst_LBHxsIUjpmOospLal5LOKo8L"

user_states = {}

quote_questions = [
    "awesome. what’s the estimated home price?",
    "how much are you putting down? (either dollar amount or %)",
    "what state is the property located in?",
    "what’s your estimated credit score?",
    "what are the monthly property taxes? (or say 'average')",
    "what’s the monthly homeowners insurance cost? (or say 'average')",
    "any HOA dues? if none, just say 0."
]

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    user_input = body.get("message", "").lower()
    user_id = "default_user"

    # First-time greeting
    if user_input.strip() in ["hello", "hi", "hey", "start"]:
        return {
            "response": "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!"
        }

    # Quote flow trigger
    if "quote" in user_input or "fha" in user_input or "rate" in user_input:
        user_states[user_id] = {
            "step": 0,
            "answers": []
        }
        return {"response": quote_questions[0]}

    # Continue quote flow
    if user_id in user_states:
        state = user_states[user_id]
        state["answers"].append(user_input)

        if len(state["answers"]) < len(quote_questions):
            return {"response": quote_questions[len(state["answers"])]}
        else:
            inputs = state["answers"]
            user_states.pop(user_id)

            # Extract inputs safely
            try:
                purchase_price = float(inputs[0].replace("$", "").replace(",", "").replace("k", "000"))
                down = inputs[1]
                down_payment = float(down.replace("%", "")) / 100 * purchase_price if "%" in down else float(down.replace("$", "").replace(",", ""))
                loan_base = purchase_price - down_payment
                ufmip = loan_base * 0.0175
                final_loan = loan_base + ufmip

                interest_rate = 0.06125
                daily_interest = final_loan * interest_rate / 365
                interim_interest = daily_interest * 15

                taxes = float(inputs[4]) if inputs[4] != "average" else 250
                insurance = float(inputs[5]) if inputs[5] != "average" else 125
                hoa = float(inputs[6])

                # Monthly payment
                monthly_pi = (final_loan * interest_rate) / 12
                mip = final_loan * 0.0055 / 12
                monthly_payment = monthly_pi + mip + taxes + insurance + hoa

                # Closing costs
                closing_costs = {
                    "box a – origination charges": "$0",
                    "box b – services you cannot shop for": f"appraisal $650\ncredit report $100\nflood cert $30\nufmip ${ufmip:,.2f}",
                    "box c – services you can shop for": f"title $500\nsurvey $300\nlender title policy ${final_loan * 0.0055:,.2f}",
                    "box e – taxes and gov fees": f"recording $299\ntransfer tax ${final_loan * 0.0055:,.2f}",
                    "box f – prepaid items": f"homeowners insurance (12mo) ${insurance * 12:,.2f}\ninterim interest (15 days) ${interim_interest:,.2f}",
                    "box g – initial escrow": f"taxes (3mo) ${taxes * 3:,.2f}\ninsurance (3mo) ${insurance * 3:,.2f}"
                }

                total_closing = (
                    650 + 100 + 30 + ufmip + 500 + 300 +
                    (final_loan * 0.0055) + 299 + (final_loan * 0.0055) +
                    (insurance * 12) + interim_interest + (taxes * 3) + (insurance * 3)
                )

                down_payment_line = f"down payment: ${down_payment:,.2f}"
                cash_to_close = down_payment + total_closing

                # Format response
                output = f"""your actual rate, payment, and costs could be higher. get an official loan estimate before choosing a loan.

purchase price: ${purchase_price:,.2f}
loan amount: ${final_loan:,.2f}
interest rate: 6.125%
monthly payment (PITIA): ${monthly_payment:,.2f}
estimated cash to close: ${cash_to_close:,.2f}

{down_payment_line}
closing costs: ${total_closing:,.2f}

"""

                for box, items in closing_costs.items():
                    output += f"**{box}**\n{items}\n\n"

                output += """**calculating cash to close**

please review this estimate and consult with us if you'd like to move forward.  
- [🔗 apply now](https://govies.com/apply)  
- [📅 book a consult](https://govies.com/consult)  
- [📞 1-800-YES-GOVIES](tel:1800937468437)  
- [✉️ team@govies.com](mailto:team@govies.com)
"""

                return {"response": output}
            except Exception as e:
                return {"response": f"⚠️ error calculating quote. please check your inputs or try again.\n\n{str(e)}"}

    # Default to assistant Q&A (underwriting/guidelines)
    try:
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

        # Wait until complete
        while run.status not in ["completed", "failed"]:
            time.sleep(0.5)
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
    except Exception as e:
        return {"response": f"⚠️ error reaching assistant: {str(e)}"}
