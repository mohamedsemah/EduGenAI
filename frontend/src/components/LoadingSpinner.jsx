import React from 'react';

const LoadingSpinner = ({ progress = 0, currentStep = '', estimatedTime = 30 }) => {
  const getStepIcon = (step) => {
    if (step.includes('Analyzing')) return '🔍';
    if (step.includes('Generating')) return '🧠';
    if (step.includes('Creating')) return '✨';
    if (step.includes('Adding')) return '🎯';
    if (step.includes('Applying')) return '♿';
    if (step.includes('Finalizing')) return '🎨';
    if (step.includes('Complete')) return '🎉';
    return '⚡';
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="loading-container">
      <div className="loading-header">
        <div className="loading-brain">
          <div className="brain-core">
            <div className="neural-network">
              <div className="node node-1"></div>
              <div className="node node-2"></div>
              <div className="node node-3"></div>
              <div className="connection connection-1"></div>
              <div className="connection connection-2"></div>
              <div className="connection connection-3"></div>
            </div>
          </div>
          <div className="brain-waves-outer">
            <div className="wave wave-1"></div>
            <div className="wave wave-2"></div>
            <div className="wave wave-3"></div>
          </div>
        </div>

        <div className="loading-text">
          <h3>EduGenAI is Creating Your Lesson</h3>
          <p className="loading-subtitle">Powered by Advanced Neural Networks</p>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-ring">
          <svg className="progress-ring-svg" width="120" height="120">
            <circle
              className="progress-ring-background"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
            />
            <circle
              className="progress-ring-progress"
              stroke="#667eea"
              strokeWidth="8"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            />
          </svg>
          <div className="progress-percentage">
            <span className="percentage-number">{Math.round(progress)}</span>
            <span className="percentage-symbol">%</span>
          </div>
        </div>

        <div className="progress-info">
          <div className="current-step">
            <span className="step-icon">{getStepIcon(currentStep)}</span>
            <span className="step-text">{currentStep || 'Initializing AI systems...'}</span>
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              >
                <div className="progress-shine"></div>
              </div>
            </div>
            <div className="progress-markers">
              <div className={`marker ${progress >= 20 ? 'active' : ''}`}></div>
              <div className={`marker ${progress >= 40 ? 'active' : ''}`}></div>
              <div className={`marker ${progress >= 60 ? 'active' : ''}`}></div>
              <div className={`marker ${progress >= 80 ? 'active' : ''}`}></div>
              <div className={`marker ${progress >= 100 ? 'active' : ''}`}></div>
            </div>
          </div>

          <div className="time-estimate">
            <div className="time-display">
              <span className="time-icon">⏱️</span>
              <span className="time-text">
                {estimatedTime > 0 ? `~${formatTime(estimatedTime)} remaining` : 'Almost done!'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="loading-features">
        <div className="feature-item">
          <div className="feature-dot"></div>
          <span>Analyzing grade-appropriate content</span>
        </div>
        <div className="feature-item">
          <div className="feature-dot"></div>
          <span>Generating comprehensive explanations</span>
        </div>
        <div className="feature-item">
          <div className="feature-dot"></div>
          <span>Creating interactive elements</span>
        </div>
        <div className="feature-item">
          <div className="feature-dot"></div>
          <span>Applying UDL accessibility features</span>
        </div>
      </div>

      <div className="loading-tip">
        <div className="tip-icon">💡</div>
        <div className="tip-content">
          <strong>Pro Tip:</strong> Your lesson will include detailed presenter notes
          and multiple assessment formats to engage all learning styles.
        </div>
      </div>

      <style jsx>{`
        .loading-container {
          text-align: center;
          margin: 3rem 0;
          padding: 3rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.95));
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .loading-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #667eea, transparent);
          animation: borderSlide 3s infinite;
        }

        @keyframes borderSlide {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }

        .loading-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 3rem;
        }

        .loading-brain {
          width: 120px;
          height: 120px;
          position: relative;
          margin-bottom: 2rem;
        }

        .brain-core {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: coreRotate 4s linear infinite;
        }

        @keyframes coreRotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .neural-network {
          position: relative;
          width: 50px;
          height: 50px;
        }

        .node {
          position: absolute;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: nodeGlow 2s infinite ease-in-out;
        }

        .node-1 { top: 10px; left: 20px; animation-delay: 0s; }
        .node-2 { top: 30px; left: 10px; animation-delay: 0.3s; }
        .node-3 { top: 30px; left: 30px; animation-delay: 0.6s; }

        .connection {
          position: absolute;
          background: white;
          height: 2px;
          border-radius: 1px;
          animation: connectionFlow 2s infinite ease-in-out;
        }

        .connection-1 { 
          width: 15px; 
          top: 14px; 
          left: 15px; 
          transform: rotate(-30deg);
          animation-delay: 0.1s;
        }
        .connection-2 { 
          width: 12px; 
          top: 25px; 
          left: 25px; 
          transform: rotate(30deg);
          animation-delay: 0.4s;
        }
        .connection-3 { 
          width: 20px; 
          top: 34px; 
          left: 15px;
          animation-delay: 0.7s;
        }

        @keyframes nodeGlow {
          0%, 100% { 
            opacity: 0.8;
            box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
          }
          50% { 
            opacity: 1;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
            transform: scale(1.3);
          }
        }

        @keyframes connectionFlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .brain-waves-outer {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
        }

        .wave {
          position: absolute;
          border: 2px solid #667eea;
          border-radius: 50%;
          opacity: 0;
          animation: waveExpand 3s infinite ease-out;
        }

        .wave-1 {
          width: 80px;
          height: 80px;
          top: 20px;
          left: 20px;
          animation-delay: 0s;
        }

        .wave-2 {
          width: 100px;
          height: 100px;
          top: 10px;
          left: 10px;
          animation-delay: 1s;
        }

        .wave-3 {
          width: 120px;
          height: 120px;
          top: 0;
          left: 0;
          animation-delay: 2s;
        }

        @keyframes waveExpand {
          0% {
            opacity: 1;
            transform: scale(0.8);
          }
          100% {
            opacity: 0;
            transform: scale(1.2);
          }
        }

        .loading-text h3 {
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .loading-subtitle {
          color: #6b7280;
          font-size: 1rem;
          font-weight: 500;
          letter-spacing: 1px;
        }

        .progress-section {
          display: flex;
          align-items: center;
          gap: 3rem;
          margin-bottom: 3rem;
          justify-content: center;
        }

        .progress-ring {
          position: relative;
        }

        .progress-ring-svg {
          transform: rotate(-90deg);
        }

        .progress-ring-progress {
          stroke-linecap: round;
          transition: stroke-dashoffset 0.5s ease;
          filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.3));
        }

        .progress-percentage {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .percentage-number {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .percentage-symbol {
          font-size: 1.2rem;
          color: #6b7280;
          font-weight: 600;
        }

        .progress-info {
          flex: 1;
          max-width: 400px;
        }

        .current-step {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          border-radius: 12px;
          border-left: 4px solid #667eea;
        }

        .step-icon {
          font-size: 1.5rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        .step-text {
          font-weight: 600;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .progress-bar-container {
          position: relative;
          margin-bottom: 2rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 10px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .progress-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: shine 2s infinite;
        }

        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .progress-markers {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
          padding: 0 2px;
        }

        .marker {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e5e7eb;
          transition: all 0.3s ease;
        }

        .marker.active {
          background: #667eea;
          box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
          transform: scale(1.2);
        }

        .time-estimate {
          text-align: center;
        }

        .time-display {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.5rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 20px;
          font-weight: 600;
          color: #667eea;
        }

        .time-icon {
          font-size: 1.1rem;
        }

        .loading-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 10px;
          font-size: 0.9rem;
          color: #4b5563;
          font-weight: 500;
        }

        .feature-dot {
          width: 8px;
          height: 8px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          border-radius: 50%;
          animation: dotPulse 2s infinite ease-in-out;
        }

        .feature-item:nth-child(1) .feature-dot { animation-delay: 0s; }
        .feature-item:nth-child(2) .feature-dot { animation-delay: 0.5s; }
        .feature-item:nth-child(3) .feature-dot { animation-delay: 1s; }
        .feature-item:nth-child(4) .feature-dot { animation-delay: 1.5s; }

        @keyframes dotPulse {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.3);
          }
        }

        .loading-tip {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border-radius: 12px;
          border-left: 4px solid #667eea;
          text-align: left;
        }

        .tip-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          margin-top: 0.2rem;
        }

        .tip-content {
          color: #4b5563;
          line-height: 1.5;
        }

        .tip-content strong {
          color: #667eea;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .progress-section {
            flex-direction: column;
            gap: 2rem;
          }
          
          .loading-features {
            grid-template-columns: 1fr;
          }
          
          .loading-tip {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;