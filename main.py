from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS settings (adjust your frontend domain if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can change this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str

# Global memory for conversation (replace with DB/session logic later)
conversations = {}

@app.post("/chat")
async def chat_endpoint(data: Message, request: Request):
    user_id = request.client.host  # crude session logic
    user_input = data.message.strip().lower()

    if user_id not in conversations:
        conversations[user_id] = {
            "step": 0,
            "data": {}
        }

    convo = conversations[user_id]
    step = convo["step"]
    qdata = convo["data"]

    # Conversation logic
    if step == 0:
        convo["step"] += 1
        return {"response": "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!"}
    
    if step == 1 and "quote" in user_input:
        convo["step"] += 1
        return {"response": "awesome. what's the estimated home price?"}

    if step == 2:
        qdata["price"] = user_input.replace("$", "").replace(",", "")
        convo["step"] += 1
        return {"response": "how much are you putting down? (either dollar amount or %)"}

    if step == 3:
        qdata["down"] = user_input
        convo["step"] += 1
        return {"response": "what state is the property located in?"}

    if step == 4:
        qdata["state"] = user_input
        convo["step"] += 1
        return {"response": "what's your estimated credit score?"}

    if step == 5:
        qdata["fico"] = user_input
        convo["step"] += 1
        return {"response": "what are the monthly property taxes? (if you're not sure, just say 'average')"}

    if step == 6:
        qdata["taxes"] = user_input if user_input != "average" else "250"
        convo["step"] += 1
        return {"response": "what's the monthly homeowners insurance cost? (or say 'average')"}

    if step == 7:
        qdata["insurance"] = user_input if user_input != "average" else "125"
        convo["step"] += 1
        return {"response": "any HOA dues? if none, just say 0."}

    if step == 8:
        qdata["hoa"] = user_input
        convo["step"] += 1
        return {"response": "got it! working up your FHA quote now — give me just a moment… " + run_fha_quote(qdata)}

    # Fallback
    return {"response": "just let me know if you want an FHA quote or help understanding your loan."}

# FHA QUOTE LOGIC
def run_fha_quote(quote_data):
    try:
        home_price = float(quote_data.get("price"))
        down_input = quote_data.get("down").strip().replace("%", "")
        down_payment = float(down_input) if "%" in quote_data.get("down") else float(quote_data.get("down"))
        if "%" in quote_data.get("down"):
            down_payment = home_price * (down_payment / 100)

        loan_base = home_price - down_payment
        ufmip = loan_base * 0.0175
        final_loan = loan_base + ufmip

        rate = 0.06125
        term_months = 360
        monthly_rate = rate / 12
        monthly_p_and_i = final_loan * (monthly_rate * (1 + monthly_rate) ** term_months) / ((1 + monthly_rate) ** term_months - 1)

        monthly_mip = final_loan * 0.0055 / 12
        taxes = float(quote_data.get("taxes", 0))
        insurance = float(quote_data.get("insurance", 0))
        hoa = float(quote_data.get("hoa", 0))
        total_monthly = monthly_p_and_i + monthly_mip + taxes + insurance + hoa

        interim_interest = round(final_loan * rate / 365 * 15, 2)
        insurance_escrow = insurance * 3
        taxes_escrow = taxes * 3
        prepaids = insurance + interim_interest + insurance_escrow + taxes_escrow

        closing_costs = {
            "box_a": 0.00,
            "box_b": 650 + 100 + 30 + round(ufmip, 2),
            "box_c": 500 + 300 + round(final_loan * 0.0055, 2),
            "box_e": 299 + round(final_loan * 0.0055, 2),
            "box_f": round(prepaids, 2),
            "box_g": round(insurance_escrow + taxes_escrow, 2)
        }

        total_closing = sum(closing_costs.values())
        total_cash_to_close = down_payment + total_closing

        response = f"""your actual rate, payment, and costs could be higher. get an official loan estimate before choosing a loan.

**loan terms**
home price: ${home_price:,.2f}
loan amount (with ufmip): ${final_loan:,.2f}
interest rate: {rate * 100:.3f}%
loan type: FHA 30-year fixed

**monthly payment (PITIA)**
principal & interest: ${monthly_p_and_i:,.2f}
FHA mip: ${monthly_mip:,.2f}
property taxes: ${taxes:,.2f}
insurance: ${insurance:,.2f}
HOA: ${hoa:,.2f}
**total monthly**: ${total_monthly:,.2f}

**estimated cash to close**
down payment: ${down_payment:,.2f}
closing costs: ${total_closing:,.2f}
→ **total due at closing**: ${total_cash_to_close:,.2f}

**closing cost breakdown**
box a – origination charges: ${closing_costs["box_a"]:,.2f}

box b – services you cannot shop for:
- appraisal: $650
- credit report: $100
- flood cert: $30
- upfront MIP: ${ufmip:,.2f}

box c – services you can shop for:
- title: $500
- survey: $300
- lender’s title insurance: ${final_loan * 0.0055:,.2f}

box e – taxes and other government fees:
- recording fee: $299
- transfer tax: ${final_loan * 0.0055:,.2f}

box f – prepaids:
- 12 months insurance: ${insurance:,.2f}
- interim interest (15 days): ${interim_interest:,.2f}

box g – initial escrow:
- 3 months insurance: ${insurance_escrow:,.2f}
- 3 months taxes: ${taxes_escrow:,.2f}

please review this estimate and consult with us if you'd like to move forward.

- [🔗 apply now](https://govies.com/apply)  
- [📅 book a consult](https://govies.com/consult)  
- [📞 1-800-YES-GOVIES](tel:1800937468437)  
- [✉️ team@govies.com](mailto:team@govies.com)
"""
        return response

    except Exception as e:
        return f"⚠️ there was a problem calculating the quote: {str(e)}"
