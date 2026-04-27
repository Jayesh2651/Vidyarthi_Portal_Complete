# Vidyarthi Mitra AI Assistant Setup

## What was added

- A global floating React assistant available across the portal UI.
- A Django endpoint at `POST /api/ai/chat/`.
- A Retrieval-Augmented Generation pipeline over portal data and uploaded files.
- Local vector storage using FAISS when available, with a vector-file fallback.
- Optional extra document indexing through `AI_EXTRA_DOCUMENT_PATHS`.

## Environment

1. Copy `.env.example` to `.env`.
2. Set `AI_API_KEY` to your chat provider key.
3. If you have a dedicated embedding provider, also set:
   - `EMBEDDING_API_KEY`
   - `EMBEDDING_API_BASE_URL`
   - `EMBEDDING_MODEL`
4. If you want to index extra notes folders, set `AI_EXTRA_DOCUMENT_PATHS`.

Example:

```env
AI_API_KEY=your-provider-key
AI_API_BASE_URL=https://api.groq.com/openai/v1
AI_CHAT_MODEL=llama-3.3-70b-versatile
EMBEDDING_API_KEY=your-embedding-key
EMBEDDING_API_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-3-small
AI_EXTRA_DOCUMENT_PATHS=notes,docs/reference-material
```

## Install dependencies

```powershell
pip install -r requirements.txt
npm --prefix frontend install
```

## Build the vector index

Run this once after dependencies are installed or anytime you upload a large batch of new files:

```powershell
python manage.py rebuild_ai_index
```

The assistant also invalidates its cache automatically after uploads and rebuilds on the next request.

## Run locally

Backend:

```powershell
python manage.py runserver
```

Frontend:

```powershell
npm --prefix frontend run dev
```

If you use the built SPA through Django only:

```powershell
npm --prefix frontend run build
python manage.py collectstatic --noinput
```

## API contract

Request:

```json
{
  "message": "Explain DBMS normalization",
  "mode": "simple",
  "page_path": "/syllabus",
  "page_title": "Syllabus",
  "history": [
    { "role": "user", "content": "What is DBMS?" },
    { "role": "assistant", "content": "..." }
  ]
}
```

Response:

```json
{
  "reply": "AI-generated answer",
  "sources": [
    { "label": "Syllabus: DBMS (2025)", "type": "syllabus" }
  ],
  "language": "english"
}
```

## Notes

- Chat history is never stored in the database.
- The frontend keeps conversation state locally and only sends recent messages for continuity.
- API keys are only used from the backend.
- If your chat provider does not support embeddings, the code falls back to local hashed embeddings so the assistant still works.
