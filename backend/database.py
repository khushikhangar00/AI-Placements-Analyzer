from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.orm import sessionmaker
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DBStudentProfile(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    branch = Column(String, index=True)
    year = Column(Integer)
    cgpa = Column(Float)
    target_companies = Column(String)  # Comma separated
    available_study_hours = Column(Integer)
    
    history = relationship("DBTrackerHistory", back_populates="student")

class DBTrackerHistory(Base):
    __tablename__ = "tracker_history"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    coding_score = Column(Float)
    aptitude_score = Column(Float)
    communication_score = Column(Float)
    technical_score = Column(Float)
    resume_score = Column(Float)
    interview_score = Column(Float)
    
    study_hours_coding = Column(Integer)
    study_hours_aptitude = Column(Integer)
    study_hours_communication = Column(Integer)
    study_hours_technical = Column(Integer)
    
    mock_test_accuracy = Column(Float)
    company_target = Column(String)
    
    readiness_score = Column(Float)
    
    student = relationship("DBStudentProfile", back_populates="history")

Base.metadata.create_all(bind=engine)
