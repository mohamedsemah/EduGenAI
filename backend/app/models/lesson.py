# backend/app/models/lesson.py
from pydantic import BaseModel
from typing import Optional, List, Dict, Literal
from enum import Enum


class LessonStage(str, Enum):
    BASELINE = "baseline"
    ENGAGEMENT = "engagement"
    REPRESENTATION = "representation"
    ACTION_EXPRESSION = "action_expression"
    COMPLETED = "completed"


class UDLPrinciple(str, Enum):
    ENGAGEMENT = "engagement"
    REPRESENTATION = "representation"
    ACTION_EXPRESSION = "action_expression"


class LessonRequest(BaseModel):
    topic: str
    chapter: str
    lesson_title: str
    grade_level: str
    learning_objectives: str
    duration: str
    uploaded_file_path: Optional[str] = None


class SlideEditRequest(BaseModel):
    slide_index: int
    title: Optional[str] = None
    content: Optional[str] = None
    notes: Optional[str] = None
    image_prompt: Optional[str] = None


class UDLEnhancementRequest(BaseModel):
    principle: Literal["engagement", "representation", "action_expression"]
    custom_requirements: Optional[str] = None


class LessonSlide(BaseModel):
    title: str
    content: str
    image_prompt: Optional[str] = None
    notes: Optional[str] = None
    accessibility_features: Dict[str, str] = {}
    udl_enhancements: Dict[str, List[str]] = {}

    def copy(self):
        """Create a deep copy of the slide"""
        return LessonSlide(
            title=self.title,
            content=self.content,
            image_prompt=self.image_prompt,
            notes=self.notes,
            accessibility_features=self.accessibility_features.copy(),
            udl_enhancements={k: v.copy() for k, v in self.udl_enhancements.items()}
        )


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
    udl_stage: LessonStage = LessonStage.BASELINE
    udl_applied_principles: List[UDLPrinciple] = []


class LessonSession(BaseModel):
    session_id: str
    request: LessonRequest
    current_stage: LessonStage
    lesson_content: LessonContent
    edit_history: List[Dict] = []
    lesson_dir: str