# backend/app/services/lesson_generator.py
import os
from typing import List, Dict, Any
from openai import OpenAI
from app.models.lesson import LessonRequest, LessonContent, LessonSlide, LessonStage, UDLPrinciple
from app.core.config import settings
import json
import re


# Initialize OpenAI client
def get_openai_client():
    """Get OpenAI client with proper error handling"""
    try:
        return OpenAI(api_key=settings.OPENAI_API_KEY)
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        return None


def generate_baseline_lesson(lesson_request: LessonRequest) -> LessonContent:
    """Generate baseline lesson content without UDL enhancements"""

    client = get_openai_client()

    if not client:
        return create_baseline_fallback_lesson(lesson_request)

    # Generate baseline content prompt
    system_prompt = f"""
    You are an expert curriculum designer. Create a baseline lesson plan for {lesson_request.grade_level} students 
    on {lesson_request.topic}. This is the FIRST STAGE of a multi-stage process where UDL principles will be added later.

    Focus on creating solid, comprehensive educational content WITHOUT UDL enhancements yet.

    Requirements:
    - Create exactly 8 slides with clear, educational content
    - Each slide should have 150-250 words of content
    - Include engaging titles and comprehensive explanations
    - Provide detailed presenter notes for each slide
    - Include suggested image descriptions
    - Use grade-appropriate language and examples

    DO NOT include UDL-specific accessibility features yet - we'll add those in subsequent stages.
    """

    user_prompt = f"""
    Create a baseline lesson plan for:

    Topic: {lesson_request.topic}
    Chapter: {lesson_request.chapter}
    Title: {lesson_request.lesson_title}
    Grade Level: {lesson_request.grade_level}
    Duration: {lesson_request.duration}
    Learning Objectives: {lesson_request.learning_objectives}

    Create 8 slides with this structure:
    1. Introduction to {lesson_request.topic}
    2. Key Vocabulary and Concepts
    3. Core Concept Part 1
    4. Core Concept Part 2
    5. Examples and Applications
    6. Practice Activity
    7. Assessment
    8. Summary and Next Steps

    For each slide, provide:
    - Engaging title
    - 150-250 words of educational content
    - Detailed presenter notes (100+ words)
    - Image description for visual content
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=3000
        )

        ai_response = response.choices[0].message.content
        slides = parse_ai_response_to_slides(ai_response, lesson_request)

    except Exception as e:
        print(f"Error generating baseline content: {e}")
        slides = create_baseline_slides_fallback(lesson_request)

    # Parse learning objectives
    learning_objectives = [obj.strip() for obj in lesson_request.learning_objectives.split("\n") if obj.strip()]

    return LessonContent(
        title=lesson_request.lesson_title,
        overview=f"Baseline lesson on {lesson_request.topic} for {lesson_request.grade_level} students. "
                 f"This lesson will be enhanced with UDL principles in subsequent stages.",
        learning_objectives=learning_objectives,
        grade_level=lesson_request.grade_level,
        duration=lesson_request.duration,
        materials=[
            "Digital presentation slides",
            "Note-taking materials",
            "Basic classroom supplies"
        ],
        introduction=f"Introduction to {lesson_request.topic} concepts and foundational knowledge.",
        main_activities=[
            {
                "name": "Concept Introduction",
                "description": f"Introduction to key {lesson_request.topic} concepts"
            },
            {
                "name": "Content Exploration",
                "description": f"Detailed exploration of {lesson_request.topic} principles"
            },
            {
                "name": "Application Practice",
                "description": f"Practice applying {lesson_request.topic} knowledge"
            }
        ],
        assessment=f"Standard assessment of {lesson_request.topic} understanding through questions and activities.",
        conclusion=f"Summary of {lesson_request.topic} learning and preview of next steps.",
        accessibility_features={},  # Will be added in UDL stages
        slides=slides,
        udl_stage=LessonStage.BASELINE,
        udl_applied_principles=[]
    )


def enhance_with_udl_principle(lesson_content: LessonContent, principle: str,
                               lesson_request: LessonRequest) -> LessonContent:
    """Enhance lesson content with a specific UDL principle"""

    client = get_openai_client()

    if not client:
        return apply_fallback_udl_enhancement(lesson_content, principle)

    # Create enhancement prompt based on principle
    udl_prompts = {
        "engagement": """
        Apply UDL ENGAGEMENT principles to enhance this lesson:

        ENGAGEMENT GUIDELINES:
        - Add multiple options for recruiting interest (curiosity, relevance, authenticity)
        - Include options for sustaining effort and persistence (collaboration, feedback, goal-setting)
        - Provide options for self-regulation (expectations, personal skills, strategies)

        For each slide, add:
        - Engaging hooks and attention-grabbers
        - Personal relevance connections
        - Choice and autonomy opportunities
        - Motivation and interest-building elements
        - Goal-setting and self-reflection prompts
        """,

        "representation": """
        Apply UDL REPRESENTATION principles to enhance this lesson:

        REPRESENTATION GUIDELINES:
        - Add options for perception (visual, auditory, tactile displays)
        - Include options for language and symbols (multiple formats, media)
        - Provide options for comprehension (background knowledge, patterns, strategies)

        For each slide, add:
        - Multiple ways to present information
        - Visual, auditory, and textual alternatives
        - Background knowledge connections
        - Pattern recognition aids
        - Comprehension supports and scaffolds
        """,

        "action_expression": """
        Apply UDL ACTION & EXPRESSION principles to enhance this lesson:

        ACTION & EXPRESSION GUIDELINES:
        - Add options for physical action (navigation, interaction, accessibility)
        - Include options for expression and communication (multiple tools, media)
        - Provide options for executive functions (planning, organizing, monitoring)

        For each slide, add:
        - Multiple ways students can respond and participate
        - Various communication and expression options
        - Tools and supports for organization
        - Scaffolds for planning and strategy development
        - Progress monitoring opportunities
        """
    }

    system_prompt = f"""
    You are a Universal Design for Learning expert. Enhance the provided lesson content by applying 
    {principle.upper()} principles. Build upon the existing content rather than replacing it.

    {udl_prompts[principle]}

    Return the enhanced lesson with all original content plus UDL enhancements clearly marked.
    """

    # Convert current lesson to text for AI processing
    current_lesson_text = format_lesson_for_ai(lesson_content)

    user_prompt = f"""
    Enhance this lesson with UDL {principle} principles:

    {current_lesson_text}

    For each slide, add specific {principle} enhancements while keeping all original content.
    Mark new additions with [UDL-{principle.upper()}] tags.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=3500
        )

        ai_response = response.choices[0].message.content
        enhanced_slides = parse_enhanced_slides(ai_response, lesson_content.slides, principle)

    except Exception as e:
        print(f"Error enhancing with UDL {principle}: {e}")
        enhanced_slides = apply_fallback_udl_enhancement(lesson_content, principle).slides

    # Update lesson content
    enhanced_lesson = lesson_content.copy(deep=True)
    enhanced_lesson.slides = enhanced_slides
    enhanced_lesson.udl_stage = LessonStage(principle)
    enhanced_lesson.udl_applied_principles.append(UDLPrinciple(principle))

    # Update accessibility features based on principle
    enhanced_lesson.accessibility_features.update(get_udl_accessibility_features(principle))

    return enhanced_lesson


def get_udl_accessibility_features(principle: str) -> Dict[str, str]:
    """Get accessibility features for a specific UDL principle"""
    features = {
        "engagement": {
            "motivation": "Interest-based choices, culturally relevant examples, authentic learning contexts",
            "persistence": "Goal-setting tools, progress tracking, collaborative opportunities",
            "self_regulation": "Self-assessment rubrics, reflection prompts, coping strategies"
        },
        "representation": {
            "perception": "Visual and auditory content, tactile elements, adjustable display options",
            "language": "Multiple language supports, symbol alternatives, glossaries",
            "comprehension": "Background knowledge activation, pattern highlighting, concept maps"
        },
        "action_expression": {
            "physical_action": "Multiple navigation options, assistive technology compatibility",
            "expression": "Choice in response formats, multimedia tools, communication supports",
            "executive_function": "Planning templates, organizational tools, progress monitoring"
        }
    }
    return features.get(principle, {})


def parse_ai_response_to_slides(ai_response: str, lesson_request: LessonRequest) -> List[LessonSlide]:
    """Parse AI response into slide objects"""
    # This is a simplified parser - in production, you'd want more robust parsing
    slides = []

    # Split response into slide sections (this would need more sophisticated parsing)
    slide_sections = ai_response.split("Slide ")

    for i, section in enumerate(slide_sections[1:], 1):  # Skip first empty split
        if i <= 8:  # Ensure we only get 8 slides
            slides.append(LessonSlide(
                title=f"{lesson_request.topic} - Slide {i}",
                content=section[:300] if len(section) > 300 else section,  # Truncate if too long
                image_prompt=f"Educational illustration for {lesson_request.topic} slide {i}",
                notes=f"Presenter notes for slide {i} covering {lesson_request.topic}",
                accessibility_features={},
                udl_enhancements={}
            ))

    # Ensure we have exactly 8 slides
    while len(slides) < 8:
        slides.append(create_fallback_slide(len(slides) + 1, lesson_request))

    return slides[:8]


def parse_enhanced_slides(ai_response: str, original_slides: List[LessonSlide], principle: str) -> List[LessonSlide]:
    """Parse AI-enhanced response and merge with original slides"""
    enhanced_slides = []

    for i, original_slide in enumerate(original_slides):
        enhanced_slide = original_slide.copy()

        # Extract enhancements for this slide (simplified parsing)
        # In production, you'd want more sophisticated parsing
        enhancement_markers = [f"[UDL-{principle.upper()}]", f"UDL {principle}", f"{principle} enhancement"]

        # Add principle-specific enhancements
        if principle not in enhanced_slide.udl_enhancements:
            enhanced_slide.udl_enhancements[principle] = []

        enhanced_slide.udl_enhancements[principle].extend(get_default_udl_enhancements(principle))

        enhanced_slides.append(enhanced_slide)

    return enhanced_slides


def get_default_udl_enhancements(principle: str) -> List[str]:
    """Get default UDL enhancements for a principle"""
    enhancements = {
        "engagement": [
            "Added choice in activity participation",
            "Included culturally relevant examples",
            "Added progress tracking elements",
            "Included self-reflection opportunities"
        ],
        "representation": [
            "Added visual content alternatives",
            "Included vocabulary supports",
            "Added background knowledge connections",
            "Included multiple format options"
        ],
        "action_expression": [
            "Added multiple response options",
            "Included planning supports",
            "Added progress monitoring tools",
            "Included communication alternatives"
        ]
    }
    return enhancements.get(principle, [])


def create_baseline_fallback_lesson(lesson_request: LessonRequest) -> LessonContent:
    """Create fallback baseline lesson when AI is unavailable"""
    slides = create_baseline_slides_fallback(lesson_request)

    learning_objectives = [obj.strip() for obj in lesson_request.learning_objectives.split("\n") if obj.strip()]

    return LessonContent(
        title=lesson_request.lesson_title,
        overview=f"Baseline lesson on {lesson_request.topic}",
        learning_objectives=learning_objectives,
        grade_level=lesson_request.grade_level,
        duration=lesson_request.duration,
        materials=["Digital presentation", "Note-taking materials"],
        introduction=f"Introduction to {lesson_request.topic}",
        main_activities=[{"name": "Main Activity", "description": f"Learning about {lesson_request.topic}"}],
        assessment=f"Assessment of {lesson_request.topic} understanding",
        conclusion=f"Summary of {lesson_request.topic} learning",
        accessibility_features={},
        slides=slides,
        udl_stage=LessonStage.BASELINE,
        udl_applied_principles=[]
    )


def create_baseline_slides_fallback(lesson_request: LessonRequest) -> List[LessonSlide]:
    """Create fallback slides when AI is unavailable"""
    slide_titles = [
        f"Introduction to {lesson_request.topic}",
        f"Key Vocabulary for {lesson_request.topic}",
        f"Core Concepts of {lesson_request.topic}",
        f"Understanding {lesson_request.topic} Principles",
        f"Real-World Applications of {lesson_request.topic}",
        f"Practice with {lesson_request.topic}",
        f"Assessment of {lesson_request.topic} Knowledge",
        f"Summary and Next Steps"
    ]

    slides = []
    for i, title in enumerate(slide_titles):
        slides.append(LessonSlide(
            title=title,
            content=f"Content for {title}. This slide covers important aspects of {lesson_request.topic} "
                    f"appropriate for {lesson_request.grade_level} students. The content will be enhanced "
                    f"with UDL principles in subsequent stages.",
            image_prompt=f"Educational illustration for {lesson_request.topic}",
            notes=f"Presenter notes for {title}. Guide students through key concepts and check for understanding.",
            accessibility_features={},
            udl_enhancements={}
        ))

    return slides


def create_fallback_slide(slide_number: int, lesson_request: LessonRequest) -> LessonSlide:
    """Create a single fallback slide"""
    return LessonSlide(
        title=f"{lesson_request.topic} - Slide {slide_number}",
        content=f"Content for slide {slide_number} about {lesson_request.topic}. "
                f"This covers key learning points for {lesson_request.grade_level} students.",
        image_prompt=f"Educational illustration for {lesson_request.topic} slide {slide_number}",
        notes=f"Presenter notes for slide {slide_number}",
        accessibility_features={},
        udl_enhancements={}
    )


def apply_fallback_udl_enhancement(lesson_content: LessonContent, principle: str) -> LessonContent:
    """Apply fallback UDL enhancements when AI is unavailable"""
    enhanced_lesson = lesson_content.copy(deep=True)

    # Add default UDL enhancements to each slide
    for slide in enhanced_lesson.slides:
        if principle not in slide.udl_enhancements:
            slide.udl_enhancements[principle] = []
        slide.udl_enhancements[principle].extend(get_default_udl_enhancements(principle))

    enhanced_lesson.udl_stage = LessonStage(principle)
    enhanced_lesson.udl_applied_principles.append(UDLPrinciple(principle))
    enhanced_lesson.accessibility_features.update(get_udl_accessibility_features(principle))

    return enhanced_lesson


def format_lesson_for_ai(lesson_content: LessonContent) -> str:
    """Format lesson content for AI processing"""
    formatted_text = f"""
    LESSON: {lesson_content.title}
    GRADE: {lesson_content.grade_level}
    DURATION: {lesson_content.duration}

    LEARNING OBJECTIVES:
    {chr(10).join([f"- {obj}" for obj in lesson_content.learning_objectives])}

    SLIDES:
    """

    for i, slide in enumerate(lesson_content.slides, 1):
        formatted_text += f"""

    SLIDE {i}: {slide.title}
    Content: {slide.content}
    Notes: {slide.notes}
    """

    return formatted_text