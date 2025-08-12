# Promoly Architecture Diagrams

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PROMOLY PLATFORM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    HTTP/REST    ┌─────────────────┐                   │
│  │   Frontend      │◄──────────────►│    Backend      │                   │
│  │   (Next.js)     │                 │   (NestJS)      │                   │
│  │                 │                 │                 │                   │
│  │ • Chat UI       │                 │ • Auth Module   │                   │
│  │ • Dashboard     │                 │ • Campaign Mgmt │                   │
│  │ • Campaign Mgmt │                 │ • Meta API      │                   │
│  │ • Settings      │                 │ • AI Proxy      │                   │
│  └─────────────────┘                 └─────────────────┘                   │
│          │                                   │                             │
│          │                                   │                             │
│          │                                   ▼                             │
│          │                          ┌─────────────────┐                   │
│          │                          │   AI Service    │                   │
│          │                          │   (FastAPI)     │                   │
│          │                          │                 │                   │
│          │                          │ • Ad Generation │                   │
│          │                          │ • Optimization  │                   │
│          │                          │ • RAG Service   │                   │
│          │                          │ • Chat Complet. │                   │
│          │                          └─────────────────┘                   │
│          │                                   │                             │
│          │                                   │                             │
│          ▼                                   ▼                             │
│  ┌─────────────────┐                 ┌─────────────────┐                   │
│  │   PostgreSQL    │                 │     Redis       │                   │
│  │   (Main DB)     │                 │   (Cache/Queue) │                   │
│  │                 │                 │                 │                   │
│  │ • Users         │                 │ • Session Cache │                   │
│  │ • Campaigns     │                 │ • Job Queue     │                   │
│  │ • Performance   │                 │ • Rate Limiting │                   │
│  │ • Suggestions   │                 │ • Pub/Sub       │                   │
│  └─────────────────┘                 └─────────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### 1. User Authentication Flow

```
┌─────────────┐   1. Login Request    ┌─────────────┐   2. Validate User    ┌─────────────┐
│   Frontend  │─────────────────────►│   Backend   │─────────────────────►│ PostgreSQL  │
│             │                      │             │                      │             │
└─────────────┘                      └─────────────┘                      └─────────────┘
       │                                     │                                     │
       │                                     │                                     │
       │                                     ▼                                     │
       │                              ┌─────────────┐                              │
       │                              │   bcrypt    │                              │
       │                              │  Password   │                              │
       │                              │  Hashing    │                              │
       │                              └─────────────┘                              │
       │                                     │                                     │
       │                                     ▼                                     │
       │                              ┌─────────────┐                              │
       │                              │   JWT       │                              │
       │                              │ Generation  │                              │
       │                              └─────────────┘                              │
       │                                     │                                     │
       ▼                                     │                                     │
┌─────────────┐   3. JWT Token        ┌─────────────┐                              │
│   Frontend  │◄─────────────────────│   Backend   │                              │
│             │                      │             │                              │
└─────────────┘                      └─────────────┘                              │
       │                                     │                                     │
       ▼                                     │                                     │
┌─────────────┐                              │                                     │
│ localStorage │                              │                                     │
│   Storage    │                              │                                     │
└─────────────┘                              │                                     │
                                             │                                     │
                                             ▼                                     │
                                    ┌─────────────┐   4. Protected Routes          │
                                    │   JWT       │◄───────────────────────────────┘
                                    │ Validation  │
                                    └─────────────┘
```

### 2. Campaign Creation Flow

```
┌─────────────┐   1. Campaign Data    ┌─────────────┐   2. Validation      ┌─────────────┐
│   Frontend  │─────────────────────►│   Backend   │─────────────────────►│ PostgreSQL  │
│             │                      │             │                      │             │
└─────────────┘                      └─────────────┘                      └─────────────┘
                                             │                                     │
                                             ▼                                     │
                                    ┌─────────────┐   3. Meta API Call            │
                                    │   Meta Ads  │───────────────────────────────┘
                                    │     API     │
                                    └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────┐   4. Background Job           │
                                    │    Redis    │◄──────────────────────────────┘
                                    │   Queue     │
                                    └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────┐   5. Performance Sync         │
                                    │   Worker    │───────────────────────────────┘
                                    │  Process    │
                                    └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────┐   6. AI Optimization          │
                                    │ AI Service  │───────────────────────────────┘
                                    │ (FastAPI)   │
                                    └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────┐   7. Store Suggestions        │
                                    │ PostgreSQL  │◄──────────────────────────────┘
                                    │             │
                                    └─────────────┘
```

### 3. AI Optimization Flow

```
┌─────────────┐   1. Performance Data ┌─────────────┐   2. Data Processing ┌─────────────┐
│   Meta Ads  │─────────────────────►│   Backend   │─────────────────────►│ AI Service  │
│     API     │                      │             │                      │ (FastAPI)   │
└─────────────┘                      └─────────────┘                      └─────────────┘
                                             │                                     │
                                             │                                     ▼
                                             │                              ┌─────────────┐
                                             │                              │   OpenAI    │
                                             │                              │   GPT-4o    │
                                             │                              │             │
                                             │                              └─────────────┘
                                             │                                     │
                                             │                                     ▼
                                             │                              ┌─────────────┐
                                             │                              │ Optimization│
                                             │                              │ Suggestions │
                                             │                              └─────────────┘
                                             │                                     │
                                             ▼                                     │
                                    ┌─────────────┐   3. Store Results            │
                                    │ PostgreSQL  │◄──────────────────────────────┘
                                    │             │
                                    └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────┐   4. Frontend Update          │
                                    │   Frontend  │◄──────────────────────────────┘
                                    │             │
                                    └─────────────┘
```

## Component Architecture

### Backend Module Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NESTJS BACKEND                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Auth Module   │  │  Users Module   │  │ Campaign Module │             │
│  │                 │  │                 │  │                 │             │
│  │ • JWT Strategy  │  │ • User CRUD     │  │ • Campaign CRUD │             │
│  │ • Local Strategy│  │ • Profile Mgmt  │  │ • Performance   │             │
│  │ • Guards        │  │ • Role Mgmt     │  │ • Meta Sync     │             │
│  │ • DTOs          │  │ • DTOs          │  │ • Background    │             │
│  └─────────────────┘  └─────────────────┘  │   Jobs          │             │
│                                            └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Meta Integration│  │   AI Module     │  │Suggestions Module│             │
│  │     Module      │  │                 │  │                 │             │
│  │                 │  │ • AI Proxy      │  │ • Suggestion    │             │
│  │ • Meta API      │  │ • HTTP Client   │  │   CRUD          │             │
│  │ • OAuth Flow    │  │ • Error Handling│  │ • Approval      │             │
│  │ • Campaign Sync │  │ • Response      │  │ • Execution     │             │
│  │ • Performance   │  │   Transform     │  │ • DTOs          │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  Prisma Module  │  │  Bull Module    │  │ Schedule Module │             │
│  │                 │  │                 │  │                 │             │
│  │ • Database      │  │ • Job Queues    │  │ • Cron Jobs     │             │
│  │   Connection    │  │ • Processors    │  │ • Scheduled     │             │
│  │ • ORM           │  │ • Redis         │  │   Tasks         │             │
│  │ • Migrations    │  │ • Monitoring    │  │ • Automation    │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Frontend Component Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NEXT.JS FRONTEND                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   App Router    │  │   Components    │  │     Lib         │             │
│  │                 │  │                 │  │                 │             │
│  │ • Layout        │  │ • UI Components │  │ • API Client    │             │
│  │ • Pages         │  │ • Forms         │  │ • Stores        │             │
│  │ • Navigation    │  │ • Cards         │  │ • Utils         │             │
│  │ • Metadata      │  │ • Charts        │  │ • Types         │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   State Mgmt    │  │   Styling       │  │   Features      │             │
│  │                 │  │                 │  │                 │             │
│  │ • Zustand       │  │ • Tailwind CSS  │  │ • Authentication│             │
│  │ • React Query   │  │ • shadcn/ui     │  │ • Dashboard     │             │
│  │ • Local Storage │  │ • Animations    │  │ • Campaign Mgmt │             │
│  │ • Context       │  │ • Responsive    │  │ • Chat Interface│             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   API Layer     │  │   Validation    │  │   Error Handling│             │
│  │                 │  │                 │  │                 │             │
│  │ • Axios         │  │ • Zod Schemas   │  │ • Error Boundaries│             │
│  │ • Interceptors  │  │ • Form Validation│  │ • Toast Messages│             │
│  │ • Error Handling│  │ • Type Safety   │  │ • Fallback UI   │             │
│  │ • Caching       │  │ • Runtime Check │  │ • Retry Logic   │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### AI Service Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FASTAPI AI SERVICE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   AI Service    │  │ Optimization    │  │   RAG Service   │             │
│  │                 │  │   Service       │  │                 │             │
│  │                 │  │                 │  │                 │             │
│  │ • Ad Generation │  │ • Performance   │  │ • Knowledge     │             │
│  │ • Creative Ideas│  │   Analysis      │  │   Base          │             │
│  │ • Copy Writing  │  │ • Suggestions   │  │ • Vector Search │             │
│  │ • OpenAI        │  │ • Rule Engine   │  │ • Embeddings    │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   FastAPI App   │  │   Dependencies  │  │   Middleware    │             │
│  │                 │  │                 │  │                 │             │
│  │ • Endpoints     │  │ • OpenAI        │  │ • CORS          │             │
│  │ • Validation    │  │ • LangChain     │  │ • Authentication│             │
│  │ • Documentation │  │ • Pydantic      │  │ • Rate Limiting │             │
│  │ • Error Handling│  │ • NumPy/Pandas  │  │ • Logging       │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Data Models   │  │   Utilities     │  │   Configuration │             │
│  │                 │  │                 │  │                 │             │
│  │ • Request DTOs  │  │ • Prompt        │  │ • Environment   │             │
│  │ • Response DTOs │  │   Templates     │  │   Variables     │             │
│  │ • Validation    │  │ • Text          │  │ • API Keys      │             │
│  │ • Type Hints    │  │   Processing    │  │ • Model Config  │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│      User       │         │    Campaign     │         │   Performance   │
│                 │         │                 │         │                 │
│ • id (PK)       │◄────────│ • userId (FK)   │         │ • id (PK)       │
│ • email         │         │ • id (PK)       │◄────────│ • campaignId    │
│ • password      │         │ • name          │         │   (FK)          │
│ • firstName     │         │ • objective     │         │ • date          │
│ • lastName      │         │ • status        │         │ • reach         │
│ • company       │         │ • budget        │         │ • clicks        │
│ • role          │         │ • spent         │         │ • leads         │
│ • plan          │         │ • metaCampaignId│         │ • spent         │
│ • createdAt     │         │ • adAccountId   │         │ • ctr           │
│ • updatedAt     │         │ • createdAt     │         │ • cpl           │
│                 │         │ • updatedAt     │         │ • roas          │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │                           │                           │
         │                           │                           │
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Meta Account   │         │   Suggestion    │         │   User Session  │
│                 │         │                 │         │                 │
│ • id (PK)       │         │ • id (PK)       │         │ • id (PK)       │
│ • userId (FK)   │         │ • campaignId    │         │ • userId (FK)   │
│ • adAccountId   │         │   (FK)          │         │ • token         │
│ • name          │         │ • type          │         │ • expiresAt     │
│ • status        │         │ • title         │         │ • createdAt     │
│ • accessToken   │         │ • description   │         │ • updatedAt     │
│ • currency      │         │ • priority      │         │                 │
│ • timezone      │         │ • status        │         │                 │
│ • connectedAt   │         │ • action        │         │                 │
│ • lastSyncAt    │         │ • createdAt     │         │                 │
│                 │         │ • updatedAt     │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## Deployment Architecture

### Docker Compose Setup

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DOCKER COMPOSE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │    Frontend     │  │     Backend     │  │   AI Service    │             │
│  │   (Next.js)     │  │    (NestJS)     │  │   (FastAPI)     │             │
│  │                 │  │                 │  │                 │             │
│  │ • Port: 3000    │  │ • Port: 3001    │  │ • Port: 8000    │             │
│  │ • Build: npm    │  │ • Build: npm    │  │ • Build: pip    │             │
│  │ • Hot Reload    │  │ • Hot Reload    │  │ • Hot Reload    │             │
│  │ • Static Files  │  │ • API Server    │  │ • AI Endpoints  │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   PostgreSQL    │  │     Redis       │  │     Worker      │             │
│  │                 │  │                 │  │                 │             │
│  │ • Port: 5432    │  │ • Port: 6379    │  │ • Background    │             │
│  │ • Data Volume   │  │ • Cache/Queue   │  │   Jobs          │             │
│  │ • Migrations    │  │ • Sessions      │  │ • BullMQ        │             │
│  │ • pgvector      │  │ • Rate Limiting │  │ • Processors    │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Networks      │  │   Volumes       │  │   Environment   │             │
│  │                 │  │                 │  │                 │             │
│  │ • promoly_net   │  │ • postgres_data │  │ • .env files    │             │
│  │ • Internal      │  │ • redis_data    │  │ • API Keys      │             │
│  │ • Communication │  │ • logs          │  │ • Config        │             │
│  │ • Service       │  │ • backups       │  │ • Secrets       │             │
│  │   Discovery     │  │ • temp          │  │ • Variables     │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Security Architecture

### Authentication & Authorization Flow

```
┌─────────────┐   1. Request with JWT    ┌─────────────┐   2. Token Validation
│   Client    │─────────────────────────►│   Gateway   │─────────────────────┐
│             │                          │             │                      │
└─────────────┘                          └─────────────┘                      │
                                                                              │
                                                                              ▼
┌─────────────┐   4. User Context       ┌─────────────┐   3. JWT Decode     │
│   Service   │◄────────────────────────│   JWT       │◄─────────────────────┘
│   Layer     │                          │  Guard      │
│             │                          │             │
└─────────────┘                          └─────────────┘
       │                                         │
       ▼                                         ▼
┌─────────────┐                          ┌─────────────┐
│   Role      │                          │ Permission  │
│  Check      │                          │  Check      │
└─────────────┘                          └─────────────┘
       │                                         │
       ▼                                         ▼
┌─────────────┐                          ┌─────────────┐
│  Resource   │                          │   Action    │
│  Access     │                          │  Allowed    │
└─────────────┘                          └─────────────┘
```

### Data Flow Security

```
┌─────────────┐   1. HTTPS Request      ┌─────────────┐   2. Rate Limiting
│   Client    │────────────────────────►│   Load      │─────────────────────┐
│             │                          │  Balancer   │                      │
└─────────────┘                          └─────────────┘                      │
                                                                              │
                                                                              ▼
┌─────────────┐   5. Encrypted Response ┌─────────────┐   3. Input Validation
│   Client    │◄────────────────────────│   Service   │◄─────────────────────┘
│             │                          │   Layer     │
└─────────────┘                          └─────────────┘
                                                 │
                                                 ▼
                                        ┌─────────────┐   4. Database Query
                                        │   Database  │◄─────────────────────┐
                                        │   Layer     │                      │
                                        └─────────────┘                      │
                                                 │                           │
                                                 ▼                           │
                                        ┌─────────────┐                      │
                                        │   Audit     │                      │
                                        │   Log       │                      │
                                        └─────────────┘                      │
                                                                              │
                                                                              ▼
                                        ┌─────────────┐   6. Response Sanitization
                                        │   Output    │◄─────────────────────┘
                                        │  Filtering  │
                                        └─────────────┘
```

## Performance Architecture

### Caching Strategy

```
┌─────────────┐   1. Cache Check       ┌─────────────┐   2. Cache Hit
│   Client    │───────────────────────►│   Redis     │◄─────────────────────┐
│             │                        │   Cache     │                      │
└─────────────┘                        └─────────────┘                      │
                                               │                             │
                                               ▼                             │
┌─────────────┐   4. Cache Update      ┌─────────────┐   3. Database Query  │
│   Client    │◄───────────────────────│   Redis     │◄─────────────────────┘
│             │                        │   Cache     │
└─────────────┘                        └─────────────┘
                                               │
                                               ▼
                                      ┌─────────────┐   5. TTL Expiration
                                      │   Cache     │
                                      │  Invalidation│
                                      └─────────────┘
```

### Load Balancing

```
┌─────────────┐   1. Request           ┌─────────────┐   2. Load Distribution
│   Client    │───────────────────────►│   Load      │─────────────────────┐
│             │                        │  Balancer   │                      │
└─────────────┘                        └─────────────┘                      │
                                                                              │
                                                                              ▼
┌─────────────┐   4. Response          ┌─────────────┐   3. Service Instance
│   Client    │◄───────────────────────│   Load      │◄─────────────────────┘
│             │                        │  Balancer   │
└─────────────┘                        └─────────────┘
                                               │
                                               ▼
                                      ┌─────────────┐
                                      │   Health    │
                                      │   Check     │
                                      └─────────────┘
```

These architecture diagrams provide a comprehensive visual representation of the Promoly system, showing how different components interact, data flows through the system, and the overall structure of the application.
