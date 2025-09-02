@echo off
echo 🚀 QarzDaftar Deployment Script
echo ================================

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not found. Please initialize git first:
    echo    git init
    echo    git add .
    echo    git commit -m "Initial commit"
    echo    git remote add origin ^<your-github-repo-url^>
    pause
    exit /b 1
)

REM Check if remote origin is set
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ❌ Git remote origin not set. Please add your GitHub repository:
    echo    git remote add origin ^<your-github-repo-url^>
    pause
    exit /b 1
)

echo ✅ Git repository ready

REM Build frontend
echo 🔨 Building frontend...
cd client
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend built successfully
cd ..

REM Build backend (if needed)
echo 🔨 Preparing backend...
cd server
call npm install --production
if errorlevel 1 (
    echo ❌ Backend preparation failed
    pause
    exit /b 1
)
echo ✅ Backend prepared successfully
cd ..

REM Commit and push changes
echo 📝 Committing changes...
git add .
git commit -m "🚀 Deploy to production - %date% %time%"
if errorlevel 1 (
    echo ❌ Git commit failed
    pause
    exit /b 1
)

echo 📤 Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ❌ Git push failed
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment preparation complete!
echo.
echo Next steps:
echo 1. Deploy backend to Railway:
echo    - Go to https://railway.app
echo    - Create new project from GitHub
echo    - Set root directory to /server
echo    - Add environment variables (see DEPLOYMENT.md)
echo.
echo 2. Deploy frontend to Vercel:
echo    - Go to https://vercel.com
echo    - Import GitHub repository
echo    - Set root directory to /client
echo    - Add VITE_API_URL environment variable
echo.
echo 3. Update CORS configuration with your Vercel domain
echo 4. Test your deployed application
echo.
echo 📖 See DEPLOYMENT.md for detailed instructions
pause
