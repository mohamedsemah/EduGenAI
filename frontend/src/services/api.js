// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);

    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.detail || `Server error: ${error.response.status}`);
    } else if (error.request) {
      // Request made but no response received
      throw new Error('No response from server. Please check your connection and try again.');
    } else {
      // Error setting up request
      throw new Error('Request configuration error: ' + error.message);
    }
  }
);

/**
 * Generate baseline lesson content
 */
export const generateBaselineLesson = async (formData) => {
  try {
    const data = new FormData();

    // Append form fields
    Object.keys(formData).forEach(key => {
      if (key === 'file' && formData[key]) {
        data.append(key, formData[key]);
      } else if (key !== 'file') {
        data.append(key, formData[key].toString());
      }
    });

    const response = await apiClient.post('/generate-baseline', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current lesson session data
 */
export const getLessonSession = async (sessionId) => {
  try {
    const response = await apiClient.get(`/lesson-session/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Edit a specific slide
 */
export const editSlide = async (sessionId, slideIndex, slideData) => {
  try {
    const response = await apiClient.post(`/edit-slide/${sessionId}`, {
      slide_index: slideIndex,
      title: slideData.title,
      content: slideData.content,
      notes: slideData.notes,
      image_prompt: slideData.image_prompt
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Enhance a slide with AI
 */
export const enhanceSlideWithAI = async (sessionId, slideIndex, prompt) => {
  try {
    const response = await apiClient.post(`/ai-enhance-slide/${sessionId}`, {
      slide_index: slideIndex,
      prompt: prompt
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Apply UDL principle to lesson
 */
export const applyUDLPrinciple = async (sessionId, principle, customRequirements = null) => {
  try {
    const response = await apiClient.post(`/apply-udl-principle/${sessionId}`, {
      principle: principle,
      custom_requirements: customRequirements
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Export final lesson as PowerPoint
 */
export const exportLesson = async (sessionId) => {
  try {
    const response = await apiClient.post(`/export-lesson/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Clean up lesson session
 */
export const deleteLessonSession = async (sessionId) => {
  try {
    const response = await apiClient.delete(`/lesson-session/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Legacy function for backward compatibility
 */
export const generateLesson = async (formData) => {
  console.warn('generateLesson is deprecated. Use generateBaselineLesson instead.');
  return generateBaselineLesson(formData);
};

// Utility functions for API data transformation
export const transformSlideData = (slide) => {
  return {
    title: slide.title || '',
    content: slide.content || '',
    notes: slide.notes || '',
    image_prompt: slide.image_prompt || '',
    accessibility_features: slide.accessibility_features || {},
    udl_enhancements: slide.udl_enhancements || {}
  };
};

export const transformLessonData = (lessonContent) => {
  return {
    ...lessonContent,
    slides: lessonContent.slides?.map(transformSlideData) || []
  };
};

// Constants for UDL principles
export const UDL_PRINCIPLES = {
  ENGAGEMENT: 'engagement',
  REPRESENTATION: 'representation',
  ACTION_EXPRESSION: 'action_expression'
};

export const UDL_PRINCIPLE_NAMES = {
  [UDL_PRINCIPLES.ENGAGEMENT]: 'Engagement',
  [UDL_PRINCIPLES.REPRESENTATION]: 'Representation',
  [UDL_PRINCIPLES.ACTION_EXPRESSION]: 'Action & Expression'
};

// Stage progression mapping
export const LESSON_STAGES = {
  FORM: 'form',
  BASELINE: 'baseline',
  ENGAGEMENT: 'engagement',
  REPRESENTATION: 'representation',
  ACTION_EXPRESSION: 'action_expression',
  EXPORT: 'export'
};

export const STAGE_PROGRESSION = {
  [LESSON_STAGES.FORM]: LESSON_STAGES.BASELINE,
  [LESSON_STAGES.BASELINE]: LESSON_STAGES.ENGAGEMENT,
  [LESSON_STAGES.ENGAGEMENT]: LESSON_STAGES.REPRESENTATION,
  [LESSON_STAGES.REPRESENTATION]: LESSON_STAGES.ACTION_EXPRESSION,
  [LESSON_STAGES.ACTION_EXPRESSION]: LESSON_STAGES.EXPORT
};

// Validation functions
export const validateFormData = (formData) => {
  const errors = [];

  if (!formData.topic?.trim()) {
    errors.push('Topic is required');
  }

  if (!formData.chapter?.trim()) {
    errors.push('Chapter/Unit is required');
  }

  if (!formData.lesson_title?.trim()) {
    errors.push('Lesson title is required');
  }

  if (!formData.grade_level?.trim()) {
    errors.push('Grade level is required');
  }

  if (!formData.learning_objectives?.trim()) {
    errors.push('Learning objectives are required');
  }

  if (!formData.duration?.trim()) {
    errors.push('Duration is required');
  }

  // File validation
  if (formData.file) {
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (formData.file.size > maxSizeBytes) {
      errors.push('File size must be less than 10MB');
    }

    if (!allowedTypes.includes(formData.file.type)) {
      errors.push('File must be PDF, Word document, text file, or image (JPG/PNG)');
    }
  }

  return errors;
};

export const validateSessionId = (sessionId) => {
  if (!sessionId || typeof sessionId !== 'string') {
    throw new Error('Valid session ID is required');
  }
  return true;
};

export const validateSlideIndex = (slideIndex, maxSlides) => {
  if (typeof slideIndex !== 'number' || slideIndex < 0 || slideIndex >= maxSlides) {
    throw new Error(`Slide index must be between 0 and ${maxSlides - 1}`);
  }
  return true;
};

// Helper functions for session management
export const createSessionStorage = () => {
  const storage = {
    get: (key) => {
      try {
        const item = localStorage.getItem(`edugenai_${key}`);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.warn('Error reading from localStorage:', error);
        return null;
      }
    },

    set: (key, value) => {
      try {
        localStorage.setItem(`edugenai_${key}`, JSON.stringify(value));
        return true;
      } catch (error) {
        console.warn('Error writing to localStorage:', error);
        return false;
      }
    },

    remove: (key) => {
      try {
        localStorage.removeItem(`edugenai_${key}`);
        return true;
      } catch (error) {
        console.warn('Error removing from localStorage:', error);
        return false;
      }
    },

    clear: () => {
      try {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('edugenai_'));
        keys.forEach(key => localStorage.removeItem(key));
        return true;
      } catch (error) {
        console.warn('Error clearing localStorage:', error);
        return false;
      }
    }
  };

  return storage;
};

// Auto-save functionality
export const createAutoSave = (sessionId, lessonContent, interval = 30000) => {
  const storage = createSessionStorage();
  let timeoutId = null;

  const save = () => {
    if (sessionId && lessonContent) {
      storage.set(`session_${sessionId}`, {
        sessionId,
        lessonContent,
        timestamp: Date.now()
      });
    }
  };

  const scheduleAutoSave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(save, interval);
  };

  const stopAutoSave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const restore = () => {
    if (sessionId) {
      return storage.get(`session_${sessionId}`);
    }
    return null;
  };

  return {
    save,
    scheduleAutoSave,
    stopAutoSave,
    restore
  };
};

// Error handling utilities
export const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const isNetworkError = (error) => {
  return !error?.response && error?.request;
};

export const isServerError = (error) => {
  return error?.response?.status >= 500;
};

export const isClientError = (error) => {
  return error?.response?.status >= 400 && error?.response?.status < 500;
};

// Progress tracking utilities
export const createProgressTracker = () => {
  const stages = Object.values(LESSON_STAGES);

  const getProgress = (currentStage) => {
    const stageIndex = stages.indexOf(currentStage);
    return stageIndex >= 0 ? ((stageIndex + 1) / stages.length) * 100 : 0;
  };

  const getNextStage = (currentStage) => {
    return STAGE_PROGRESSION[currentStage] || null;
  };

  const getPreviousStage = (currentStage) => {
    const entries = Object.entries(STAGE_PROGRESSION);
    const entry = entries.find(([_, next]) => next === currentStage);
    return entry ? entry[0] : null;
  };

  const canProceedToNext = (currentStage, lessonContent) => {
    switch (currentStage) {
      case LESSON_STAGES.FORM:
        return false; // Form stage requires submission
      case LESSON_STAGES.BASELINE:
        return lessonContent && lessonContent.slides && lessonContent.slides.length > 0;
      case LESSON_STAGES.ENGAGEMENT:
      case LESSON_STAGES.REPRESENTATION:
        return lessonContent && lessonContent.udl_applied_principles?.includes(currentStage);
      case LESSON_STAGES.ACTION_EXPRESSION:
        return lessonContent && lessonContent.udl_applied_principles?.includes(currentStage);
      default:
        return false;
    }
  };

  return {
    getProgress,
    getNextStage,
    getPreviousStage,
    canProceedToNext
  };
};

// Export all functions and utilities
export default {
  // API functions
  generateBaselineLesson,
  getLessonSession,
  editSlide,
  enhanceSlideWithAI,
  applyUDLPrinciple,
  exportLesson,
  deleteLessonSession,
  healthCheck,

  // Utility functions
  transformSlideData,
  transformLessonData,
  validateFormData,
  validateSessionId,
  validateSlideIndex,
  createSessionStorage,
  createAutoSave,
  getErrorMessage,
  isNetworkError,
  isServerError,
  isClientError,
  createProgressTracker,

  // Constants
  UDL_PRINCIPLES,
  UDL_PRINCIPLE_NAMES,
  LESSON_STAGES,
  STAGE_PROGRESSION
};