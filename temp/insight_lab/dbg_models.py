import json, urllib.request, urllib.error, importlib.util, pathlib
spec = importlib.util.spec_from_file_location("rc", pathlib.Path(__file__).parent / "run_compare.py")
rc = importlib.util.module_from_spec(spec); spec.loader.exec_module(rc)

candidates = [
    "us.anthropic.claude-opus-5-v1",
    "us.anthropic.claude-opus-5-20250929-v1:0",
    "global.anthropic.claude-opus-5-v1",
    "us.anthropic.claude-opus-4-6-v1",  # known-good baseline
]
for m in candidates:
    body = {"anthropic_version": "bedrock-2023-05-31", "max_tokens": 20,
            "messages": [{"role": "user", "content": "say hi"}]}
    req = urllib.request.Request(f"{rc.BEDROCK_URL}/model/{m}/invoke",
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {rc.env('BEDROCK_API_KEY')}", "Content-Type": "application/json"},
        method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            json.loads(r.read().decode())
        print(f"OK    {m}")
    except urllib.error.HTTPError as e:
        print(f"{e.code}  {m}  -> {e.read().decode()[:160]}")
    except Exception as e:
        print(f"ERR   {m}  -> {e}")
