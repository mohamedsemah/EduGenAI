# backend/app/api/endpoints.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import os
import uuid
import shutil
from typing import List, Optional, Dict, Any
from app.services.lesson_generator import generate_baseline_lesson, enhance_with_udl_principle
from app.services.pptx_generator import create_presentation
from app.models.lesson import LessonRequest, LessonStage, SlideEditRequest, UDLEnhancementRequest

router = APIRouter()

# Store lesson sessions in memory (in production, use Redis or database)
lesson_sessions = {}


@router.post("/generate-baseline")
async def generate_baseline_lesson_endpoint(
        background_tasks: BackgroundTasks,
        topic: str = Form(...),
        chapter: str = Form(...),
        lesson_title: str = Form(...),
        grade_level: str = Form(...),
        learning_objectives: str = Form(...),
        duration: str = Form(...),
        complexity_level: int = Form(5),
        file: Optional[UploadFile] = File(None)
):
    """Generate the initial baseline lesson deck"""
    try:
        # Create unique session ID
        session_id = str(uuid.uuid4())

        # Create directory for this lesson's files
        lesson_dir = f"static/downloads/{session_id}"
        os.makedirs(lesson_dir, exist_ok=True)

        # Save uploaded file if provided
        uploaded_file_path = None
        if file and file.filename:
            uploaded_file_path = f"{lesson_dir}/uploaded_{file.filename}"
            with open(uploaded_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

        # Create lesson request object
        lesson_request = LessonRequest(
            topic=topic,
            chapter=chapter,
            lesson_title=lesson_title,
            grade_level=grade_level,
            learning_objectives=learning_objectives,
            duration=duration,
            complexity_level=complexity_level,
            uploaded_file_path=uploaded_file_path
        )

        # Generate baseline lesson content
        baseline_lesson = generate_baseline_lesson(lesson_request)

        # Store session data
        lesson_sessions[session_id] = {
            "request": lesson_request,
            "current_stage": "baseline",
            "lesson_content": baseline_lesson,
            "edit_history": [],
            "lesson_dir": lesson_dir
        }

        return {
            "success": True,
            "session_id": session_id,
            "stage": "baseline",
            "lesson_content": baseline_lesson.dict(),
            "message": "Baseline lesson generated successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating baseline lesson: {str(e)}")


@router.post("/edit-slide/{session_id}")
async def edit_slide(session_id: str, edit_request: SlideEditRequest):
    """Edit a specific slide in the current lesson"""
    try:
        if session_id not in lesson_sessions:
            raise HTTPException(status_code=404, detail="Lesson session not found")

        session = lesson_sessions[session_id]
        lesson_content = session["lesson_content"]

        # Validate slide index
        if edit_request.slide_index >= len(lesson_content.slides):
            raise HTTPException(status_code=400, detail="Invalid slide index")

        # Store edit in history
        original_slide = lesson_content.slides[edit_request.slide_index].copy()
        session["edit_history"].append({
            "slide_index": edit_request.slide_index,
            "original": original_slide.dict(),
            "timestamp": str(uuid.uuid4())  # Simple timestamp placeholder
        })

        # Apply edits
        slide = lesson_content.slides[edit_request.slide_index]
        if edit_request.title is not None:
            slide.title = edit_request.title
        if edit_request.content is not None:
            slide.content = edit_request.content
        if edit_request.notes is not None:
            slide.notes = edit_request.notes
        if edit_request.image_prompt is not None:
            slide.image_prompt = edit_request.image_prompt

        return {
            "success": True,
            "message": "Slide updated successfully",
            "slide": slide.dict()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error editing slide: {str(e)}")


@router.post("/ai-enhance-slide/{session_id}")
async def ai_enhance_slide(session_id: str, enhancement_request: Dict[str, Any]):
    """Use AI to enhance a specific slide based on user prompt"""
    try:
        if session_id not in lesson_sessions:
            raise HTTPException(status_code=404, detail="Lesson session not found")

        session = lesson_sessions[session_id]
        lesson_content = session["lesson_content"]

        slide_index = enhancement_request.get("slide_index")
        user_prompt = enhancement_request.get("prompt")

        if slide_index >= len(lesson_content.slides):
            raise HTTPException(status_code=400, detail="Invalid slide index")

        # Store original in history
        original_slide = lesson_content.slides[slide_index].copy()
        session["edit_history"].append({
            "slide_index": slide_index,
            "original": original_slide.dict(),
            "timestamp": str(uuid.uuid4())
        })

        # Enhance slide with AI
        enhanced_slide = enhance_slide_with_ai(
            lesson_content.slides[slide_index],
            user_prompt,
            session["request"]
        )

        lesson_content.slides[slide_index] = enhanced_slide

        return {
            "success": True,
            "message": "Slide enhanced with AI",
            "slide": enhanced_slide.dict()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enhancing slide: {str(e)}")


@router.post("/apply-udl-principle/{session_id}")
async def apply_udl_principle(session_id: str, udl_request: UDLEnhancementRequest):
    """Apply a specific UDL principle to the entire lesson"""
    try:
        if session_id not in lesson_sessions:
            raise HTTPException(status_code=404, detail="Lesson session not found")

        session = lesson_sessions[session_id]

        # Validate UDL principle
        valid_principles = ["engagement", "representation", "action_expression"]
        if udl_request.principle not in valid_principles:
            raise HTTPException(status_code=400, detail="Invalid UDL principle")

        # Check stage progression
        current_stage = session["current_stage"]
        stage_progression = {
            "baseline": "engagement",
            "engagement": "representation",
            "representation": "action_expression"
        }

        expected_principle = stage_progression.get(current_stage)
        if udl_request.principle != expected_principle:
            raise HTTPException(
                status_code=400,
                detail=f"Must apply {expected_principle} principle next"
            )

        # Store current state in history
        session["edit_history"].append({
            "stage_transition": f"{current_stage}_to_{udl_request.principle}",
            "lesson_content": session["lesson_content"].dict(),
            "timestamp": str(uuid.uuid4())
        })

        # Apply UDL enhancement
        enhanced_lesson = enhance_with_udl_principle(
            session["lesson_content"],
            udl_request.principle,
            session["request"]
        )

        # Update session
        session["lesson_content"] = enhanced_lesson
        session["current_stage"] = udl_request.principle

        return {
            "success": True,
            "stage": udl_request.principle,
            "lesson_content": enhanced_lesson.dict(),
            "message": f"UDL {udl_request.principle} principle applied successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error applying UDL principle: {str(e)}")


@router.get("/lesson-session/{session_id}")
async def get_lesson_session(session_id: str):
    """Get current lesson session data"""
    try:
        if session_id not in lesson_sessions:
            raise HTTPException(status_code=404, detail="Lesson session not found")

        session = lesson_sessions[session_id]

        return {
            "success": True,
            "session_id": session_id,
            "stage": session["current_stage"],
            "lesson_content": session["lesson_content"].dict(),
            "available_next_stages": get_available_next_stages(session["current_stage"])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving session: {str(e)}")


@router.post("/export-lesson/{session_id}")
async def export_lesson(session_id: str):
    """Export the final lesson as PowerPoint"""
    try:
        if session_id not in lesson_sessions:
            raise HTTPException(status_code=404, detail="Lesson session not found")

        session = lesson_sessions[session_id]
        lesson_content = session["lesson_content"]
        lesson_dir = session["lesson_dir"]

        # Create PowerPoint presentation
        pptx_filename = f"{lesson_content.title.replace(' ', '_')}_final.pptx"
        pptx_path = f"{lesson_dir}/{pptx_filename}"
        create_presentation(lesson_content, pptx_path)

        # Generate download URL
        download_url = f"/static/downloads/{session_id}/{pptx_filename}"

        return {
            "success": True,
            "download_url": download_url,
            "message": "Lesson exported successfully",
            "lesson_details": {
                "title": lesson_content.title,
                "stage": session["current_stage"],
                "slide_count": len(lesson_content.slides),
                "edits_made": len(session["edit_history"])
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting lesson: {str(e)}")


@router.delete("/lesson-session/{session_id}")
async def delete_lesson_session(session_id: str):
    """Clean up lesson session"""
    try:
        if session_id in lesson_sessions:
            # Clean up files
            lesson_dir = lesson_sessions[session_id]["lesson_dir"]
            if os.path.exists(lesson_dir):
                shutil.rmtree(lesson_dir)

            # Remove session
            del lesson_sessions[session_id]

        return {"success": True, "message": "Session cleaned up"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning up session: {str(e)}")


def get_available_next_stages(current_stage: str) -> List[str]:
    """Get list of available next stages"""
    stage_map = {
        "baseline": ["engagement"],
        "engagement": ["representation"],
        "representation": ["action_expression"],
        "action_expression": ["export"]
    }
    return stage_map.get(current_stage, [])


def enhance_slide_with_ai(slide, user_prompt: str, lesson_request):
    """Enhance a slide using AI based on user prompt"""
    # This would integrate with your existing AI enhancement logic
    # For now, return the slide with a note about the enhancement
    enhanced_slide = slide.copy()
    enhanced_slide.notes = f"{slide.notes}\n\nAI Enhancement: {user_prompt}"
    return enhanced_slide


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Enhanced UDL Lesson Generator API with Staged Pipeline",
        "version": "3.0 - Teacher-in-the-Loop Pipeline",
        "active_sessions": len(lesson_sessions)
    }