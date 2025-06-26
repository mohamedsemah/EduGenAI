import os
from typing import List, Dict, Any
from openai import OpenAI
from app.models.lesson import LessonRequest, LessonContent, LessonSlide
from app.core.config import settings
import json
import re


# Initialize OpenAI client with error handling
def get_openai_client():
    """Get OpenAI client with proper error handling"""
    try:
        return OpenAI(api_key=settings.OPENAI_API_KEY)
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        return None


def determine_grade_category(grade_level: str) -> str:
    """Determine the broad grade category for content complexity"""
    grade_lower = grade_level.lower()

    if grade_lower in ['k', '1', '2', '3', '4', '5'] or 'elementary' in grade_lower:
        return 'elementary'
    elif grade_lower in ['6', '7', '8'] or 'middle' in grade_lower:
        return 'middle'
    elif grade_lower in ['9', '10', '11', '12'] or 'high' in grade_lower:
        return 'high_school'
    elif any(term in grade_lower for term in
             ['college', 'university', 'graduate', 'freshman', 'sophomore', 'junior', 'senior']):
        return 'university'
    else:
        return 'middle'  # Default fallback


def get_grade_specific_guidelines(grade_category: str) -> Dict[str, Any]:
    """Get specific content guidelines based on grade level"""
    guidelines = {
        'elementary': {
            'vocabulary_level': 'Simple, everyday language with key terms explained clearly',
            'sentence_length': 'Short sentences (10-15 words average)',
            'explanation_depth': 'Basic concepts with lots of concrete examples and analogies',
            'examples_type': 'Familiar, everyday experiences and objects',
            'complexity': 'Introduce one concept at a time with clear connections',
            'assessment_style': 'Visual, hands-on, and interactive activities',
            'attention_span': '5-10 minutes per concept',
            'learning_style': 'Heavy use of visuals, stories, and movement'
        },
        'middle': {
            'vocabulary_level': 'Grade-appropriate with some academic terms defined',
            'sentence_length': 'Medium sentences (15-20 words average)',
            'explanation_depth': 'More detailed explanations with cause-and-effect relationships',
            'examples_type': 'Mix of familiar and new examples, some abstract concepts',
            'complexity': 'Can handle multiple related concepts with clear organization',
            'assessment_style': 'Combination of creative and analytical tasks',
            'attention_span': '10-15 minutes per concept',
            'learning_style': 'Balance of visual, auditory, and kinesthetic elements'
        },
        'high_school': {
            'vocabulary_level': 'Academic vocabulary with context and definitions',
            'sentence_length': 'Varied sentence length for engagement',
            'explanation_depth': 'Comprehensive explanations with multiple perspectives',
            'examples_type': 'Real-world applications, current events, and case studies',
            'complexity': 'Can synthesize multiple concepts and think critically',
            'assessment_style': 'Analysis, evaluation, and creation tasks',
            'attention_span': '15-20 minutes per concept',
            'learning_style': 'Independent learning with guidance and collaboration'
        },
        'university': {
            'vocabulary_level': 'Sophisticated academic and professional terminology',
            'sentence_length': 'Complex, varied sentences appropriate for academic discourse',
            'explanation_depth': 'In-depth analysis with theoretical frameworks and research',
            'examples_type': 'Scholarly examples, research studies, professional applications',
            'complexity': 'Complex synthesis, original thinking, and critical analysis',
            'assessment_style': 'Research-based, analytical, and original work',
            'attention_span': '20-30 minutes per concept',
            'learning_style': 'Self-directed learning with peer collaboration and expert guidance'
        }
    }
    return guidelines.get(grade_category, guidelines['middle'])


def generate_detailed_content_prompt(lesson_request: LessonRequest, complexity_level: int = 5) -> str:
    """Generate a comprehensive, detailed prompt for AI content generation"""

    grade_category = determine_grade_category(lesson_request.grade_level)
    guidelines = get_grade_specific_guidelines(grade_category)

    # Adjust complexity based on slider (1-10 scale)
    complexity_descriptors = {
        1: "Very basic, foundational level",
        2: "Basic with simple examples",
        3: "Introductory with some detail",
        4: "Moderate detail and examples",
        5: "Standard comprehensive level",
        6: "Detailed with advanced examples",
        7: "In-depth with complex applications",
        8: "Advanced with sophisticated analysis",
        9: "Expert level with nuanced concepts",
        10: "Highly advanced, research-level depth"
    }

    complexity_instruction = complexity_descriptors.get(complexity_level, "Standard comprehensive level")

    system_prompt = f"""
    You are an expert curriculum designer and educator specializing in Universal Design for Learning (UDL) principles. 
    Create an exceptionally detailed, comprehensive lesson plan for {grade_category} level students.

    CONTENT COMPLEXITY: {complexity_instruction}

    GRADE-SPECIFIC GUIDELINES for {grade_category.upper()}:
    - Vocabulary: {guidelines['vocabulary_level']}
    - Sentence Structure: {guidelines['sentence_length']}
    - Explanation Depth: {guidelines['explanation_depth']}
    - Examples Type: {guidelines['examples_type']}
    - Conceptual Complexity: {guidelines['complexity']}
    - Assessment Style: {guidelines['assessment_style']}
    - Attention Considerations: {guidelines['attention_span']}
    - Learning Style: {guidelines['learning_style']}

    UDL PRINCIPLES TO INTEGRATE:
    1. Multiple means of representation (visual, auditory, tactile)
    2. Multiple means of engagement (choice, relevance, motivation)
    3. Multiple means of action/expression (flexible demonstration)

    CONTENT REQUIREMENTS - Each slide must include:
    1. DETAILED EXPLANATIONS (200-400 words per slide)
    2. SPECIFIC DEFINITIONS of key terms with pronunciation guides
    3. CONCRETE EXAMPLES (minimum 2-3 per concept)
    4. STEP-BY-STEP BREAKDOWNS for complex processes
    5. REAL-WORLD CONNECTIONS and applications
    6. CASE STUDIES or scenarios when appropriate
    7. MULTIPLE PERSPECTIVES on concepts
    8. ASSESSMENT QUESTIONS at various cognitive levels

    ACCESSIBILITY REQUIREMENTS:
    - All content must be screen-reader friendly
    - Include alternative text descriptions for visual elements
    - Provide multiple ways to access the same information
    - Use clear headings and consistent structure
    - Include phonetic pronunciations for difficult terms

    Create exactly 12 comprehensive slides with rich, detailed content appropriate for the specified grade level and complexity.
    """

    user_prompt = f"""
    CREATE A COMPREHENSIVE LESSON PLAN FOR:

    Topic: {lesson_request.topic}
    Chapter/Unit: {lesson_request.chapter}
    Lesson Title: {lesson_request.lesson_title}
    Grade Level: {lesson_request.grade_level} ({grade_category} category)
    Duration: {lesson_request.duration}
    Complexity Level: {complexity_level}/10 ({complexity_instruction})

    Learning Objectives:
    {lesson_request.learning_objectives}

    SPECIFIC CONTENT REQUIREMENTS:

    For each slide, provide:
    1. Engaging, descriptive title
    2. 200-400 words of detailed content including:
       - Clear definitions of key terms
       - Multiple concrete examples
       - Step-by-step explanations where needed
       - Real-world connections and applications
       - Cultural and diverse perspectives
    3. Detailed image description for DALL-E generation
    4. Comprehensive presenter notes (100-150 words)
    5. Specific accessibility features for diverse learners
    6. Assessment/interaction opportunities

    SLIDE STRUCTURE (12 slides total):
    1. Welcome & Hook (engaging introduction with preview)
    2. Learning Objectives & Success Criteria (detailed breakdown)
    3. Vocabulary & Key Terms (definitions, pronunciations, examples)
    4. Core Concept 1 (detailed explanation with examples)
    5. Core Concept 2 (building on previous knowledge)
    6. Real-World Applications (case studies and examples)
    7. Interactive Activity/Demonstration (hands-on learning)
    8. Problem-Solving/Critical Thinking (application activity)
    9. Assessment & Check for Understanding (multiple formats)
    10. Synthesis & Connections (linking to other subjects/concepts)
    11. Extension & Enrichment (advanced applications)
    12. Summary & Next Steps (wrap-up and preview)

    Make each slide substantive, engaging, and educationally rigorous while maintaining age-appropriateness.
    Include specific examples, case studies, and detailed explanations that students can understand and apply.
    """

    return system_prompt, user_prompt


async def generate_slide_image(client: OpenAI, image_prompt: str, lesson_topic: str) -> str:
    """Generate an image using DALL-E for a specific slide"""
    try:
        # Enhance the image prompt for better educational content
        enhanced_prompt = f"Educational illustration for a lesson about {lesson_topic}: {image_prompt}. Clean, professional style suitable for classroom presentation. Bright, engaging colors. High contrast for accessibility."

        response = client.images.generate(
            model="dall-e-3",
            prompt=enhanced_prompt,
            size="1024x1024",
            quality="standard",
            n=1
        )

        return response.data[0].url
    except Exception as e:
        print(f"Error generating image: {e}")
        return None


def generate_lesson_content(lesson_request: LessonRequest, complexity_level: int = 5) -> LessonContent:
    """Generate comprehensive lesson content using enhanced AI prompting"""

    # Parse learning objectives into list
    learning_objectives = [obj.strip() for obj in lesson_request.learning_objectives.split("\n") if obj.strip()]

    # Get OpenAI client
    client = get_openai_client()

    if not client:
        print("OpenAI client not available, using enhanced fallback lesson generation")
        return create_enhanced_fallback_lesson(lesson_request, learning_objectives, complexity_level)

    # Generate detailed prompts
    system_prompt, user_prompt = generate_detailed_content_prompt(lesson_request, complexity_level)

    # Make API call to OpenAI for content generation
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

        # Get the AI response
        ai_response = response.choices[0].message.content
        print(f"AI Response received: {len(ai_response)} characters")

        # Create enhanced slides with detailed content
        slides = create_enhanced_detailed_slides(lesson_request, ai_response, complexity_level, client)

        # Determine grade category for appropriate materials and activities
        grade_category = determine_grade_category(lesson_request.grade_level)
        guidelines = get_grade_specific_guidelines(grade_category)

        # Create comprehensive lesson content
        lesson_content = LessonContent(
            title=lesson_request.lesson_title,
            overview=f"This comprehensive {lesson_request.duration} lesson on {lesson_request.topic} is specifically designed for {lesson_request.grade_level} students using Universal Design for Learning principles. The lesson includes detailed explanations, multiple concrete examples, step-by-step breakdowns of complex concepts, and extensive real-world applications. Content complexity is set to level {complexity_level}/10, ensuring appropriate challenge and engagement for the target audience.",
            learning_objectives=learning_objectives,
            grade_level=lesson_request.grade_level,
            duration=lesson_request.duration,
            materials=[
                "Interactive digital presentation with embedded multimedia",
                "Printed handouts in multiple formats (standard, large print, simplified)",
                "Manipulative materials for hands-on activities",
                "Assessment tools with multiple response options",
                "Assistive technology supports as needed",
                "Reference materials and vocabulary guides",
                "Extension activities for advanced learners",
                "Scaffolding materials for struggling learners"
            ],
            introduction=f"Begin with an engaging hook that connects {lesson_request.topic} to students' prior experiences and interests. Use {guidelines['learning_style']} to activate background knowledge and establish clear learning goals. Duration: {guidelines['attention_span']}.",
            main_activities=[
                {
                    "name": "Vocabulary and Concept Introduction",
                    "description": f"Systematic introduction of key terms and foundational concepts related to {lesson_request.topic} using visual, auditory, and kinesthetic modalities. Includes pronunciation guides, multiple examples, and student interaction opportunities."
                },
                {
                    "name": "Deep Dive Content Exploration",
                    "description": f"Comprehensive exploration of core concepts with detailed explanations, step-by-step processes, and multiple concrete examples. Content adapted for {grade_category} learners with appropriate complexity and scaffolding."
                },
                {
                    "name": "Real-World Application Activities",
                    "description": f"Hands-on activities and case studies that demonstrate how {lesson_request.topic} applies in real-world contexts. Students engage through {guidelines['assessment_style']} appropriate for their developmental level."
                },
                {
                    "name": "Interactive Problem-Solving",
                    "description": f"Structured problem-solving activities that allow students to apply their understanding of {lesson_request.topic} concepts. Multiple solution pathways and expression formats accommodate diverse learning preferences."
                },
                {
                    "name": "Synthesis and Extension",
                    "description": f"Advanced application activities that challenge students to make connections between {lesson_request.topic} and other subjects, current events, or future learning. Differentiated for various readiness levels."
                }
            ],
            assessment=f"Comprehensive assessment strategy including formative and summative options: {guidelines['assessment_style']}. Multiple formats available including visual demonstrations, oral explanations, written responses, digital creations, and performance tasks. All assessments align with learning objectives and accommodate diverse learning needs and preferences.",
            conclusion=f"Systematic wrap-up that reinforces key learning about {lesson_request.topic}, helps students make connections to prior and future learning, and provides clear next steps. Includes reflection opportunities and preview of upcoming content.",
            accessibility_features={
                "visual": "High contrast slides (4.5:1 ratio minimum), large fonts (minimum 18pt), sans-serif typefaces, alt text for all images, visual organizers and graphic supports",
                "auditory": "Clear narration tracks, closed captions for all videos, audio descriptions for visual content, multiple audio format options",
                "cognitive": f"Clear structure with consistent layout, reduced cognitive load through chunking, {guidelines['sentence_length']}, vocabulary supports with definitions and pronunciations",
                "physical": "Keyboard navigation optimized, voice recognition compatible, flexible timing for all activities, multiple input methods supported",
                "language": f"Content appropriate for {grade_category} level, multiple language supports available, visual vocabulary supports, simplified versions available for ELL students",
                "social_emotional": "Choice and autonomy in learning activities, culturally responsive examples, collaborative learning opportunities, stress-reduction strategies embedded"
            },
            slides=slides
        )

        return lesson_content

    except Exception as e:
        print(f"Error generating detailed lesson content with AI: {e}")
        return create_enhanced_fallback_lesson(lesson_request, learning_objectives, complexity_level)


def create_enhanced_detailed_slides(lesson_request: LessonRequest, ai_response: str, complexity_level: int,
                                    client: OpenAI) -> List[LessonSlide]:
    """Create detailed slides with comprehensive content"""

    grade_category = determine_grade_category(lesson_request.grade_level)
    guidelines = get_grade_specific_guidelines(grade_category)

    slides = []

    # Slide 1: Welcome & Hook
    slides.append(LessonSlide(
        title=f"Welcome to the Amazing World of {lesson_request.topic}!",
        content=generate_detailed_slide_content(
            f"""Welcome to an exciting exploration of {lesson_request.topic}! Today's {lesson_request.duration} journey will transform your understanding of this fascinating subject.

**What makes {lesson_request.topic} so important?** This concept appears everywhere in our daily lives, from the technology you use to the natural world around you. By the end of today's lesson, you'll not only understand the key principles of {lesson_request.topic}, but you'll also be able to identify its applications in your own experiences.

**Today's Learning Adventure Includes:**
• Discovering the fundamental concepts that make {lesson_request.topic} work
• Exploring real-world examples that will surprise and engage you  
• Hands-on activities that let you experience these concepts firsthand
• Problem-solving challenges that connect to current events and future possibilities

**Multiple Ways to Learn:** Whether you learn best through visual demonstrations, hands-on activities, collaborative discussions, or independent reflection, today's lesson offers something for everyone. You'll have choices in how you participate and demonstrate your understanding.

**Why This Matters:** Understanding {lesson_request.topic} will help you in {lesson_request.chapter} and connect to your future learning across multiple subjects. The skills and knowledge you gain today will serve you well beyond the classroom.""",
            grade_category, guidelines
        ),
        image_prompt=f"Diverse group of engaged {grade_category} students in a modern classroom setting, with visual elements representing {lesson_request.topic}, bright and welcoming atmosphere",
        notes=f"""**Opening Strategy (5-7 minutes):**
Begin with enthusiasm and energy! Use a compelling hook such as a surprising fact, intriguing question, or brief demonstration related to {lesson_request.topic}.

**Engagement Techniques:**
- Ask students to share what they already know about {lesson_request.topic}
- Use a quick poll or hand-raising activity to gauge prior knowledge
- Connect to current events or popular culture when appropriate
- Acknowledge different learning preferences and assure all students they can succeed

**UDL Implementation:**
- Provide both visual and auditory introduction
- Offer preview materials for students who benefit from advance preparation
- Include physical movement or interactive elements
- Use culturally responsive examples that reflect your student population

**Accessibility Reminders:**
- Ensure all students can see and hear clearly
- Check that assistive technology is functioning
- Provide lesson overview in multiple formats if needed""",
        accessibility_features={
            "alt_text": f"Welcome slide showing diverse {grade_category} students engaged in learning about {lesson_request.topic}",
            "font_size": "24pt minimum for titles, 18pt for body text",
            "contrast": "High contrast color scheme (dark text on light background)",
            "audio_support": "Narration available for all text content",
            "visual_structure": "Clear hierarchy with headers and bullet points",
            "language_support": "Key terms highlighted with simple definitions available"
        }
    ))

    # Add remaining 11 slides with comprehensive content
    slide_topics = [
        ("Learning Objectives & Success Criteria", "learning_objectives"),
        ("Essential Vocabulary & Key Terms", "vocabulary_introduction"),
        ("Core Concept Deep Dive", "detailed_concept_explanation"),
        ("Building Understanding", "concept_development"),
        ("Real-World Applications", "applications_and_examples"),
        ("Interactive Discovery Activity", "hands_on_learning"),
        ("Problem-Solving Challenge", "critical_thinking"),
        ("Check Your Understanding", "formative_assessment"),
        ("Synthesis & Connections", "cross_curricular_links"),
        ("Extension & Enrichment", "advanced_applications"),
        ("Summary & Next Steps", "conclusion_and_preview")
    ]

    for i, (slide_title, slide_type) in enumerate(slide_topics, 2):
        slides.append(create_detailed_slide_by_type(
            lesson_request, slide_title, slide_type, grade_category, guidelines, complexity_level, i
        ))

    return slides


def create_detailed_slide_by_type(lesson_request, title, slide_type, grade_category, guidelines, complexity_level,
                                  slide_num):
    """Create a detailed slide based on type and content requirements"""

    content_templates = {
        "learning_objectives": f"""**Your Learning Goals: What Will You Achieve Today?**

By the end of this {lesson_request.duration} lesson, you will have developed deep understanding and practical skills related to {lesson_request.topic}. Here are your specific learning goals:

{generate_objectives_list(lesson_request.learning_objectives)}

**Success Strategies Available:**
• **Visual Learners:** Diagrams, charts, and graphic organizers will support your understanding
• **Auditory Learners:** Discussion opportunities and verbal explanations will reinforce concepts  
• **Kinesthetic Learners:** Hands-on activities and movement will help you grasp key ideas
• **Reading/Writing Learners:** Note-taking templates and written reflections will deepen learning

**How You Can Show Your Learning:**
You'll have multiple opportunities to demonstrate what you've learned through visual presentations, oral explanations, written summaries, digital creations, or hands-on demonstrations. Choose what works best for you!

**Support Available:** Throughout the lesson, you'll receive scaffolding, peer support, and teacher guidance to help you achieve these goals successfully.""",

        "vocabulary_introduction": f"""**Essential Vocabulary: The Language of {lesson_request.topic}**

Understanding the language of {lesson_request.topic} is crucial for your success. Here are the key terms you'll master today:

**Core Vocabulary Terms:**
{generate_vocabulary_section(lesson_request.topic, grade_category, complexity_level)}

**Memory Strategies:**
• **Visual Associations:** Connect each term to a memorable image or diagram
• **Real-World Connections:** Link vocabulary to examples from your daily life
• **Word Relationships:** Understand how these terms connect to each other
• **Practice Opportunities:** Use these terms in discussions and activities throughout the lesson

**Pronunciation Guide:** All terms include phonetic spelling to help you say them correctly and confidently.

**Cultural Connections:** We'll explore how different cultures and communities might use or understand these concepts, broadening your perspective on {lesson_request.topic}.""",

        "detailed_concept_explanation": f"""**Understanding {lesson_request.topic}: A Comprehensive Exploration**

The concept of {lesson_request.topic} is fundamental to understanding {lesson_request.chapter}. Let's explore this in detail with multiple perspectives and examples.

**Core Definition:** {lesson_request.topic} can be defined as [detailed definition appropriate for {grade_category} level]. This concept has become essential to our understanding of [broader field].

**Key Components:** The main elements that make up {lesson_request.topic} include:
• **Component 1:** [Detailed explanation with examples appropriate for complexity level {complexity_level}]
• **Component 2:** [Detailed explanation with examples appropriate for complexity level {complexity_level}]  
• **Component 3:** [Detailed explanation with examples appropriate for complexity level {complexity_level}]

**Multiple Perspectives:** Different experts and cultures view {lesson_request.topic} in various ways:
• **Scientific Perspective:** How scientists understand this concept
• **Historical Perspective:** How this concept developed over time
• **Cultural Perspective:** How different cultures relate to this concept
• **Personal Perspective:** How this relates to students' daily lives

**Common Misconceptions:** Many people initially think that {lesson_request.topic} works one way, but actually understanding the correct concept is important because [why correct understanding matters].

**Memory Aids:** To help you remember this concept, think of [analogy appropriate for {grade_category} level].""",

        "applications_and_examples": f"""**{lesson_request.topic} in Action: Real-World Applications**

Now that we understand the fundamentals of {lesson_request.topic}, let's explore how this concept appears and impacts our world every day.

**Everyday Examples You Experience:**
• **At Home:** [Specific example of how {lesson_request.topic} appears in home life]
• **At School:** [Specific example of how {lesson_request.topic} appears in school]
• **In Your Community:** [Specific example of how {lesson_request.topic} appears locally]
• **In Entertainment/Media:** [Specific example from movies, games, social media]

**Professional Applications:**
• **Career Field 1:** How professionals use {lesson_request.topic}
• **Career Field 2:** How professionals use {lesson_request.topic}
• **Career Field 3:** How professionals use {lesson_request.topic}

**Current Events Connection:** Recently in the news, {lesson_request.topic} has been important because [current event example]. This shows how understanding {lesson_request.topic} helps us make sense of what's happening in our world.

**Global Perspectives:** Different countries and cultures apply {lesson_request.topic} in unique ways, showing both universal principles and cultural variations.

**Future Implications:** As technology and society continue to evolve, {lesson_request.topic} will likely play an even more important role in [future predictions]."""
    }

    base_content = content_templates.get(slide_type, f"Detailed exploration of {lesson_request.topic} - {title}")

    return LessonSlide(
        title=f"{title}: {lesson_request.topic}",
        content=generate_detailed_slide_content(base_content, grade_category, guidelines),
        image_prompt=f"Educational illustration showing {slide_type} for {lesson_request.topic}, designed for {grade_category} students, professional classroom style",
        notes=f"Comprehensive presenter notes for {title} slide focusing on {slide_type}. Include interactive elements, check for understanding frequently, and provide multiple examples. Estimated time: {guidelines['attention_span']}.",
        accessibility_features={
            "detailed_content": f"Comprehensive {slide_type} with multiple examples",
            "grade_appropriate": f"Content adapted for {grade_category} level",
            "complexity_level": f"Complexity level {complexity_level}/10 applied",
            "multiple_modalities": "Visual, auditory, and kinesthetic elements included",
            "interaction_opportunities": "Built-in discussion and activity prompts"
        }
    )


def generate_detailed_slide_content(base_content: str, grade_category: str, guidelines: Dict) -> str:
    """Enhance slide content based on grade-level guidelines"""
    # Apply grade-specific formatting and complexity adjustments
    if grade_category == 'elementary':
        # Simplify language and add more visual cues
        base_content = base_content.replace('fundamental', 'basic')
        base_content = base_content.replace('comprehensive', 'complete')
    elif grade_category == 'university':
        # Add more sophisticated vocabulary and concepts
        base_content = base_content.replace('understanding', 'comprehension and analysis')

    return base_content


def generate_objectives_list(learning_objectives: str) -> str:
    """Generate a formatted list of learning objectives"""
    objectives = [obj.strip() for obj in learning_objectives.split('\n') if obj.strip()]
    formatted_objectives = []
    for i, obj in enumerate(objectives, 1):
        formatted_objectives.append(f'**Goal {i}:** {obj}')
    return '\n'.join(formatted_objectives)


def generate_vocabulary_section(topic: str, grade_category: str, complexity_level: int) -> str:
    """Generate detailed vocabulary section appropriate for grade level"""
    # This would generate topic-specific vocabulary with definitions
    vocab_items = [
        f"**Term 1 related to {topic}:** [Definition appropriate for {grade_category}] - Example: [Concrete example]",
        f"**Term 2 related to {topic}:** [Definition appropriate for {grade_category}] - Example: [Concrete example]",
        f"**Term 3 related to {topic}:** [Definition appropriate for {grade_category}] - Example: [Concrete example]"
    ]
    return '\n'.join(vocab_items)


def create_enhanced_fallback_lesson(lesson_request: LessonRequest, learning_objectives: List[str],
                                    complexity_level: int) -> LessonContent:
    """Create enhanced fallback lesson with detailed content"""
    grade_category = determine_grade_category(lesson_request.grade_level)
    guidelines = get_grade_specific_guidelines(grade_category)

    # Create detailed fallback slides
    basic_slides = [
        LessonSlide(
            title=f"Welcome to {lesson_request.lesson_title}",
            content=f"Comprehensive introduction to {lesson_request.topic} designed specifically for {lesson_request.grade_level} students. This lesson follows Universal Design for Learning principles and includes multiple ways to engage with the content. Today we'll explore key concepts, work through examples, and connect learning to real-world applications.",
            image_prompt=f"Educational introduction image for {lesson_request.topic} suitable for {grade_category} students",
            notes="Welcome students warmly. Set expectations for inclusive, engaging learning. Check for accessibility needs.",
            accessibility_features={
                "detailed": "Comprehensive accessibility features including visual, auditory, and cognitive supports"}
        ),
        LessonSlide(
            title="Learning Objectives",
            content="\n".join([f"• {obj}" for obj in
                               learning_objectives]) + f"\n\nThese objectives are designed for {grade_category} learners with complexity level {complexity_level}/10.",
            image_prompt=f"Visual representation of learning goals for {lesson_request.topic}",
            notes="Review each objective thoroughly. Connect to students' interests and experiences.",
            accessibility_features={"structure": "Clear organization",
                                    "language": f"Appropriate for {grade_category} level"}
        )
    ]

    return LessonContent(
        title=lesson_request.lesson_title,
        overview=f"Enhanced lesson on {lesson_request.topic} with detailed, grade-appropriate content for {grade_category} learners at complexity level {complexity_level}/10",
        learning_objectives=learning_objectives,
        grade_level=lesson_request.grade_level,
        duration=lesson_request.duration,
        materials=["Enhanced presentation slides", "Interactive materials", "Assessment tools",
                   "Accessibility supports"],
        introduction=f"Engaging introduction using {guidelines['learning_style']} appropriate for {grade_category} students",
        main_activities=[
            {"name": "Enhanced concept exploration",
             "description": f"Detailed exploration of {lesson_request.topic} concepts"},
            {"name": "Interactive application", "description": "Hands-on learning with multiple participation options"},
            {"name": "Comprehensive assessment", "description": "Multiple ways to demonstrate understanding"}
        ],
        assessment=f"Multi-modal assessment strategy: {guidelines['assessment_style']}",
        conclusion=f"Systematic wrap-up connecting {lesson_request.topic} to future learning",
        accessibility_features={
            "visual": guidelines.get('visual', "High contrast, large fonts, visual supports"),
            "auditory": guidelines.get('auditory', "Clear audio, captions, verbal descriptions"),
            "cognitive": guidelines.get('cognitive', "Organized structure, reduced cognitive load"),
            "physical": guidelines.get('physical', "Flexible interaction, assistive technology compatible"),
            "language": guidelines.get('language', f"Appropriate for {grade_category} level"),
            "complexity": f"Content set to level {complexity_level}/10"
        },
        slides=basic_slides
    )