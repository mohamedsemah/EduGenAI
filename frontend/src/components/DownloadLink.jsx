import React, { useState, useEffect } from 'react';

const DownloadLink = ({ url, filename, lessonDetails }) => {
  const fullUrl = `http://localhost:8000${url}`;
  const [isVisible, setIsVisible] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setCelebrationActive(true);

    // Stop celebration after 3 seconds
    const timer = setTimeout(() => {
      setCelebrationActive(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    // Add download analytics or tracking here if needed
    window.open(fullUrl, '_blank');
  };

  const getComplexityColor = (level) => {
    if (level <= 3) return '#43e97b';
    if (level <= 6) return '#667eea';
    return '#f5576c';
  };

  const getComplexityLabel = (level) => {
    if (level <= 3) return 'Basic';
    if (level <= 6) return 'Intermediate';
    return 'Advanced';
  };

  return (
    <div className={`download-container ${isVisible ? 'visible' : ''}`}>
      {celebrationActive && (
        <div className="celebration-overlay">
          <div className="confetti">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`confetti-piece confetti-${i}`} />
            ))}
          </div>
        </div>
      )}

      <div className="success-header">
        <div className="success-icon">
          <div className="checkmark-circle">
            <div className="checkmark">✓</div>
          </div>
          <div className="success-rings">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
          </div>
        </div>

        <div className="success-content">
          <h2>🎉 Your Enhanced Lesson is Ready!</h2>
          <p>Your comprehensive UDL-based lesson plan has been generated successfully with detailed, engaging content powered by EduGenAI.</p>
        </div>
      </div>

      {lessonDetails && (
        <div className="lesson-summary">
          <div className="summary-header">
            <div className="summary-icon">📊</div>
            <h3>Lesson Summary</h3>
          </div>

          <div className="summary-grid">
            <div className="summary-card">
              <div className="card-icon">📚</div>
              <div className="card-content">
                <div className="card-label">Title</div>
                <div className="card-value">{lessonDetails.title}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">🎓</div>
              <div className="card-content">
                <div className="card-label">Grade Level</div>
                <div className="card-value">{lessonDetails.grade_level}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">⏱️</div>
              <div className="card-content">
                <div className="card-label">Duration</div>
                <div className="card-value">{lessonDetails.duration}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">⚙️</div>
              <div className="card-content">
                <div className="card-label">Complexity</div>
                <div className="card-value">
                  <span
                    className="complexity-badge"
                    style={{ backgroundColor: getComplexityColor(lessonDetails.complexity_level) }}
                  >
                    {lessonDetails.complexity_level}/10 - {getComplexityLabel(lessonDetails.complexity_level)}
                  </span>
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">📄</div>
              <div className="card-content">
                <div className="card-label">Total Slides</div>
                <div className="card-value">{lessonDetails.slide_count}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">♿</div>
              <div className="card-content">
                <div className="card-label">Accessibility Features</div>
                <div className="card-value">{lessonDetails.accessibility_features}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="download-section">
        <button
          onClick={handleDownload}
          className="download-button"
        >
          <div className="button-content">
            <div className="button-icon">
              <div className="download-arrow">↓</div>
            </div>
            <div className="button-text">
              <span className="button-title">Download Enhanced Presentation</span>
              <span className="button-subtitle">PowerPoint format • Ready to use</span>
            </div>
          </div>
          <div className="button-glow"></div>
        </button>

        <div className="download-options">
          <div className="option-item">
            <span className="option-icon">💾</span>
            <span>Instant download</span>
          </div>
          <div className="option-item">
            <span className="option-icon">🔒</span>
            <span>Secure & private</span>
          </div>
          <div className="option-item">
            <span className="option-icon">📱</span>
            <span>Mobile friendly</span>
          </div>
        </div>
      </div>

      <div className="enhanced-features">
        <div className="features-header">
          <div className="features-icon">✨</div>
          <h3>What's Included in Your Enhanced Lesson</h3>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">📝</div>
              <h4>Comprehensive Content</h4>
            </div>
            <p>12 detailed slides with 200-400 words each, including in-depth explanations, examples, and real-world applications</p>
            <div className="feature-highlight">AI-Generated</div>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">🎯</div>
              <h4>Grade-Appropriate Design</h4>
            </div>
            <p>Content complexity and language specifically adapted for your selected grade level and complexity setting</p>
            <div className="feature-highlight">Personalized</div>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">🖼️</div>
              <h4>AI-Generated Images</h4>
            </div>
            <p>Relevant, educational images created specifically for your topic with proper alt-text for accessibility</p>
            <div className="feature-highlight">Visual Rich</div>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">♿</div>
              <h4>UDL Accessibility</h4>
            </div>
            <p>Complete Universal Design for Learning features including multiple learning modalities and accessibility supports</p>
            <div className="feature-highlight">Inclusive</div>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">📚</div>
              <h4>Detailed Vocabulary</h4>
            </div>
            <p>Key terms with definitions, pronunciation guides, and multiple examples appropriate for your grade level</p>
            <div className="feature-highlight">Educational</div>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">🎨</div>
              <h4>Interactive Elements</h4>
            </div>
            <p>Built-in discussion prompts, activities, and assessment opportunities to engage all learners</p>
            <div className="feature-highlight">Engaging</div>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">🗒️</div>
              <h4>Presenter Notes</h4>
            </div>
            <p>Comprehensive notes for each slide with teaching strategies, UDL implementation tips, and interaction suggestions</p>
            <div className="feature-highlight">Teacher-Ready</div>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <div className="feature-icon">🌍</div>
              <h4>Real-World Connections</h4>
            </div>
            <p>Concrete examples, case studies, and applications that connect your topic to students' lives and current events</p>
            <div className="feature-highlight">Relevant</div>
          </div>
        </div>
      </div>

      <div className="next-steps">
        <div className="steps-header">
          <div className="steps-icon">🚀</div>
          <h3>Next Steps</h3>
        </div>

        <div className="steps-timeline">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <div className="step-title">Review Your Presentation</div>
              <p>Open the PowerPoint file and review all slides, notes, and accessibility features</p>
            </div>
            <div className="step-connector"></div>
          </div>

          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <div className="step-title">Customize as Needed</div>
              <p>Add your personal touches, school branding, or additional examples specific to your students</p>
            </div>
            <div className="step-connector"></div>
          </div>

          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <div className="step-title">Prepare for Teaching</div>
              <p>Review the presenter notes and consider which interactive elements work best for your classroom</p>
            </div>
            <div className="step-connector"></div>
          </div>

          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-content">
              <div className="step-title">Deliver with Confidence</div>
              <p>Use the UDL principles embedded in the lesson to engage all your learners effectively</p>
            </div>
          </div>
        </div>
      </div>

      <div className="feedback-section">
        <div className="feedback-header">
          <div className="feedback-icon">💬</div>
          <h3>How was your EduGenAI experience?</h3>
          <p>Your feedback helps us improve our AI-powered lesson generation for educators worldwide.</p>
        </div>

        <div className="feedback-actions">
          <button className="feedback-btn excellent">
            <span className="feedback-emoji">🌟</span>
            <span>Excellent!</span>
          </button>
          <button className="feedback-btn good">
            <span className="feedback-emoji">👍</span>
            <span>Good</span>
          </button>
          <button className="feedback-btn average">
            <span className="feedback-emoji">👌</span>
            <span>Average</span>
          </button>
          <button className="feedback-btn needs-improvement">
            <span className="feedback-emoji">💡</span>
            <span>Needs improvement</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .download-container {
          margin: 3rem 0;
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .download-container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .celebration-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 1000;
        }

        .confetti {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          animation: confettiFall 3s ease-out forwards;
        }

        .confetti-piece:nth-child(odd) {
          background: #667eea;
        }

        .confetti-piece:nth-child(even) {
          background: #764ba2;
        }

        @keyframes confettiFall {
          0% {
            opacity: 1;
            transform: translateY(-100vh) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg);
          }
        }

        ${[...Array(20)].map((_, i) => `
          .confetti-${i} {
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 2}s;
            animation-duration: ${2 + Math.random() * 2}s;
          }
        `).join('')}

        .success-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 3rem;
          background: linear-gradient(135deg, rgba(67, 233, 123, 0.1), rgba(56, 249, 215, 0.1));
          border-radius: 20px;
          margin-bottom: 3rem;
          position: relative;
          overflow: hidden;
        }

        .success-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(67, 233, 123, 0.1), transparent);
          animation: successShine 2s infinite;
        }

        @keyframes successShine {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .success-icon {
          position: relative;
          flex-shrink: 0;
        }

        .checkmark-circle {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #43e97b, #38f9d7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          animation: checkmarkPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes checkmarkPop {
          0% { transform: scale(0) rotate(-180deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        .checkmark {
          font-size: 2rem;
          color: white;
          font-weight: bold;
          animation: checkmarkDraw 0.8s ease-out 0.3s both;
        }

        @keyframes checkmarkDraw {
          0% { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }

        .success-rings {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .ring {
          position: absolute;
          border: 2px solid #43e97b;
          border-radius: 50%;
          opacity: 0;
          animation: ringExpand 2s infinite ease-out;
        }

        .ring-1 {
          width: 100px;
          height: 100px;
          top: -50px;
          left: -50px;
          animation-delay: 0.5s;
        }

        .ring-2 {
          width: 120px;
          height: 120px;
          top: -60px;
          left: -60px;
          animation-delay: 1s;
        }

        .ring-3 {
          width: 140px;
          height: 140px;
          top: -70px;
          left: -70px;
          animation-delay: 1.5s;
        }

        @keyframes ringExpand {
          0% {
            opacity: 0.8;
            transform: scale(0.8);
          }
          100% {
            opacity: 0;
            transform: scale(1.2);
          }
        }

        .success-content h2 {
          font-size: 2.2rem;
          font-weight: 800;
          background: linear-gradient(45deg, #43e97b, #38f9d7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .success-content p {
          font-size: 1.1rem;
          color: #4b5563;
          line-height: 1.6;
        }

        .lesson-summary {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2.5rem;
          margin-bottom: 3rem;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .summary-icon {
          font-size: 1.8rem;
          padding: 0.8rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
        }

        .summary-header h3 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #1f2937;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.1);
          transition: all 0.3s ease;
        }

        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }

        .card-icon {
          font-size: 1.5rem;
          padding: 0.8rem;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .card-content {
          flex: 1;
        }

        .card-label {
          font-size: 0.85rem;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 0.3rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .complexity-badge {
          display: inline-block;
          padding: 0.3rem 0.8rem;
          border-radius: 15px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .download-section {
          text-align: center;
          margin-bottom: 4rem;
        }

        .download-button {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          border: none;
          border-radius: 20px;
          padding: 2rem 3rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(67, 233, 123, 0.3);
          margin-bottom: 2rem;
        }

        .download-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px rgba(67, 233, 123, 0.4);
        }

        .button-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          position: relative;
          z-index: 2;
        }

        .button-icon {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .download-arrow {
          font-size: 1.5rem;
          color: white;
          font-weight: bold;
          animation: arrowBounce 2s infinite;
        }

        @keyframes arrowBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(5px); }
          60% { transform: translateY(3px); }
        }

        .button-text {
          text-align: left;
        }

        .button-title {
          display: block;
          font-size: 1.3rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.3rem;
        }

        .button-subtitle {
          display: block;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        .button-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s ease;
        }

        .download-button:hover .button-glow {
          left: 100%;
        }

        .download-options {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 500;
        }

        .option-icon {
          font-size: 1.1rem;
        }

        .enhanced-features {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 3rem;
          margin-bottom: 3rem;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .features-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
          text-align: center;
          justify-content: center;
        }

        .features-icon {
          font-size: 2rem;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 15px;
        }

        .features-header h3 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(102, 126, 234, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: left 0.5s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.15);
        }

        .feature-card:hover::before {
          left: 0;
        }

        .feature-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .feature-icon {
          font-size: 1.5rem;
          padding: 0.8rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .feature-card h4 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .feature-card p {
          color: #4b5563;
          line-height: 1.6;
          margin: 1rem 0;
        }

        .feature-highlight {
          display: inline-block;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.4rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          position: absolute;
          top: 1rem;
          right: 1rem;
        }

        .next-steps {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border-radius: 24px;
          padding: 3rem;
          margin-bottom: 3rem;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .steps-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
          text-align: center;
          justify-content: center;
        }

        .steps-icon {
          font-size: 2rem;
          padding: 1rem;
          background: linear-gradient(135deg, #f093fb, #f5576c);
          border-radius: 15px;
        }

        .steps-header h3 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(45deg, #f093fb, #f5576c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .steps-timeline {
          position: relative;
        }

        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 2rem;
          margin-bottom: 2.5rem;
          position: relative;
        }

        .step-item:last-child {
          margin-bottom: 0;
        }

        .step-number {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
          flex-shrink: 0;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .step-content {
          flex: 1;
          padding-top: 0.5rem;
        }

        .step-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.8rem;
        }

        .step-content p {
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
        }

        .step-connector {
          position: absolute;
          left: 24px;
          top: 50px;
          width: 2px;
          height: calc(100% + 10px);
          background: linear-gradient(to bottom, #667eea, #764ba2);
          opacity: 0.3;
        }

        .step-item:last-child .step-connector {
          display: none;
        }

        .feedback-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 3rem;
          text-align: center;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .feedback-header {
          margin-bottom: 2.5rem;
        }

        .feedback-icon {
          font-size: 2rem;
          padding: 1rem;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          border-radius: 15px;
          display: inline-block;
          margin-bottom: 1.5rem;
        }

        .feedback-header h3 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .feedback-header p {
          color: #6b7280;
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .feedback-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .feedback-btn {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          color: #4b5563;
        }

        .feedback-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .feedback-btn.excellent:hover {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .feedback-btn.good:hover {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .feedback-btn.average:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .feedback-btn.needs-improvement:hover {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .feedback-emoji {
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .success-header {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }
          
          .summary-grid {
            grid-template-columns: 1fr;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .download-options {
            flex-direction: column;
            gap: 1rem;
          }
          
          .feedback-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .feedback-btn {
            width: 100%;
            max-width: 250px;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default DownloadLink;