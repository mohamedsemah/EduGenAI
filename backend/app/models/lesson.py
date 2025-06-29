# backend/app/models/lesson.py
from pydantic import BaseModel, Field, validator
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


class CourseLevelType(str, Enum):
    """Enumeration of college course levels"""
    UNDERGRADUATE_INTRO = "undergraduate_intro"
    UNDERGRADUATE_INTERMEDIATE = "undergraduate_intermediate"
    UNDERGRADUATE_ADVANCED = "undergraduate_advanced"
    GRADUATE_MASTERS = "graduate_masters"
    GRADUATE_DOCTORAL = "graduate_doctoral"
    PROFESSIONAL = "professional"


class LessonRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=200, description="Subject area or academic discipline")
    chapter: str = Field(..., min_length=1, max_length=200, description="Course module, unit, or chapter")
    lesson_title: str = Field(..., min_length=1, max_length=300, description="Specific lesson title")
    grade_level: str = Field(default="College", description="Fixed to College level")
    course_level: Optional[CourseLevelType] = Field(default=CourseLevelType.UNDERGRADUATE_INTRO,
                                                    description="Specific course level")
    learning_objectives: str = Field(..., min_length=10, description="Learning objectives, one per line")
    duration: str = Field(..., min_length=1, max_length=100, description="Class session duration")
    complexity_level: Optional[int] = Field(default=5, ge=3, le=10, description="Academic rigor level (3-10)")
    uploaded_file_path: Optional[str] = None

    @validator('grade_level')
    def validate_grade_level(cls, v):
        """Ensure grade level is always College"""
        return "College"

    @validator('learning_objectives')
    def validate_learning_objectives(cls, v):
        """Ensure learning objectives contain multiple items"""
        objectives = [obj.strip() for obj in v.split('\n') if obj.strip()]
        if len(objectives) < 1:
            raise ValueError('At least one learning objective is required')
        return v

    @validator('complexity_level')
    def validate_complexity_level(cls, v):
        """Ensure complexity level is appropriate for college"""
        if v < 3:
            return 3  # Minimum college level
        return v


class SlideEditRequest(BaseModel):
    slide_index: int = Field(..., ge=0, description="Index of slide to edit")
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = Field(None, max_length=2000)
    notes: Optional[str] = Field(None, max_length=1000)
    image_prompt: Optional[str] = Field(None, max_length=500)

    @validator('slide_index')
    def validate_slide_index(cls, v):
        if v < 0:
            raise ValueError('Slide index must be non-negative')
        return v


class UDLEnhancementRequest(BaseModel):
    principle: Literal["engagement", "representation", "action_expression"]
    custom_requirements: Optional[str] = Field(None, max_length=1000, description="Custom UDL requirements")


class LessonSlide(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=10, max_length=2000)
    image_prompt: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    accessibility_features: Dict[str, str] = Field(default_factory=dict)
    udl_enhancements: Dict[str, List[str]] = Field(default_factory=dict)

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
    title: str = Field(..., min_length=1, max_length=300)
    overview: str = Field(..., min_length=10, max_length=1000)
    learning_objectives: List[str] = Field(..., min_items=1)
    grade_level: str = Field(default="College")
    course_level: Optional[str] = Field(default="undergraduate_intro")
    duration: str = Field(..., min_length=1, max_length=100)
    materials: List[str] = Field(default_factory=list)
    introduction: str = Field(..., min_length=10, max_length=1000)
    main_activities: List[Dict[str, str]] = Field(default_factory=list)
    assessment: str = Field(..., min_length=10, max_length=1000)
    conclusion: str = Field(..., min_length=10, max_length=1000)
    accessibility_features: Dict[str, str] = Field(default_factory=dict)
    slides: List[LessonSlide] = Field(..., min_items=8, max_items=15)
    udl_stage: LessonStage = Field(default=LessonStage.BASELINE)
    udl_applied_principles: List[UDLPrinciple] = Field(default_factory=list)

    @validator('grade_level')
    def validate_grade_level(cls, v):
        """Ensure grade level is always College"""
        return "College"

    @validator('slides')
    def validate_slides_count(cls, v):
        """Ensure appropriate number of slides for college-level content"""
        if len(v) < 8:
            raise ValueError('College-level lessons require at least 8 slides')
        if len(v) > 15:
            raise ValueError('College-level lessons should not exceed 15 slides for optimal engagement')
        return v


class LessonSession(BaseModel):
    session_id: str
    request: LessonRequest
    current_stage: LessonStage
    lesson_content: LessonContent
    edit_history: List[Dict] = Field(default_factory=list)
    lesson_dir: str

    class Config:
        """Pydantic configuration"""
        use_enum_values = True


class CollegeLessonMetrics(BaseModel):
    """Metrics specific to college-level lessons"""
    academic_rigor_score: float = Field(..., ge=0.0, le=10.0, description="Academic rigor rating")
    research_integration: bool = Field(default=False, description="Whether lesson integrates current research")
    critical_thinking_elements: int = Field(default=0, ge=0, description="Number of critical thinking components")
    professional_relevance: bool = Field(default=False, description="Whether lesson connects to career applications")
    udl_compliance_score: float = Field(default=0.0, ge=0.0, le=100.0, description="UDL compliance percentage")


class CollegeLessonExport(BaseModel):
    """Export configuration for college-level lessons"""
    include_research_citations: bool = Field(default=True)
    include_discussion_prompts: bool = Field(default=True)
    include_assessment_rubrics: bool = Field(default=True)
    include_accessibility_notes: bool = Field(default=True)
    format_type: Literal["academic", "professional", "conference"] = Field(default="academic")


# Course level descriptors for UI and processing
COURSE_LEVEL_DESCRIPTORS = {
    CourseLevelType.UNDERGRADUATE_INTRO: {
        "name": "Undergraduate - Introductory (100-200 level)",
        "description": "Foundational concepts, broad overview, basic terminology",
        "complexity_range": (3, 5),
        "typical_duration": "50-75 minutes",
        "focus": "Building fundamental knowledge and connecting to prior experience"
    },
    CourseLevelType.UNDERGRADUATE_INTERMEDIATE: {
        "name": "Undergraduate - Intermediate (300 level)",
        "description": "Building on fundamentals, connecting concepts, practical applications",
        "complexity_range": (4, 7),
        "typical_duration": "75-90 minutes",
        "focus": "Developing analytical skills and practical application"
    },
    CourseLevelType.UNDERGRADUATE_ADVANCED: {
        "name": "Undergraduate - Advanced (400 level)",
        "description": "Complex analysis, advanced theories, independent thinking",
        "complexity_range": (6, 8),
        "typical_duration": "75-120 minutes",
        "focus": "Critical analysis and synthesis of complex concepts"
    },
    CourseLevelType.GRADUATE_MASTERS: {
        "name": "Graduate - Master's Level",
        "description": "Research-based, critical analysis, professional application",
        "complexity_range": (7, 9),
        "typical_duration": "90-150 minutes",
        "focus": "Research methodology and professional competency development"
    },
    CourseLevelType.GRADUATE_DOCTORAL: {
        "name": "Graduate - Doctoral Level",
        "description": "Cutting-edge research, original thinking, scholarly discourse",
        "complexity_range": (8, 10),
        "typical_duration": "120-180 minutes",
        "focus": "Original research and contribution to disciplinary knowledge"
    },
    CourseLevelType.PROFESSIONAL: {
        "name": "Professional Development/Continuing Education",
        "description": "Practical skills, real-world application, career enhancement",
        "complexity_range": (4, 8),
        "typical_duration": "60-240 minutes",
        "focus": "Immediate workplace application and skill enhancement"
    }
}

# UDL Principles adapted for college-level instruction
COLLEGE_UDL_PRINCIPLES = {
    "engagement": {
        "name": "Engagement for Adult Learners",
        "guidelines": [
            "Connect to professional and career goals",
            "Provide authentic, research-based problems",
            "Offer choice in learning pathways and assessment",
            "Support self-directed learning preferences",
            "Include diverse cultural and global perspectives",
            "Facilitate peer collaboration and knowledge sharing"
        ],
        "college_specific": [
            "Career relevance and professional application",
            "Autonomous learning and goal-setting support",
            "Integration of prior professional experience",
            "Current events and contemporary issue connections"
        ]
    },
    "representation": {
        "name": "Representation for Academic Content",
        "guidelines": [
            "Multiple academic formats and media types",
            "Discipline-specific vocabulary and concept support",
            "Background knowledge scaffolds for diverse paths",
            "Multiple theoretical and scholarly perspectives",
            "Visual representations appropriate for college content",
            "Multilingual and cultural accessibility options"
        ],
        "college_specific": [
            "Research article and primary source integration",
            "Academic vocabulary with etymological support",
            "Theoretical framework comparisons",
            "Discipline-appropriate visual representations"
        ]
    },
    "action_expression": {
        "name": "Action & Expression for College Assessment",
        "guidelines": [
            "Multiple demonstration formats (written, oral, visual, digital)",
            "Individual and collaborative response options",
            "Various communication tools and platforms",
            "Organizational supports for complex projects",
            "Self-assessment and peer review opportunities",
            "Technology accommodating different skill levels"
        ],
        "college_specific": [
            "Research and thesis-level project organization",
            "Academic writing and presentation formats",
            "Peer review and scholarly discourse skills",
            "Professional communication competencies"
        ]
    }
}


def get_course_level_info(course_level: CourseLevelType) -> Dict[str, any]:
    """Get comprehensive information about a specific course level"""
    return COURSE_LEVEL_DESCRIPTORS.get(course_level, COURSE_LEVEL_DESCRIPTORS[CourseLevelType.UNDERGRADUATE_INTRO])


def validate_complexity_for_course_level(complexity: int, course_level: CourseLevelType) -> int:
    """Validate and adjust complexity level based on course level"""
    level_info = get_course_level_info(course_level)
    min_complexity, max_complexity = level_info["complexity_range"]

    if complexity < min_complexity:
        return min_complexity
    elif complexity > max_complexity:
        return max_complexity
    return complexity


def get_recommended_duration(course_level: CourseLevelType) -> str:
    """Get recommended duration for course level"""
    level_info = get_course_level_info(course_level)
    return level_info["typical_duration"]


def get_college_udl_guidelines(principle: str) -> Dict[str, List[str]]:
    """Get UDL guidelines specifically adapted for college-level instruction"""
    return COLLEGE_UDL_PRINCIPLES.get(principle, {
        "name": "Unknown Principle",
        "guidelines": [],
        "college_specific": []
    })


# Validation functions for college-specific requirements
def validate_college_learning_objectives(objectives: str) -> List[str]:
    """Validate that learning objectives are appropriate for college level"""
    college_action_verbs = [
        'analyze', 'evaluate', 'synthesize', 'create', 'assess', 'critique',
        'compare', 'contrast', 'examine', 'investigate', 'research', 'design',
        'develop', 'construct', 'formulate', 'interpret', 'justify', 'defend',
        'argue', 'propose', 'theorize', 'hypothesize', 'conceptualize'
    ]

    objectives_list = [obj.strip() for obj in objectives.split('\n') if obj.strip()]
    validated_objectives = []

    for obj in objectives_list:
        # Check if objective uses appropriate college-level action verbs
        has_college_verb = any(verb in obj.lower() for verb in college_action_verbs)
        if has_college_verb or len(obj) > 20:  # Allow longer, descriptive objectives
            validated_objectives.append(obj)
        else:
            # Suggest enhancement
            validated_objectives.append(f"Students will analyze and evaluate {obj.lower()}")

    return validated_objectives


def get_assessment_strategies_for_level(course_level: CourseLevelType) -> List[str]:
    """Get appropriate assessment strategies for different course levels"""
    strategies = {
        CourseLevelType.UNDERGRADUATE_INTRO: [
            "Multiple choice with analysis questions",
            "Short essay responses",
            "Concept mapping activities",
            "Case study analysis",
            "Group presentations",
            "Reflection papers"
        ],
        CourseLevelType.UNDERGRADUATE_INTERMEDIATE: [
            "Research essays",
            "Project-based assessments",
            "Comparative analysis papers",
            "Literature reviews",
            "Field work reports",
            "Professional portfolios"
        ],
        CourseLevelType.UNDERGRADUATE_ADVANCED: [
            "Independent research projects",
            "Thesis proposals",
            "Conference presentations",
            "Peer review activities",
            "Grant proposal writing",
            "Capstone projects"
        ],
        CourseLevelType.GRADUATE_MASTERS: [
            "Comprehensive literature reviews",
            "Original research proposals",
            "Thesis chapters",
            "Professional competency demonstrations",
            "Scholarly article critiques",
            "Research methodology designs"
        ],
        CourseLevelType.GRADUATE_DOCTORAL: [
            "Dissertation chapters",
            "Original research contributions",
            "Conference paper presentations",
            "Peer-reviewed publications",
            "Grant applications",
            "Comprehensive examinations"
        ],
        CourseLevelType.PROFESSIONAL: [
            "Skills-based assessments",
            "Workplace application projects",
            "Professional certification preparation",
            "Case study solutions",
            "Best practices documentation",
            "Training module development"
        ]
    }
    return strategies.get(course_level, strategies[CourseLevelType.UNDERGRADUATE_INTRO])


class CollegeLessonValidator:
    """Validator class for college-specific lesson requirements"""

    @staticmethod
    def validate_academic_rigor(lesson_content: LessonContent, course_level: CourseLevelType) -> Dict[str, any]:
        """Validate that lesson content meets academic rigor standards"""
        validation_results = {
            "is_valid": True,
            "score": 0.0,
            "feedback": [],
            "recommendations": []
        }

        # Check content length for college appropriateness
        avg_slide_length = sum(len(slide.content) for slide in lesson_content.slides) / len(lesson_content.slides)
        min_expected_length = 200 if course_level in [CourseLevelType.UNDERGRADUATE_INTRO] else 300

        if avg_slide_length < min_expected_length:
            validation_results["feedback"].append(
                f"Average slide content ({avg_slide_length:.0f} chars) below college standard ({min_expected_length})")
            validation_results["recommendations"].append("Expand content with more detailed explanations and examples")
            validation_results["score"] -= 2.0

        # Check for research integration
        research_keywords = ["research", "study", "studies", "findings", "evidence", "data", "analysis"]
        research_mentions = sum(1 for slide in lesson_content.slides
                                if any(keyword in slide.content.lower() for keyword in research_keywords))

        if research_mentions < len(lesson_content.slides) * 0.3:  # At least 30% of slides should mention research
            validation_results["feedback"].append("Limited integration of research and evidence")
            validation_results["recommendations"].append("Incorporate more research findings and scholarly evidence")
            validation_results["score"] -= 1.0

        # Check learning objectives for higher-order thinking
        college_verbs = ['analyze', 'evaluate', 'synthesize', 'create', 'assess', 'critique']
        objectives_text = " ".join(lesson_content.learning_objectives).lower()
        higher_order_count = sum(1 for verb in college_verbs if verb in objectives_text)

        if higher_order_count == 0:
            validation_results["feedback"].append("Learning objectives lack higher-order thinking verbs")
            validation_results["recommendations"].append(
                "Revise objectives to include analysis, evaluation, or synthesis")
            validation_results["score"] -= 1.5

        # Calculate final score (out of 10)
        validation_results["score"] = max(0, 10 + validation_results["score"])
        validation_results["is_valid"] = validation_results["score"] >= 6.0

        return validation_results

    @staticmethod
    def suggest_enhancements(lesson_content: LessonContent, course_level: CourseLevelType) -> List[str]:
        """Suggest enhancements to improve college-level appropriateness"""
        suggestions = []

        level_info = get_course_level_info(course_level)

        # Course-level specific suggestions
        if course_level in [CourseLevelType.UNDERGRADUATE_INTRO, CourseLevelType.UNDERGRADUATE_INTERMEDIATE]:
            suggestions.extend([
                "Add more real-world examples and case studies",
                "Include opportunities for collaborative learning",
                "Provide clear connections to career applications"
            ])
        elif course_level in [CourseLevelType.UNDERGRADUATE_ADVANCED, CourseLevelType.GRADUATE_MASTERS]:
            suggestions.extend([
                "Incorporate current research and scholarly debates",
                "Add critical analysis and evaluation components",
                "Include opportunities for independent research"
            ])
        elif course_level == CourseLevelType.GRADUATE_DOCTORAL:
            suggestions.extend([
                "Focus on original thinking and contribution to knowledge",
                "Emphasize methodological considerations",
                "Include opportunities for scholarly discourse and debate"
            ])

        return suggestions