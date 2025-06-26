from pydantic import BaseModel
from typing import Optional, List, Dict

class LessonRequest(BaseModel):
    topic: str
    chapter: str
    lesson_title: str
    grade_level: str
    learning_objectives: str
    duration: str
    uploaded_file_path: Optional[str] = None

class LessonSlide(BaseModel):
    title: str
    content: str
    image_prompt: Optional[str] = None
    notes: Optional[str] = None
    accessibility_features: Dict[str, str] = {}

class LessonContent(BaseModel):
    title: str
    overview: str
    learning_objectives: List[str]
    grade_level: str
    duration: str
    materials: List[str]
    introduction: str
    main_activities: List[Dict[str, str]]
    assessment: str
    conclusion: str
    accessibility_features: Dict[str, str]
    slides: List[LessonSlide]