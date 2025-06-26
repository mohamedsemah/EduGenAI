import React, { useState, useEffect } from 'react';
import { generateLesson } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import DownloadLink from './DownloadLink';

const LessonForm = () => {
  const [formData, setFormData] = useState({
    topic: '',
    chapter: '',
    lesson_title: '',
    grade_level: '',
    learning_objectives: '',
    duration: '',
    complexity_level: 5,
    file: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [lessonDetails, setLessonDetails] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(30);

  useEffect(() => {
    setFormVisible(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];

      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, Word document, text file, or image (JPG/PNG)');
        return;
      }
    }

    setFormData(prevData => ({
      ...prevData,
      file: file
    }));

    if (error) setError(null);
  };

  const simulateProgress = () => {
    const steps = [
      { step: 'Analyzing your requirements...', progress: 15, time: 2000 },
      { step: 'Generating AI-powered content...', progress: 35, time: 3000 },
      { step: 'Creating detailed explanations...', progress: 55, time: 4000 },
      { step: 'Adding interactive elements...', progress: 70, time: 2500 },
      { step: 'Applying UDL principles...', progress: 85, time: 2000 },
      { step: 'Finalizing presentation...', progress: 95, time: 1500 },
      { step: 'Complete!', progress: 100, time: 500 }
    ];

    let currentStepIndex = 0;

    const updateProgress = () => {
      if (currentStepIndex < steps.length) {
        const currentStepData = steps[currentStepIndex];
        setCurrentStep(currentStepData.step);
        setProgress(currentStepData.progress);

        setTimeout(() => {
          currentStepIndex++;
          updateProgress();
        }, currentStepData.time);
      }
    };

    updateProgress();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDownloadUrl(null);
    setLessonDetails(null);
    setProgress(0);
    setCurrentStep('Initializing AI lesson generation...');

    // Start progress simulation
    simulateProgress();

    try {
      const response = await generateLesson(formData);
      setDownloadUrl(response.download_url);
      setLessonDetails(response.lesson_details);
      setProgress(100);
      setCurrentStep('Lesson generated successfully!');
    } catch (err) {
      setError(err.message || 'An error occurred while generating the lesson');
      setProgress(0);
      setCurrentStep('');
    } finally {
      setLoading(false);
    }
  };

  const gradeOptions = [
    "K", "1", "2", "3", "4", "5", "6", "7", "8",
    "9", "10", "11", "12",
    "College Freshman", "College Sophomore", "College Junior", "College Senior",
    "Graduate"
  ];

  const getGradeCategory = (gradeLevel) => {
    const grade = gradeLevel.toLowerCase();
    if (['k', '1', '2', '3', '4', '5'].includes(grade) || grade.includes('elementary')) {
      return 'Elementary (K-5)';
    } else if (['6', '7', '8'].includes(grade) || grade.includes('middle')) {
      return 'Middle School (6-8)';
    } else if (['9', '10', '11', '12'].includes(grade) || grade.includes('high')) {
      return 'High School (9-12)';
    } else if (grade.includes('college') || grade.includes('university') || grade.includes('graduate')) {
      return 'University Level';
    }
    return 'Not specified';
  };

  return (
    <div className={`lesson-form-container ${formVisible ? 'visible' : ''}`}>
      <div className="form-header">
        <div className="header-icon">
          <div className="ai-brain">
            <div className="brain-pulse"></div>
            <div className="brain-waves">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        <h2>Create Your Enhanced UDL Lesson</h2>
        <p>Generate detailed, accessible lesson content with AI-powered customization</p>
        <div className="feature-badges">
          <span className="badge">🧠 AI-Powered</span>
          <span className="badge">♿ UDL Compliant</span>
          <span className="badge">🎨 Visual Rich</span>
          <span className="badge">📊 Data-Driven</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="lesson-form-single-column">
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">📚</span>
            Basic Information
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="topic">
                Topic <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Photosynthesis, American Revolution, Algebra"
                  className="premium-input"
                />
                <div className="input-highlight"></div>
              </div>
              <small>The main subject area for your lesson</small>
            </div>

            <div className="form-group">
              <label htmlFor="chapter">
                Chapter/Unit <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="chapter"
                  name="chapter"
                  value={formData.chapter}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Plant Biology, Colonial America, Linear Equations"
                  className="premium-input"
                />
                <div className="input-highlight"></div>
              </div>
              <small>The specific chapter or unit this lesson belongs to</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lesson_title">
                Lesson Title <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="lesson_title"
                  name="lesson_title"
                  value={formData.lesson_title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., How Plants Make Food, The Boston Tea Party"
                  className="premium-input"
                />
                <div className="input-highlight"></div>
              </div>
              <small>A specific, engaging title for this lesson</small>
            </div>

            <div className="form-group">
              <label htmlFor="duration">
                Duration <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 45 minutes, 1 hour, 90 minutes"
                  className="premium-input"
                />
                <div className="input-highlight"></div>
              </div>
              <small>How long will this lesson take to complete?</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="grade_level">
              Grade Level <span className="required">*</span>
            </label>
            <div className="select-wrapper">
              <select
                id="grade_level"
                name="grade_level"
                value={formData.grade_level}
                onChange={handleChange}
                required
                className="premium-select"
              >
                <option value="">Select Grade Level</option>
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              <div className="select-arrow">▼</div>
            </div>
            {formData.grade_level && (
              <div className="grade-category-badge">
                <span className="category-label">Category:</span>
                <span className="category-value">{getGradeCategory(formData.grade_level)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">🎯</span>
            Learning Objectives
          </h3>

          <div className="form-group">
            <label htmlFor="learning_objectives">
              Learning Objectives <span className="required">*</span>
            </label>
            <div className="textarea-wrapper">
              <textarea
                id="learning_objectives"
                name="learning_objectives"
                value={formData.learning_objectives}
                onChange={handleChange}
                required
                placeholder="Enter each learning objective on a new line, e.g.:&#10;Students will understand the process of photosynthesis&#10;Students will identify the materials needed for photosynthesis&#10;Students will explain the importance of photosynthesis to life on Earth"
                rows="6"
                className="premium-textarea"
              />
              <div className="textarea-highlight"></div>
            </div>
            <small>Enter each learning objective on a separate line. Be specific and measurable.</small>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">📎</span>
            Supporting Materials
          </h3>

          <div className="form-group">
            <label htmlFor="file">
              Supporting Material (optional)
            </label>
            <div className="file-upload-area">
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                className="file-input"
              />
              <div className="file-upload-content">
                {formData.file ? (
                  <div className="file-selected">
                    <span className="file-icon">📄</span>
                    <div className="file-info">
                      <span className="file-name">{formData.file.name}</span>
                      <span className="file-size">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => setFormData(prev => ({...prev, file: null}))}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="file-placeholder">
                    <span className="upload-icon">📤</span>
                    <span className="upload-text">Click to upload or drag and drop</span>
                    <span className="upload-formats">PDF, Word, Text, or Image files (Max 10MB)</span>
                  </div>
                )}
              </div>
            </div>
            <small>
              Upload any relevant document, image, or material to incorporate into the lesson
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-generate" disabled={loading}>
            <span className="btn-content">
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  Generating Enhanced Lesson...
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  Generate Enhanced Lesson
                </>
              )}
            </span>
            <div className="btn-bg-effect"></div>
          </button>
        </div>

        <div className="generation-info">
          <div className="info-header">
            <span className="info-icon">✨</span>
            <strong>What you'll get:</strong>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="item-icon">📊</span>
              <span>12 detailed slides with comprehensive content (200-400 words each)</span>
            </div>
            <div className="info-item">
              <span className="item-icon">📚</span>
              <span>Grade-appropriate vocabulary with definitions and examples</span>
            </div>
            <div className="info-item">
              <span className="item-icon">🌍</span>
              <span>Real-world applications and case studies</span>
            </div>
            <div className="info-item">
              <span className="item-icon">🎯</span>
              <span>Multiple assessment formats and interaction opportunities</span>
            </div>
            <div className="info-item">
              <span className="item-icon">♿</span>
              <span>Complete accessibility features following UDL principles</span>
            </div>
            <div className="info-item">
              <span className="item-icon">🖼️</span>
              <span>AI-generated images relevant to your topic</span>
            </div>
            <div className="info-item">
              <span className="item-icon">📝</span>
              <span>Detailed presenter notes for each slide</span>
            </div>
            <div className="info-item">
              <span className="item-icon">🎨</span>
              <span>Professional design with consistent branding</span>
            </div>
          </div>
        </div>
      </form>

      <style jsx>{`
        .lesson-form-single-column {
          display: block;
          gap: 0;
        }
        
        .lesson-form-single-column .form-section {
          margin-bottom: 3rem;
        }
        
        .lesson-form-single-column .form-actions {
          margin-top: 2rem;
        }
      `}</style>

      {loading && (
        <LoadingSpinner
          progress={progress}
          currentStep={currentStep}
          estimatedTime={Math.max(0, estimatedTime - Math.floor(progress * estimatedTime / 100))}
        />
      )}

      {error && (
        <div className="error-message">
          <div className="error-header">
            <span className="error-icon">⚠️</span>
            <h3>Generation Error</h3>
          </div>
          <p>{error}</p>
          <div className="error-actions">
            <button
              type="button"
              className="btn-retry"
              onClick={() => setError(null)}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {downloadUrl && lessonDetails && (
        <DownloadLink
          url={downloadUrl}
          filename={`${formData.lesson_title}.pptx`}
          lessonDetails={lessonDetails}
        />
      )}
    </div>
  );
};

export default LessonForm;