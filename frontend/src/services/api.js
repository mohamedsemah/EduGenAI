import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const generateLesson = async (formData) => {
  try {
    const data = new FormData();
    data.append('topic', formData.topic);
    data.append('chapter', formData.chapter);
    data.append('lesson_title', formData.lesson_title);
    data.append('grade_level', formData.grade_level);
    data.append('learning_objectives', formData.learning_objectives);
    data.append('duration', formData.duration);
    data.append('complexity_level', formData.complexity_level.toString());

    if (formData.file) {
      data.append('file', formData.file);
    }

    const response = await axios.post(`${API_BASE_URL}/generate`, data, {
      headers: {'Content-Type': 'multipart/form-data'},
      timeout: 120000
    });

    return response.data;
  } catch (error) {
    console.error('Error generating lesson:', error);
    if (error.response) {
      throw new Error(error.response.data.detail || 'Server error occurred during lesson generation');
    } else if (error.request) {
      throw new Error('No response from server. The lesson generation may have timed out. Please try again.');
    } else {
      throw new Error('Error setting up request: ' + error.message);
    }
  }
};