from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from google.cloud import firestore
from datetime import datetime
import os

app = FastAPI(
    title="DevOps Notes API",
    description="Personal knowledge base for DevOps tips, tricks & learnings",
    version="1.0.0"
)

# Initialize Firestore
db = firestore.Client(database="devops-notes-db")
NOTES_COLLECTION = "devops_notes"

class Note(BaseModel):
    title: str
    content: str
    tags: Optional[List[str]] = []
    created_at: Optional[str] = None

class NoteResponse(Note):
    id: str

@app.get("/")
async def root():
    return {"message": "DevOps Notes API is running on Google Cloud Run!"}

@app.post("/notes", response_model=NoteResponse)
async def create_note(note: Note):
    """Create a new DevOps note"""
    note_dict = note.dict()
    note_dict["created_at"] = datetime.utcnow().isoformat()
    
    doc_ref = db.collection(NOTES_COLLECTION).document()
    doc_ref.set(note_dict)
    
    return NoteResponse(id=doc_ref.id, **note_dict)

@app.get("/notes", response_model=List[NoteResponse])
async def get_notes(limit: int = Query(50, le=100)):
    """List all notes"""
    notes = []
    docs = db.collection(NOTES_COLLECTION).limit(limit).stream()
    
    for doc in docs:
        note = doc.to_dict()
        note["id"] = doc.id
        notes.append(note)
    
    return notes

@app.get("/notes/search", response_model=List[NoteResponse])
async def search_notes(q: str):
    """Search notes by keyword in title or content"""
    notes = []
    # Firestore doesn't support full-text search natively, so we fetch and filter
    docs = db.collection(NOTES_COLLECTION).stream()
    
    for doc in docs:
        data = doc.to_dict()
        if (q.lower() in data.get("title", "").lower() or 
            q.lower() in data.get("content", "").lower()):
            data["id"] = doc.id
            notes.append(data)
    
    return notes

@app.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    """Delete a note"""
    doc_ref = db.collection(NOTES_COLLECTION).document(note_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Note not found")
    
    doc_ref.delete()
    return {"message": f"Note {note_id} deleted successfully"}