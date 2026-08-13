## TypeForm Clone: Backend Architecture Blueprint

The main challenge is not basic CRUD operations; it is **state synchronization, polymorphic question structures and respondent state isolation**.

Core Architecture

## TypeForm Clone: Backend Architecture Blueprint

The main challenge is not basic CRUD operations; it is **state synchronization, polymorphic question structures and respondent state isolation**.

### Core Architectural Decision:

### 1. Python + FastAPI

- **Type-Safe API Contracts:** FastAPI and Pydantic give us automated runtime validation, immediate error handling, and auto-generated OpenAPI documentation.
- **API-First Architecture:** Next.js handles the entire UI layer, while FastAPI acts purely as a fast, decoupled REST API for data and logic.

### 2. SQLite + SQLAlchemy 2.0

- **Modern ORM Practices:** Uses SQLAlchemy 2.0 typed mappings (`Mapped[]`) for clean Python database models.
- **Production-Ready Relational Design:** Built using standard relational design and cascade rules (`ON DELETE CASCADE`), making it effortless to switch from SQLite to PostgreSQL in production without breaking code.

### 3. Abstracted Creator Authentication

- **Default Creator Injection:** Uses a central dependency (`get_current_creator()`) returning a seeded `User ID: 1`.
- **Zero Refactoring Needed Later:** In production, this dependency can be updated to handle JWT/OAuth authentication without changing any API routes or business logic.

### Architecture:

```
┌──────────────────────────────────────────────┐
│                  FRONTEND                    │
│               Next.js + TS                   │
│                                              │
│ Dashboard                                    │
│ Form Builder                                 │
│ Preview                                      │
│ Public Form                                  │
│ Results                                      │
└──────────────────────┬───────────────────────┘
                       │
                    REST API
                       │
┌──────────────────────▼───────────────────────┐
│                  BACKEND                     │
│                FastAPI + Python              │
│                                              │
│ Form APIs                                    │
│ Question APIs                                │
│ Publish APIs                                 │
│ Response APIs                                │
│ Validation                                   │
│ Statistics                                   │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│                  DATABASE                    │
│                   SQLite                     │
│                                              │
│ Users                                        │
│ Forms                                        │
│ Questions                                    │
│ Question Options                             │
│ Responses                                    │
│ Answers                                      │
└──────────────────────────────────────────────┘
```

```
                    TYPEFORM CLONE

                         │
             ┌───────────┴───────────┐
             │                       │
        CREATOR API              PUBLIC API
             │                       │
     ┌───────┼────────┐              │
     │       │        │              │
   Forms  Questions Results       Form
     │       │        │              │
     └───────┴────────┘              │
             │                       │
             └──────────┬────────────┘
                        │
                    Services
                        │
                   SQLAlchemy
                        │
                     SQLite
```
