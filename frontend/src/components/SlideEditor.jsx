import React, { useState, useRef, useEffect } from 'react';

const SlideEditor = ({ slide, slideIndex, onSlideUpdate, onAIEnhance }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSlide, setEditedSlide] = useState(slide);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setEditedSlide(slide);
  }, [slide]);

  const handleEdit = (field, value) => {
    setEditedSlide(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSlideUpdate(slideIndex, editedSlide);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSlide(slide);
    setIsEditing(false);
  };

  const handleAIEnhancement = () => {
    if (aiPrompt.trim()) {
      onAIEnhance(slideIndex, aiPrompt);
      setAiPrompt('');
      setShowAIPrompt(false);
    }
  };

  const getUDLBadges = () => {
    if (!slide.udl_enhancements) return null;

    return Object.keys(slide.udl_enhancements).map(principle => (
      <span key={principle} className={`udl-badge udl-${principle}`}>
        {principle.charAt(0).toUpperCase() + principle.slice(1)}
      </span>
    ));
  };

  return (
    <div className="slide-editor">
      <div className="slide-header">
        <div className="slide-number">Slide {slideIndex + 1}</div>
        <div className="slide-actions">
          {getUDLBadges()}
          <button
            className="btn-edit"
            onClick={() => setIsEditing(!isEditing)}
            title="Edit slide"
          >
            ✏️
          </button>
          <button
            className="btn-ai"
            onClick={() => setShowAIPrompt(!showAIPrompt)}
            title="AI enhancement"
          >
            🧠
          </button>
        </div>
      </div>

      {showAIPrompt && (
        <div className="ai-prompt-section">
          <div className="ai-prompt-header">
            <span className="ai-icon">🤖</span>
            <span>Ask AI to enhance this slide</span>
          </div>
          <div className="ai-prompt-input">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="E.g., 'Add more visual elements', 'Make it more interactive', 'Include real-world examples'..."
              rows="3"
            />
            <div className="ai-prompt-actions">
              <button onClick={handleAIEnhancement} className="btn-ai-submit">
                Enhance with AI
              </button>
              <button onClick={() => setShowAIPrompt(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="slide-content">
        <div className="slide-title-section">
          {isEditing ? (
            <input
              type="text"
              value={editedSlide.title}
              onChange={(e) => handleEdit('title', e.target.value)}
              className="slide-title-input"
              placeholder="Slide title..."
            />
          ) : (
            <h3 className="slide-title">{slide.title}</h3>
          )}
        </div>

        <div className="slide-body">
          <div className="slide-main-content">
            {isEditing ? (
              <textarea
                value={editedSlide.content}
                onChange={(e) => handleEdit('content', e.target.value)}
                className="slide-content-input"
                placeholder="Slide content..."
                rows="8"
              />
            ) : (
              <div className="slide-content-display">
                {slide.content.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>

          <div className="slide-image-section">
            <div className="image-placeholder">
              <div className="image-icon">🖼️</div>
              <div className="image-description">
                {isEditing ? (
                  <textarea
                    value={editedSlide.image_prompt || ''}
                    onChange={(e) => handleEdit('image_prompt', e.target.value)}
                    placeholder="Describe the image for this slide..."
                    rows="3"
                    className="image-prompt-input"
                  />
                ) : (
                  <p>{slide.image_prompt || 'No image description provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {slide.udl_enhancements && Object.keys(slide.udl_enhancements).length > 0 && (
          <div className="udl-enhancements">
            <h4>UDL Enhancements Applied:</h4>
            {Object.entries(slide.udl_enhancements).map(([principle, enhancements]) => (
              <div key={principle} className="udl-enhancement-group">
                <h5 className={`udl-principle-title udl-${principle}`}>
                  {principle.charAt(0).toUpperCase() + principle.slice(1).replace('_', ' & ')}
                </h5>
                <ul className="udl-enhancement-list">
                  {enhancements.map((enhancement, idx) => (
                    <li key={idx}>{enhancement}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="slide-notes-section">
          <h4>Presenter Notes</h4>
          {isEditing ? (
            <textarea
              value={editedSlide.notes || ''}
              onChange={(e) => handleEdit('notes', e.target.value)}
              placeholder="Notes for the presenter..."
              rows="4"
              className="slide-notes-input"
            />
          ) : (
            <div className="slide-notes-display">
              {slide.notes ? (
                slide.notes.split('\n').map((note, idx) => (
                  <p key={idx}>{note}</p>
                ))
              ) : (
                <p className="no-notes">No presenter notes provided</p>
              )}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="edit-actions">
            <button onClick={handleSave} className="btn-save">
              💾 Save Changes
            </button>
            <button onClick={handleCancel} className="btn-cancel">
              ❌ Cancel
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .slide-editor {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .slide-editor:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .slide-header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slide-number {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .slide-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .udl-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 15px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .udl-engagement {
          background: rgba(255, 193, 7, 0.9);
          color: #856404;
        }

        .udl-representation {
          background: rgba(40, 167, 69, 0.9);
          color: #155724;
        }

        .udl-action_expression {
          background: rgba(220, 53, 69, 0.9);
          color: #721c24;
        }

        .btn-edit, .btn-ai {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .btn-edit:hover, .btn-ai:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .ai-prompt-section {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border-bottom: 1px solid #e5e7eb;
          padding: 1.5rem;
        }

        .ai-prompt-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: #4b5563;
        }

        .ai-icon {
          font-size: 1.2rem;
        }

        .ai-prompt-input textarea {
          width: 100%;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          font-family: inherit;
          font-size: 0.9rem;
          resize: vertical;
          margin-bottom: 1rem;
        }

        .ai-prompt-input textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .ai-prompt-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-ai-submit {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 0.7rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-ai-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .slide-content {
          padding: 2rem;
        }

        .slide-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
          line-height: 1.3;
        }

        .slide-title-input {
          width: 100%;
          font-size: 1.5rem;
          font-weight: 700;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 0.8rem;
          margin-bottom: 1.5rem;
        }

        .slide-title-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .slide-body {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .slide-content-input {
          width: 100%;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.6;
          resize: vertical;
        }

        .slide-content-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .slide-content-display {
          line-height: 1.7;
          color: #4b5563;
        }

        .slide-content-display p {
          margin-bottom: 1rem;
        }

        .image-placeholder {
          background: #f9fafb;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .image-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .image-description {
          font-size: 0.9rem;
          color: #6b7280;
          line-height: 1.5;
        }

        .image-prompt-input {
          width: 100%;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 0.8rem;
          font-family: inherit;
          font-size: 0.9rem;
          resize: vertical;
        }

        .image-prompt-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .udl-enhancements {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .udl-enhancements h4 {
          color: #1f2937;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .udl-enhancement-group {
          margin-bottom: 1rem;
        }

        .udl-principle-title {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          display: inline-block;
        }

        .udl-principle-title.udl-engagement {
          background: rgba(255, 193, 7, 0.2);
          color: #856404;
        }

        .udl-principle-title.udl-representation {
          background: rgba(40, 167, 69, 0.2);
          color: #155724;
        }

        .udl-principle-title.udl-action_expression {
          background: rgba(220, 53, 69, 0.2);
          color: #721c24;
        }

        .udl-enhancement-list {
          list-style: none;
          padding-left: 0;
        }

        .udl-enhancement-list li {
          padding: 0.3rem 0;
          padding-left: 1.5rem;
          position: relative;
          color: #4b5563;
          font-size: 0.9rem;
        }

        .udl-enhancement-list li::before {
          content: "✨";
          position: absolute;
          left: 0;
          color: #667eea;
        }

        .slide-notes-section h4 {
          color: #1f2937;
          margin-bottom: 0.8rem;
          font-size: 1rem;
        }

        .slide-notes-input {
          width: 100%;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          font-family: inherit;
          font-size: 0.9rem;
          line-height: 1.6;
          resize: vertical;
        }

        .slide-notes-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .slide-notes-display {
          background: #f9fafb;
          border-radius: 6px;
          padding: 1rem;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #4b5563;
        }

        .no-notes {
          color: #9ca3af;
          font-style: italic;
        }

        .edit-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-save {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-cancel {
          background: #6b7280;
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-cancel:hover {
          background: #4b5563;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .slide-body {
            grid-template-columns: 1fr;
          }
          
          .slide-header {
            padding: 1rem;
          }
          
          .slide-content {
            padding: 1.5rem;
          }
          
          .edit-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default SlideEditor;