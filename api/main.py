from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import re
import json
from faker import Faker
import random

app = FastAPI(title="Financial Data ETL")
fake = Faker()

# Allow CORS for React Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. Mock Data Generator ---
def generate_raw_data(num_records=10):
    records = []
    for _ in range(num_records):
        records.append({
            "transaction_id": fake.uuid4(),
            "customer_name": fake.name(),
            "ssn": fake.ssn(),
            "credit_card": fake.credit_card_number(),
            "amount": round(random.uniform(10.0, 5000.0), 2),
            "merchant": fake.company(),
            "notes": f"Payment from {fake.name()} using card {fake.credit_card_number()}."
        })
    return records

# --- 2. Anonymization Engine ---
def anonymize_record(record):
    anon = record.copy()
    
    # Mask Name (Pseudonymization)
    anon["customer_name"] = "CUSTOMER_" + fake.uuid4()[:8]
    
    # Mask SSN (Preserve last 4)
    if "ssn" in anon:
        anon["ssn"] = "***-**-" + anon["ssn"][-4:]
        
    # Mask Credit Card (Preserve last 4)
    if "credit_card" in anon:
        anon["credit_card"] = "****-****-****-" + anon["credit_card"][-4:]
        
    # Regex Redaction on unstructured text (notes)
    if "notes" in anon:
        notes = anon["notes"]
        # Find and redact 13-16 digit numbers (CC)
        notes = re.sub(r'\b\d{13,16}\b', '[REDACTED_CC]', notes)
        anon["notes"] = notes

    return anon

# --- 3. API Endpoints ---
@app.get("/api/v1/pipeline/run")
def run_pipeline():
    # 1. Extract
    raw_data = generate_raw_data(5)
    
    # 2. Transform (Anonymize)
    anonymized_data = [anonymize_record(r) for r in raw_data]
    
    # 3. Load (Return to UI for visualization)
    return {
        "status": "success",
        "raw_data": raw_data,
        "anonymized_data": anonymized_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
