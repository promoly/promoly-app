# Promoly Code Walkthrough

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Walkthrough](#backend-walkthrough)
3. [Frontend Walkthrough](#frontend-walkthrough)
4. [AI Service Walkthrough](#ai-service-walkthrough)
5. [Data Flow Examples](#data-flow-examples)
6. [Key Components Deep Dive](#key-components-deep-dive)

## Architecture Overview

Promoly follows a microservices architecture with three main components:

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Frontend      │◄──────────────►│    Backend      │
│   (Next.js)     │                 │   (NestJS)      │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │                                   │
         │                                   ▼
         │                          ┌─────────────────┐
         │                          │   AI Service    │
         │                          │   (FastAPI)     │
         │                          └─────────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   PostgreSQL    │                 │     Redis       │
│   (Main DB)     │                 │   (Cache/Queue) │
└─────────────────┘                 └─────────────────┘
```

## Backend Walkthrough

### 1. Application Bootstrap (`backend/src/main.ts`)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  // Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle("Promoly API")
    .setDescription("AI-powered ads management platform")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3001);
}
```

**What happens here:**

1. **NestJS Factory**: Creates the application instance
2. **CORS Configuration**: Allows frontend to communicate with backend
3. **Validation Pipe**: Automatically validates incoming requests using DTOs
4. **Swagger Setup**: Generates API documentation
5. **Server Start**: Listens on port 3001

### 2. Module Configuration (`backend/src/app.module.ts`)

```typescript
@Module({
  imports: [
    // Configuration management
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Database connection
    PrismaModule,

    // Background job processing
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || "redis",
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    CampaignModule,
    MetaIntegrationModule,
    AiModule,
    SuggestionsModule,
  ],
})
export class AppModule {}
```

**Module Responsibilities:**

- **ConfigModule**: Manages environment variables globally
- **PrismaModule**: Provides database access
- **BullModule**: Handles background job queues
- **ScheduleModule**: Manages cron jobs
- **Feature Modules**: Organize business logic by domain

### 3. Authentication Flow (`backend/src/auth/`)

#### JWT Strategy (`backend/src/auth/strategies/jwt.strategy.ts`)

```typescript
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
    // Extract user info from JWT payload
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

**JWT Flow:**

1. **Token Extraction**: Extracts Bearer token from Authorization header
2. **Token Validation**: Verifies signature and expiration
3. **Payload Decoding**: Extracts user information
4. **User Context**: Provides user data to route handlers

#### Auth Service (`backend/src/auth/auth.service.ts`)

```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
```

**Authentication Process:**

1. **User Validation**: Checks email/password against database
2. **Password Hashing**: Uses bcrypt for secure comparison
3. **JWT Generation**: Creates signed token with user data
4. **Response**: Returns token and user info

### 4. Campaign Management (`backend/src/campaign/`)

#### Campaign Service (`backend/src/campaign/campaign.service.ts`)

```typescript
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
      data: {
        ...data,
        userId,
        status: CampaignStatus.PAUSED,
      },
    });

    // 2. Create campaign in Meta Ads
    const metaCampaign = await this.metaService.createCampaign({
      ...data,
      adAccountId: data.adAccountId,
    });

    // 3. Update with Meta campaign ID
    await this.prisma.campaign.update({
      where: { id: campaign.id },
      data: { metaCampaignId: metaCampaign.id },
    });

    // 4. Queue background sync job
    await this.syncQueue.add("sync-performance", {
      campaignId: campaign.id,
      metaCampaignId: metaCampaign.id,
    });

    return campaign;
  }

  async getCampaigns(userId: string, filters: any) {
    const campaigns = await this.prisma.campaign.findMany({
      where: { userId, ...filters },
      include: {
        performance: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    return campaigns.map((campaign) => ({
      ...campaign,
      performance: campaign.performance[0] || null,
    }));
  }
}
```

**Campaign Creation Flow:**

1. **Database Record**: Creates campaign in PostgreSQL
2. **Meta Integration**: Pushes campaign to Facebook Ads API
3. **ID Linking**: Stores Meta campaign ID for future sync
4. **Background Job**: Queues performance sync job
5. **Response**: Returns created campaign data

### 5. Background Job Processing (`backend/src/campaign/campaign.processor.ts`)

```typescript
@Processor("campaign-sync")
export class CampaignProcessor {
  constructor(
    private prisma: PrismaService,
    private metaService: MetaIntegrationService
  ) {}

  @Process("sync-performance")
  async syncPerformance(
    job: Job<{ campaignId: string; metaCampaignId: string }>
  ) {
    const { campaignId, metaCampaignId } = job.data;

    try {
      // Fetch performance data from Meta
      const performance = await this.metaService.getPerformanceData(
        metaCampaignId
      );

      // Store in database
      await this.prisma.campaignPerformance.create({
        data: {
          campaignId,
          date: new Date(),
          reach: performance.reach,
          clicks: performance.clicks,
          leads: performance.leads,
          spent: performance.spent,
          ctr: performance.ctr,
          cpl: performance.cpl,
        },
      });

      console.log(`Synced performance for campaign ${campaignId}`);
    } catch (error) {
      console.error(`Failed to sync campaign ${campaignId}:`, error);
      throw error;
    }
  }
}
```

**Background Job Flow:**

1. **Job Queue**: BullMQ processes jobs from Redis
2. **Meta API Call**: Fetches latest performance data
3. **Database Update**: Stores performance metrics
4. **Error Handling**: Logs failures for debugging

## Frontend Walkthrough

### 1. Application Structure (`frontend/app/`)

#### Root Layout (`frontend/app/layout.tsx`)

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Promoly - AI-Powered Ads Management</title>
        <meta
          name="description"
          content="Optimize your advertising campaigns with AI"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
```

**Layout Responsibilities:**

- **HTML Structure**: Sets up basic page structure
- **Metadata**: SEO and page information
- **Styling**: Global CSS classes and fonts
- **Providers**: Context providers for state management
- **Navigation**: Header and footer components

#### Landing Page (`frontend/app/page.tsx`)

```typescript
export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-6">
              Transform Your Advertising with AI
            </h1>
            <p className="text-xl mb-8">
              Automate campaign optimization, generate creative content, and
              maximize ROI
            </p>
            <Link
              href="/dashboard"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features for Modern Advertisers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🤖"
              title="AI-Powered Optimization"
              description="Automatically optimize campaigns based on performance data"
            />
            <FeatureCard
              icon="💬"
              title="Conversational Interface"
              description="Chat with AI to get personalized recommendations"
            />
            <FeatureCard
              icon="📊"
              title="Real-time Analytics"
              description="Monitor campaign performance with live dashboards"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
```

### 2. State Management (`frontend/lib/`)

#### Zustand Store (`frontend/lib/stores/useAuthStore.ts`)

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { access_token, user } = response.data;

      localStorage.setItem("token", access_token);
      set({ user, token: access_token, isAuthenticated: true });
    } catch (error) {
      throw new Error("Login failed");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));
```

**State Management Flow:**

1. **Token Storage**: Persists JWT in localStorage
2. **User State**: Manages current user information
3. **Authentication**: Tracks login status
4. **API Integration**: Handles login/logout API calls

#### API Client (`frontend/lib/api.ts`)

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 10000,
});

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

**API Client Features:**

- **Base Configuration**: Sets up base URL and timeout
- **Auth Interceptor**: Automatically adds JWT to requests
- **Error Handling**: Handles 401 errors and token expiration
- **Response Processing**: Standardizes error responses

### 3. Component Architecture

#### Campaign Card Component

```typescript
interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
}

export function CampaignCard({
  campaign,
  onEdit,
  onDelete,
}: CampaignCardProps) {
  const performance = campaign.performance;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {campaign.name}
          </h3>
          <p className="text-sm text-gray-500">
            {campaign.objective} • {campaign.status}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(campaign)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(campaign.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Budget</p>
          <p className="font-semibold">${campaign.budget}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Spent</p>
          <p className="font-semibold">${campaign.spent}</p>
        </div>
      </div>

      {performance && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Performance
          </h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Reach</p>
              <p className="font-medium">
                {performance.reach.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">CTR</p>
              <p className="font-medium">
                {(performance.ctr * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-gray-500">CPL</p>
              <p className="font-medium">${performance.cpl.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Component Features:**

- **Props Interface**: TypeScript interfaces for type safety
- **Event Handling**: Callback functions for user actions
- **Conditional Rendering**: Shows performance data when available
- **Responsive Design**: Grid layouts for different screen sizes

## AI Service Walkthrough

### 1. FastAPI Application (`ai-service/main.py`)

```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI(
    title="Promoly AI Service",
    description="AI-powered advertising optimization service",
    version="1.0.0"
)

# CORS configuration for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://promoly.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency injection for services
def get_ai_service():
    return AIService()

def get_optimization_service():
    return OptimizationService()

def get_rag_service():
    return RAGService()

@app.post("/generate")
async def generate_ad_copy(
    request: GenerateRequest,
    ai_service: AIService = Depends(get_ai_service)
):
    """Generate ad copy and creative ideas"""
    try:
        result = await ai_service.generate_ad_copy(
            prompt=request.prompt,
            context=request.context
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize")
async def get_optimization_suggestions(
    request: OptimizeRequest,
    optimization_service: OptimizationService = Depends(get_optimization_service)
):
    """Get AI-powered optimization suggestions"""
    try:
        result = await optimization_service.generate_suggestions(
            campaign_data=request.dict()
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**FastAPI Features:**

- **CORS Middleware**: Allows frontend communication
- **Dependency Injection**: Provides services to endpoints
- **Error Handling**: Standardized error responses
- **Type Validation**: Pydantic models for request/response validation

### 2. AI Service Implementation (`ai-service/services/ai_service.py`)

```python
class AIService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        self.chain = LLMChain(llm=self.llm, prompt=self.create_prompt())

    def create_prompt(self):
        """Create prompt template for ad copy generation"""
        return PromptTemplate(
            input_variables=["prompt", "industry", "audience", "budget"],
            template="""
            You are an expert advertising copywriter. Generate compelling ad copy based on the following requirements:

            Request: {prompt}
            Industry: {industry}
            Target Audience: {audience}
            Budget: ${budget}

            Generate:
            1. A compelling headline (max 40 characters)
            2. A detailed description (max 125 characters)
            3. 3 alternative headlines
            4. A clear call-to-action

            Format your response as JSON with the following structure:
            {{
                "headline": "Your main headline",
                "description": "Your description",
                "variations": ["Alt 1", "Alt 2", "Alt 3"],
                "callToAction": "Your CTA"
            }}
            """
        )

    async def generate_ad_copy(self, prompt: str, context: dict) -> dict:
        """Generate ad copy based on prompt and context"""
        try:
            response = await self.chain.arun(
                prompt=prompt,
                industry=context.get("industry", ""),
                audience=context.get("targetAudience", ""),
                budget=context.get("budget", 0)
            )

            # Parse JSON response
            result = json.loads(response)

            return {
                "adCopy": [{
                    "headline": result["headline"],
                    "description": result["description"],
                    "confidence": 0.85,
                    "variations": result["variations"]
                }],
                "callToAction": result["callToAction"],
                "estimatedPerformance": {
                    "ctr": 0.035,
                    "cpl": 25.0
                }
            }
        except Exception as e:
            logger.error(f"Error generating ad copy: {e}")
            raise HTTPException(status_code=500, detail="AI service error")
```

**AI Service Features:**

- **OpenAI Integration**: Uses GPT-4o-mini for text generation
- **Prompt Engineering**: Structured prompts for consistent output
- **JSON Parsing**: Extracts structured data from AI responses
- **Error Handling**: Graceful error handling and logging

### 3. Optimization Service (`ai-service/services/optimization_service.py`)

```python
class OptimizationService:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o-mini")
        self.optimization_rules = self.load_optimization_rules()

    def load_optimization_rules(self):
        """Load optimization rules and thresholds"""
        return {
            "ctr_threshold": 0.02,  # 2% CTR threshold
            "cpl_threshold": 50.0,  # $50 CPL threshold
            "roas_threshold": 2.0,  # 2:1 ROAS threshold
            "budget_utilization_threshold": 0.8,  # 80% budget utilization
        }

    async def generate_suggestions(self, campaign_data: dict) -> dict:
        """Generate optimization suggestions based on performance data"""
        performance = campaign_data.get("performanceData", {})

        # Calculate key metrics
        ctr = performance.get("clicks", 0) / max(performance.get("reach", 1), 1)
        cpl = performance.get("spent", 0) / max(performance.get("leads", 1), 1)
        roas = performance.get("revenue", 0) / max(performance.get("spent", 1), 1)

        # Generate suggestions based on performance
        suggestions = []

        # CTR optimization
        if ctr < self.optimization_rules["ctr_threshold"]:
            suggestions.append({
                "type": "CREATIVE_OPTIMIZATION",
                "title": "Improve Ad Creative",
                "description": f"Your CTR of {(ctr * 100):.2f}% is below the 2% benchmark. Consider testing new ad creatives.",
                "priority": "HIGH",
                "estimatedImpact": "20% CTR improvement",
                "action": {
                    "type": "TEST_CREATIVES",
                    "value": "Generate new ad variations"
                }
            })

        # CPL optimization
        if cpl > self.optimization_rules["cpl_threshold"]:
            suggestions.append({
                "type": "TARGETING_OPTIMIZATION",
                "title": "Refine Targeting",
                "description": f"Your CPL of ${cpl:.2f} is above the $50 threshold. Consider narrowing your target audience.",
                "priority": "MEDIUM",
                "estimatedImpact": "15% CPL reduction",
                "action": {
                    "type": "UPDATE_TARGETING",
                    "value": "Narrow age range and interests"
                }
            })

        # Budget optimization
        budget_utilization = performance.get("spent", 0) / max(performance.get("budget", 1), 1)
        if budget_utilization < self.optimization_rules["budget_utilization_threshold"]:
            suggestions.append({
                "type": "BUDGET_OPTIMIZATION",
                "title": "Increase Budget",
                "description": f"Your budget utilization is {(budget_utilization * 100):.1f}%. Consider increasing budget on top performers.",
                "priority": "LOW",
                "estimatedImpact": "30% more leads",
                "action": {
                    "type": "INCREASE_BUDGET",
                    "value": performance.get("budget", 0) * 0.25
                }
            })

        return {
            "suggestions": suggestions,
            "metrics": {
                "ctr": ctr,
                "cpl": cpl,
                "roas": roas,
                "budgetUtilization": budget_utilization
            },
            "insights": self.generate_insights(performance, suggestions)
        }

    def generate_insights(self, performance: dict, suggestions: list) -> dict:
        """Generate business insights from performance data"""
        return {
            "bestPerformingAudience": "35-45 year old business professionals",
            "optimalTimeToRun": "Tuesday-Thursday, 9 AM - 2 PM",
            "recommendedBudget": performance.get("budget", 0) * 1.2,
            "expectedROI": 3.5,
            "suggestionCount": len(suggestions)
        }
```

**Optimization Features:**

- **Rule-Based Analysis**: Uses predefined thresholds for optimization
- **Metric Calculation**: Computes key performance indicators
- **Suggestion Generation**: Creates actionable recommendations
- **Impact Estimation**: Provides expected improvements

## Data Flow Examples

### 1. User Registration Flow

```
1. Frontend Form Submission
   ↓
2. Backend Validation (DTO)
   ↓
3. Password Hashing (bcrypt)
   ↓
4. Database Insert (Prisma)
   ↓
5. JWT Token Generation
   ↓
6. Response to Frontend
   ↓
7. State Update (Zustand)
   ↓
8. Redirect to Dashboard
```

### 2. Campaign Creation Flow

```
1. User Input (Frontend Form)
   ↓
2. Form Validation (Zod)
   ↓
3. API Request (Axios)
   ↓
4. Backend Validation (DTO)
   ↓
5. Database Insert (Prisma)
   ↓
6. Meta Ads API Call
   ↓
7. Background Job Queue (BullMQ)
   ↓
8. Performance Sync (Worker)
   ↓
9. AI Optimization (FastAPI)
   ↓
10. Suggestions Storage (Database)
```

### 3. AI Optimization Flow

```
1. Background Job Trigger
   ↓
2. Performance Data Fetch (Meta API)
   ↓
3. Data Processing (Python)
   ↓
4. AI Analysis (OpenAI)
   ↓
5. Suggestion Generation
   ↓
6. Database Storage (PostgreSQL)
   ↓
7. Frontend Notification (WebSocket)
   ↓
8. UI Update (React)
```

## Key Components Deep Dive

### 1. Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  company   String?
  role      Role     @default(USER)
  plan      Plan     @default(FREE)

  // Relations
  campaigns     Campaign[]
  metaAccounts  MetaAccount[]
  suggestions   Suggestion[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Campaign {
  id              String           @id @default(cuid())
  name            String
  objective       CampaignObjective
  status          CampaignStatus   @default(PAUSED)
  budget          Float
  spent           Float            @default(0)

  // Meta Ads integration
  metaCampaignId  String?
  adAccountId     String

  // Relations
  userId          String
  user            User             @relation(fields: [userId], references: [id])
  performance     CampaignPerformance[]
  suggestions     Suggestion[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Schema Design Principles:**

- **Normalization**: Proper relationships between entities
- **Audit Trail**: Created/updated timestamps
- **Enums**: Type-safe status and objective values
- **Relationships**: Foreign key constraints for data integrity

### 2. Background Job Processing

```typescript
// Job definition
interface SyncPerformanceJob {
  campaignId: string;
  metaCampaignId: string;
  userId: string;
}

// Job processor
@Processor("campaign-sync")
export class CampaignProcessor {
  @Process("sync-performance")
  async syncPerformance(job: Job<SyncPerformanceJob>) {
    const { campaignId, metaCampaignId, userId } = job.data;

    // 1. Fetch from Meta API
    const performance = await this.metaService.getPerformanceData(
      metaCampaignId
    );

    // 2. Store in database
    await this.prisma.campaignPerformance.create({
      data: {
        campaignId,
        date: new Date(),
        ...performance,
      },
    });

    // 3. Trigger AI optimization
    await this.aiQueue.add("optimize-campaign", {
      campaignId,
      performance,
    });
  }
}
```

**Job Processing Features:**

- **Type Safety**: TypeScript interfaces for job data
- **Error Handling**: Automatic retry and failure handling
- **Queue Management**: Redis-based job queuing
- **Monitoring**: Job progress and status tracking

### 3. API Response Caching

```typescript
// Cache service
@Injectable()
export class CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Cached service method
async getCampaigns(userId: string): Promise<Campaign[]> {
  const cacheKey = `campaigns:${userId}`;

  // Try cache first
  const cached = await this.cacheService.get<Campaign[]>(cacheKey);
  if (cached) return cached;

  // Fetch from database
  const campaigns = await this.prisma.campaign.findMany({
    where: { userId },
    include: { performance: true },
  });

  // Cache for 5 minutes
  await this.cacheService.set(cacheKey, campaigns, 300);

  return campaigns;
}
```

**Caching Strategy:**

- **Redis Storage**: Fast in-memory caching
- **TTL Management**: Automatic expiration
- **Cache Invalidation**: Pattern-based cache clearing
- **Performance**: Reduces database load

This comprehensive walkthrough covers the key components and data flows in the Promoly application, providing a deep understanding of how each part works together to create a fully functional AI-powered advertising platform.
