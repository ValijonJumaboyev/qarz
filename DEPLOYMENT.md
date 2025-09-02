# 🚀 QarzDaftar Deployment Guide

This guide will help you deploy QarzDaftar to production using Vercel (frontend) and Railway (backend).

## 📋 Prerequisites

- [GitHub](https://github.com) account
- [Vercel](https://vercel.com) account (free)
- [Railway](https://railway.app) account (free tier available)
- [MongoDB Atlas](https://mongodb.com/atlas) account (free tier available)

## 🎯 Deployment Strategy

- **Frontend**: Vercel (React + Vite)
- **Backend**: Railway (Node.js + Express)
- **Database**: MongoDB Atlas
- **Authentication**: JWT with 7-day expiry

## 🔧 Step 1: Prepare MongoDB Atlas

1. **Create MongoDB Atlas Cluster**

   - Go to [MongoDB Atlas](https://mongodb.com/atlas)
   - Create a free cluster
   - Set up database access (username/password)
   - Set up network access (allow all IPs: 0.0.0.0/0)
   - Get your connection string

2. **Connection String Format**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/authDB?retryWrites=true&w=majority
   ```

## 🚀 Step 2: Deploy Backend to Railway

1. **Push Code to GitHub**

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Railway**

   - Go to [Railway](https://railway.app)
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Set the root directory to `/server`

3. **Configure Environment Variables**

   ```bash
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/authDB?retryWrites=true&w=majority
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   NODE_ENV=production
   PORT=3000
   ```

4. **Get Your Backend URL**
   - Railway will provide a URL like: `https://your-app.railway.app`
   - Your API will be at: `https://your-app.railway.app/api`

## 🌐 Step 3: Deploy Frontend to Vercel

1. **Deploy to Vercel**

   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set the root directory to `/client`
   - Framework preset: Vite

2. **Configure Environment Variables**

   ```bash
   VITE_API_URL=https://your-app.railway.app/api
   ```

3. **Build Settings**

   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app

## 🔗 Step 4: Update CORS Configuration

1. **Update Backend CORS**

   - In `server/config/production.js`
   - Update `CORS_ORIGINS` with your Vercel domain:

   ```javascript
   CORS_ORIGINS: ["https://your-app.vercel.app", "http://localhost:5173"]
   ```

2. **Redeploy Backend**
   - Railway will automatically redeploy when you push changes

## 🧪 Step 5: Test Deployment

1. **Test Backend Health**

   ```
   GET https://your-app.railway.app/health
   ```

2. **Test Frontend**
   - Visit your Vercel URL
   - Try to sign up/sign in
   - Test debt creation and listing

## 🔒 Step 6: Security Considerations

1. **JWT Secret**

   - Use a strong, random secret
   - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

2. **MongoDB Security**

   - Use strong passwords
   - Restrict network access if possible
   - Enable MongoDB Atlas security features

3. **Environment Variables**
   - Never commit `.env` files
   - Use platform environment variables
   - Rotate secrets regularly

## 📊 Step 7: Monitoring

1. **Railway Dashboard**

   - Monitor backend performance
   - Check logs for errors
   - Monitor resource usage

2. **Vercel Analytics**
   - Frontend performance
   - User analytics
   - Error tracking

## 🚨 Troubleshooting

### Backend Issues

- Check Railway logs
- Verify environment variables
- Test MongoDB connection
- Check CORS configuration

### Frontend Issues

- Check Vercel build logs
- Verify API URL configuration
- Test API endpoints directly
- Check browser console for errors

### Database Issues

- Verify MongoDB connection string
- Check network access settings
- Verify database user permissions

## 🔄 Continuous Deployment

1. **Automatic Deployments**

   - Both Vercel and Railway deploy on git push
   - Update your code and push to trigger deployment

2. **Environment Management**
   - Use different branches for staging/production
   - Set up preview deployments in Vercel

## 📱 Custom Domain (Optional)

1. **Vercel Custom Domain**

   - Add your domain in Vercel dashboard
   - Configure DNS records
   - Enable HTTPS

2. **Railway Custom Domain**
   - Add custom domain in Railway
   - Configure DNS records

## 🎉 Success!

Your QarzDaftar app is now deployed and accessible worldwide!

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **API**: `https://your-app.railway.app/api`

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review platform logs
3. Verify configuration
4. Test locally first

Happy deploying! 🚀
