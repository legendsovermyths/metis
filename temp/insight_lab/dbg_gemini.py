import json, urllib.request, importlib.util, pathlib
spec = importlib.util.spec_from_file_location("rc", pathlib.Path(__file__).parent / "run_compare.py")
rc = importlib.util.module_from_spec(spec); spec.loader.exec_module(rc)

tok = rc.gemini_token(); proj = rc._token["project"]
url = (f"https://aiplatform.googleapis.com/v1/projects/{proj}"
       f"/locations/global/publishers/google/models/{rc.GEMINI_MODEL}:generateContent")
body = {
    "systemInstruction": {"parts": [{"text": "You reply with one JSON object: {\"ok\": true}"}]},
    "contents": [{"role": "user", "parts": [{"text": "hello"}]}],
    "generationConfig": {"responseMimeType": "application/json", "maxOutputTokens": 9000},
}
req = urllib.request.Request(url, data=json.dumps(body).encode(),
    headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json",
             "x-goog-user-project": proj}, method="POST")
with urllib.request.urlopen(req, timeout=120) as r:
    resp = json.loads(r.read().decode())
print(json.dumps(resp, indent=2)[:4000])
