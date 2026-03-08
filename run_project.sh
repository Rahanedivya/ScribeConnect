#!/bin/bash

# ScribeConnect One-Click Setup & Run Script (Mac/Linux)

echo "=========================================="
echo "   ScribeConnect - One-Click Setup & Run"
echo "=========================================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node -v)"

# Function to setup and start backend
setup_backend() {
    echo ""
    echo "🔧 Setting up Backend..."
    cd backend

    if [ ! -d "node_modules" ]; then
        echo "   Installing backend dependencies..."
        npm install
    else
        echo "   Backend dependencies already installed."
    fi

    if [ ! -f ".env" ]; then
        echo "   Creating backend .env file..."
        cp .env.example .env
        echo "   ⚠️  IMPORTANT: Please edit backend/.env and update MONGODB_URI with your database credentials!"
    else
        echo "   Backend .env file exists."
    fi

    cd ..
}

# Function to setup and start frontend
setup_frontend() {
    echo ""
    echo "🎨 Setting up Frontend..."
    cd frontend

    if [ ! -d "node_modules" ]; then
        echo "   Installing frontend dependencies..."
        npm install
    else
        echo "   Frontend dependencies already installed."
    fi

    if [ ! -f ".env" ]; then
        echo "   Creating frontend .env file..."
        cp .env.example .env
    else
        echo "   Frontend .env file exists."
    fi

    cd ..
}

# Main Execution
setup_backend
setup_frontend

echo ""
echo "=========================================="
echo "🚀 Starting ScribeAI..."
echo "=========================================="
echo "Press Ctrl+C to stop the servers."

# Start Backend and Frontend in parallel using a subshell trap
(trap 'kill 0' SIGINT; \
 cd backend && npm run dev & \
 cd frontend && npm run dev)

