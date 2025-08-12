# Promoly API Documentation

## Table of Contents

1. [Authentication](#authentication)
2. [Base URL](#base-url)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Endpoints](#endpoints)
   - [Authentication](#authentication-endpoints)
   - [Users](#user-endpoints)
   - [Campaigns](#campaign-endpoints)
   - [Meta Integration](#meta-integration-endpoints)
   - [AI Service](#ai-service-endpoints)
   - [Suggestions](#suggestions-endpoints)

## Authentication

Promoly uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Token Format

- **Algorithm**: HS256
- **Expiration**: 24 hours
- **Issuer**: Promoly API

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.promoly.com`

## Error Handling

### Standard Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/register",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **API endpoints**: 100 requests per minute per user
- **AI service endpoints**: 10 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Endpoints

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
  "company": "Acme Corp",
  "phone": "+1234567890"
}
```

**Validation Rules:**

- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters, must contain uppercase, lowercase, number
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `company`: Optional, 2-100 characters
- `phone`: Optional, valid phone format

**Response (201):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp",
  "role": "USER",
  "plan": "FREE",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- `400` - Validation error
- `409` - Email already exists

#### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "plan": "FREE"
  }
}
```

**Error Responses:**

- `401` - Invalid credentials
- `422` - Validation error

#### POST /auth/refresh

Refresh JWT token.

**Headers:** `Authorization: Bearer <current_token>`

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

#### POST /auth/logout

Logout user (invalidate token).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "message": "Successfully logged out"
}
```

### User Endpoints

#### GET /users/me

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp",
  "phone": "+1234567890",
  "role": "USER",
  "plan": "FREE",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "metaAccounts": [
    {
      "id": "meta-account-uuid",
      "adAccountId": "act_123456789",
      "name": "Acme Corp Ad Account",
      "status": "ACTIVE",
      "connectedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### PUT /users/me

Update current user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "company": "New Company",
  "phone": "+1234567890"
}
```

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "company": "New Company",
  "phone": "+1234567890",
  "role": "USER",
  "plan": "FREE",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### POST /users/me/change-password

Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200):**

```json
{
  "message": "Password changed successfully"
}
```

### Campaign Endpoints

#### GET /campaigns

Get user's campaigns with performance data.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `status` (optional): Filter by status (ACTIVE, PAUSED, COMPLETED)
- `objective` (optional): Filter by objective (AWARENESS, CONSIDERATION, CONVERSIONS)

**Response (200):**

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
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z",
      "targeting": {
        "ageRange": [25, 45],
        "locations": ["US"],
        "interests": ["technology", "business"]
      },
      "performance": {
        "reach": 12500,
        "impressions": 15000,
        "clicks": 340,
        "leads": 27,
        "ctr": 0.027,
        "cpl": 16.67,
        "roas": 3.2
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### GET /campaigns/:id

Get specific campaign details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "id": "campaign-uuid",
  "name": "Summer Sale Campaign",
  "objective": "LEADS",
  "status": "ACTIVE",
  "budget": 1000,
  "spent": 450,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "targeting": {
    "ageRange": [25, 45],
    "locations": ["US"],
    "interests": ["technology", "business"],
    "gender": ["MALE", "FEMALE"],
    "languages": ["en"]
  },
  "performance": {
    "reach": 12500,
    "impressions": 15000,
    "clicks": 340,
    "leads": 27,
    "ctr": 0.027,
    "cpl": 16.67,
    "roas": 3.2,
    "frequency": 1.2,
    "cpm": 30.0
  },
  "ads": [
    {
      "id": "ad-uuid",
      "name": "Summer Sale Ad 1",
      "status": "ACTIVE",
      "creative": {
        "imageUrl": "https://example.com/image.jpg",
        "headline": "Summer Sale - 50% Off",
        "description": "Limited time offer on all products"
      },
      "performance": {
        "reach": 8000,
        "clicks": 200,
        "leads": 15
      }
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### POST /campaigns

Create a new campaign.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "New Campaign",
  "objective": "LEADS",
  "budget": 1000,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "targeting": {
    "ageRange": [25, 45],
    "locations": ["US"],
    "interests": ["technology", "business"],
    "gender": ["MALE", "FEMALE"],
    "languages": ["en"]
  },
  "adAccountId": "act_123456789"
}
```

**Validation Rules:**

- `name`: Required, 3-100 characters
- `objective`: Required, one of [AWARENESS, CONSIDERATION, CONVERSIONS, LEADS, SALES]
- `budget`: Required, minimum 10, maximum 100000
- `startDate`: Required, future date
- `endDate`: Required, after startDate
- `targeting`: Required object with valid targeting options
- `adAccountId`: Required, valid Meta Ads account ID

**Response (201):**

```json
{
  "id": "campaign-uuid",
  "name": "New Campaign",
  "objective": "LEADS",
  "status": "PAUSED",
  "budget": 1000,
  "spent": 0,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "targeting": {
    "ageRange": [25, 45],
    "locations": ["US"],
    "interests": ["technology", "business"]
  },
  "metaCampaignId": "123456789",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /campaigns/:id

Update campaign.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Updated Campaign Name",
  "budget": 1500,
  "status": "ACTIVE"
}
```

**Response (200):**

```json
{
  "id": "campaign-uuid",
  "name": "Updated Campaign Name",
  "objective": "LEADS",
  "status": "ACTIVE",
  "budget": 1500,
  "spent": 450,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### DELETE /campaigns/:id

Delete campaign.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "message": "Campaign deleted successfully"
}
```

#### GET /campaigns/:id/performance

Get detailed performance data for a campaign.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `period` (optional): Time period (day, week, month, custom)
- `startDate` (optional): Custom start date
- `endDate` (optional): Custom end date

**Response (200):**

```json
{
  "campaignId": "campaign-uuid",
  "period": "month",
  "data": [
    {
      "date": "2024-01-01",
      "reach": 1250,
      "impressions": 1500,
      "clicks": 34,
      "leads": 3,
      "spent": 45,
      "ctr": 0.027,
      "cpl": 15.0,
      "roas": 3.2
    }
  ],
  "summary": {
    "totalReach": 12500,
    "totalImpressions": 15000,
    "totalClicks": 340,
    "totalLeads": 27,
    "totalSpent": 450,
    "avgCtr": 0.027,
    "avgCpl": 16.67,
    "avgRoas": 3.2
  }
}
```

### Meta Integration Endpoints

#### GET /meta/accounts

Get connected Meta Ads accounts.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "accounts": [
    {
      "id": "meta-account-uuid",
      "adAccountId": "act_123456789",
      "name": "Acme Corp Ad Account",
      "status": "ACTIVE",
      "currency": "USD",
      "timezone": "America/New_York",
      "connectedAt": "2024-01-01T00:00:00.000Z",
      "lastSyncAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /meta/connect

Connect Meta Ads account.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "adAccountId": "act_123456789",
  "accessToken": "meta_access_token"
}
```

**Response (201):**

```json
{
  "id": "meta-account-uuid",
  "adAccountId": "act_123456789",
  "name": "Acme Corp Ad Account",
  "status": "ACTIVE",
  "currency": "USD",
  "timezone": "America/New_York",
  "connectedAt": "2024-01-01T00:00:00.000Z"
}
```

#### DELETE /meta/accounts/:id

Disconnect Meta Ads account.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "message": "Meta Ads account disconnected successfully"
}
```

#### POST /meta/sync

Manually trigger campaign sync.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "accountId": "meta-account-uuid"
}
```

**Response (200):**

```json
{
  "message": "Sync initiated successfully",
  "jobId": "sync-job-uuid"
}
```

### AI Service Endpoints

#### POST /ai/generate

Generate ad copy and creative ideas.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "prompt": "Generate ad copy for a tech startup",
  "context": {
    "industry": "technology",
    "targetAudience": "business professionals",
    "budget": 1000,
    "objective": "LEADS",
    "brandVoice": "professional",
    "keyFeatures": ["AI-powered", "automation", "efficiency"]
  }
}
```

**Response (200):**

```json
{
  "adCopy": [
    {
      "headline": "Transform Your Business with AI-Powered Automation",
      "description": "Streamline operations and boost efficiency with our cutting-edge AI solutions. Start your free trial today!",
      "confidence": 0.92,
      "variations": [
        "Supercharge Your Workflow with AI",
        "Automate Everything, Focus on Growth"
      ]
    }
  ],
  "creativeIdeas": [
    {
      "type": "image",
      "description": "Professional team collaborating on digital dashboard",
      "style": "modern, clean, tech-focused"
    },
    {
      "type": "video",
      "description": "Before/after workflow comparison",
      "duration": "15 seconds"
    }
  ],
  "callToAction": "Start Free Trial",
  "estimatedPerformance": {
    "ctr": 0.035,
    "cpl": 25.0
  }
}
```

#### POST /ai/optimize

Get AI-powered optimization suggestions.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "campaignId": "campaign-uuid",
  "performanceData": {
    "reach": 12500,
    "clicks": 340,
    "leads": 27,
    "spent": 450,
    "ctr": 0.027,
    "cpl": 16.67
  },
  "historicalData": [
    {
      "date": "2024-01-01",
      "reach": 1200,
      "clicks": 30,
      "leads": 2,
      "spent": 40
    }
  ]
}
```

**Response (200):**

```json
{
  "suggestions": [
    {
      "id": "suggestion-uuid",
      "type": "BUDGET_OPTIMIZATION",
      "title": "Increase Budget on Top Performing Ad",
      "description": "Your best performing ad has a 40% higher CTR than average. Consider increasing its budget by 25%.",
      "priority": "HIGH",
      "estimatedImpact": {
        "metric": "leads",
        "improvement": "30%",
        "confidence": 0.85
      },
      "action": {
        "type": "INCREASE_BUDGET",
        "value": 250,
        "targetAdId": "ad-uuid"
      }
    },
    {
      "id": "suggestion-uuid-2",
      "type": "TARGETING_OPTIMIZATION",
      "title": "Refine Age Targeting",
      "description": "Users aged 35-45 show 60% higher conversion rates. Consider narrowing your age range.",
      "priority": "MEDIUM",
      "estimatedImpact": {
        "metric": "cpl",
        "improvement": "15%",
        "confidence": 0.75
      },
      "action": {
        "type": "UPDATE_TARGETING",
        "value": {
          "ageRange": [35, 45]
        }
      }
    }
  ],
  "insights": {
    "bestPerformingAudience": "35-45 year old business professionals",
    "optimalTimeToRun": "Tuesday-Thursday, 9 AM - 2 PM",
    "recommendedBudget": 1200,
    "expectedROI": 3.5
  }
}
```

#### POST /ai/chat

Chat with AI assistant for marketing advice.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "message": "How can I improve my ad's click-through rate?",
  "context": {
    "campaignId": "campaign-uuid",
    "currentPerformance": {
      "ctr": 0.02,
      "cpl": 20.0
    }
  },
  "conversationHistory": [
    {
      "role": "user",
      "content": "My ads aren't performing well"
    },
    {
      "role": "assistant",
      "content": "I can help you optimize your campaigns. What specific metrics are you seeing?"
    }
  ]
}
```

**Response (200):**

```json
{
  "response": "Based on your current CTR of 2%, here are some strategies to improve it:\n\n1. **Test different ad creatives** - Try new images, videos, or carousel ads\n2. **Optimize your headlines** - Use action words and include your value proposition\n3. **Improve your targeting** - Focus on more specific audience segments\n4. **A/B test your landing pages** - Ensure they match your ad messaging\n\nWould you like me to generate some specific ad copy variations for you?",
  "suggestions": [
    "Generate new ad creatives",
    "Review targeting options",
    "Analyze competitor ads"
  ],
  "confidence": 0.88
}
```

#### POST /ai/rag/query

Query the marketing knowledge base.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "query": "What are the best practices for Facebook ad targeting?",
  "context": {
    "industry": "e-commerce",
    "budget": 1000,
    "objective": "SALES"
  }
}
```

**Response (200):**

```json
{
  "answer": "Here are the key Facebook ad targeting best practices for e-commerce:\n\n1. **Start Broad, Then Narrow**: Begin with broader audiences and let Facebook's algorithm find your best customers\n2. **Use Lookalike Audiences**: Create audiences based on your best customers\n3. **Leverage Custom Audiences**: Target people who have visited your website or engaged with your content\n4. **Consider Demographics**: Age, location, and interests matter for e-commerce\n5. **Test Different Placements**: Try different ad placements (feed, stories, marketplace)\n\nFor your $1000 budget, I recommend starting with 3-5 different audience segments to test.",
  "sources": [
    {
      "title": "Facebook Ads Best Practices",
      "category": "targeting",
      "relevance": 0.95
    },
    {
      "title": "E-commerce Advertising Guide",
      "category": "industry_specific",
      "relevance": 0.88
    }
  ],
  "confidence": 0.92
}
```

### Suggestions Endpoints

#### GET /suggestions

Get AI-generated suggestions.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED)
- `type` (optional): Filter by type (BUDGET_OPTIMIZATION, TARGETING_OPTIMIZATION, CREATIVE_OPTIMIZATION)

**Response (200):**

```json
{
  "suggestions": [
    {
      "id": "suggestion-uuid",
      "type": "BUDGET_OPTIMIZATION",
      "title": "Increase Budget on Top Performing Ad",
      "description": "Your best performing ad has a 40% higher CTR than average. Consider increasing its budget by 25%.",
      "priority": "HIGH",
      "status": "PENDING",
      "estimatedImpact": {
        "metric": "leads",
        "improvement": "30%",
        "confidence": 0.85
      },
      "action": {
        "type": "INCREASE_BUDGET",
        "value": 250,
        "targetAdId": "ad-uuid"
      },
      "campaignId": "campaign-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

#### GET /suggestions/:id

Get specific suggestion details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "id": "suggestion-uuid",
  "type": "BUDGET_OPTIMIZATION",
  "title": "Increase Budget on Top Performing Ad",
  "description": "Your best performing ad has a 40% higher CTR than average. Consider increasing its budget by 25%.",
  "priority": "HIGH",
  "status": "PENDING",
  "estimatedImpact": {
    "metric": "leads",
    "improvement": "30%",
    "confidence": 0.85
  },
  "action": {
    "type": "INCREASE_BUDGET",
    "value": 250,
    "targetAdId": "ad-uuid"
  },
  "campaignId": "campaign-uuid",
  "reasoning": "Analysis of your campaign data shows that Ad #1 consistently outperforms others with a 40% higher CTR and 25% lower CPL. Increasing its budget allocation could significantly improve overall campaign performance.",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### POST /suggestions/:id/approve

Approve and execute a suggestion.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "notes": "Approved based on strong performance data"
}
```

**Response (200):**

```json
{
  "message": "Suggestion approved and executed successfully",
  "executionId": "execution-uuid",
  "status": "COMPLETED",
  "executedAt": "2024-01-01T00:00:00.000Z"
}
```

#### POST /suggestions/:id/reject

Reject a suggestion.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "reason": "Budget constraints prevent implementation"
}
```

**Response (200):**

```json
{
  "message": "Suggestion rejected successfully",
  "status": "REJECTED",
  "rejectedAt": "2024-01-01T00:00:00.000Z"
}
```

#### POST /suggestions/:id/snooze

Snooze a suggestion for later review.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "snoozeUntil": "2024-01-15T00:00:00.000Z",
  "reason": "Will review after current campaign ends"
}
```

**Response (200):**

```json
{
  "message": "Suggestion snoozed successfully",
  "status": "SNOOZED",
  "snoozedUntil": "2024-01-15T00:00:00.000Z"
}
```

## Webhook Endpoints

### POST /webhooks/meta

Receive Meta Ads webhooks for real-time updates.

**Headers:** `X-Hub-Signature-256: <signature>`

**Request Body:**

```json
{
  "object": "ad_account",
  "entry": [
    {
      "id": "act_123456789",
      "time": 1640995200,
      "changes": [
        {
          "field": "spend",
          "value": {
            "amount": 1000,
            "currency": "USD"
          }
        }
      ]
    }
  ]
}
```

**Response (200):**

```json
{
  "status": "ok"
}
```

## Health Check Endpoints

### GET /health

Check API health status.

**Response (200):**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "ai_service": "healthy",
    "meta_api": "healthy"
  }
}
```

### GET /health/detailed

Get detailed health information.

**Response (200):**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 86400,
  "memory": {
    "used": 512,
    "total": 1024,
    "percentage": 50
  },
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 15,
      "connections": 5
    },
    "redis": {
      "status": "healthy",
      "responseTime": 2,
      "memory": 256
    },
    "ai_service": {
      "status": "healthy",
      "responseTime": 150,
      "queueSize": 0
    },
    "meta_api": {
      "status": "healthy",
      "responseTime": 200,
      "rateLimitRemaining": 95
    }
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript SDK

```bash
npm install @promoly/sdk
```

```javascript
import { PromolyClient } from "@promoly/sdk";

const client = new PromolyClient({
  apiKey: "your_api_key",
  baseUrl: "https://api.promoly.com",
});

// Create campaign
const campaign = await client.campaigns.create({
  name: "New Campaign",
  objective: "LEADS",
  budget: 1000,
});

// Get AI suggestions
const suggestions = await client.ai.getOptimizationSuggestions({
  campaignId: campaign.id,
});
```

### Python SDK

```bash
pip install promoly-sdk
```

```python
from promoly import PromolyClient

client = PromolyClient(
    api_key='your_api_key',
    base_url='https://api.promoly.com'
)

# Generate ad copy
ad_copy = client.ai.generate_ad_copy(
    prompt="Generate ad copy for tech startup",
    context={"industry": "technology"}
)
```

## Rate Limits and Quotas

### Free Plan

- 100 API requests per day
- 5 AI generations per day
- 1 Meta Ads account
- 5 campaigns maximum

### Pro Plan

- 10,000 API requests per day
- 100 AI generations per day
- 5 Meta Ads accounts
- Unlimited campaigns

### Enterprise Plan

- Unlimited API requests
- Unlimited AI generations
- Unlimited Meta Ads accounts
- Unlimited campaigns
- Priority support

## Error Codes Reference

| Code             | Message                  | Description                              |
| ---------------- | ------------------------ | ---------------------------------------- |
| `AUTH_001`       | Invalid credentials      | Email or password is incorrect           |
| `AUTH_002`       | Token expired            | JWT token has expired                    |
| `AUTH_003`       | Invalid token            | JWT token is malformed                   |
| `AUTH_004`       | Insufficient permissions | User lacks required permissions          |
| `CAMPAIGN_001`   | Campaign not found       | Campaign with specified ID doesn't exist |
| `CAMPAIGN_002`   | Invalid campaign status  | Cannot perform action on current status  |
| `CAMPAIGN_003`   | Budget exceeded          | Campaign budget limit reached            |
| `META_001`       | Invalid access token     | Meta Ads access token is invalid         |
| `META_002`       | Account not found        | Meta Ads account doesn't exist           |
| `META_003`       | Insufficient permissions | No permission to access Meta Ads account |
| `AI_001`         | Service unavailable      | AI service is temporarily unavailable    |
| `AI_002`         | Rate limit exceeded      | AI service rate limit reached            |
| `AI_003`         | Invalid prompt           | AI prompt is too long or inappropriate   |
| `VALIDATION_001` | Required field missing   | Required field is not provided           |
| `VALIDATION_002` | Invalid format           | Field format is invalid                  |
| `VALIDATION_003` | Value out of range       | Field value is outside allowed range     |

## Support and Contact

- **API Documentation**: https://docs.promoly.com
- **SDK Documentation**: https://docs.promoly.com/sdk
- **Support Email**: api-support@promoly.com
- **Status Page**: https://status.promoly.com
- **Community Forum**: https://community.promoly.com
