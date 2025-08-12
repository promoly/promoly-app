# Promoly Quick Start Guide

Get Promoly up and running in 5 minutes! 🚀

## Prerequisites

- Docker and Docker Compose installed
- OpenAI API key
- Meta Ads API credentials (optional for initial testing)

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd promoly

# Copy environment template
cp env.example .env
```

## Step 2: Configure Environment

Edit `.env` file and add your API keys:

```bash
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional (for Meta Ads integration)
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret

# Generate a secure JWT secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## Step 3: Deploy

```bash
# Run the deployment script
./deploy.sh

# Or manually:
docker-compose up --build -d
```

## Step 4: Initialize Database

```bash
# Run database migrations
docker-compose exec backend npx prisma migrate dev --name init
docker-compose exec backend npx prisma generate
```

## Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:3001/api
- **AI Service**: http://localhost:8000

## Quick Test

1. Open http://localhost:3000
2. Register a new account
3. Connect your Meta Ads account (optional)
4. Create your first campaign
5. Chat with the AI assistant for optimization tips

## Troubleshooting

### Services not starting?

```bash
# Check logs
docker-compose logs

# Restart services
docker-compose down
docker-compose up --build -d
```

### Database connection issues?

```bash
# Check if PostgreSQL is running
docker-compose ps

# Reset database
docker-compose down -v
docker-compose up --build -d
```

### AI service not responding?

- Verify your OpenAI API key is correct
- Check AI service logs: `docker-compose logs ai-service`

## Next Steps

- [Read the full documentation](README.md)
- [Explore the API](http://localhost:3001/api)
- [Check out the code structure](README.md#project-structure)

## Support

- Create an issue in the repository
- Check the logs: `docker-compose logs -f`
- Review the troubleshooting section in the main README

---

Happy optimizing! 🎯
