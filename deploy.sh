#!/bin/bash

echo "🚀 QarzDaftar Deployment Script"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    exit 1
fi

# Check if remote origin is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Git remote origin not set. Please add your GitHub repository:"
    echo "   git remote add origin <your-github-repo-url>"
    exit 1
fi

echo "✅ Git repository ready"

# Build frontend
echo "🔨 Building frontend..."
cd client
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend built successfully"
cd ..

# Build backend (if needed)
echo "🔨 Preparing backend..."
cd server
npm install --production
if [ $? -ne 0 ]; then
    echo "❌ Backend preparation failed"
    exit 1
fi
echo "✅ Backend prepared successfully"
cd ..

# Commit and push changes
echo "📝 Committing changes..."
git add .
git commit -m "🚀 Deploy to production - $(date)"
if [ $? -ne 0 ]; then
    echo "❌ Git commit failed"
    exit 1
fi

echo "📤 Pushing to GitHub..."
git push origin main
if [ $? -ne 0 ]; then
    echo "❌ Git push failed"
    exit 1
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - Create new project from GitHub"
echo "   - Set root directory to /server"
echo "   - Add environment variables (see DEPLOYMENT.md)"
echo ""
echo "2. Deploy frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import GitHub repository"
echo "   - Set root directory to /client"
echo "   - Add VITE_API_URL environment variable"
echo ""
echo "3. Update CORS configuration with your Vercel domain"
echo "4. Test your deployed application"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
