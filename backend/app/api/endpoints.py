from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import os
import uuid
import shutil
from typing import List, Optional
from app.services.lesson_generator import generate_lesson_content
from app.services.pptx_generator import create_presentation
from app.models.lesson import LessonRequest

router = APIRouter()


@router.post("/generate")
async def generate_lesson(
        background_tasks: BackgroundTasks,
        topic: str = Form(...),
        chapter: str = Form(...),
        lesson_title: str = Form(...),
        grade_level: str = Form(...),
        learning_objectives: str = Form(...),
        duration: str = Form(...),
        complexity_level: int = Form(5),  # New complexity level parameter (1-10)
        file: Optional[UploadFile] = File(None)
):
    try:
        # Validate complexity level
        if complexity_level < 1 or complexity_level > 10:
            raise HTTPException(
                status_code=400,
                detail="Complexity level must be between 1 and 10"
            )

        # Create unique ID for this lesson
        lesson_id = str(uuid.uuid4())

        # Create directory for this lesson's files
        lesson_dir = f"static/downloads/{lesson_id}"
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

        # Generate lesson content using enhanced AI with complexity level
        lesson_content = generate_lesson_content(lesson_request, complexity_level)

        # Create PowerPoint presentation with enhanced content
        pptx_filename = f"{lesson_title.replace(' ', '_')}_complexity_{complexity_level}.pptx"
        pptx_path = f"{lesson_dir}/{pptx_filename}"
        create_presentation(lesson_content, pptx_path)

        # Generate download URL
        download_url = f"/static/downloads/{lesson_id}/{pptx_filename}"

        return {
            "success": True,
            "message": f"Enhanced lesson generated successfully with complexity level {complexity_level}",
            "download_url": download_url,
            "lesson_details": {
                "title": lesson_content.title,
                "grade_level": lesson_content.grade_level,
                "duration": lesson_content.duration,
                "complexity_level": complexity_level,
                "slide_count": len(lesson_content.slides),
                "accessibility_features": len(lesson_content.accessibility_features)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating lesson: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Enhanced UDL Lesson Generator API is running",
        "version": "2.0 - Enhanced Content Generation"
    }