import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageCircle, Send, CheckCircle, AlertCircle, BarChart3, TrendingUp, BookOpen, Clock, User, AlertTriangle } from 'lucide-react';
import './index.css';

const API_URL = 'http://localhost:8000';

function App() {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    branch: 'Computer Science',
    year: 4,
    cgpa: 8.5,
    target_companies: ['TCS', 'Infosys'],
    available_study_hours: 20
  });

  const [tracker, setTracker] = useState({
    student_id: 1,
    coding: 65,
    aptitude: 70,
    communication: 60,
    technical: 75,
    resume: 80,
    interview: 55,
    study_hours: 15,
    study_hours_coding: 5,
    study_hours_aptitude: 4,
    study_hours_communication: 3,
    study_hours_technical: 3,
    mock_test_accuracy: 68,
    company_target: 'TCS'
  });

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { text: "Hello! I am your AI Mentor. How can I help you today?", isBot: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/history/1`);
      setTrendData(response.data.trend);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleTrackerChange = (e) => {
    setTracker({ ...tracker, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      await axios.post(`${API_URL}/api/profile`, profile);
      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
    }
    setProfileSaving(false);
  };

  const analyzePerformance = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/analyze`, tracker);
      setAnalysis(response.data);
      fetchHistory(); // Refresh chart data after saving new analysis
    } catch (error) {
      console.error('Error analyzing performance:', error);
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { text: chatInput, isBot: false };
    setChatMessages([...chatMessages, userMsg]);
    setChatInput('');
    
    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: userMsg.text,
        tracker_data: tracker
      });
      setChatMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
    } catch (error) {
      console.error('Error in chat:', error);
    }
  };

  return (
    <div className="container" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '10px' }}>
          Placement Performance Analyzer
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
          AI-Powered Insights to Boost Your Placement Readiness
        </p>
      </header>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Left Column: Data Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Student Profile Module */}
          <div className="glass-panel">
            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User className="gradient-text" /> Student Profile
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label>Name</label>
                <input type="text" className="input-field" name="name" value={profile.name} onChange={handleProfileChange} />
              </div>
              <div>
                <label>Branch</label>
                <input type="text" className="input-field" name="branch" value={profile.branch} onChange={handleProfileChange} />
              </div>
              <div>
                <label>Year</label>
                <input type="number" className="input-field" name="year" value={profile.year} onChange={handleProfileChange} />
              </div>
              <div>
                <label>CGPA</label>
                <input type="number" step="0.1" className="input-field" name="cgpa" value={profile.cgpa} onChange={handleProfileChange} />
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={saveProfile}>
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

          {/* Preparation Tracker */}
          <div className="glass-panel">
            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle className="gradient-text" /> Preparation Tracker
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label>Target Company</label>
                <select 
                  className="input-field" 
                  name="company_target" 
                  value={tracker.company_target} 
                  onChange={handleTrackerChange}
                >
                  <option value="TCS">TCS</option>
                  <option value="Infosys">Infosys</option>
                  <option value="Wipro">Wipro</option>
                  <option value="Accenture">Accenture</option>
                  <option value="Deloitte">Deloitte</option>
                </select>
              </div>
              <div>
                <label>Mock Test Accuracy %</label>
                <input type="number" className="input-field" name="mock_test_accuracy" value={tracker.mock_test_accuracy} onChange={handleTrackerChange} />
              </div>

              {/* Scores */}
              <div><label>Coding Score (0-100)</label><input type="number" className="input-field" name="coding" value={tracker.coding} onChange={handleTrackerChange} /></div>
              <div><label>Aptitude Score (0-100)</label><input type="number" className="input-field" name="aptitude" value={tracker.aptitude} onChange={handleTrackerChange} /></div>
              <div><label>Communication (0-100)</label><input type="number" className="input-field" name="communication" value={tracker.communication} onChange={handleTrackerChange} /></div>
              <div><label>Technical Score (0-100)</label><input type="number" className="input-field" name="technical" value={tracker.technical} onChange={handleTrackerChange} /></div>
              <div><label>Interview Prep (0-100)</label><input type="number" className="input-field" name="interview" value={tracker.interview} onChange={handleTrackerChange} /></div>
              <div><label>Resume (0-100)</label><input type="number" className="input-field" name="resume" value={tracker.resume} onChange={handleTrackerChange} /></div>

              {/* Study Hours */}
              <div style={{ gridColumn: 'span 2', marginTop: '10px' }}><strong style={{ color: '#cbd5e1' }}>Weekly Study Hours Breakdown</strong></div>
              <div><label>Total Study Hrs</label><input type="number" className="input-field" name="study_hours" value={tracker.study_hours} onChange={handleTrackerChange} /></div>
              <div><label>Coding Hrs</label><input type="number" className="input-field" name="study_hours_coding" value={tracker.study_hours_coding} onChange={handleTrackerChange} /></div>
              <div><label>Aptitude Hrs</label><input type="number" className="input-field" name="study_hours_aptitude" value={tracker.study_hours_aptitude} onChange={handleTrackerChange} /></div>
              <div><label>Comm/Tech Hrs</label><input type="number" className="input-field" name="study_hours_communication" value={tracker.study_hours_communication} onChange={handleTrackerChange} /></div>
            </div>
            
            <button className="btn-primary" style={{ width: '100%', marginTop: '20px', fontSize: '1.1rem' }} onClick={analyzePerformance}>
              {loading ? 'Analyzing...' : 'Generate AI Analysis'}
            </button>
          </div>
        </div>

        {/* Right Column: Analytics Dashboard */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 className="gradient-text" /> AI Placement Analysis
          </h2>
          
          {analysis ? (
            <div className="analysis-results" style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
              
              {/* Risk Alert */}
              {analysis.risk_analysis && analysis.risk_analysis.is_at_risk && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', marginBottom: '10px' }}>
                    <AlertTriangle size={24} /> PLACEMENT RISK DETECTED
                  </h3>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <strong>Risk Flags:</strong>
                      <ul style={{ margin: '8px 0 0 20px', color: '#fca5a5' }}>
                        {analysis.risk_analysis.risk_flags.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong>Recovery Plan:</strong>
                      <ul style={{ margin: '8px 0 0 20px', color: '#fca5a5' }}>
                        {analysis.risk_analysis.recovery_plan.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
                  <div className="score-circle" style={{ '--score': analysis.readiness_score }}>
                    <span>{analysis.readiness_score}%</span>
                  </div>
                  <h3>Readiness Score</h3>
                  <p style={{ color: analysis.readiness_score > 70 ? 'var(--accent)' : 'var(--warning)', marginTop: '8px' }}>
                    Status: {analysis.readiness_level}
                  </p>
                </div>
                
                <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
                  <div className="score-circle" style={{ '--score': analysis.placement_probability, background: `conic-gradient(var(--secondary) calc(${analysis.placement_probability} * 1%), rgba(255,255,255,0.1) 0)` }}>
                    <span>{analysis.placement_probability}%</span>
                  </div>
                  <h3>Probability of Selection</h3>
                  <p style={{ color: analysis.predicted_status === 'Likely' ? 'var(--accent)' : 'var(--warning)', marginTop: '8px' }}>
                    {analysis.predicted_status} for {tracker.company_target}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--danger)' }}>
                    <AlertCircle size={20} /> Weak Areas Identified
                  </h3>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {analysis.weak_areas.map((weakness, i) => (
                      <li key={i} style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px 15px', borderRadius: '8px', marginBottom: '8px', borderLeft: '4px solid var(--danger)' }}>
                        {weakness}
                      </li>
                    ))}
                    {analysis.weak_areas.length === 0 && <p>No major weak areas! Keep it up.</p>}
                  </ul>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent)' }}>
                    <TrendingUp size={20} /> Skill Gap for {tracker.company_target}
                  </h3>
                  {Object.entries(analysis.skill_gap).map(([skill, data]) => (
                    <div key={skill} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'capitalize' }}>{skill}</span>
                        <span>{data.current}% / {data.required}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${(data.current / data.required) * 100}%`, height: '100%', background: 'var(--warning)', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
                  {Object.keys(analysis.skill_gap).length === 0 && <p>You meet all skill requirements!</p>}
                </div>
              </div>

              {/* Time Utilization Analysis */}
              {analysis.time_analysis && (
                <div style={{ marginTop: '30px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary)' }}>
                    <Clock size={20} /> Time Utilization Analyzer
                  </h3>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', minWidth: '120px' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{analysis.time_analysis.productivity_score}</span>
                      <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Productivity Score</p>
                    </div>
                    <div>
                      <ul style={{ listStyleType: 'disc', margin: '0 0 0 20px', padding: 0 }}>
                        {analysis.time_analysis.suggestions.map((s, i) => <li key={i} style={{ marginBottom: '6px' }}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Chart */}
              <div style={{ marginTop: '30px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '20px' }}>Readiness Trend History</h3>
                <div style={{ height: '250px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="#cbd5e1" />
                      <YAxis stroke="#cbd5e1" domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: 'white' }} />
                      <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ fill: 'var(--secondary)', r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Study Plan */}
              <div style={{ marginTop: '30px' }}>
                 <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--secondary)' }}>
                    <BookOpen size={20} /> Personalized Study Plan
                  </h3>
                  <div style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '10px' }}>
                    {Object.entries(analysis.study_plan).map(([day, tasks]) => (
                      <div key={day} style={{ minWidth: '150px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                        <strong style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>{day}</strong>
                        {Array.isArray(tasks) ? tasks.map((t, i) => <div key={i} style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> {t}</div>) : <p style={{ fontSize: '0.85rem' }}>{tasks}</p>}
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexDirection: 'column' }}>
              <BarChart3 size={64} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>Enter your tracking details and click "Generate AI Analysis" to see your personalized placement report.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Chatbot */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
        {chatOpen ? (
          <div className="glass-panel" style={{ width: '350px', height: '500px', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={20} /> AI Mentor
              </h3>
              <button onClick={() => setChatOpen(false)} style={{ background: 'none', padding: 0, color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', background: msg.isBot ? 'rgba(255,255,255,0.1)' : 'var(--primary)', padding: '10px 14px', borderRadius: '12px', maxWidth: '85%', fontSize: '0.9rem' }}>
                  {msg.text}
                </div>
              ))}
            </div>
            
            <div style={{ padding: '16px', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="input-field" 
                style={{ margin: 0 }} 
                placeholder="Ask about your readiness..." 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="btn-primary" style={{ padding: '12px' }} onClick={handleSendMessage}>
                <Send size={18} />
              </button>
            </div>
          </div>
        ) : (
          <button 
            className="btn-primary" 
            style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)' }}
            onClick={() => setChatOpen(true)}
          >
            <MessageCircle size={28} />
          </button>
        )}
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;

