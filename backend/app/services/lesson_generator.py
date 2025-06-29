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
    """Generate baseline lesson content for college-level instruction"""

    client = get_openai_client()

    if not client:
        return create_baseline_fallback_lesson(lesson_request)

    # Enhanced college-focused system prompt
    system_prompt = f"""
    You are an expert higher education curriculum designer with extensive experience in college-level pedagogy. 
    Create a comprehensive, research-based lesson plan for college students studying {lesson_request.topic}.

    This is the BASELINE STAGE of a multi-stage UDL enhancement process.

    COLLEGE-LEVEL REQUIREMENTS:
    - Use sophisticated academic language appropriate for higher education
    - Include research citations and current scholarly perspectives
    - Incorporate critical thinking and analytical frameworks
    - Reference real-world applications and case studies
    - Use discipline-specific terminology with clear explanations
    - Design for adult learners with diverse academic backgrounds

    CONTENT DEPTH:
    - Each slide should contain 300-500 words of substantive content
    - Include multiple examples, counterexamples, and applications
    - Connect concepts to broader theoretical frameworks
    - Encourage analysis, synthesis, and evaluation (Bloom's higher levels)

    ACADEMIC RIGOR:
    - Present multiple perspectives on complex topics
    - Include current research and emerging trends
    - Reference primary sources and foundational texts
    - Encourage scholarly discourse and debate

    DO NOT include UDL-specific accessibility features yet - we'll add those in subsequent stages.
    Focus on creating exceptional college-level educational content.
    """

    # Enhanced course-level specific prompting
    course_level_context = get_course_level_context(getattr(lesson_request, 'course_level', 'undergraduate_intro'))

    user_prompt = f"""
    Create a comprehensive college-level lesson plan for:

    Subject Area: {lesson_request.topic}
    Course Module: {lesson_request.chapter}
    Lesson Title: {lesson_request.lesson_title}
    Course Level: {course_level_context}
    Duration: {lesson_request.duration}
    Learning Objectives: {lesson_request.learning_objectives}

    Create exactly 12 slides with this enhanced structure:
    1. Course Introduction & Context
    2. Learning Objectives & Outcomes
    3. Theoretical Framework & Background
    4. Key Concepts & Terminology
    5. Core Content - Part I (Foundational Theory)
    6. Core Content - Part II (Advanced Applications)
    7. Research Perspectives & Current Developments
    8. Case Studies & Real-World Applications
    9. Critical Analysis & Discussion Points
    10. Practical Exercise & Problem-Solving
    11. Assessment & Evaluation Methods
    12. Synthesis & Future Directions

    For each slide, provide:
    - Compelling, academic title
    - 300-500 words of substantive, college-level content
    - Detailed instructor notes (150+ words) with pedagogical guidance
    - Specific image descriptions for academic visuals
    - Discussion questions or reflection prompts
    - References to relevant research or scholarly sources
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=4000
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
        overview=f"College-level lesson on {lesson_request.topic} designed for {course_level_context}. "
                 f"This comprehensive lesson incorporates current research, critical thinking frameworks, "
                 f"and real-world applications. Content will be enhanced with UDL principles in subsequent stages.",
        learning_objectives=learning_objectives,
        grade_level="College",
        duration=lesson_request.duration,
        materials=[
            "Digital presentation with academic content",
            "Research articles and scholarly sources",
            "Case study materials",
            "Discussion prompts and analytical frameworks",
            "Assessment rubrics",
            "Supplementary readings"
        ],
        introduction=f"Advanced exploration of {lesson_request.topic} incorporating current research, "
                     f"theoretical frameworks, and practical applications for college-level learning.",
        main_activities=[
            {
                "name": "Theoretical Foundation",
                "description": f"In-depth analysis of {lesson_request.topic} theoretical frameworks and research"
            },
            {
                "name": "Critical Analysis",
                "description": f"Examination of multiple perspectives and current developments in {lesson_request.topic}"
            },
            {
                "name": "Application & Synthesis",
                "description": f"Real-world case studies and practical application of {lesson_request.topic} concepts"
            },
            {
                "name": "Scholarly Discourse",
                "description": f"Discussion and debate of complex {lesson_request.topic} issues and implications"
            }
        ],
        assessment=f"Multi-modal assessment including analytical essays, case study analysis, "
                   f"research presentations, and peer discussions aligned with college-level expectations.",
        conclusion=f"Synthesis of {lesson_request.topic} learning with connections to broader academic "
                   f"and professional contexts, and identification of areas for further research.",
        accessibility_features={},  # Will be added in UDL stages
        slides=slides,
        udl_stage=LessonStage.BASELINE,
        udl_applied_principles=[]
    )


def get_course_level_context(course_level: str) -> str:
    """Get appropriate context and expectations for different course levels"""
    course_contexts = {
        "undergraduate_intro": "Introductory undergraduate level (100-200). Focus on foundational concepts, "
                               "broad survey of the field, basic terminology, and connecting to students' prior knowledge.",
        "undergraduate_intermediate": "Intermediate undergraduate level (300). Building on prerequisites, "
                                      "connecting complex concepts, practical applications, and developing analytical skills.",
        "undergraduate_advanced": "Advanced undergraduate level (400). Sophisticated analysis, advanced theories, "
                                  "independent research, and preparation for graduate study or professional practice.",
        "graduate_masters": "Graduate master's level. Research-based content, critical analysis of current literature, "
                            "professional application, thesis-level thinking, and advanced methodological approaches.",
        "graduate_doctoral": "Graduate doctoral level. Cutting-edge research, original scholarship, theoretical innovation, "
                             "comprehensive literature mastery, and contribution to disciplinary knowledge.",
        "professional": "Professional development/continuing education. Practical skills enhancement, "
                        "real-world application, career advancement, and immediate workplace relevance."
    }
    return course_contexts.get(course_level, course_contexts["undergraduate_intro"])


def enhance_with_udl_principle(lesson_content: LessonContent, principle: str,
                               lesson_request: LessonRequest) -> LessonContent:
    """Enhance lesson content with UDL principles specifically adapted for college-level adult learners"""

    client = get_openai_client()

    if not client:
        return apply_fallback_udl_enhancement(lesson_content, principle)

    # College-focused UDL enhancement prompts
    udl_prompts = {
        "engagement": """
        Apply UDL ENGAGEMENT principles specifically for COLLEGE-LEVEL ADULT LEARNERS:

        ENGAGEMENT FOR ADULT LEARNERS:
        - Connect to prior professional/academic experiences and career goals
        - Provide authentic, research-based problems and real-world applications
        - Offer choice in learning pathways, assignment formats, and assessment methods
        - Include collaborative opportunities that leverage diverse student backgrounds
        - Incorporate current events and contemporary issues relevant to the field
        - Support self-directed learning and autonomous goal-setting
        - Address diverse cultural perspectives and global contexts
        - Encourage peer teaching and knowledge sharing

        For each slide, add college-appropriate:
        - Professional relevance connections and career applications
        - Choice in how students engage with content (discussion, research, analysis)
        - Authentic problems from current practice or research
        - Opportunities for student expertise sharing
        - Self-regulation tools for adult learners
        - Culturally responsive examples and perspectives
        """,

        "representation": """
        Apply UDL REPRESENTATION principles for COLLEGE-LEVEL ACADEMIC CONTENT:

        REPRESENTATION FOR HIGHER EDUCATION:
        - Provide multiple formats: visual diagrams, research articles, case studies, multimedia
        - Include academic vocabulary support with discipline-specific glossaries
        - Offer background knowledge scaffolds for students from diverse academic paths
        - Present information through multiple scholarly perspectives and theoretical lenses
        - Use discipline-appropriate visual representations (charts, models, diagrams)
        - Provide translated materials or multilingual resources when appropriate
        - Include audio/video supplements for complex concepts
        - Offer different levels of detail for varied prior knowledge

        For each slide, add:
        - Multiple representation formats (text, visual, audio descriptions)
        - Academic vocabulary support and definition resources
        - Background knowledge connections and prerequisite reviews
        - Alternative explanations using different theoretical approaches
        - Visual aids appropriate for college-level content
        - Links to supplementary resources and extended readings
        """,

        "action_expression": """
        Apply UDL ACTION & EXPRESSION principles for COLLEGE-LEVEL ASSESSMENT:

        ACTION & EXPRESSION FOR ADULT LEARNERS:
        - Provide multiple ways to demonstrate knowledge (written, oral, visual, digital)
        - Include options for individual and collaborative responses
        - Support different communication styles and academic backgrounds
        - Offer various assignment formats and assessment methods
        - Provide organizational tools for complex projects and research
        - Support executive functioning with planning templates and rubrics
        - Allow for different technological skill levels and preferences
        - Include self-assessment and peer review opportunities

        For each slide, add:
        - Multiple options for student responses and participation
        - Various communication tools and platforms
        - Organizational supports for complex academic tasks
        - Planning templates and project management tools
        - Self-monitoring and reflection opportunities
        - Technology options accommodating different skill levels
        - Collaborative and individual expression choices
        """
    }

    system_prompt = f"""
    You are a Universal Design for Learning expert specializing in HIGHER EDUCATION. 
    Enhance the provided college-level lesson content by applying {principle.upper()} principles 
    specifically adapted for adult learners in higher education settings.

    COLLEGE UDL CONSIDERATIONS:
    - Adult learners bring diverse professional and academic experiences
    - Students may have different technological comfort levels
    - Career relevance and practical application are crucial motivators
    - Academic rigor must be maintained while ensuring accessibility
    - Cultural and linguistic diversity requires thoughtful accommodation
    - Self-directed learning preferences should be supported

    {udl_prompts[principle]}

    Build upon the existing content rather than replacing it. Maintain academic rigor while adding accessibility.
    Mark new additions with [UDL-{principle.upper()}-COLLEGE] tags for clear identification.
    """

    # Convert current lesson to text for AI processing
    current_lesson_text = format_lesson_for_ai(lesson_content)

    user_prompt = f"""
    Enhance this college-level lesson with UDL {principle} principles adapted for adult learners:

    {current_lesson_text}

    For each slide, add specific {principle} enhancements while preserving all original academic content.
    Ensure enhancements are appropriate for college-level instruction and adult learning principles.
    Mark new additions with [UDL-{principle.upper()}-COLLEGE] tags.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=4000
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

    # Update accessibility features with college-specific enhancements
    enhanced_lesson.accessibility_features.update(get_college_udl_features(principle))

    return enhanced_lesson


def get_college_udl_features(principle: str) -> Dict[str, str]:
    """Get UDL accessibility features specifically designed for college-level instruction"""
    features = {
        "engagement": {
            "motivation": "Career-relevant applications, authentic research problems, choice in learning pathways",
            "persistence": "Professional goal alignment, peer collaboration, self-directed learning options",
            "self_regulation": "Academic planning tools, reflection frameworks, metacognitive strategies"
        },
        "representation": {
            "perception": "Multiple academic formats, visual-audio-text options, discipline-specific representations",
            "language": "Academic vocabulary support, multilingual resources, discipline glossaries",
            "comprehension": "Theoretical framework connections, prerequisite reviews, multiple scholarly perspectives"
        },
        "action_expression": {
            "physical_action": "Technology choice flexibility, multiple platform options, accessibility tools",
            "expression": "Diverse assessment formats, oral-written-visual options, collaborative-individual choices",
            "executive_function": "Research planning templates, project organization tools, academic rubrics"
        }
    }
    return features.get(principle, {})


def create_baseline_slides_fallback(lesson_request: LessonRequest) -> List[LessonSlide]:
    """Create fallback slides with college-level content when AI is unavailable"""
    college_slide_templates = [
        {
            "title": f"Introduction to {lesson_request.topic}: Academic Context",
            "content": f"Welcome to our comprehensive exploration of {lesson_request.topic}. This course module examines "
                       f"the theoretical foundations, current research developments, and practical applications within "
                       f"the broader context of {lesson_request.chapter}. We will analyze multiple perspectives, "
                       f"engage with current scholarly literature, and develop critical thinking skills essential "
                       f"for advanced understanding in this field.",
            "notes": f"Begin with an overview of the academic landscape surrounding {lesson_request.topic}. "
                     f"Connect to students' prior coursework and professional experiences. Emphasize the importance "
                     f"of critical analysis and evidence-based reasoning throughout the lesson."
        },
        {
            "title": "Learning Objectives & Academic Outcomes",
            "content": f"By the end of this session, students will demonstrate advanced understanding of {lesson_request.topic} "
                       f"through analysis, evaluation, and synthesis of key concepts. Students will examine theoretical "
                       f"frameworks, assess current research, and apply knowledge to real-world scenarios. This aligns "
                       f"with higher-order thinking skills essential for college-level academic success.",
            "notes": "Review learning objectives with emphasis on Bloom's higher levels. Connect objectives to "
                     "course outcomes and professional competencies. Encourage students to set personal learning goals."
        },
        {
            "title": f"Theoretical Framework: Understanding {lesson_request.topic}",
            "content": f"The theoretical foundation of {lesson_request.topic} encompasses multiple scholarly perspectives "
                       f"and research paradigms. Current academic discourse includes debates about methodology, "
                       f"interpretation, and application. Understanding these theoretical underpinnings is crucial "
                       f"for developing sophisticated analysis and contributing to scholarly discussions in the field.",
            "notes": "Present major theoretical perspectives. Encourage students to compare and contrast different "
                     "approaches. Use questioning techniques to promote critical thinking and analysis."
        },
        {
            "title": f"Advanced Concepts & Academic Terminology",
            "content": f"Mastery of discipline-specific terminology and advanced concepts is essential for academic "
                       f"discourse in {lesson_request.topic}. These concepts form the foundation for research, "
                       f"analysis, and professional practice. Students should develop fluency with these terms "
                       f"to engage effectively with scholarly literature and contribute to academic discussions.",
            "notes": "Define key terms with academic precision. Provide etymology and historical development where "
                     "relevant. Encourage students to use terminology in context and connect to their experiences."
        },
        {
            "title": f"Current Research & Scholarly Perspectives",
            "content": f"Contemporary research in {lesson_request.topic} reveals evolving understanding and emerging "
                       f"methodologies. Recent studies challenge traditional assumptions and offer new insights. "
                       f"Students should critically evaluate research methodologies, assess evidence quality, "
                       f"and understand how research findings influence theory and practice.",
            "notes": "Present recent research findings and methodological approaches. Teach students to critically "
                     "evaluate sources and assess research quality. Encourage engagement with primary literature."
        },
        {
            "title": f"Case Studies & Real-World Applications",
            "content": f"The practical application of {lesson_request.topic} concepts is demonstrated through "
                       f"comprehensive case studies from professional practice and current events. These examples "
                       f"illustrate the complexity of real-world implementation and the importance of theoretical "
                       f"knowledge in addressing contemporary challenges.",
            "notes": "Use authentic case studies that reflect professional practice. Encourage students to analyze "
                     "cases using theoretical frameworks. Facilitate discussion about ethical considerations and implications."
        },
        {
            "title": f"Critical Analysis & Evaluation Methods",
            "content": f"Developing critical analysis skills is essential for advanced study of {lesson_request.topic}. "
                       f"Students must learn to evaluate sources, assess evidence, identify bias, and construct "
                       f"logical arguments. These skills are fundamental to academic success and professional practice.",
            "notes": "Model critical thinking processes. Provide frameworks for analysis and evaluation. "
                     "Encourage students to question assumptions and consider alternative perspectives."
        },
        {
            "title": f"Contemporary Issues & Debates",
            "content": f"Current debates in {lesson_request.topic} reflect the dynamic nature of academic disciplines. "
                       f"Understanding these controversies helps students appreciate the complexity of knowledge "
                       f"creation and the importance of ongoing research. Students should engage with multiple "
                       f"viewpoints and develop informed opinions based on evidence.",
            "notes": "Present multiple perspectives on controversial issues. Encourage respectful debate and "
                     "evidence-based arguments. Help students develop comfort with ambiguity and complexity."
        },
        {
            "title": f"Methodology & Research Approaches",
            "content": f"Research methodology in {lesson_request.topic} encompasses various approaches, each with "
                       f"distinct advantages and limitations. Understanding methodological choices is crucial for "
                       f"evaluating research and designing studies. Students should appreciate the relationship "
                       f"between research questions and methodological approaches.",
            "notes": "Explain different research methodologies and their applications. Discuss strengths and "
                     "limitations of various approaches. Connect methodology to epistemological assumptions."
        },
        {
            "title": f"Professional Applications & Career Connections",
            "content": f"The study of {lesson_request.topic} prepares students for diverse career paths and professional "
                       f"challenges. Understanding how academic knowledge translates to professional practice is "
                       f"essential for career development. Students should consider how their learning applies to "
                       f"their career goals and professional development.",
            "notes": "Connect academic content to career opportunities. Invite guest speakers or use professional "
                     "examples. Encourage students to reflect on their career goals and skill development."
        },
        {
            "title": f"Assessment & Evaluation Strategies",
            "content": f"Assessment in college-level study of {lesson_request.topic} encompasses multiple formats "
                       f"designed to evaluate different aspects of learning. Students will demonstrate knowledge "
                       f"through analytical essays, research projects, presentations, and collaborative work. "
                       f"Understanding assessment criteria promotes academic success.",
            "notes": "Explain assessment criteria and expectations. Provide rubrics and examples of high-quality work. "
                     "Encourage self-assessment and peer feedback opportunities."
        },
        {
            "title": f"Synthesis & Future Directions",
            "content": f"The study of {lesson_request.topic} continues to evolve with new research, changing social "
                       f"contexts, and emerging technologies. Students should synthesize their learning, identify "
                       f"areas for future exploration, and consider how they might contribute to ongoing scholarly "
                       f"discussions and professional practice in the field.",
            "notes": "Help students synthesize key concepts and connections. Encourage identification of research "
                     "gaps and future learning goals. Connect to subsequent coursework and lifelong learning."
        }
    ]

    slides = []
    for i, template in enumerate(college_slide_templates):
        slides.append(LessonSlide(
            title=template["title"],
            content=template["content"],
            image_prompt=f"Professional academic illustration for college-level {lesson_request.topic} content, "
                         f"suitable for higher education presentation",
            notes=template["notes"],
            accessibility_features={},
            udl_enhancements={}
        ))

    return slides


def parse_ai_response_to_slides(ai_response: str, lesson_request: LessonRequest) -> List[LessonSlide]:
    """Parse AI response into college-level slide objects with enhanced content"""
    slides = []

    # Enhanced parsing for college-level content
    slide_sections = ai_response.split("Slide ")

    for i, section in enumerate(slide_sections[1:], 1):  # Skip first empty split
        if i <= 12:  # Ensure we get exactly 12 slides
            # Extract more sophisticated content for college level
            title = f"Advanced {lesson_request.topic} - Module {i}"
            content = section[:600] if len(section) > 600 else section  # More content for college level

            slides.append(LessonSlide(
                title=title,
                content=content,
                image_prompt=f"Academic illustration for college-level {lesson_request.topic}, "
                             f"suitable for higher education and scholarly presentation",
                notes=f"Instructor notes for advanced slide {i} covering {lesson_request.topic}. "
                      f"Encourage critical thinking, discussion, and connection to current research.",
                accessibility_features={},
                udl_enhancements={}
            ))

    # Ensure we have exactly 12 slides
    while len(slides) < 12:
        slides.append(create_fallback_slide(len(slides) + 1, lesson_request))

    return slides[:12]


def create_fallback_slide(slide_number: int, lesson_request: LessonRequest) -> LessonSlide:
    """Create a single fallback slide with college-level content"""
    return LessonSlide(
        title=f"Advanced {lesson_request.topic} - Section {slide_number}",
        content=f"This section covers advanced concepts in {lesson_request.topic} appropriate for college-level "
                f"instruction. Content includes theoretical frameworks, current research perspectives, and "
                f"practical applications relevant to {lesson_request.grade_level} students. Students will "
                f"engage in critical analysis and scholarly discussion of key principles.",
        image_prompt=f"Professional academic illustration for college-level {lesson_request.topic} content",
        notes=f"Instructor guidance for slide {slide_number}: Facilitate discussion, encourage critical thinking, "
              f"and connect to broader academic and professional contexts.",
        accessibility_features={},
        udl_enhancements={}
    )


def parse_enhanced_slides(ai_response: str, original_slides: List[LessonSlide], principle: str) -> List[LessonSlide]:
    """Parse AI-enhanced response and merge with original slides for college content"""
    enhanced_slides = []

    for i, original_slide in enumerate(original_slides):
        enhanced_slide = original_slide.copy()

        # Add college-specific UDL enhancements
        if principle not in enhanced_slide.udl_enhancements:
            enhanced_slide.udl_enhancements[principle] = []

        enhanced_slide.udl_enhancements[principle].extend(get_college_udl_enhancements(principle))

        enhanced_slides.append(enhanced_slide)

    return enhanced_slides


def get_college_udl_enhancements(principle: str) -> List[str]:
    """Get default UDL enhancements specifically designed for college-level instruction"""
    enhancements = {
        "engagement": [
            "Connected to professional career applications and real-world relevance",
            "Included diverse cultural perspectives and global contexts",
            "Added student choice in learning pathways and assignment formats",
            "Incorporated collaborative opportunities leveraging student expertise",
            "Provided authentic research problems and current case studies",
            "Supported self-directed learning and autonomous goal-setting"
        ],
        "representation": [
            "Added multiple academic content formats (text, visual, audio, multimedia)",
            "Included discipline-specific vocabulary support and glossaries",
            "Provided background knowledge scaffolds for diverse academic paths",
            "Offered multiple theoretical perspectives and scholarly viewpoints",
            "Added visual representations appropriate for college-level content",
            "Included links to supplementary research and extended readings"
        ],
        "action_expression": [
            "Provided multiple assessment formats (written, oral, visual, digital)",
            "Included individual and collaborative response options",
            "Added organizational tools for complex academic projects",
            "Provided planning templates and research frameworks",
            "Included self-assessment and peer review opportunities",
            "Offered technology options for different skill levels and preferences"
        ]
    }
    return enhancements.get(principle, [])


# Rest of the existing functions remain the same but can be enhanced for college focus
def create_baseline_fallback_lesson(lesson_request: LessonRequest) -> LessonContent:
    """Create fallback baseline lesson for college level when AI is unavailable"""
    slides = create_baseline_slides_fallback(lesson_request)

    learning_objectives = [obj.strip() for obj in lesson_request.learning_objectives.split("\n") if obj.strip()]

    return LessonContent(
        title=lesson_request.lesson_title,
        overview=f"College-level lesson on {lesson_request.topic} with academic rigor and research-based content",
        learning_objectives=learning_objectives,
        grade_level="College",
        duration=lesson_request.duration,
        materials=["Academic presentation", "Research materials", "Case studies", "Assessment tools"],
        introduction=f"Advanced exploration of {lesson_request.topic} for college-level learning",
        main_activities=[{
            "name": "College-Level Analysis",
            "description": f"Advanced study of {lesson_request.topic} with critical thinking emphasis"
        }],
        assessment=f"Multi-modal college-level assessment of {lesson_request.topic} understanding",
        conclusion=f"Synthesis of {lesson_request.topic} learning with scholarly and professional connections",
        accessibility_features={},
        slides=slides,
        udl_stage=LessonStage.BASELINE,
        udl_applied_principles=[]
    )


def apply_fallback_udl_enhancement(lesson_content: LessonContent, principle: str) -> LessonContent:
    """Apply fallback UDL enhancements with college-level focus when AI is unavailable"""
    enhanced_lesson = lesson_content.copy(deep=True)

    # Add college-specific UDL enhancements to each slide
    for slide in enhanced_lesson.slides:
        if principle not in slide.udl_enhancements:
            slide.udl_enhancements[principle] = []
        slide.udl_enhancements[principle].extend(get_college_udl_enhancements(principle))

    enhanced_lesson.udl_stage = LessonStage(principle)
    enhanced_lesson.udl_applied_principles.append(UDLPrinciple(principle))
    enhanced_lesson.accessibility_features.update(get_college_udl_features(principle))

    return enhanced_lesson


def format_lesson_for_ai(lesson_content: LessonContent) -> str:
    """Format lesson content for AI processing with college-level context"""
    formatted_text = f"""
    COLLEGE-LEVEL LESSON: {lesson_content.title}
    ACADEMIC LEVEL: {lesson_content.grade_level}
    DURATION: {lesson_content.duration}

    LEARNING OBJECTIVES:
    {chr(10).join([f"- {obj}" for obj in lesson_content.learning_objectives])}

    SLIDES:
    """

    for i, slide in enumerate(lesson_content.slides, 1):
        formatted_text += f"""

    SLIDE {i}: {slide.title}
    Content: {slide.content}
    Instructor Notes: {slide.notes}
    """

    return formatted_text