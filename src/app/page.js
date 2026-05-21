'use client';
import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function Home() {
  const [step, setStep] = useState('form'); // 'form', 'loading', 'result'
  const [expandedCard, setExpandedCard] = useState(null);
  const [resultData, setResultData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    birthTime: '',
    gender: 'boy',
    vibe: 'modern'
  });

  const handleInputChange = (e) => {
    const { id, name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id || name]: value
    }));
  };

  const handlePaymentSuccess = async () => {
    setStep('loading');
    
    try {
      const response = await fetch('/api/generate-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if(data.sajuAnalysis && data.names) {
        setResultData(data);
        setStep('result');
      } else {
        alert("Failed to generate names. Please try again.");
        setStep('form');
      }
    } catch(e) {
      console.error(e);
      alert("Error calling AI. Please try again.");
      setStep('form');
    }
  };

  const resetForm = () => {
    setStep('form');
    setExpandedCard(null);
    setResultData(null);
  };

  const toggleDetails = (rank) => {
    setExpandedCard(expandedCard === rank ? null : rank);
  };

  // Helper function to draw the SVG Life Graph
  const renderLifeGraph = (graphData) => {
    if (!graphData || graphData.length !== 4) return null;
    
    // SVG Dimensions
    const w = 400;
    const h = 150;
    const padX = 40;
    const padY = 20;
    
    // Calculate points
    const points = graphData.map((d, i) => {
      const x = padX + (i * ((w - 2 * padX) / 3));
      // Invert Y axis (higher score = higher visually, meaning lower Y coordinate)
      const y = h - padY - (d.score / 100) * (h - 2 * padY);
      return { x, y, stage: d.stage, score: d.score };
    });

    // Create polyline string
    const polylinePts = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <div className="life-graph-container">
        <h3>📈 Life Trajectory Graph</h3>
        <p className="life-graph-desc">A visual representation of the baby's natural fortune flow over time.</p>
        <svg viewBox={`0 0 ${w} ${h}`} className="life-graph-svg">
          {/* Grid lines */}
          <line x1={padX} y1={padY} x2={w-padX} y2={padY} stroke="#e0e0e0" strokeDasharray="4" />
          <line x1={padX} y1={h/2} x2={w-padX} y2={h/2} stroke="#e0e0e0" strokeDasharray="4" />
          <line x1={padX} y1={h-padY} x2={w-padX} y2={h-padY} stroke="#e0e0e0" strokeDasharray="4" />
          
          {/* Connecting Line */}
          <polyline 
            points={polylinePts}
            fill="none" 
            stroke="var(--secondary-color)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="var(--gold)" stroke="#fff" strokeWidth="2" />
              <text x={p.x} y={p.y - 12} fontSize="10" textAnchor="middle" fill="var(--text-main)" fontWeight="bold">{p.score}</text>
              <text x={p.x} y={h - 5} fontSize="10" textAnchor="middle" fill="var(--text-light)">{p.stage.split(' ')[0]}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <>
      <div className="background-elements">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>

      <div className="container">
        <header>
          <h1>Saju Baby Naming</h1>
          <p>Discover your child's perfect Korean name through ancient Eastern astrology and modern AI</p>
        </header>

        <main className="glass-panel">
          {step === 'form' && (
            <form id="namingForm" onSubmit={(e) => e.preventDefault()}>
              {/* Form Content Omitted for Brevity in logic, exact same as before */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Intended English Name</label>
                  <input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="e.g. Leo" required />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Family Last Name</label>
                  <input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="e.g. Smith" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="birthDate">Expected Birth Date</label>
                  <input type="date" id="birthDate" value={formData.birthDate} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="birthTime">Expected Birth Time</label>
                  <input type="time" id="birthTime" value={formData.birthTime} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Baby's Gender</label>
                <div className="radio-group">
                  <label className="radio-btn">
                    <input type="radio" name="gender" value="boy" checked={formData.gender === 'boy'} onChange={handleInputChange} required /> <span>Boy</span>
                  </label>
                  <label className="radio-btn">
                    <input type="radio" name="gender" value="girl" checked={formData.gender === 'girl'} onChange={handleInputChange} /> <span>Girl</span>
                  </label>
                  <label className="radio-btn">
                    <input type="radio" name="gender" value="unknown" checked={formData.gender === 'unknown'} onChange={handleInputChange} /> <span>Surprise me</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="vibe">Preferred Name Vibe</label>
                <select id="vibe" value={formData.vibe} onChange={handleInputChange} required>
                  <option value="modern">Modern & Trendy</option>
                  <option value="classic">Classic & Noble</option>
                  <option value="soft">Soft & Warm</option>
                  <option value="strong">Strong & Resilient</option>
                  <option value="neutral">Gender-Neutral</option>
                </select>
              </div>

              <div className="payment-section">
                <div className="price-info">
                  <span className="price-label">Premium AI Saju Analysis</span>
                  <span className="price-amount">$2.99</span>
                </div>
                
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <PayPalScriptProvider options={{ "client-id": "AZjtN3-Erdz5rGDcBoj-UKQT4gc5qSkbmw1LXtdvNxua7ibRJN8dgWbjh-sEQyoc2KN2QdOQCMZC20-t", currency: "USD", intent: "capture" }}>
                    <PayPalButtons 
                      style={{ layout: "vertical", shape: "pill", color: "gold", height: 45 }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [
                            {
                              description: "Premium AI Saju Naming Analysis",
                              amount: {
                                value: "2.99",
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={async (data, actions) => {
                        const details = await actions.order.capture();
                        console.log("Transaction completed by " + details.payer.name.given_name);
                        handlePaymentSuccess();
                      }}
                      onError={(err) => {
                        console.error("PayPal Checkout onError", err);
                        alert("Payment could not be processed. Please try again.");
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
                
                <p className="secure-text">🔒 Protected by secure payment systems.</p>

                <div className="disclaimer-box">
                  <h4>⚠️ Terms & Disclaimer</h4>
                  <p>
                    This service is provided for <strong>entertainment purposes only</strong>. The AI-generated Saju analysis and name recommendations are based on traditional cultural beliefs and do not guarantee specific life outcomes.
                    <br/><br/>
                    <strong>Refund Policy:</strong> Due to the immediate delivery of digital AI-generated content, <strong>all sales are final and non-refundable</strong>. By proceeding with the payment, you agree to these terms.
                  </p>
                </div>
              </div>
            </form>
          )}

          {step === 'loading' && (
            <div className="loader" id="loader">
              <div className="spinner"></div>
              <p>Aligning the stars and analyzing Eastern elements...</p>
            </div>
          )}

          {step === 'result' && resultData && (
            <div id="resultContent" className="result-content">
              <h2>Your Saju Analysis is Ready!</h2>
              
              <div className="saju-analysis">
                <h3>📊 Yin-Yang & Five Elements (Saju)</h3>
                <div className="elements-chart">
                  <div className={`element ${resultData.sajuAnalysis.wood > 2 ? 'highlight' : ''}`}><span className="icon">🌳</span><span className="name">Wood</span><span className="count">{resultData.sajuAnalysis.wood}</span></div>
                  <div className={`element ${resultData.sajuAnalysis.fire > 2 ? 'highlight' : ''}`}><span className="icon">🔥</span><span className="name">Fire</span><span className="count">{resultData.sajuAnalysis.fire}</span></div>
                  <div className={`element ${resultData.sajuAnalysis.earth > 2 ? 'highlight' : ''}`}><span className="icon">⛰️</span><span className="name">Earth</span><span className="count">{resultData.sajuAnalysis.earth}</span></div>
                  <div className={`element ${resultData.sajuAnalysis.metal > 2 ? 'highlight' : ''}`}><span className="icon">⚔️</span><span className="name">Metal</span><span className="count">{resultData.sajuAnalysis.metal}</span></div>
                  <div className={`element ${resultData.sajuAnalysis.water > 2 ? 'highlight' : ''}`}><span className="icon">💧</span><span className="name">Water</span><span className="count">{resultData.sajuAnalysis.water}</span></div>
                </div>
                <p className="saju-desc-summary">
                  {resultData.sajuAnalysis.description}
                </p>
                
                <div className="saju-details">
                  <div className="saju-detail-card">
                    <h4>🤝 Personality & Social Dynamics</h4>
                    <p>{resultData.sajuAnalysis.details.personality}</p>
                  </div>
                  <div className="saju-detail-card">
                    <h4>💼 Academics & Career Fortune</h4>
                    <p>{resultData.sajuAnalysis.details.career}</p>
                  </div>
                  <div className="saju-detail-card">
                    <h4>💎 Financial Capability & Wealth</h4>
                    <p>{resultData.sajuAnalysis.details.wealth}</p>
                  </div>
                  <div className="saju-detail-card">
                    <h4>🌊 Life's Natural Rhythm</h4>
                    <p>{resultData.sajuAnalysis.details.lifeRhythm}</p>
                  </div>
                  <div className="saju-detail-card">
                    <h4>👨‍👩‍👧 Relationship with Parents</h4>
                    <p>{resultData.sajuAnalysis.details.parents}</p>
                  </div>
                </div>

                <div className="parenting-tip-box">
                  <h4>✨ Future-Oriented Parenting Tip</h4>
                  <p>{resultData.sajuAnalysis.parentingTip}</p>
                </div>
              </div>

              {renderLifeGraph(resultData.lifeGraph)}
              
              <p className="instruction-text">✨ Click on a name to see how it shapes their destiny!</p>

              <div className="name-recommendations">
                {resultData.names.map((nameData, index) => {
                  const rankClasses = ['rank-1', 'rank-2', 'rank-3'];
                  const rankBadges = ['🥇 1st Choice', '🥈 2nd Choice', '🥉 3rd Choice'];
                  const rank = index + 1;
                  
                  return (
                    <div key={index} className={`name-card ${rankClasses[index]}`} onClick={() => toggleDetails(rank)}>
                      <div className="rank-badge">{rankBadges[index]}</div>
                      <div className="name-header">
                        <h3 className="pronunciation">{nameData.pronunciation}</h3>
                        <span className="korean-name">{nameData.hangul}</span>
                      </div>
                      <p className="hanja">{nameData.hanja}</p>
                      <p className="meaning">{nameData.meaning}</p>
                      {expandedCard !== rank && <p className="click-hint">Tap to see destiny details ▾</p>}
                      
                      {expandedCard === rank && (
                        <div className="expanded-details storytelling-details">
                          <div className="detail-item">
                            <h4>⚖️ Destiny Compensation Story</h4>
                            <p>{nameData.compensationStory}</p>
                          </div>
                          <div className="detail-item">
                            <h4>🚀 Maximized Abilities</h4>
                            <p>{nameData.maximizedAbilities}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button className="retry-btn" onClick={resetForm}>Start Over</button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
