# 🏪 QarzDaftar - Debt Management System

A modern, secure debt tracking application built for shop owners and small businesses to manage customer debts efficiently.

## ✨ Features

- **🔐 Secure Authentication**: JWT-based authentication with 7-day expiry
- **📱 Responsive Design**: Modern UI that works on all devices
- **🌙 Dark/Light Mode**: Toggle between themes
- **💾 Offline Support**: Works even without internet connection
- **📊 Real-time Dashboard**: Live debt tracking and statistics
- **🔍 Quick Search**: Find customers by name or phone number
- **📋 Detailed Records**: Track items, amounts, and due dates
- **🚫 Smart Filtering**: Automatically excludes setup records

## 🛠️ Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Heroicons** for beautiful icons
- **React Router** for navigation

### Backend

- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

### Database

- **MongoDB Atlas** for cloud database
- **Multi-tenant architecture** with separate databases per shop
- **Automatic database creation** for new users

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Git

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/qarzdaftar.git
   cd qarzdaftar
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # In server directory, create .env file
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/authDB
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

4. **Start the development servers**

   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev

   # Terminal 2 - Start frontend
   cd client
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## 📱 Usage

### For Shop Owners

1. **Sign up** with your email and shop name
2. **Add customers** and their debt items
3. **Track payments** and outstanding amounts
4. **Generate reports** for your business

### Features

- **Customer Management**: Add, edit, and search customers
- **Debt Tracking**: Record items, amounts, and due dates
- **Payment Status**: Mark debts as paid, partial, or unpaid
- **Search & Filter**: Quick access to customer information
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Deployment

### Option 1: Vercel + Railway (Recommended)

- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway
- **Database**: MongoDB Atlas

### Option 2: Full Stack on Railway

- Deploy both frontend and backend on Railway

### Quick Deployment

```bash
# Run deployment script
./deploy.sh          # Linux/Mac
deploy.bat           # Windows

# Follow the prompts and deploy to your chosen platform
```

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions**

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Configurable cross-origin request handling
- **Environment Variables**: Secure configuration management
- **Input Validation**: Server-side validation for all inputs

## 📊 Database Schema

### Users Collection (authDB)

```javascript
{
  email: String,
  passwordHash: String,
  shopName: String,
  dbName: String,
  createdAt: Date
}
```

### Debts Collection (shop-specific DBs)

```javascript
{
  customerName: String,
  phone: String,
  items: [{
    description: String,
    amount: Number
  }],
  total: Number,
  dueDate: Date,
  status: String, // "unpaid", "partial", "paid"
  createdAt: Date
}
```

## 🧪 Testing

### Frontend Testing

```bash
cd client
npm run lint        # Run ESLint
npm run build       # Build for production
npm run preview     # Preview production build
```

### Backend Testing

```bash
cd server
npm start           # Start production server
# Test endpoints manually or with tools like Postman
```

## 📁 Project Structure

```
qarzdaftar/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (auth)
│   │   ├── lib/           # API client and utilities
│   │   ├── pages/         # Page components
│   │   └── main.tsx       # App entry point
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── index.js           # Server entry point
│   └── package.json       # Backend dependencies
├── DEPLOYMENT.md          # Deployment guide
├── README.md              # This file
└── deploy.sh              # Deployment script
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Vite Team** for the fast build tool
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the flexible database
- **Express.js** for the web framework

## 📞 Support

If you have any questions or need help:

1. **Check the documentation** in this README
2. **Review the deployment guide** in DEPLOYMENT.md
3. **Open an issue** on GitHub
4. **Test locally first** before reporting bugs

---

**Made with ❤️ for shop owners and small businesses**

_QarzDaftar - From paper to digital, one debt at a time_
