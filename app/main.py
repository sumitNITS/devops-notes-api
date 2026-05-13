import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import firestore
from pydantic import BaseModel, Field

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Firestore client (reused across requests)
FIRESTORE_DB_NAME = os.environ.get("FIRESTORE_DB_NAME", "devops-notes-db")
db = firestore.Client(database=FIRESTORE_DB_NAME)
NOTES_COLLECTION = "devops_notes"

# Pydantic models
class Note(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=10000)
    tags: Optional[List[str]] = Field(default_factory=list)
    created_at: Optional[str] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1, max_length=10000)
    tags: Optional[List[str]] = None

class NoteResponse(Note):
    id: str
    updated_at: Optional[str] = None

class MessageResponse(BaseModel):
    message: str

# FastAPI app
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("DevOps Notes API starting up")
    yield
    logger.info("DevOps Notes API shutting down")

app = FastAPI(
    title="DevOps Notes API",
    description="Personal knowledge base for DevOps tips, tricks & learnings",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://notes.sumitkumardas.dev",                    
        "https://devops-notes-frontend-*.run.app",           
        "http://localhost:5173",                           
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helpers
def _clean_tags(tags: Optional[List[str]]) -> List[str]:
    if not tags:
        return []
    cleaned = [t.strip().lower() for t in tags if t and t.strip()]
    return list(dict.fromkeys(cleaned))  # dedupe while preserving order

# Endpoints
@app.get("/", response_model=MessageResponse)
async def root():
    return {"message": "DevOps Notes API is running on Google Cloud Run!"}


@app.get("/health", response_model=MessageResponse)
async def health_check():
    """Liveness/readiness probe for Cloud Run"""
    return {"message": "healthy"}


@app.post("/notes", response_model=NoteResponse, status_code=201)
async def create_note(note: Note):
    """Create a new DevOps note"""
    try:
        note_dict = note.model_dump()
        note_dict["tags"] = _clean_tags(note_dict.get("tags"))
        note_dict["created_at"] = datetime.now(timezone.utc).isoformat()
        note_dict["updated_at"] = note_dict["created_at"]

        doc_ref = db.collection(NOTES_COLLECTION).document()
        doc_ref.set(note_dict)

        logger.info(f"Created note {doc_ref.id}")
        return NoteResponse(id=doc_ref.id, **note_dict)
    except Exception as e:
        logger.error(f"Failed to create note: {e}")
        raise HTTPException(status_code=500, detail="Failed to create note")


@app.get("/notes", response_model=List[NoteResponse])
async def get_notes(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort: str = Query("desc", pattern="^(asc|desc)$"),
):
    """List notes with pagination and sorting"""
    try:
        query = (
            db.collection(NOTES_COLLECTION)
            .order_by("created_at", direction=firestore.Query.DESCENDING if sort == "desc" else firestore.Query.ASCENDING)
            .limit(limit)
            .offset(offset)
        )
        docs = query.stream()

        notes = []
        for doc in docs:
            note = doc.to_dict()
            note["id"] = doc.id
            notes.append(note)

        return notes
    except Exception as e:
        logger.error(f"Failed to list notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to list notes")


@app.get("/notes/search", response_model=List[NoteResponse])
async def search_notes(q: str = Query(..., min_length=1)):
    """Search notes by keyword in title, content, or tags"""
    try:
        notes = []
        query_lower = q.lower()
        docs = db.collection(NOTES_COLLECTION).stream()

        for doc in docs:
            data = doc.to_dict()
            title = data.get("title", "").lower()
            content = data.get("content", "").lower()
            tags = [tag.lower() for tag in data.get("tags", [])]

            match = (
                query_lower in title
                or query_lower in content
                or any(query_lower in tag for tag in tags)
            )

            if match:
                data["id"] = doc.id
                notes.append(data)

        return notes
    except Exception as e:
        logger.error(f"Failed to search notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to search notes")


@app.get("/notes/tag/{tag}", response_model=List[NoteResponse])
async def get_notes_by_tag(tag: str):
    """Get all notes that have a specific tag (exact match)"""
    try:
        docs = (
            db.collection(NOTES_COLLECTION)
            .where("tags", "array_contains", tag.lower().strip())
            .stream()
        )
        notes = []
        for doc in docs:
            note = doc.to_dict()
            note["id"] = doc.id
            notes.append(note)
        return notes
    except Exception as e:
        logger.error(f"Failed to get notes by tag: {e}")
        raise HTTPException(status_code=500, detail="Failed to get notes by tag")


@app.get("/notes/{note_id}", response_model=NoteResponse)
async def get_note(note_id: str):
    """Get a single note by ID"""
    try:
        doc_ref = db.collection(NOTES_COLLECTION).document(note_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="Note not found")

        note = doc.to_dict()
        note["id"] = doc.id
        return note
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get note {note_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get note")


@app.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, update: NoteUpdate):
    """Update an existing note"""
    try:
        doc_ref = db.collection(NOTES_COLLECTION).document(note_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="Note not found")

        current = doc.to_dict()
        payload = {k: v for k, v in update.model_dump().items() if v is not None}

        if not payload:
            raise HTTPException(status_code=400, detail="No fields to update")

        if "tags" in payload:
            payload["tags"] = _clean_tags(payload["tags"])

        payload["updated_at"] = datetime.now(timezone.utc).isoformat()
        doc_ref.update(payload)

        # Merge current + updates for response
        current.update(payload)
        current["id"] = note_id
        logger.info(f"Updated note {note_id}")
        return current
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update note {note_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update note")


@app.delete("/notes/{note_id}", response_model=MessageResponse)
async def delete_note(note_id: str):
    """Delete a note"""
    try:
        doc_ref = db.collection(NOTES_COLLECTION).document(note_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="Note not found")

        doc_ref.delete()
        logger.info(f"Deleted note {note_id}")
        return {"message": f"Note {note_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete note {note_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete note")
