import React, { useState, useEffect } from 'react';
import { generateLesson } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import DownloadLink from './DownloadLink';

const LessonForm = () => {
  const [formData, setFormData] = useState({
    topic: '',
    chapter: '',
    lesson_title: '',
    grade_level: 'College', // Fixed to College
    learning_objectives: '',
    duration: '',
    complexity_level: 5,
    course_level: 'undergraduate', // New field for course level
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
      { step: 'Analyzing course requirements...', progress: 15, time: 2000 },
      { step: 'Generating college-level content...', progress: 35, time: 3000 },
      { step: 'Creating detailed academic explanations...', progress: 55, time: 4000 },
      { step: 'Adding interactive learning elements...', progress: 70, time: 2500 },
      { step: 'Applying UDL principles for adult learners...', progress: 85, time: 2000 },
      { step: 'Finalizing professional presentation...', progress: 95, time: 1500 },
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

  const courseLevelOptions = [
    { value: 'undergraduate_intro', label: 'Undergraduate - Introductory (100-200 level)' },
    { value: 'undergraduate_intermediate', label: 'Undergraduate - Intermediate (300 level)' },
    { value: 'undergraduate_advanced', label: 'Undergraduate - Advanced (400 level)' },
    { value: 'graduate_masters', label: 'Graduate - Master\'s Level' },
    { value: 'graduate_doctoral', label: 'Graduate - Doctoral Level' },
    { value: 'professional', label: 'Professional Development/Continuing Education' }
  ];

  const getCourseLevelDescription = (courseLevel) => {
    const descriptions = {
      'undergraduate_intro': 'Foundational concepts, broad overview, basic terminology',
      'undergraduate_intermediate': 'Building on fundamentals, connecting concepts, practical applications',
      'undergraduate_advanced': 'Complex analysis, advanced theories, independent thinking',
      'graduate_masters': 'Research-based, critical analysis, professional application',
      'graduate_doctoral': 'Cutting-edge research, original thinking, scholarly discourse',
      'professional': 'Practical skills, real-world application, career enhancement'
    };
    return descriptions[courseLevel] || '';
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
        <h2>Create Your College-Level UDL Lesson</h2>
        <p>Generate comprehensive, accessible instructional content designed specifically for higher education</p>
        <div className="feature-badges">
          <span className="badge">🎓 College-Focused</span>
          <span className="badge">♿ UDL Compliant</span>
          <span className="badge">📚 Research-Based</span>
          <span className="badge">🧠 Critical Thinking</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="lesson-form-single-column">
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">📚</span>
            Course Information
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="topic">
                Subject Area <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Organic Chemistry, Macroeconomics, Data Structures"
                  className="premium-input"
                />
                <div className="input-highlight"></div>
              </div>
              <small>The main academic discipline or subject area</small>
            </div>

            <div className="form-group">
              <label htmlFor="chapter">
                Course Module/Unit <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="chapter"
                  name="chapter"
                  value={formData.chapter}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Molecular Structure, Market Analysis, Algorithm Design"
                  className="premium-input"
                />
                <div className="input-highlight"></div>
              </div>
              <small>The specific course module, unit, or chapter</small>
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
                  placeholder="e.g., Stereochemistry in Drug Design, Game Theory Applications"
                  className="premium-input"
                />
                <div className="input-highlight"></div>
              </div>
              <small>A specific, engaging title for this lesson</small>
            </div>

            <div className="form-group">
              <label htmlFor="duration">
                Class Duration <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 75 minutes, 2 hours, 3-hour seminar"
                  className="premium-input"
                />
                <div className="input-highlight"></div>
              </div>
              <small>Duration of the class session</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="course_level">
              Course Level <span className="required">*</span>
            </label>
            <div className="select-wrapper">
              <select
                id="course_level"
                name="course_level"
                value={formData.course_level}
                onChange={handleChange}
                required
                className="premium-select"
              >
                <option value="">Select Course Level</option>
                {courseLevelOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="select-arrow">▼</div>
            </div>
            {formData.course_level && (
              <div className="grade-category-badge">
                <span className="category-label">Focus:</span>
                <span className="category-value">{getCourseLevelDescription(formData.course_level)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">🎯</span>
            Learning Outcomes
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
                placeholder="Enter each learning objective on a new line, e.g.:&#10;Students will analyze the relationship between molecular structure and biological activity&#10;Students will evaluate different approaches to drug design using stereochemical principles&#10;Students will synthesize knowledge to predict molecular behavior in biological systems"
                rows="6"
                className="premium-textarea"
              />
              <div className="textarea-highlight"></div>
            </div>
            <small>Enter specific, measurable learning objectives. Use action verbs like analyze, evaluate, synthesize, create.</small>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">⚙️</span>
            Content Complexity
          </h3>

          <div className="complexity-section">
            <div className="complexity-header">
              <label htmlFor="complexity_level">
                Academic Rigor Level: <span className="complexity-value">{formData.complexity_level}/10</span>
              </label>
            </div>

            <input
              type="range"
              id="complexity_level"
              name="complexity_level"
              min="3"
              max="10"
              value={formData.complexity_level}
              onChange={handleChange}
              className="complexity-slider"
            />

            <div className="complexity-description">
              <div className="complexity-badge" style={{
                backgroundColor:
                  formData.complexity_level <= 4 ? '#3b82f6' :
                  formData.complexity_level <= 6 ? '#667eea' :
                  formData.complexity_level <= 8 ? '#8b5cf6' : '#ef4444'
              }}>
                {formData.complexity_level <= 4 ? 'Foundational' :
                 formData.complexity_level <= 6 ? 'Intermediate' :
                 formData.complexity_level <= 8 ? 'Advanced' : 'Expert'}
              </div>

              <div className="time-estimate">
                <span className="time-icon">⏱️</span>
                <span>Est. {20 + formData.complexity_level * 3} min generation</span>
              </div>
            </div>

            <div className="complexity-labels">
              <span>Foundational</span>
              <span>Intermediate</span>
              <span>Advanced</span>
              <span>Expert</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">📎</span>
            Supporting Materials
          </h3>

          <div className="form-group">
            <label htmlFor="file">
              Course Material (optional)
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
                    <span className="upload-text">Upload course materials</span>
                    <span className="upload-formats">Syllabus, readings, research papers, or reference materials (Max 10MB)</span>
                  </div>
                )}
              </div>
            </div>
            <small>
              Upload relevant course materials, research papers, or reference documents to enhance the lesson
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-generate" disabled={loading}>
            <span className="btn-content">
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  Generating College Lesson...
                </>
              ) : (
                <>
                  <span className="btn-icon">🎓</span>
                  Generate College-Level Lesson
                </>
              )}
            </span>
            <div className="btn-bg-effect"></div>
          </button>
        </div>

        <div className="generation-info">
          <div className="info-header">
            <span className="info-icon">✨</span>
            <strong>Your college-level lesson will include:</strong>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="item-icon">📊</span>
              <span>12 comprehensive slides with academic depth (300-500 words each)</span>
            </div>
            <div className="info-item">
              <span className="item-icon">📚</span>
              <span>Advanced vocabulary with scholarly definitions and examples</span>
            </div>
            <div className="info-item">
              <span className="item-icon">🔬</span>
              <span>Research-based content with current academic perspectives</span>
            </div>
            <div className="info-item">
              <span className="item-icon">🧠</span>
              <span>Critical thinking exercises and analytical frameworks</span>
            </div>
            <div className="info-item">
              <span className="item-icon">♿</span>
              <span>UDL accessibility features designed for adult learners</span>
            </div>
            <div className="info-item">
              <span className="item-icon">🎯</span>
              <span>Multiple assessment strategies aligned with learning objectives</span>
            </div>
            <div className="info-item">
              <span className="item-icon">📝</span>
              <span>Detailed instructor notes with pedagogical guidance</span>
            </div>
            <div className="info-item">
              <span className="item-icon">🌐</span>
              <span>Professional design suitable for academic presentations</span>
            </div>
          </div>
        </div>
      </form>

      {/* Rest of the component remains the same */}
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