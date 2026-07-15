import pandas as pd
import numpy as np
import random
import os

def generate_synthetic_data(num_records=1000, output_path='student_data.csv'):
    np.random.seed(42)
    random.seed(42)

    companies = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'Capgemini', 'Deloitte']

    data = []
    for _ in range(num_records):
        cgpa = round(random.uniform(5.0, 10.0), 2)
        study_hours = random.randint(10, 50)  # hours per week
        mock_test_accuracy = random.randint(40, 100)
        
        # Determine base correlation with study hours and cgpa
        base_score = (cgpa * 10) * 0.4 + (study_hours * 2) * 0.4 + (mock_test_accuracy) * 0.2
        
        aptitude_score = min(100, max(0, int(base_score + random.uniform(-10, 10))))
        coding_score = min(100, max(0, int(base_score + random.uniform(-15, 15))))
        comm_score = min(100, max(0, int(base_score + random.uniform(-15, 10))))
        tech_score = min(100, max(0, int(base_score + random.uniform(-10, 10))))
        resume_score = min(100, max(0, int(base_score + random.uniform(-10, 15))))
        interview_score = min(100, max(0, int(base_score + random.uniform(-15, 10))))
        
        company_target = random.choice(companies)
        
        # Placement probability logic
        # Weights
        placement_prob = (coding_score * 0.35 + aptitude_score * 0.25 + 
                          comm_score * 0.15 + tech_score * 0.15 + 
                          resume_score * 0.05 + interview_score * 0.05)
        
        # Threshold for placement changes based on company target
        thresholds = {
            'Deloitte': 85,
            'Accenture': 80,
            'TCS': 70,
            'Infosys': 75,
            'Wipro': 70,
            'Cognizant': 75,
            'Capgemini': 75
        }
        
        placement_status = 1 if placement_prob >= thresholds[company_target] else 0
        
        data.append([
            cgpa, aptitude_score, coding_score, comm_score, tech_score, 
            resume_score, interview_score, study_hours, mock_test_accuracy, 
            company_target, placement_status
        ])
        
    df = pd.DataFrame(data, columns=[
        'CGPA', 'Aptitude_Score', 'Coding_Score', 'Communication_Score', 
        'Technical_Score', 'Resume_Score', 'Interview_Score', 'Study_Hours', 
        'Mock_Test_Accuracy', 'Company_Target', 'Placement_Status'
    ])
    
    df.to_csv(output_path, index=False)
    print(f"Generated {num_records} records and saved to {output_path}")
    return df

if __name__ == "__main__":
    generate_synthetic_data(1000, 'student_data.csv')
