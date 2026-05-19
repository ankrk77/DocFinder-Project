import io
import json
import uvicorn
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel

# Nayi Google GenAI library
from google import genai
from google.genai import types

# --- Setup ---
app = FastAPI()

# Yahan apni API Key daalein
GEMINI_API_KEY = "AIzaSyB_fMJf8_zoQuCA5sEq1fWYxFu-BJYTs9Q"

# Naya Client Setup
client = genai.Client(api_key=GEMINI_API_KEY)

# Response structure for FastAPI
class ExtractionResponse(BaseModel):
    document_id: str
    cert_no: str
    doc_type: str

@app.post("/extract-data", response_model=ExtractionResponse)
async def extract_data(file: UploadFile = File(...)):
    try:
        # Load Image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        prompt = """
        Analyze this Indian educational/identity document. 
        Extract:
        1. doc_type: (e.g., '10th Marksheet', 'Aadhaar Card')
        2. document_id: The primary unique identifier of this document (e.g., Roll Number, Aadhaar Number, PAN Number, DL Number).
        3. cert_no: The certificate serial number.

        Return exactly this JSON schema:
        {"doc_type": "string", "document_id": "string", "cert_no": "string"}
        If a value is not found, use 'NOT_FOUND'.
        """

        # Call Gemini using the NEW SDK
        response = client.models.generate_content(
            model='gemini-2.5-flash', # Using the latest available fast model
            contents=[prompt, image],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        
        # Parse result
        data = json.loads(response.text)

        return ExtractionResponse(
            document_id=str(data.get("document_id", "NOT_FOUND")),
            cert_no=str(data.get("cert_no", "NOT_FOUND")),
            doc_type=str(data.get("doc_type", "UNKNOWN"))
        )

    except Exception as e:
        print(f"Backend Error: {e}")
        return ExtractionResponse(
           document_id="NOT_FOUND",
            cert_no="NOT_FOUND",
            doc_type="ERROR"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)