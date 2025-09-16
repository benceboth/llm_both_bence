# Gemini Code Assistant Context

This repository contains several projects, each in its own directory.

## Projects

### 1. Python Tools (`02_python_tools`)

*   **Purpose:** A Python package that contains a simple number guessing game.
*   **Frameworks/Libraries:** Standard Python libraries.
*   **How to Run:**
    ```bash
    python 02_python_tools/bb-fancy-pack/main.py
    ```

### 2. Python FastAPI Project (`03_python_fastapi_project`)

*   **Purpose:** A backend service for managing products, built with FastAPI. It provides CRUD operations for a `Product` entity.
*   **Frameworks/Libraries:** FastAPI, SQLAlchemy, Pydantic.
*   **Database:** SQLite
*   **How to Run:**
    ```bash
    # Install dependencies
    pip install -r 03_python_fastapi_project/requirements.txt 

    # Run the application
    uvicorn 03_python_fastapi_project.main:app --reload
    ```
    The application will be available at `http://127.0.0.1:8000`.

### 3. Market App (`04_market`)

*   **Purpose:** A frontend application built with Angular, likely serving as a user interface for the FastAPI product service.
*   **Frameworks/Libraries:** Angular, Bootstrap.
*   **How to Run:**
    ```bash
    # Install dependencies
    npm install --prefix 04_market/market-app

    # Start the development server
    npm start --prefix 04_market/market-app
    ```
    The application will be available at `http://localhost:4200/`.

### 4. Design (`05_design`)

*   **Purpose:** This directory is likely intended to store design assets for the projects.
*   **Contents:** Currently empty.

## Development Conventions

*   The projects are organized into separate directories.
*   The Python projects use `pyproject.toml` for dependency management.
*   The Angular project uses `package.json` for dependency management.
