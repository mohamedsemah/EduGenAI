import React from 'react';
import LessonForm from './components/LessonForm';
import './styles/App.css';

function App() {
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
              <div className="logo-tagline">Intelligent Lesson Generation</div>
            </div>
          </div>
        </div>
        <p className="hero-description">
          Create premium, accessible course content powered by Advanced AI and
          <span className="highlight"> Universal Design for Learning</span> principles
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">50K+</span>
            <span className="stat-label">Lessons Generated</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">99.8%</span>
            <span className="stat-label">Accuracy Rate</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">12s</span>
            <span className="stat-label">Avg Generation</span>
          </div>
        </div>
      </header>

      <main>
        <LessonForm />
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">EduGenAI</span>
            <span className="footer-tagline">Powered by Advanced Neural Networks</span>
          </div>
          <div className="footer-info">
            <p>
              Universal Design for Learning (UDL) framework enhanced with cutting-edge AI to optimize
              teaching and learning experiences for all students based on cognitive science research.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;