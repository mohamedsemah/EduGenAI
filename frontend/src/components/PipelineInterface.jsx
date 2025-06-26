import React, { useState, useEffect } from 'react';
import SlideEditor from './SlideEditor';

const PipelineInterface = () => {
  const [currentStage, setCurrentStage] = useState('form');
  const [sessionId, setSessionId] = useState(null);
  const [lessonContent, setLessonContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    chapter: '',
    lesson_title: '',
    grade_level: '',
    learning_objectives: '',
    duration: '',
    file: null
  });

  const stages = [
    { id: 'form', name: 'Setup', icon: '📝', description: 'Create your lesson parameters' },
    { id: 'baseline', name: 'Baseline', icon: '📚', description: 'Review initial lesson content' },
    { id: 'engagement', name: 'Engagement', icon: '🎯', description: 'Add UDL engagement principles' },
    { id: 'representation', name: 'Representation', icon: '👁️', description: 'Add multiple representation modes' },
    { id: 'action_expression', name: 'Action & Expression', icon: '🗣️', description: 'Add expression options' },
    { id: 'export', name: 'Export', icon: '📤', description: 'Download your lesson' }
  ];

  const getCurrentStageIndex = () => {
    return stages.findIndex(stage => stage.id === currentStage);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'file' && formData[key]) {
          formDataObj.append(key, formData[key]);
        } else if (key !== 'file') {
          formDataObj.append(key, formData[key]);
        }
      });

      const response = await fetch('http://localhost:8000/api/generate-baseline', {
        method: 'POST',
        body: formDataObj
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.session_id);
        setLessonContent(data.lesson_content);
        setCurrentStage('baseline');
      } else {
        throw new Error(data.message || 'Failed to generate baseline lesson');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSlideUpdate = async (slideIndex, updatedSlide) => {
    try {
      const response = await fetch(`http://localhost:8000/api/edit-slide/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slide_index: slideIndex,
          title: updatedSlide.title,
          content: updatedSlide.content,
          notes: updatedSlide.notes,
          image_prompt: updatedSlide.image_prompt
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        const updatedContent = { ...lessonContent };
        updatedContent.slides[slideIndex] = updatedSlide;
        setLessonContent(updatedContent);
      }
    } catch (err) {
      setError('Failed to update slide');
    }
  };

  const handleAIEnhance = async (slideIndex, prompt) => {
    try {
      const response = await fetch(`http://localhost:8000/api/ai-enhance-slide/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slide_index: slideIndex,
          prompt: prompt
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        const updatedContent = { ...lessonContent };
        updatedContent.slides[slideIndex] = data.slide;
        setLessonContent(updatedContent);
      }
    } catch (err) {
      setError('Failed to enhance slide with AI');
    }
  };

  const handleNextStage = async () => {
    const currentIndex = getCurrentStageIndex();
    const nextStage = stages[currentIndex + 1];

    if (!nextStage) return;

    // If moving to a UDL stage, apply the principle
    if (['engagement', 'representation', 'action_expression'].includes(nextStage.id)) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/apply-udl-principle/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            principle: nextStage.id
          })
        });

        const data = await response.json();
        if (data.success) {
          setLessonContent(data.lesson_content);
          setCurrentStage(nextStage.id);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStage(nextStage.id);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/export-lesson/${sessionId}`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        // Open download link
        window.open(`http://localhost:8000${data.download_url}`, '_blank');
        setCurrentStage('export');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStageIndicator = () => {
    return (
      <div className="stage-indicator">
        <div className="stages-container">
          {stages.map((stage, index) => {
            const isActive = stage.id === currentStage;
            const isCompleted = getCurrentStageIndex() > index;
            const isAccessible = index <= getCurrentStageIndex() + 1;

            return (
              <div key={stage.id} className={`stage-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${!isAccessible ? 'disabled' : ''}`}>
                <div className="stage-connector" />
                <div className="stage-circle">
                  <span className="stage-icon">{stage.icon}</span>
                </div>
                <div className="stage-info">
                  <div className="stage-name">{stage.name}</div>
                  <div className="stage-description">{stage.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFormStage = () => {
    return (
      <div className="form-stage">
        <div className="stage-header">
          <h2>🚀 Create Your Lesson</h2>
          <p>Set up the basic parameters for your lesson. We'll generate a baseline version first, then enhance it with UDL principles.</p>
        </div>

        <form onSubmit={handleFormSubmit} className="lesson-form">
          <div className="form-section full-width">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Topic *</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  required
                  placeholder="e.g., Photosynthesis, American Revolution"
                />
              </div>
              <div className="form-group">
                <label>Chapter/Unit *</label>
                <input
                  type="text"
                  value={formData.chapter}
                  onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                  required
                  placeholder="e.g., Plant Biology, Colonial America"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Lesson Title *</label>
                <input
                  type="text"
                  value={formData.lesson_title}
                  onChange={(e) => setFormData({...formData, lesson_title: e.target.value})}
                  required
                  placeholder="e.g., How Plants Make Food"
                />
              </div>
              <div className="form-group">
                <label>Duration *</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  required
                  placeholder="e.g., 45 minutes, 1 hour"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Grade Level *</label>
              <select
                value={formData.grade_level}
                onChange={(e) => setFormData({...formData, grade_level: e.target.value})}
                required
              >
                <option value="">Select Grade Level</option>
                <option value="K">Kindergarten</option>
                <option value="1">1st Grade</option>
                <option value="2">2nd Grade</option>
                <option value="3">3rd Grade</option>
                <option value="4">4th Grade</option>
                <option value="5">5th Grade</option>
                <option value="6">6th Grade</option>
                <option value="7">7th Grade</option>
                <option value="8">8th Grade</option>
                <option value="9">9th Grade</option>
                <option value="10">10th Grade</option>
                <option value="11">11th Grade</option>
                <option value="12">12th Grade</option>
                <option value="College">College</option>
              </select>
            </div>

            <div className="form-group">
              <label>Learning Objectives *</label>
              <textarea
                value={formData.learning_objectives}
                onChange={(e) => setFormData({...formData, learning_objectives: e.target.value})}
                required
                rows="4"
                placeholder="Enter each learning objective on a new line..."
              />
            </div>

            <div className="form-group">
              <label>Supporting Material (optional)</label>
              <input
                type="file"
                onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              <small>Upload any relevant document, image, or material</small>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Generating Baseline...' : 'Generate Baseline Lesson'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderEditorStage = () => {
    if (!lessonContent) return null;

    const stageInfo = stages.find(s => s.id === currentStage);
    const canProceed = currentStage !== 'export';
    const canExport = ['action_expression', 'export'].includes(currentStage);

    return (
      <div className="editor-stage">
        <div className="stage-header">
          <h2>{stageInfo.icon} {stageInfo.name} Stage</h2>
          <p>{stageInfo.description}</p>

          {currentStage !== 'baseline' && (
            <div className="udl-info">
              <div className="udl-principle-applied">
                <span className="udl-icon">✨</span>
                <span>UDL {stageInfo.name} principles have been applied to all slides</span>
              </div>
            </div>
          )}
        </div>

        <div className="lesson-overview">
          <div className="lesson-meta">
            <h3>{lessonContent.title}</h3>
            <div className="lesson-details">
              <span className="detail-item">📚 {lessonContent.grade_level}</span>
              <span className="detail-item">⏱️ {lessonContent.duration}</span>
              <span className="detail-item">📄 {lessonContent.slides.length} slides</span>
            </div>
          </div>

          {currentStage === 'baseline' && (
            <div className="baseline-notice">
              <div className="notice-icon">💡</div>
              <div className="notice-content">
                <strong>Baseline Version Ready!</strong>
                <p>Review and edit your slides below. Click "Next" to enhance with UDL Engagement principles.</p>
              </div>
            </div>
          )}
        </div>

        <div className="slides-editor">
          {lessonContent.slides.map((slide, index) => (
            <SlideEditor
              key={index}
              slide={slide}
              slideIndex={index}
              onSlideUpdate={handleSlideUpdate}
              onAIEnhance={handleAIEnhance}
            />
          ))}
        </div>

        <div className="stage-actions">
          {canExport && (
            <button onClick={handleExport} className="btn-export" disabled={loading}>
              {loading ? 'Exporting...' : '📤 Export Final Lesson'}
            </button>
          )}

          {canProceed && (
            <button onClick={handleNextStage} className="btn-next" disabled={loading}>
              {loading ? 'Applying UDL...' : `Next: ${stages[getCurrentStageIndex() + 1]?.name}`}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderExportStage = () => {
    return (
      <div className="export-stage">
        <div className="success-animation">
          <div className="success-icon">🎉</div>
          <h2>Lesson Complete!</h2>
          <p>Your UDL-enhanced lesson has been successfully created and exported.</p>
        </div>

        <div className="completion-summary">
          <h3>What you accomplished:</h3>
          <div className="accomplishment-list">
            <div className="accomplishment-item">
              <span className="accomplishment-icon">📚</span>
              <span>Generated baseline lesson content</span>
            </div>
            <div className="accomplishment-item">
              <span className="accomplishment-icon">🎯</span>
              <span>Applied UDL Engagement principles</span>
            </div>
            <div className="accomplishment-item">
              <span className="accomplishment-icon">👁️</span>
              <span>Added multiple representation modes</span>
            </div>
            <div className="accomplishment-item">
              <span className="accomplishment-icon">🗣️</span>
              <span>Included action & expression options</span>
            </div>
            <div className="accomplishment-item">
              <span className="accomplishment-icon">✏️</span>
              <span>Made personalized edits and improvements</span>
            </div>
          </div>
        </div>

        <div className="next-steps">
          <h3>Next Steps:</h3>
          <div className="next-step-item">
            <span className="step-number">1</span>
            <span>Review your downloaded PowerPoint presentation</span>
          </div>
          <div className="next-step-item">
            <span className="step-number">2</span>
            <span>Customize further based on your specific classroom needs</span>
          </div>
          <div className="next-step-item">
            <span className="step-number">3</span>
            <span>Deliver your inclusive, accessible lesson!</span>
          </div>
        </div>

        <button
          onClick={() => {
            setCurrentStage('form');
            setSessionId(null);
            setLessonContent(null);
            setFormData({
              topic: '',
              chapter: '',
              lesson_title: '',
              grade_level: '',
              learning_objectives: '',
              duration: '',
              file: null
            });
          }}
          className="btn-new-lesson"
        >
          Create Another Lesson
        </button>
      </div>
    );
  };

  return (
    <div className="pipeline-interface">
      {renderStageIndicator()}

      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">✕</button>
        </div>
      )}

      <div className="stage-content">
        {currentStage === 'form' && renderFormStage()}
        {['baseline', 'engagement', 'representation', 'action_expression'].includes(currentStage) && renderEditorStage()}
        {currentStage === 'export' && renderExportStage()}
      </div>

      <style jsx>{`
        .pipeline-interface {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .stage-indicator {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 3rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .stages-container {
          display: flex;
          justify-content: space-between;
          position: relative;
        }

        .stages-container::before {
          content: '';
          position: absolute;
          top: 30px;
          left: 5%;
          right: 5%;
          height: 2px;
          background: linear-gradient(90deg, #e5e7eb, #d1d5db);
          z-index: 1;
        }

        .stage-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
          position: relative;
          z-index: 2;
        }

        .stage-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .stage-item.active .stage-circle {
          background: linear-gradient(135deg, #667eea, #764ba2);
          transform: scale(1.1);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .stage-item.completed .stage-circle {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .stage-item.disabled .stage-circle {
          background: #f3f4f6;
          opacity: 0.5;
        }

        .stage-icon {
          font-size: 1.5rem;
        }

        .stage-item.active .stage-icon,
        .stage-item.completed .stage-icon {
          filter: brightness(0) invert(1);
        }

        .stage-info {
          max-width: 120px;
        }

        .stage-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.3rem;
          font-size: 0.9rem;
        }

        .stage-item.active .stage-name {
          color: #667eea;
        }

        .stage-description {
          font-size: 0.75rem;
          color: #6b7280;
          line-height: 1.3;
        }

        .error-alert {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #dc2626;
        }

        .error-close {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          margin-left: auto;
          color: #dc2626;
        }

        .stage-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .stage-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .stage-header h2 {
          font-size: 2.2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .stage-header p {
          font-size: 1.1rem;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
        }

        .udl-info {
          margin-top: 1.5rem;
        }

        .udl-principle-applied {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
          color: #059669;
          padding: 0.8rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .lesson-form {
          width: 100%;
          margin: 0;
          display: block;
        }

        .form-section.full-width {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(118, 75, 162, 0.02));
          border: 1px solid rgba(102, 126, 234, 0.1);
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
          grid-column: 1 / -1;
        }

        .form-section {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(118, 75, 162, 0.02));
          border: 1px solid rgba(102, 126, 234, 0.1);
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
        }

        .form-section h3 {
          color: #1f2937;
          margin-bottom: 2rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 2rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.8rem;
          font-size: 1rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 1.2rem 1.4rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-family: inherit;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group small {
          display: block;
          margin-top: 0.5rem;
          color: #6b7280;
          font-size: 0.85rem;
        }

        .form-actions {
          text-align: center;
          margin-top: 3rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 1.2rem 2.5rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .lesson-overview {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 3rem;
        }

        .lesson-meta h3 {
          color: #1f2937;
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }

        .lesson-details {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-weight: 500;
        }

        .baseline-notice {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: rgba(59, 130, 246, 0.1);
          border-left: 4px solid #3b82f6;
          padding: 1.5rem;
          border-radius: 8px;
          margin-top: 2rem;
        }

        .notice-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .notice-content strong {
          color: #1f2937;
          display: block;
          margin-bottom: 0.5rem;
        }

        .notice-content p {
          color: #4b5563;
          margin: 0;
        }

        .slides-editor {
          margin-bottom: 3rem;
        }

        .stage-actions {
          display: flex;
          justify-content: center;
          gap: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-next {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-next:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .btn-export {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-export:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }

        .btn-next:disabled,
        .btn-export:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .export-stage {
          text-align: center;
        }

        .success-animation {
          margin-bottom: 3rem;
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: bounce 1s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }

        .success-animation h2 {
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .completion-summary {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05));
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 3rem;
          text-align: left;
        }

        .completion-summary h3 {
          color: #1f2937;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .accomplishment-list {
          display: grid;
          gap: 1rem;
        }

        .accomplishment-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
        }

        .accomplishment-icon {
          font-size: 1.2rem;
        }

        .next-steps {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 3rem;
          text-align: left;
        }

        .next-steps h3 {
          color: #1f2937;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .next-step-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .step-number {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .btn-new-lesson {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 1.2rem 2.5rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-new-lesson:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
          .pipeline-interface {
            padding: 1rem;
          }

          .stages-container {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .stage-item {
            flex-basis: calc(50% - 0.5rem);
          }

          .stages-container::before {
            display: none;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .lesson-details {
            flex-direction: column;
            gap: 1rem;
          }

          .stage-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default PipelineInterface;:wq