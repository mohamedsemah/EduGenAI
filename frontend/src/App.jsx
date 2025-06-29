import React, { useEffect, useState } from 'react';
import PipelineInterface from './components/PipelineInterface';
import { healthCheck } from './services/api';
import './styles/App.css';

function App() {
  const [isApiHealthy, setIsApiHealthy] = useState(null);
  const [healthCheckError, setHealthCheckError] = useState(null);

  useEffect(() => {
    // Check API health on app load
    const checkApiHealth = async () => {
      try {
        const health = await healthCheck();
        setIsApiHealthy(true);
        console.log('API Health:', health);
      } catch (error) {
        setIsApiHealthy(false);
        setHealthCheckError(error.message);
        console.error('API Health Check Failed:', error);
      }
    };

    checkApiHealth();

    // Set up periodic health checks (every 5 minutes)
    const healthCheckInterval = setInterval(checkApiHealth, 5 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(healthCheckInterval);
  }, []);

  const renderHealthStatus = () => {
    if (isApiHealthy === null) {
      return (
        <div className="health-status checking">
          <div className="health-indicator">🔄</div>
          <span>Checking API status...</span>
        </div>
      );
    }

    if (isApiHealthy) {
      return (
        <div className="health-status healthy">
          <div className="health-indicator">✅</div>
          <span>API Connected</span>
        </div>
      );
    }

    return (
      <div className="health-status unhealthy">
        <div className="health-indicator">❌</div>
        <div className="health-content">
          <span>API Disconnected</span>
          <small>{healthCheckError}</small>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="background-animation">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-6"></div>
        </div>
      </div>

      <header className="App-header">
        <div className="header-top">
          {renderHealthStatus()}
        </div>

        <div className="logo-container">
          <div className="logo">
            <div className="logo-icon">
              <div className="brain-circuit">
                <div className="circuit-line"></div>
                <div className="circuit-line"></div>
                <div className="circuit-line"></div>
                <div className="circuit-node"></div>
                <div className="circuit-node"></div>
                <div className="circuit-node"></div>
              </div>
            </div>
            <div className="logo-text">
              <h1>EduGen<span className="ai-gradient">AI</span></h1>
              <div className="logo-tagline">Teacher-in-the-Loop Lesson Pipeline</div>
            </div>
          </div>
        </div>

<div className="hero-description">
          Create comprehensive, research-based course content with our
          <span className="highlight"> college-focused AI pipeline</span> powered by
          <span className="highlight"> Universal Design for Learning</span> principles for higher education
        </div>

        <div className="pipeline-overview">
          <div className="overview-title">
            <span className="overview-icon">🎓</span>
            <span>College-Level Enhancement Pipeline</span>
          </div>
          <div className="pipeline-steps">
            <div className="pipeline-step">
              <div className="step-icon">📝</div>
              <div className="step-info">
                <div className="step-name">Setup</div>
                <div className="step-desc">Define course parameters & level</div>
              </div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="step-icon">📚</div>
              <div className="step-info">
                <div className="step-name">Academic Baseline</div>
                <div className="step-desc">Review research-based content</div>
              </div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="step-icon">🎯</div>
              <div className="step-info">
                <div className="step-name">Adult Engagement</div>
                <div className="step-desc">Add career-relevant motivations</div>
              </div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="step-icon">👁️</div>
              <div className="step-info">
                <div className="step-name">Academic Representation</div>
                <div className="step-desc">Multiple scholarly formats</div>
              </div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="step-icon">🗣️</div>
              <div className="step-info">
                <div className="step-name">College Assessment</div>
                <div className="step-desc">Diverse evaluation methods</div>
              </div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="step-icon">📤</div>
              <div className="step-info">
                <div className="step-name">Export</div>
                <div className="step-desc">Download academic lesson</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">6</span>
            <span className="stat-label">Enhancement Stages</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">College</span>
            <span className="stat-label">Focused Content</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">Research</span>
            <span className="stat-label">Based Learning</span>
          </div>
        </div>
      </header>

      <main>
        {isApiHealthy === false ? (
          <div className="api-error-state">
            <div className="error-container">
              <div className="error-icon">🚨</div>
              <h2>Service Unavailable</h2>
              <p>
                The EduGenAI backend service is currently unavailable.
                Please ensure the backend server is running and try again.
              </p>
              <div className="error-details">
                <strong>Error:</strong> {healthCheckError}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="retry-button"
              >
                Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <PipelineInterface />
        )}
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">EduGenAI</span>
            <span className="footer-tagline">Teacher-in-the-Loop AI Pipeline</span>
          </div>
          <div className="footer-info">
            <p>
              Revolutionary staged refinement process combining human expertise with AI capabilities.
              Each stage builds upon the previous one, ensuring maximum educational effectiveness
              and Universal Design for Learning compliance.
            </p>
          </div>
          <div className="footer-features">
            <div className="feature-highlight">
              <span className="feature-icon">✏️</span>
              <span>WYSIWYG Editing</span>
            </div>
            <div className="feature-highlight">
              <span className="feature-icon">🧠</span>
              <span>AI Enhancement</span>
            </div>
            <div className="feature-highlight">
              <span className="feature-icon">♿</span>
              <span>UDL Principles</span>
            </div>
            <div className="feature-highlight">
              <span className="feature-icon">📊</span>
              <span>Progress Tracking</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .header-top {
          position: absolute;
          top: 1rem;
          right: 2rem;
          z-index: 10;
        }

        .health-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .health-status.checking {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .health-status.healthy {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .health-status.unhealthy {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .health-indicator {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .health-content {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .health-content small {
          font-size: 0.7rem;
          opacity: 0.8;
        }

        .logo-tagline {
          font-size: 0.85rem;
          color: #6b7280;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-top: 0.5rem;
        }

        .pipeline-overview {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 2rem;
          margin: 2rem auto;
          max-width: 1000px;
        }

        .overview-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8rem;
          margin-bottom: 2rem;
          font-size: 1.2rem;
          font-weight: 700;
          color: #1f2937;
        }

        .overview-icon {
          font-size: 1.5rem;
          animation: rotate 3s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .pipeline-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .pipeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          min-width: 100px;
          transition: all 0.3s ease;
        }

        .pipeline-step:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .step-icon {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
        }

        .step-name {
          font-weight: 700;
          color: #1f2937;
          font-size: 0.9rem;
          margin-bottom: 0.3rem;
        }

        .step-desc {
          font-size: 0.7rem;
          color: #6b7280;
          line-height: 1.3;
        }

        .pipeline-arrow {
          font-size: 1.2rem;
          color: #667eea;
          font-weight: bold;
          margin: 0 0.5rem;
        }

        .api-error-state {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          padding: 2rem;
        }

        .error-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 3rem;
          text-align: center;
          max-width: 500px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          animation: shake 0.5s infinite alternate;
        }

        @keyframes shake {
          0% { transform: translateX(0); }
          100% { transform: translateX(10px); }
        }

        .error-container h2 {
          color: #dc2626;
          margin-bottom: 1rem;
        }

        .error-container p {
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .error-details {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
          font-size: 0.9rem;
          color: #dc2626;
          text-align: left;
        }

        .retry-button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retry-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .footer-features {
          display: flex;
          gap: 2rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .feature-highlight {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #667eea;
        }

        .feature-icon {
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .header-top {
            position: static;
            display: flex;
            justify-content: center;
            margin-bottom: 2rem;
          }

          .pipeline-steps {
            flex-direction: column;
            align-items: center;
          }

          .pipeline-arrow {
            transform: rotate(90deg);
            margin: 0.5rem 0;
          }

          .pipeline-step {
            width: 100%;
            max-width: 200px;
          }

          .footer-features {
            justify-content: center;
          }

          .api-error-state {
            min-height: 50vh;
          }

          .error-container {
            padding: 2rem;
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default App;