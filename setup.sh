#!/bin/bash

# Blood Donation Web Application - Quick Setup Script
# Run this script to quickly set up the entire project

echo "🚀 Blood Donation Web Application Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --save-dev concurrently

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating server .env file..."
    cp .env.example .env
    echo "⚠️  Please edit server/.env with your configuration"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Edit server/.env with your MongoDB URI and other settings"
echo "2. Make sure MongoDB is running"
echo "3. Run 'npm run dev' to start both frontend and backend"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
