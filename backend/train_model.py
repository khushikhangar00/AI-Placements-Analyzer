import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

def train_and_evaluate():
    # Load dataset
    df = pd.read_csv('student_data.csv')
    
    # Feature Engineering
    # Company Target is categorical, need to encode it
    df = pd.get_dummies(df, columns=['Company_Target'], drop_first=True)
    
    X = df.drop('Placement_Status', axis=1)
    y = df['Placement_Status']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
    }
    
    best_model = None
    best_accuracy = 0
    best_name = ""
    
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f"--- {name} ---")
        print(f"Accuracy: {acc:.4f}")
        print(classification_report(y_test, y_pred))
        
        if acc > best_accuracy:
            best_accuracy = acc
            best_model = model
            best_name = name
            
    print(f"Best Model: {best_name} with Accuracy: {best_accuracy:.4f}")
    
    # Save the best model and the expected feature columns
    joblib.dump(best_model, 'best_placement_model.pkl')
    joblib.dump(list(X.columns), 'model_features.pkl')
    print("Model saved to best_placement_model.pkl")

if __name__ == "__main__":
    train_and_evaluate()
