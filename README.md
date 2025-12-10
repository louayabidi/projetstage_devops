# 🌊 WaveLink - Maritime Transport Booking Platform

<div align="center">

![WaveLink Logo](https://via.placeholder.com/200x80/0ea5e9/ffffff?text=WaveLink)

**Revolutionizing Maritime Transportation Through Digital Innovation**

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)](https://github.com)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)

[Features](#-key-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 Overview

WaveLink is a cutting-edge **full-stack maritime transport reservation platform** that transforms the way people book and experience boat travel. Built with the powerful MERN stack and enhanced with real-time capabilities, WaveLink connects passengers with boat owners through an intuitive, secure, and feature-rich digital ecosystem.

### 🌟 Why WaveLink?

In an era where digital transformation is reshaping industries, maritime transportation remained largely untouched by innovation. WaveLink bridges this gap by offering:

- **🚀 Real-time boat tracking** with live geolocation
- **💬 Instant communication** between passengers and boat owners
- **🤝 Smart companion matching** for shared travel experiences
- **📱 Seamless booking** with exclusive and shared modes
- **🔐 Enterprise-grade security** with multi-provider authentication

---

## ✨ Key Features

### For Passengers 🧳

- **Smart Search & Discovery**
  - Advanced filtering by destination, date, capacity, and amenities
  - Interactive map with real-time boat locations
  - Detailed boat profiles with photos and specifications

- **Flexible Booking Options**
  - **Exclusive Mode**: Book the entire boat for private trips
  - **Shared Mode**: Reserve individual seats for budget-friendly travel
  - Real-time availability calendar
  - Instant booking confirmation

- **Travel Companion Matching** 🎯
  - AI-powered matching algorithm based on:
    - Travel destinations and dates
    - Shared interests (adventure, relaxation, culture)
    - Group size and travel preferences
    - Child-friendly considerations
  - Connect with like-minded travelers before departure

- **Real-time Communication** 💬
  - Live chat with boat owners
  - Price negotiation system
  - In-chat offer acceptance
  - Push notifications for updates

### For Boat Owners ⛵

- **Comprehensive Boat Management**
  - Multi-photo uploads with drag-and-drop
  - Detailed specification forms (capacity, amenities, safety equipment)
  - Admin verification process
  - Dynamic pricing controls

- **Booking Management Dashboard**
  - Calendar view of all reservations
  - Accept/reject booking requests
  - Send custom price offers
  - Track revenue and statistics

- **Real-time Location Sharing**
  - GPS-based boat tracking
  - Socket.io powered live updates
  - Interactive map visualization

### For Administrators 👨‍💼

- **Complete Platform Oversight**
  - Beautiful analytics dashboard with ApexCharts
  - User management and role assignment
  - Boat verification workflow
  - Activity logs and monitoring

- **Security & Compliance**
  - Detailed audit trails
  - User verification management
  - Content moderation tools
  - System health monitoring

---

## 🏗️ Architecture

WaveLink follows a modern **three-tier architecture** optimized for scalability and maintainability:

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│                                                               │
│  React 19 + Material-UI + React Leaflet + Framer Motion     │
│  ├─ User Interface Components                                │
│  ├─ State Management (Context API + Hooks)                   │
│  ├─ Real-time Updates (Socket.io Client)                     │
│  └─ Responsive Design & Animations                           │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API + WebSockets
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                     │
│                                                               │
│         Node.js + Express.js + Socket.io Server              │
│  ├─ RESTful API Endpoints                                    │
│  ├─ Authentication & Authorization (JWT + OAuth2)            │
│  ├─ Business Rules & Validation                              │
│  ├─ Real-time Communication Hub                              │
│  └─ File Upload Management (Multer)                          │
└─────────────────────────────────────────────────────────────┘
                            ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
│                                                               │
│                     MongoDB 6.0 Database                      │
│  ├─ Users Collection (Auth & Profiles)                       │
│  ├─ Boats Collection (Vessels & Locations)                   │
│  ├─ Bookings Collection (Reservations)                       │
│  ├─ Messages Collection (Chat History)                       │
│  └─ TravelInterests Collection (Matching Data)               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **React 19.0.0** - Modern UI library with Concurrent Features
- **Material-UI 7.3.1** - Beautiful, accessible component library
- **React Router DOM 7.6.3** - Declarative routing
- **React Leaflet** - Interactive maps with OpenStreetMap
- **ApexCharts** - Stunning data visualizations
- **Framer Motion** - Smooth animations and transitions
- **Socket.io Client** - Real-time bidirectional communication

#### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js 4.21.2** - Fast, minimalist web framework
- **MongoDB 6.0** - NoSQL document database
- **Mongoose 8.6.3** - Elegant MongoDB ODM
- **Socket.io** - Real-time engine
- **Passport.js** - Authentication middleware
- **JWT** - Secure token-based auth
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

#### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Kubernetes** - Production orchestration & auto-scaling
- **GitHub Actions** - CI/CD pipeline
- **ESLint & Prettier** - Code quality
- **Jest & Supertest** - Testing framework
- **Husky** - Git hooks

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **MongoDB** 6.0+ (local or Atlas)
- **Git**
- **Docker** (optional, for containerized deployment)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wavelink.git
   cd wavelink
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` files in both `backend` and `frontend` directories:

   **Backend `.env`:**
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/wavelink
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   
   # OAuth2 (Google)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # OAuth2 (Facebook)
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   
   # File Upload
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   
   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend `.env`:**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name wavelink-mongo mongo:6.0
   ```

5. **Run the application**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory, new terminal)
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

---

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Kubernetes Deployment

```bash
# Apply Kubernetes configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services

# Scale deployment
kubectl scale deployment wavelink-backend --replicas=3
```

---

## 📊 Project Structure

```
wavelink/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Database connection
│   │   └── passport.js           # OAuth strategies
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── boatController.js     # Boat management
│   │   ├── bookingController.js  # Reservation handling
│   │   └── userController.js     # User management
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── errorHandler.js       # Error handling
│   │   └── upload.js             # File upload middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Boat.js               # Boat schema
│   │   ├── Booking.js            # Booking schema
│   │   ├── Message.js            # Message schema
│   │   └── TravelInterest.js     # Travel profile schema
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── boats.js              # Boat routes
│   │   ├── bookings.js           # Booking routes
│   │   └── users.js              # User routes
│   ├── sockets/
│   │   ├── chatHandler.js        # Chat socket events
│   │   └── locationHandler.js    # Geolocation events
│   ├── utils/
│   │   ├── logger.js             # Logging utility
│   │   └── validators.js         # Input validation
│   └── server.js                 # Entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/             # Authentication components
│   │   │   ├── Boats/            # Boat-related components
│   │   │   ├── Booking/          # Booking components
│   │   │   ├── Chat/             # Chat interface
│   │   │   ├── Dashboard/        # Admin dashboard
│   │   │   ├── Layout/           # Layout components
│   │   │   └── Matching/         # Companion matching
│   │   ├── context/
│   │   │   ├── AuthContext.js    # Auth state management
│   │   │   └── SocketContext.js  # Socket connection
│   │   ├── hooks/
│   │   │   ├── useAuth.js        # Auth hook
│   │   │   └── useSocket.js      # Socket hook
│   │   ├── pages/
│   │   │   ├── Home.js           # Landing page
│   │   │   ├── Login.js          # Login page
│   │   │   ├── BoatDetails.js    # Boat details
│   │   │   └── Profile.js        # User profile
│   │   ├── services/
│   │   │   ├── api.js            # API client
│   │   │   └── socket.js         # Socket client
│   │   ├── utils/
│   │   │   └── helpers.js        # Helper functions
│   │   ├── App.js                # Root component
│   │   └── index.js              # Entry point
│   └── package.json
│
├── k8s/                          # Kubernetes configs
├── docker-compose.yml            # Docker Compose config
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions
└── README.md
```

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **OAuth2 Integration** - Google and Facebook login
- **Password Hashing** - Bcrypt with salt rounds
- **Input Validation** - Server-side validation with Mongoose
- **CORS Protection** - Configured Cross-Origin Resource Sharing
- **Helmet.js** - Security headers
- **Rate Limiting** - API request throttling
- **Secure File Upload** - File type and size validation
- **XSS Protection** - Content sanitization
- **HTTPS Ready** - SSL/TLS support

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm test -- auth.test.js

# Run integration tests
npm run test:integration
```

---

## 📈 Performance Metrics

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 200ms average
- **Real-time Latency**: < 1 second for geolocation updates
- **Concurrent Users**: 500+ simultaneous connections
- **Database Queries**: Optimized with indexes
- **Auto-scaling**: Kubernetes HPA for production

---

## 🗺️ Roadmap

### Phase 1 ✅ (Completed)
- [x] User authentication and authorization
- [x] Boat management system
- [x] Basic booking functionality
- [x] Real-time chat implementation
- [x] Geolocation tracking

### Phase 2 🚧 (In Progress)
- [ ] Payment gateway integration
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Email notification system
- [ ] Multi-language support

### Phase 3 🔮 (Planned)
- [ ] AI-powered price recommendations
- [ ] Weather integration and alerts
- [ ] Route optimization
- [ ] Loyalty program
- [ ] Third-party API integrations

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Project developed at STE WAVELINK**

- **Company**: STE WAVELINK
- **Location**: Centre Urbain Nord, Tunis, Tunisia
- **Development Period**: June 15, 2025 - October 15, 2025

---


