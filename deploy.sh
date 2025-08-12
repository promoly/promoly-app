#!/bin/bash

echo "🚀 Deploying Promoly..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your API keys before continuing."
    echo "Required variables:"
    echo "  - OPENAI_API_KEY"
    echo "  - META_APP_ID"
    echo "  - META_APP_SECRET"
    echo "  - JWT_SECRET"
    read -p "Press Enter after configuring .env file..."
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Initialize database
echo "🗄️  Initializing database..."
docker-compose exec -T backend npx prisma migrate dev --name init
docker-compose exec -T backend npx prisma generate

echo "✅ Deployment complete!"
echo ""
echo "🌐 Services available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001"
echo "  API Docs: http://localhost:3001/api"
echo "  AI Service: http://localhost:8000"
echo ""
echo "📊 View logs with: docker-compose logs -f"
echo "🛑 Stop services with: docker-compose down"
