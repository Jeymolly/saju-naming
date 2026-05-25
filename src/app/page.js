'use client';
import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import html2canvas from 'html2canvas';

const Leaf = ({ x, y, rot }) => (
  <path 
    d={`M${x} ${y} C${x-3} ${y-6} ${x-3.5} ${y-12} ${x} ${y-16} C${x+3.5} ${y-12} ${x+3} ${y-6} ${x} ${y}Z`} 
    transform={`rotate(${rot}, ${x}, ${y})`} 
  />
);

const GoldLeaf = ({ flip }) => (
  <svg 
    width="50" height="110" 
    viewBox="0 0 40 70" 
    fill="var(--gold)" 
    stroke="var(--gold)" 
    strokeWidth="1" 
    strokeLinejoin="round"
    style={{ transform: flip ? 'scaleX(-1)' : 'none', margin: '0 5px', opacity: 0.85 }}
  >
    <path d="M10 65 Q 35 35 25 5" fill="none" strokeWidth="2" />
    <Leaf x={25} y={5} rot={20} />
    
    <Leaf x={26.5} y={17} rot={-35} />
    <Leaf x={28.5} y={17} rot={55} />
    
    <Leaf x={26.5} y={29} rot={-40} />
    <Leaf x={28.5} y={29} rot={60} />
    
    <Leaf x={23.5} y={41} rot={-45} />
    <Leaf x={25.5} y={41} rot={65} />
    
    <Leaf x={17.5} y={53} rot={-50} />
    <Leaf x={20} y={53} rot={70} />
  </svg>
);

export default function Home() {
  const [step, setStep] = useState('form'); // 'form', 'loading', 'result'
  const [expandedCard, setExpandedCard] = useState(null);
  const [resultData, setResultData] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    birthTime: '',
    gender: 'female',
    vibe: 'modern'
  });

  const handleInputChange = (e) => {
    const { id, name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id || name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePaymentSuccess = async (isFree = false) => {
    setStep('loading');
    
    try {
      const response = await fetch('/api/generate-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, isFree })
      });
      
      const data = await response.json();
      
      if(data.sajuAnalysis) {
        setResultData({ ...data, isFree });
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

  const handleSaveImage = async () => {
    const element = document.getElementById('resultContent');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#FAFAFA' });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `Saju_Analysis_${formData.firstName || 'My'}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to save image", err);
      alert("Failed to save image. Please try again.");
    }
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
            <GoldLeaf flip={true} />
            <h1 style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', margin: 0 }}>
              <span>Korean Fortune</span>
              <span style={{ fontSize: '0.6em', color: 'var(--secondary-color)', margin: '-8px 0' }}>&</span>
              <span>Name Studio</span>
            </h1>
            <GoldLeaf flip={false} />
          </div>
          <p>Discover your true inner value through the ancient Korean Life Code and find a Talisman Name that brings good fortune to your future.</p>
        </header>

        <main className="glass-panel">
          {step === 'form' && (
            <form id="namingForm" onSubmit={(e) => e.preventDefault()}>
              {/* Form Content Omitted for Brevity in logic, exact same as before */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name / Intended Name</label>
                  <input type="text" id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="e.g. Leo" />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Family Last Name</label>
                  <input type="text" id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="e.g. Smith" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="birthDate">Birth Date</label>
                  <input type="date" id="birthDate" value={formData.birthDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="birthTime">Birth Time</label>
                  <select id="birthTime" value={formData.birthTime} onChange={handleInputChange}>
                    <option value="">Unknown (I don't know)</option>
                    <option value="00:30">23:30 ~ 01:29 (Ja-si / 子時 - Rat)</option>
                    <option value="02:30">01:30 ~ 03:29 (Chuk-si / 丑時 - Ox)</option>
                    <option value="04:30">03:30 ~ 05:29 (In-si / 寅時 - Tiger)</option>
                    <option value="06:30">05:30 ~ 07:29 (Myo-si / 卯時 - Rabbit)</option>
                    <option value="08:30">07:30 ~ 09:29 (Jin-si / 辰時 - Dragon)</option>
                    <option value="10:30">09:30 ~ 11:29 (Sa-si / 巳時 - Snake)</option>
                    <option value="12:30">11:30 ~ 13:29 (O-si / 午時 - Horse)</option>
                    <option value="14:30">13:30 ~ 15:29 (Mi-si / 未時 - Sheep)</option>
                    <option value="16:30">15:30 ~ 17:29 (Sin-si / 申時 - Monkey)</option>
                    <option value="18:30">17:30 ~ 19:29 (Yu-si / 酉時 - Rooster)</option>
                    <option value="20:30">19:30 ~ 21:29 (Sul-si / 戌時 - Dog)</option>
                    <option value="22:30">21:30 ~ 23:29 (Hae-si / 亥時 - Pig)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Gender</label>
                <div className="radio-group">
                  <label className="radio-btn">
                    <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleInputChange} /> <span>Male</span>
                  </label>
                  <label className="radio-btn">
                    <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleInputChange} /> <span>Female</span>
                  </label>
                  <label className="radio-btn">
                    <input type="radio" name="gender" value="unknown" checked={formData.gender === 'unknown'} onChange={handleInputChange} /> <span>Surprise me</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="vibe">Preferred Name Vibe</label>
                <select id="vibe" value={formData.vibe} onChange={handleInputChange}>
                  <option value="modern">Modern & Trendy</option>
                  <option value="classic">Classic & Noble</option>
                  <option value="soft">Soft & Warm</option>
                  <option value="strong">Strong & Resilient</option>
                  <option value="neutral">Gender-Neutral</option>
                </select>
              </div>

              <div className="payment-section">
                <div style={{ color: '#d32f2f', fontSize: '0.85rem', textAlign: 'center', marginBottom: '15px' }}>
                  * You cannot see the results unless all required fields are filled.
                </div>
                {errorMessage && (
                  <div style={{ color: '#d32f2f', fontSize: '0.9rem', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
                    {errorMessage}
                  </div>
                )}
                
                <div className="price-info">
                  <span className="price-label">Premium AI Saju Analysis</span>
                  <span className="price-amount">$2.99</span>
                </div>
                
                <button 
                  type="button"
                  onClick={(e) => {
                    if (!formData.firstName || !formData.lastName || !formData.birthDate) {
                      setErrorMessage("모든 필수 칸(이름, 생년월일)을 입력하지 않으면 결과를 확인할 수 없습니다.");
                      return;
                    }
                    setErrorMessage("");
                    handlePaymentSuccess(true);
                  }}
                  className="free-reading-btn"
                >
                  🎁 Get Free Mini Reading
                </button>
                <div className="or-divider">OR</div>
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <button 
                    type="button"
                    onClick={(e) => {
                      if (!formData.firstName || !formData.lastName || !formData.birthDate) {
                        setErrorMessage("모든 필수 칸(이름, 생년월일)을 입력하지 않으면 결과를 확인할 수 없습니다.");
                        return;
                      }
                      setErrorMessage("");
                      handlePaymentSuccess(false);
                    }}
                    style={{ 
                      width: '100%', background: '#FFC439', color: '#000', border: 'none', borderRadius: '25px', padding: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '45px'
                    }}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{ height: '24px' }} />
                  </button>
                  <div style={{ display: 'none' }}>
                    <PayPalScriptProvider options={{ "client-id": "test", currency: "USD", intent: "capture" }}>
                      <PayPalButtons 
                        style={{ layout: "vertical", shape: "pill", color: "gold", height: 45 }}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [{ description: "Premium AI Saju Naming Analysis", amount: { value: "2.99" } }],
                          });
                        }}
                        onApprove={async (data, actions) => {
                          const details = await actions.order.capture();
                          handlePaymentSuccess(false);
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>
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
                {resultData.isFree && (
                  <div className="premium-upsell-container">
                    <div className="premium-upsell-overlay">
                      <h3>🔒 Unlock Your Destiny</h3>
                      <p>Discover your perfectly balanced Korean Talisman Names, full personality analysis, and Lifetime Fortune Graph!</p>
                      
                      <div className="price-info" style={{ marginTop: '15px' }}>
                        <span className="price-label">Premium Upgrade</span>
                        <span className="price-amount">$2.99</span>
                      </div>
                      
                      <div style={{ position: 'relative', zIndex: 10, width: '100%', marginTop: '15px' }}>
                        <button 
                          onClick={(e) => { e.preventDefault(); handlePaymentSuccess(false); }} 
                          style={{ 
                            width: '100%', background: '#FFC439', color: '#000', border: 'none', borderRadius: '25px', padding: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '45px'
                          }}
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{ height: '24px' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!resultData.isFree && (
                  <>
                    <div className="saju-details">
                      <div className="saju-detail-card">
                        <h4>🤝 Personality & Inner Self</h4>
                        <p>{resultData.sajuAnalysis.details.personality}</p>
                      </div>
                      <div className="saju-detail-card">
                        <h4>💼 Academics, Career & Success</h4>
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
                        <h4>👨‍👩‍👧 Relationship with Family</h4>
                        <p>{resultData.sajuAnalysis.details.parents}</p>
                      </div>
                    </div>

                    <div className="parenting-tip-box">
                      <h4>✨ Destiny & Fortune Guide</h4>
                      <p>{resultData.sajuAnalysis.destinyGuide}</p>
                    </div>
                  </>
                )}
              </div>

              {!resultData.isFree && (
                <>
                  {renderLifeGraph(resultData.lifeGraph)}
                  
                  <p className="instruction-text">✨ Click on a name to see how it shapes your destiny!</p>

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
                </>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                <button className="retry-btn" style={{ background: '#4CAF50', color: 'white', border: 'none' }} onClick={handleSaveImage}>
                  📸 Save Result as Image
                </button>
                <button className="retry-btn" onClick={resetForm}>Start Over</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
