from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str

# Global session state (reset every time app sleeps; persistent only during active chat)
session = {
    "step": 0,
    "data": {}
}

questions = [
    "What's the purchase price of the home?",
    "How much are you putting down? (either dollar amount or %)",
    "What state is the property in?",
    "What's your estimated credit score?",
    "What loan term are you considering? (e.g. 30-year fixed)",
    "How much are your monthly property taxes?",
    "How much is your monthly homeowner's insurance?",
    "Any monthly HOA dues?"
]

@app.post("/chat")
async def chat(message: Message):
    user_input = message.message.strip()

    # Start over if user says restart
    if user_input.lower() in ["restart", "start over", "reset"]:
        session["step"] = 0
        session["data"] = {}
        return {"response": "Sure — let's start fresh.\n\n" + questions[0]}

    # Collect input
    step = session["step"]

    if step < len(questions):
        session["data"][f"q{step+1}"] = user_input
        session["step"] += 1

        if session["step"] < len(questions):
            return {"response": questions[session["step"]]}
        else:
            # All data collected, generate quote
            return {"response": generate_quote(session["data"])}
    else:
        return {"response": "Type 'restart' to begin a new quote."}


def generate_quote(data):
    # Parse values (simple defaults/fallbacks for now)
    try:
        home_price = parse_amount(data["q1"])
        down_input = data["q2"]
        down = parse_amount(down_input) if "$" in down_input or down_input.isdigit() else home_price * (float(down_input.strip('%')) / 100)
        state = data["q3"]
        score = data["q4"]
        term = data["q5"]
        taxes = parse_amount(data["q6"])
        insurance = parse_amount(data["q7"])
        hoa = parse_amount(data["q8"]) if "q8" in data else 0
    except:
        return "⚠️ There was a problem parsing your inputs. Please type 'restart' to try again."

    base = home_price - down
    ufmip = base * 0.0175
    final_loan = base + ufmip
    rate = 0.06125
    pi = final_loan * rate / 12 / (1 - (1 + rate / 12) ** -360)
    mip = final_loan * 0.0055 / 12
    payment = pi + mip + taxes + insurance + hoa
    interim_interest = round(final_loan * rate / 365 * 15, 2)

    cash_to_close = round(down + 650 + 100 + 30 + 500 + 300 + (final_loan * 0.0055) + 299 + (final_loan * 0.0055) + insurance * 1 + interim_interest + taxes * 3 + insurance * 3, 2)

    return f"""
purchase price: ${home_price:,.2f}  
loan amount: ${final_loan:,.2f}  
interest rate: 6.125%  
monthly payment: ${payment:,.2f} (PITIA)  
cash to close: ${cash_to_close:,.2f}

closing costs:

**box a – origination charges**  
  $0 lender origination fee  

**box b – services you cannot shop for**  
  $650 appraisal  
  $100 credit report  
  $30 flood cert  
  ${ufmip:,.2f} upfront MIP  

**box c – services you can shop for**  
  $500 settlement  
  $300 survey  
  ${final_loan * 0.0055:,.2f} lender title insurance  

**box e – taxes and other government fees**  
  $299 recording  
  ${final_loan * 0.0055:,.2f} transfer tax  

**box f – prepaids**  
  ${insurance * 1:,.2f} homeowners insurance (12 mo)  
  ${interim_interest:,.2f} interim interest (15 days)  

**box g – initial escrow payment at closing**  
  ${taxes * 3:,.2f} for taxes  
  ${insurance * 3:,.2f} for insurance  

**estimated cash to close:** ${cash_to_close:,.2f}  

please review this estimate and consult with us if you'd like to move forward.  
🔗 [apply now](https://govies.com/apply)  
📅 [book a consult](https://govies.com/consult)  
📞 1-800-YES-GOVIES  
✉️ team@govies.com
""".strip()


def parse_amount(val):
    return float(val.replace("$", "").replace(",", "").strip())

