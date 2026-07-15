import joblib
import pandas as pd
import numpy as np

class MLEngine:
    def __init__(self, model_path='best_placement_model.pkl', features_path='model_features.pkl'):
        try:
            self.model = joblib.load(model_path)
            self.features = joblib.load(features_path)
        except Exception as e:
            print(f"Warning: Model not found. Please run train_model.py first. {e}")
            self.model = None
            self.features = None

    def calculate_readiness_score(self, profile_data):
        # Weighted parameters
        weights = {
            'coding': 0.35,
            'aptitude': 0.25,
            'communication': 0.15,
            'technical': 0.15,
            'resume': 0.05,
            'interview': 0.05
        }
        
        score = (
            profile_data.get('coding', 0) * weights['coding'] +
            profile_data.get('aptitude', 0) * weights['aptitude'] +
            profile_data.get('communication', 0) * weights['communication'] +
            profile_data.get('technical', 0) * weights['technical'] +
            profile_data.get('resume', 0) * weights['resume'] +
            profile_data.get('interview', 0) * weights['interview']
        )
        
        if score <= 40:
            level = "Poor"
        elif score <= 60:
            level = "Average"
        elif score <= 80:
            level = "Good"
        else:
            level = "Excellent"
            
        return round(score, 2), level

    def predict_placement_probability(self, profile_data):
        if not self.model or not self.features:
            return 0.0, "Unknown (Model missing)"
            
        # Convert profile_data to dataframe
        # Need to match self.features
        # Example profile_data map
        input_dict = {
            'CGPA': profile_data.get('cgpa', 0),
            'Aptitude_Score': profile_data.get('aptitude', 0),
            'Coding_Score': profile_data.get('coding', 0),
            'Communication_Score': profile_data.get('communication', 0),
            'Technical_Score': profile_data.get('technical', 0),
            'Resume_Score': profile_data.get('resume', 0),
            'Interview_Score': profile_data.get('interview', 0),
            'Study_Hours': profile_data.get('study_hours', 0),
            'Mock_Test_Accuracy': profile_data.get('mock_test_accuracy', 0)
        }
        
        company = profile_data.get('company_target', 'TCS')
        
        # Initialize all features to 0
        df_input = pd.DataFrame(columns=self.features)
        df_input.loc[0] = 0
        
        for col in input_dict:
            if col in df_input.columns:
                df_input.at[0, col] = input_dict[col]
                
        # Set the company dummy variable if it exists
        company_col = f"Company_Target_{company}"
        if company_col in df_input.columns:
            df_input.at[0, company_col] = 1
            
        prob = self.model.predict_proba(df_input)[0][1] * 100
        
        status = "Likely" if prob >= 70 else "Unlikely"
        return round(prob, 2), status
        
    def detect_weak_areas(self, profile_data):
        weaknesses = []
        if profile_data.get('coding', 0) < 60: weaknesses.append("Coding")
        if profile_data.get('aptitude', 0) < 60: weaknesses.append("Aptitude")
        if profile_data.get('communication', 0) < 60: weaknesses.append("Communication")
        if profile_data.get('technical', 0) < 60: weaknesses.append("Technical Subjects")
        if profile_data.get('resume', 0) < 60: weaknesses.append("Resume Quality")
        if profile_data.get('interview', 0) < 60: weaknesses.append("Interview Prep")
        
        return weaknesses

    def analyze_skill_gap(self, profile_data, target_company='TCS'):
        # Just some dummy expected values depending on company
        expected = {
            'coding': 85 if target_company in ['Amazon', 'Google'] else 70,
            'aptitude': 80 if target_company in ['TCS', 'Infosys'] else 70,
            'communication': 85 if target_company in ['Deloitte', 'Accenture'] else 70
        }
        
        gaps = {}
        for skill in ['coding', 'aptitude', 'communication']:
            current = profile_data.get(skill, 0)
            req = expected.get(skill, 70)
            if current < req:
                gaps[skill] = {
                    'current': current,
                    'required': req,
                    'gap': req - current
                }
        return gaps

    def generate_study_plan(self, weak_areas, available_hours):
        # Simple allocation based on weak areas
        plan = {"Monday": [], "Tuesday": [], "Wednesday": [], "Thursday": [], "Friday": [], "Saturday": [], "Sunday": []}
        if not weak_areas:
            return {"Message": "You are well prepared. Do light revision."}
            
        hours_per_day = available_hours / 7
        hours_per_topic = hours_per_day / len(weak_areas)
        
        for day in plan:
            for area in weak_areas:
                plan[day].append(f"{area}: {round(hours_per_topic, 1)} hrs")
                
        return plan

    def detect_placement_risk(self, profile_data, readiness_score):
        risk_flags = []
        if readiness_score < 50:
            risk_flags.append("Readiness Score below 50%")
        if profile_data.get('coding', 0) < 40:
            risk_flags.append("Coding Score below 40%")
        if profile_data.get('communication', 0) < 40:
            risk_flags.append("Communication Score below 40%")
            
        is_at_risk = len(risk_flags) > 0
        
        recovery_plan = []
        if is_at_risk:
            if profile_data.get('coding', 0) < 40:
                recovery_plan.append("Immediate Action: Dedicate 2 hours daily to basic Data Structures (Arrays, Strings).")
            if profile_data.get('communication', 0) < 40:
                recovery_plan.append("Immediate Action: Participate in daily mock group discussions or practice speaking for 30 mins.")
            if readiness_score < 50:
                recovery_plan.append("General Action: Increase overall study hours by 20% and take weekly mock tests.")
                
        return {
            "is_at_risk": is_at_risk,
            "risk_flags": risk_flags,
            "recovery_plan": recovery_plan
        }

    def analyze_time_utilization(self, profile_data):
        total_hours = profile_data.get('study_hours', 0)
        # Using section-wise hours or defaulting to a split if not provided
        coding_hrs = profile_data.get('study_hours_coding', total_hours * 0.4)
        aptitude_hrs = profile_data.get('study_hours_aptitude', total_hours * 0.3)
        comm_hrs = profile_data.get('study_hours_communication', total_hours * 0.15)
        tech_hrs = profile_data.get('study_hours_technical', total_hours * 0.15)
        
        suggestions = []
        productivity_score = 100
        
        if coding_hrs < 5:
            suggestions.append("Coding practice is too low. Increase to at least 5 hours/week.")
            productivity_score -= 15
        if comm_hrs < 2:
            suggestions.append("Communication practice is very low. Dedicate at least 2 hours/week.")
            productivity_score -= 10
        if aptitude_hrs < 3:
            suggestions.append("Aptitude practice needs more attention.")
            productivity_score -= 10
            
        if total_hours < 10:
            suggestions.append("Overall study hours are too low for effective placement preparation.")
            productivity_score -= 20
        elif total_hours > 50:
            suggestions.append("You are studying a lot, make sure to avoid burnout and maintain high quality of focus.")
            
        return {
            "productivity_score": max(0, productivity_score),
            "suggestions": suggestions if suggestions else ["Your time utilization looks good! Keep it up."],
            "breakdown": {
                "coding": coding_hrs,
                "aptitude": aptitude_hrs,
                "communication": comm_hrs,
                "technical": tech_hrs
            }
        }

