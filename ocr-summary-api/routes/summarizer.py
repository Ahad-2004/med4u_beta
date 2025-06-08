# summarizer.py
import sys
import json
import requests

def summarize_with_huggingface(text):
    api_url = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
    headers = {
        "Authorization": f"Bearer YOUR_HF_TOKEN_HERE"  # Replace with your actual Hugging Face token
    }
    payload = {
        "inputs": text,
        "parameters": {
            "min_length": 30,
            "max_length": 200
        }
    }
    response = requests.post(api_url, headers=headers, json=payload)
    
    if response.status_code == 200:
        summary = response.json()[0]["summary_text"]
        print(summary)
    else:
        print("Error:", response.status_code, response.text)

if __name__ == "__main__":
    input_text = sys.stdin.read()
    summarize_with_huggingface(input_text)
