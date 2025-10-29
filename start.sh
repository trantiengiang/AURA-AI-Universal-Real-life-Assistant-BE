#!/bin/bash

echo "🚀 Starting AURA Backend API..."
echo

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️ Setting up environment..."
    npm run setup
    echo
fi

# Start the server
echo "🌐 Starting server on http://localhost:5000"
echo "📱 Web Tester will be available at http://localhost:5000"
echo
echo "Press Ctrl+C to stop the server"
echo

npm run dev




