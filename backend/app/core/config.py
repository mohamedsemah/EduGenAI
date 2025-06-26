import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Settings:
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "UDL Lesson Generator"

    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # File paths
    STATIC_DIR: str = "static"
    DOWNLOADS_DIR: str = os.path.join(STATIC_DIR, "downloads")

    # UDL principles metadata
    UDL_PRINCIPLES = {
        "representation": [
            "Provide options for perception",
            "Provide options for language, expressions, and symbols",
            "Provide options for comprehension"
        ],
        "action_expression": [
            "Provide options for physical action",
            "Provide options for expression and communication",
            "Provide options for executive functions"
        ],
        "engagement": [
            "Provide options for recruiting interest",
            "Provide options for sustaining effort and persistence",
            "Provide options for self-regulation"
        ]
    }


settings = Settings()