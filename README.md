# Typeform Clone

Hey! This is a full-stack functional clone of Typeform, built for the SDE Fullstack Assignment. The goal here was to recreate that clean, focused, and conversational one-question-at-a-time experience that Typeform is known for, both for the creator and the respondent.

## Features Built

- **Drag-and-Drop Builder**: You can add, edit, delete, and reorder questions visually.
- **Multiple Question Types**: Supports Short/Long text, Email, Number, Multiple Choice, Dropdown, Yes/No, and Rating.
- **Respondent Flow**: The signature Typeform experience. Full-screen, smooth transitions, keyboard navigation (use arrows and Enter!), and client-side validation.
- **Results Dashboard**: A beautiful unified view to see Insights, a Summary of responses, and individual Response details.
- **Workspace**: Manage your forms, duplicate them, rename them, and publish/unpublish them.
- **Polished UI**: Custom toast notifications, inline editing, and modal dialogs that feel native and premium.

## Tech Stack

I kept the stack modern and straightforward:

- **Frontend**: Next.js (App Router) with TypeScript and Tailwind CSS.
- **Backend**: Python with FastAPI.
- **Database**: SQLite (using SQLAlchemy ORM).

## Running it locally

First, clone the repository and make sure you have Node.js and Python installed.

### 1. Start the Backend

Open a terminal and navigate to the `server` directory:

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

To seed the database with a user, a couple of forms (one draft, one published with all question types), and some dummy responses so you have something to look at immediately:

```bash
python seed.py
```

Then, run the server:

```bash
python -m uvicorn app.main:app --reload
```
The backend will run on `http://localhost:8000`.

### 2. Start the Frontend

Open another terminal and navigate to the `client` directory:

```bash
cd client
npm install
npm run dev
```
The frontend will run on `http://localhost:3000`. Head there in your browser to check it out! 

**Important:** On the login screen, enter **`user@gmail.com`** to access the pre-seeded account and see the generated forms!

## Architecture & Database

- **Client**: It's a standard Next.js SPA architecture using React hooks and Context for state management. I avoided heavy state management libraries like Redux to keep it lightweight. We fetch data using native `fetch` wrappers.
- **Server**: It's a FastAPI server organized in a layered architecture: Routes (controllers) -> Services (business logic) -> Models/Schemas (DB and Validation).
- **Database Schema**: 
  - `User`: Basic authentication placeholder.
  - `Form`: Stores form metadata (title, status, public link).
  - `Question`: Stores question details (type, order, required, options). Links to a Form.
  - `Response`: Represents a single submission session.
  - `Answer`: Individual answers linked to a Response and a Question.

## Assumptions & Notes

- Authentication is simplified as per the assignment constraints (assume a default logged-in creator). You can log in using the seed email `user@gmail.com` to keep the focus on the core builder and respondent flow.
- A few advanced settings like Logic Jumps and certain integrations are present in the UI to match the "Typeform feel" but are treated as mocked "Coming Soon" placeholders.
- The respondent flow does not require any login, making the published forms truly public.

Enjoy checking it out!
