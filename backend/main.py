from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from ml_engine import MLEngine
from typing import List, Optional
from database import SessionLocal, DBStudentProfile, DBTrackerHistory

app = FastAPI(title="Student Placement Performance Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = MLEngine()

class StudentProfile(BaseModel):
    name: str
    branch: str
    year: int
    cgpa: float
    target_companies: List[str]
    available_study_hours: int

class PreparationTracker(BaseModel):
    student_id: int = 1
    coding: float
    aptitude: float
    communication: float
    technical: float
    resume: float
    interview: float
    study_hours: int
    study_hours_coding: Optional[int] = 0
    study_hours_aptitude: Optional[int] = 0
    study_hours_communication: Optional[int] = 0
    study_hours_technical: Optional[int] = 0
    mock_test_accuracy: float
    company_target: str = "TCS"

class ChatRequest(BaseModel):
    message: str
    tracker_data: Optional[PreparationTracker] = None

@app.get("/")
def read_root():
    return {"message": "Welcome to the Placement Analyzer API"}

@app.post("/api/profile")
def save_profile(profile: StudentProfile):
    db = SessionLocal()
    db_student = db.query(DBStudentProfile).filter(DBStudentProfile.id == 1).first()
    if not db_student:
        db_student = DBStudentProfile(id=1)
        db.add(db_student)
    
    db_student.name = profile.name
    db_student.branch = profile.branch
    db_student.year = profile.year
    db_student.cgpa = profile.cgpa
    db_student.target_companies = ",".join(profile.target_companies)
    db_student.available_study_hours = profile.available_study_hours
    
    db.commit()
    db.close()
    return {"message": "Profile saved successfully"}

@app.post("/api/analyze")
def analyze_performance(data: PreparationTracker):
    profile_data = data.dict()
    
    score, level = engine.calculate_readiness_score(profile_data)
    prob, status = engine.predict_placement_probability(profile_data)
    weaknesses = engine.detect_weak_areas(profile_data)
    gaps = engine.analyze_skill_gap(profile_data, target_company=data.company_target)
    study_plan = engine.generate_study_plan(weaknesses, data.study_hours)
    
    risk_analysis = engine.detect_placement_risk(profile_data, score)
    time_analysis = engine.analyze_time_utilization(profile_data)
    
    # Save to history
    db = SessionLocal()
    if not db.query(DBStudentProfile).filter(DBStudentProfile.id == data.student_id).first():
        db.add(DBStudentProfile(id=data.student_id, name="Demo Student"))
        db.commit()
        
    history_entry = DBTrackerHistory(
        student_id=data.student_id,
        coding_score=data.coding,
        aptitude_score=data.aptitude,
        communication_score=data.communication,
        technical_score=data.technical,
        resume_score=data.resume,
        interview_score=data.interview,
        study_hours_coding=data.study_hours_coding,
        study_hours_aptitude=data.study_hours_aptitude,
        study_hours_communication=data.study_hours_communication,
        study_hours_technical=data.study_hours_technical,
        mock_test_accuracy=data.mock_test_accuracy,
        company_target=data.company_target,
        readiness_score=score
    )
    db.add(history_entry)
    db.commit()
    db.close()
    
    return {
        "readiness_score": score,
        "readiness_level": level,
        "placement_probability": prob,
        "predicted_status": status,
        "weak_areas": weaknesses,
        "skill_gap": gaps,
        "study_plan": study_plan,
        "risk_analysis": risk_analysis,
        "time_analysis": time_analysis
    }

@app.get("/api/history/{student_id}")
def get_history(student_id: int):
    db = SessionLocal()
    history = db.query(DBTrackerHistory).filter(DBTrackerHistory.student_id == student_id).order_by(DBTrackerHistory.timestamp.asc()).all()
    db.close()
    
    trend_data = []
    for i, h in enumerate(history):
        trend_data.append({
            "name": f"Attempt {i+1}",
            "score": h.readiness_score
        })
        
    return {"trend": trend_data}

@app.post("/api/chat")
def chat_with_mentor(req: ChatRequest):
    msg = req.message.lower()
    
    if req.tracker_data:
        profile = req.tracker_data.dict()
        score, _ = engine.calculate_readiness_score(profile)
        prob, _ = engine.predict_placement_probability(profile)
        weaknesses = engine.detect_weak_areas(profile)
    else:
        score, prob, weaknesses = 0, 0, []

    if "ready" in msg or "placement ready" in msg:
        if score > 70:
            return {"reply": f"Yes, your readiness score is {score}%. You are well prepared!"}
        else:
            return {"reply": f"Your readiness score is {score}%. You still need some preparation. Focus on your weak areas."}
            
    elif "weak" in msg:
        if weaknesses:
            return {"reply": f"Based on your tracker, your weak areas are: {', '.join(weaknesses)}."}
        else:
            return {"reply": "You don't have any major weak areas recorded. Keep practicing!"}
            
    elif "study today" in msg:
        if weaknesses:
            return {"reply": f"I recommend spending an hour today practicing {weaknesses[0]}."}
        else:
            return {"reply": "I recommend taking a mock test or revising your technical subjects today."}
            
    elif "coding" in msg:
        return {"reply": "To improve coding, practice Data Structures & Algorithms on platforms like LeetCode and focus on problem-solving."}
        
    return {"reply": "I am your AI mentor! I can help you with your placement preparation. Try asking 'Am I placement ready?' or 'What are my weak areas?'"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
