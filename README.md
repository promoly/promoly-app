# Promoly - AI-Powered Ads Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

Promoly is a comprehensive AI-powered ads management and optimization platform that combines conversational AI, automated campaign optimization, and Meta Ads API integration to help businesses maximize their advertising ROI.

## 🚀 Features

### Core Features

- **🤖 AI-Powered Chat Interface** - Conversational onboarding and daily optimization suggestions
- **📊 Real-time Dashboard** - Live campaign performance metrics and KPIs
- **🎯 Automated Optimization** - AI-driven campaign improvements and budget allocation
- **🔗 Meta Ads Integration** - Seamless connection to Facebook/Instagram advertising
- **📚 RAG Knowledge Base** - Marketing best practices and industry insights
- **⚡ Background Processing** - Automated data sync and optimization jobs

### Technical Features

- **🔐 JWT Authentication** - Secure user authentication and session management
- **🔄 Real-time Updates** - Live data synchronization with Meta Ads API
- **📈 Performance Analytics** - Comprehensive campaign performance tracking
- **🎨 Modern UI/UX** - Beautiful, responsive interface with animations
- **🐳 Docker Deployment** - Containerized microservices architecture
- **📝 API Documentation** - Complete Swagger/OpenAPI documentation

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Service    │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   (FastAPI)     │
│                 │    │                 │    │                 │
│ • Chat UI       │    │ • Auth Module   │    │ • Ad Generation │
│ • Dashboard     │    │ • Campaign Mgmt │    │ • Optimization  │
│ • Campaign Mgmt │    │ • Meta API      │    │ • RAG Service   │
│ • Settings      │    │ • AI Proxy      │    │ • Chat Complet. │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   Meta Ads      │
│   (Main DB)     │    │   (Cache/Queue) │    │     API         │
│                 │    │                 │    │                 │
│ • Users         │    │ • Session Cache │    │ • Campaigns     │
│ • Campaigns     │    │ • Job Queue     │    │ • Performance   │
│ • Performance   │    │ • Rate Limiting │    │ • Ad Accounts   │
│ • Suggestions   │    │ • Pub/Sub       │    │ • Targeting     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
promoly/
├── frontend/                 # Next.js 14 Frontend Application
│   ├── app/                 # App Router pages and layouts
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configurations
│   ├── types/               # TypeScript type definitions
│   └── Dockerfile           # Frontend container configuration
├── backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── users/           # User management
│   │   ├── campaign/        # Campaign operations
│   │   ├── meta-integration/# Meta Ads API integration
│   │   ├── ai/              # AI service communication
│   │   ├── suggestions/     # AI suggestions management
│   │   ├── prisma/          # Database ORM
│   │   └── worker.ts        # Background job processor
│   ├── prisma/              # Database schema and migrations
│   └── Dockerfile           # Backend container configuration
├── ai-service/              # FastAPI AI Service
│   ├── services/            # AI service modules
│   │   ├── ai_service.py    # Core AI functionality
│   │   ├── optimization_service.py # Campaign optimization
│   │   └── rag_service.py   # RAG knowledge base
│   └── Dockerfile           # AI service container configuration
├── docker/                  # Docker configurations
│   └── postgres/            # PostgreSQL initialization
├── docker-compose.yml       # Multi-container orchestration
├── deploy.sh               # Automated deployment script
├── .env.example            # Environment variables template
└── README.md               # This documentation
```

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion + Aceternity UI
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization

### Backend

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis + BullMQ
- **Authentication**: Passport.js (JWT + Local)
- **API Documentation**: Swagger/OpenAPI
- **Background Jobs**: BullMQ processors

### AI Service

- **Framework**: FastAPI (Python)
- **AI/ML**: LangChain + OpenAI GPT-4o-mini
- **Vector Database**: PostgreSQL pgvector
- **Data Processing**: Pandas + NumPy + Scikit-learn

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL 15+ with pgvector extension
- **Caching**: Redis 7+
- **Deployment**: VPS with Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- Python 3.9+ (for AI service development)
- Meta Ads API access

### 1. Clone and Setup

```bash
git clone <repository-url>
cd promoly
cp .env.example .env
# Edit .env with your configuration
```

### 2. Environment Configuration

```bash
# Required environment variables
OPENAI_API_KEY=your_openai_api_key
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://user:password@postgres:5432/promoly
REDIS_URL=redis://redis:6379
```

### 3. Deploy with Docker

```bash
# Automated deployment
./deploy.sh

# Or manual deployment
docker-compose up --build -d
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Service**: http://localhost:8000
- **API Documentation**: http://localhost:3001/api

## 📚 API Documentation

### Authentication Endpoints

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp"
}
```

**Response:**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp",
  "role": "USER",
  "plan": "FREE",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Campaign Management

#### GET /campaigns

Retrieve user's campaigns with performance data.

**Headers:** `Authorization: Bearer <jwt_token>`

**Response:**

```json
{
  "campaigns": [
    {
      "id": "campaign-uuid",
      "name": "Summer Sale Campaign",
      "objective": "LEADS",
      "status": "ACTIVE",
      "budget": 1000,
      "spent": 450,
      "performance": {
        "reach": 12500,
        "clicks": 340,
        "leads": 27,
        "cpl": 16.67
      }
    }
  ]
}
```

#### POST /campaigns

Create a new campaign.

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**

```json
{
  "name": "New Campaign",
  "objective": "LEADS",
  "budget": 1000,
  "targeting": {
    "ageRange": [25, 45],
    "locations": ["US"],
    "interests": ["technology", "business"]
  }
}
```

### Meta Ads Integration

#### POST /meta/connect

Connect Meta Ads account via OAuth.

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**

```json
{
  "adAccountId": "act_123456789",
  "accessToken": "meta_access_token"
}
```

### AI Service Endpoints

#### POST /ai/generate

Generate ad copy and creative ideas.

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**

```json
{
  "prompt": "Generate ad copy for a tech startup",
  "context": {
    "industry": "technology",
    "targetAudience": "business professionals",
    "budget": 1000
  }
}
```

#### POST /ai/optimize

Get AI-powered optimization suggestions.

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**

```json
{
  "campaignId": "campaign-uuid",
  "performanceData": {
    "reach": 12500,
    "clicks": 340,
    "leads": 27,
    "spent": 450
  }
}
```

### Suggestions Management

#### GET /suggestions

Retrieve AI-generated suggestions.

**Headers:** `Authorization: Bearer <jwt_token>`

#### POST /suggestions/:id/approve

Approve and execute a suggestion.

**Headers:** `Authorization: Bearer <jwt_token>`

## 🔧 Module-by-Module Explanation

### Frontend Modules

#### 1. App Router Structure (`frontend/app/`)

- **`layout.tsx`**: Root layout with metadata and global styles
- **`page.tsx`**: Landing page with hero section and features
- **`globals.css`**: Global CSS with Tailwind directives and custom variables

#### 2. Component Architecture (`frontend/components/`)

- **UI Components**: Reusable components using shadcn/ui
- **Layout Components**: Navigation, sidebar, and layout wrappers
- **Feature Components**: Chat interface, dashboard cards, campaign forms

#### 3. State Management (`frontend/lib/`)

- **Zustand Stores**: Global state management for user, campaigns, and UI
- **React Query**: Server state management and caching
- **API Client**: Axios configuration with interceptors

### Backend Modules

#### 1. Authentication Module (`backend/src/auth/`)

```typescript
// JWT Strategy Implementation
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_SECRET"),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

**Key Features:**

- JWT token generation and validation
- Password hashing with bcrypt
- Local and JWT authentication strategies
- Protected route guards

#### 2. Campaign Module (`backend/src/campaign/`)

```typescript
// Campaign Service with Meta Integration
@Injectable()
export class CampaignService {
  constructor(
    private prisma: PrismaService,
    private metaService: MetaIntegrationService,
    private aiService: AiService,
    @InjectQueue("campaign-sync") private syncQueue: Queue
  ) {}

  async createCampaign(userId: string, data: CreateCampaignDto) {
    // 1. Create campaign in database
    const campaign = await this.prisma.campaign.create({
      data: { ...data, userId },
    });

    // 2. Push to Meta Ads API
    const metaCampaign = await this.metaService.createCampaign(data);

    // 3. Queue background sync job
    await this.syncQueue.add("sync-performance", { campaignId: campaign.id });

    return campaign;
  }
}
```

**Key Features:**

- CRUD operations for campaigns
- Meta Ads API integration
- Background job queuing
- Performance data synchronization

#### 3. Meta Integration Module (`backend/src/meta-integration/`)

```typescript
// Meta Ads API Service
@Injectable()
export class MetaIntegrationService {
  private api: FacebookAdsApi;

  async createCampaign(data: CreateCampaignDto) {
    const adAccount = new AdAccount(data.adAccountId);

    const campaign = await adAccount.createCampaign([], {
      name: data.name,
      objective: this.mapObjective(data.objective),
      status: "PAUSED",
      special_ad_categories: [],
    });

    return campaign;
  }

  async getPerformanceData(campaignId: string) {
    const campaign = new Campaign(campaignId);
    const insights = await campaign.getInsights(["reach", "clicks", "actions"]);

    return this.transformInsights(insights);
  }
}
```

**Key Features:**

- Facebook Business SDK integration
- OAuth token management
- Campaign creation and updates
- Performance data fetching

#### 4. AI Module (`backend/src/ai/`)

```typescript
// AI Service Proxy
@Injectable()
export class AiService {
  constructor(private httpService: HttpService) {}

  async generateAdCopy(prompt: string, context: any) {
    const response = await this.httpService
      .post(`${this.aiServiceUrl}/generate`, { prompt, context })
      .toPromise();

    return response.data;
  }

  async getOptimizationSuggestions(campaignData: any) {
    const response = await this.httpService
      .post(`${this.aiServiceUrl}/optimize`, campaignData)
      .toPromise();

    return response.data;
  }
}
```

**Key Features:**

- HTTP communication with FastAPI AI service
- Request/response transformation
- Error handling and retry logic

### AI Service Modules

#### 1. Core AI Service (`ai-service/services/ai_service.py`)

```python
class AIService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        self.chain = LLMChain(llm=self.llm, prompt=self.create_prompt())

    async def generate_ad_copy(self, prompt: str, context: dict) -> dict:
        """Generate ad copy based on prompt and context"""
        try:
            response = await self.chain.arun(
                prompt=prompt,
                industry=context.get("industry", ""),
                audience=context.get("targetAudience", ""),
                budget=context.get("budget", 0)
            )

            return {
                "ad_copy": response,
                "confidence": 0.85,
                "suggestions": self.extract_suggestions(response)
            }
        except Exception as e:
            logger.error(f"Error generating ad copy: {e}")
            raise HTTPException(status_code=500, detail="AI service error")
```

**Key Features:**

- OpenAI GPT-4o-mini integration
- Async request handling
- Context-aware prompt engineering
- Error handling and logging

#### 2. Optimization Service (`ai-service/services/optimization_service.py`)

```python
class OptimizationService:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o-mini")
        self.optimization_prompt = self.load_optimization_prompt()

    async def generate_suggestions(self, campaign_data: dict) -> dict:
        """Generate optimization suggestions based on performance data"""
        performance = campaign_data.get("performanceData", {})

        # Calculate key metrics
        ctr = performance.get("clicks", 0) / max(performance.get("reach", 1), 1)
        cpl = performance.get("spent", 0) / max(performance.get("leads", 1), 1)

        # Generate suggestions based on performance
        suggestions = []

        if ctr < 0.02:  # Low CTR
            suggestions.append({
                "type": "CREATIVE_OPTIMIZATION",
                "title": "Improve Ad Creative",
                "description": "Your click-through rate is below average. Consider testing new ad creatives.",
                "priority": "HIGH",
                "estimated_impact": "20% CTR improvement"
            })

        if cpl > 50:  # High CPL
            suggestions.append({
                "type": "TARGETING_OPTIMIZATION",
                "title": "Refine Targeting",
                "description": "Your cost per lead is high. Consider narrowing your target audience.",
                "priority": "MEDIUM",
                "estimated_impact": "15% CPL reduction"
            })

        return {
            "suggestions": suggestions,
            "metrics": {
                "ctr": ctr,
                "cpl": cpl,
                "roas": performance.get("revenue", 0) / max(performance.get("spent", 1), 1)
            }
        }
```

**Key Features:**

- Performance data analysis
- Rule-based suggestion generation
- Metric calculations
- Priority-based recommendations

#### 3. RAG Service (`ai-service/services/rag_service.py`)

```python
class RAGService:
    def __init__(self):
        self.knowledge_base = self.load_knowledge_base()
        self.embedding_model = OpenAIEmbeddings()
        self.vector_store = self.initialize_vector_store()

    def load_knowledge_base(self) -> dict:
        """Load marketing best practices and knowledge base"""
        return {
            "facebook_ads_best_practices": [
                "Use high-quality images and videos",
                "Keep ad copy concise and compelling",
                "Test multiple ad variations",
                "Target specific audiences",
                "Monitor and optimize regularly"
            ],
            "conversion_optimization": [
                "Create clear call-to-actions",
                "Optimize landing pages",
                "Use retargeting campaigns",
                "A/B test everything",
                "Focus on mobile optimization"
            ],
            "budget_optimization": [
                "Start with small budgets and scale",
                "Use automatic bidding initially",
                "Monitor cost per result",
                "Pause underperforming ads",
                "Increase budget on winners"
            ]
        }

    async def query_knowledge_base(self, question: str) -> dict:
        """Query the knowledge base for relevant information"""
        # Simple keyword matching (production would use vector similarity)
        relevant_info = []

        for category, practices in self.knowledge_base.items():
            for practice in practices:
                if any(keyword in question.lower() for keyword in practice.lower().split()):
                    relevant_info.append({
                        "category": category,
                        "practice": practice,
                        "relevance_score": 0.8
                    })

        return {
            "answer": self.generate_answer(question, relevant_info),
            "sources": relevant_info,
            "confidence": 0.75
        }
```

**Key Features:**

- Marketing knowledge base
- Keyword-based retrieval
- Context-aware answers
- Source attribution

## 🔄 Data Flow Architecture

### 1. User Authentication Flow

```
User → Frontend → Backend Auth → JWT Token → Protected Routes
  ↓
Database ← User Creation ← Password Hashing ← Validation
```

### 2. Campaign Creation Flow

```
User Input → Frontend Form → Backend API → Meta Ads API
  ↓
Database ← Campaign Record ← Background Job ← Performance Sync
  ↓
AI Service ← Optimization Request ← Performance Data
  ↓
Suggestions ← AI Analysis ← Knowledge Base
```

### 3. AI Optimization Flow

```
Campaign Data → Background Job → AI Service → Optimization Analysis
  ↓
Suggestions → Database → Frontend Display → User Approval
  ↓
Meta API ← Approved Changes ← Backend Execution
```

### 4. Real-time Data Sync

```
Meta Ads API → Scheduled Job → Performance Data → Database
  ↓
Frontend ← WebSocket/SSE ← Backend API ← Cached Data
```

## 🚀 Deployment Guide

### VPS Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Application Deployment

```bash
# Clone repository
git clone <repository-url>
cd promoly

# Configure environment
cp .env.example .env
nano .env  # Edit with your values

# Deploy
./deploy.sh
```

#### 3. SSL Configuration (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Configure SSL
sudo certbot --nginx -d yourdomain.com
```

### Production Considerations

#### 1. Environment Variables

```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=postgresql://user:password@postgres:5432/promoly
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secure-jwt-secret
OPENAI_API_KEY=your-openai-api-key
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
```

#### 2. Database Backups

```bash
# Create backup script
#!/bin/bash
docker exec promoly-postgres-1 pg_dump -U postgres promoly > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 3. Monitoring

```bash
# View logs
docker-compose logs -f

# Monitor resources
docker stats

# Health checks
curl http://localhost:3001/health
```

## 🔒 Security Considerations

### 1. Authentication & Authorization

- JWT tokens with secure expiration
- Password hashing with bcrypt
- Role-based access control
- Rate limiting on API endpoints

### 2. Data Protection

- Encrypted token storage
- HTTPS enforcement
- Input validation and sanitization
- SQL injection prevention with Prisma

### 3. API Security

- CORS configuration
- Request size limits
- API key rotation
- Audit logging

## 🧪 Testing Strategy

### 1. Unit Tests

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

### 2. Integration Tests

```bash
# API integration tests
npm run test:e2e

# Database integration tests
npm run test:db
```

### 3. Load Testing

```bash
# Using Artillery
npm install -g artillery
artillery run load-test.yml
```

## 📊 Monitoring & Analytics

### 1. Application Metrics

- Request/response times
- Error rates
- Database query performance
- Background job success rates

### 2. Business Metrics

- Campaign performance
- User engagement
- AI suggestion effectiveness
- Revenue attribution

### 3. Infrastructure Monitoring

- Container resource usage
- Database performance
- Redis cache hit rates
- Network latency

## 🔧 Development Guide

### 1. Local Development Setup

```bash
# Clone and setup
git clone <repository-url>
cd promoly

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../ai-service && pip install -r requirements.txt

# Start development servers
docker-compose up postgres redis -d
cd backend && npm run start:dev
cd ../frontend && npm run dev
cd ../ai-service && uvicorn main:app --reload
```

### 2. Code Style Guidelines

- **TypeScript**: Strict mode, ESLint + Prettier
- **Python**: Black formatter, flake8 linter
- **Frontend**: React best practices, component composition
- **Backend**: NestJS decorators, dependency injection

### 3. Git Workflow

```bash
# Feature development
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create pull request
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check PostgreSQL container
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up postgres -d
```

#### 2. Redis Connection Issues

```bash
# Check Redis container
docker-compose logs redis

# Clear Redis cache
docker exec promoly-redis-1 redis-cli FLUSHALL
```

#### 3. AI Service Issues

```bash
# Check AI service logs
docker-compose logs ai-service

# Verify OpenAI API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

#### 4. Meta Ads API Issues

```bash
# Check Meta integration logs
docker-compose logs backend

# Verify Meta app credentials
curl "https://graph.facebook.com/v18.0/me?access_token=$META_ACCESS_TOKEN"
```

## 📈 Performance Optimization

### 1. Frontend Optimization

- Code splitting and lazy loading
- Image optimization
- Caching strategies
- Bundle size optimization

### 2. Backend Optimization

- Database query optimization
- Redis caching
- Background job optimization
- API response compression

### 3. AI Service Optimization

- Model caching
- Batch processing
- Response streaming
- Resource allocation

## 🔮 Future Roadmap

### Phase 1: MVP Enhancements

- [ ] Advanced targeting options
- [ ] A/B testing framework
- [ ] Multi-platform support (Google Ads, TikTok)
- [ ] Advanced analytics dashboard

### Phase 2: AI Capabilities

- [ ] Predictive analytics
- [ ] Automated bid optimization
- [ ] Creative asset generation
- [ ] Customer journey optimization

### Phase 3: Enterprise Features

- [ ] Multi-tenant architecture
- [ ] Advanced reporting
- [ ] API rate limiting
- [ ] White-label solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Project Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)
- **Email**: support@promoly.com

## 🙏 Acknowledgments

- OpenAI for GPT-4o-mini API
- Meta for Facebook Business SDK
- NestJS and FastAPI communities
- Open source contributors

---

**Promoly** - Transforming digital advertising with AI-powered optimization.
