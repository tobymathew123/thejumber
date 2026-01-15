# theJumbler 🎲

**Real-time team shuffler with custom constraints and stunning UI**

theJumbler is a full-stack web application that allows hosts to create rooms where participants join and get randomly assigned to teams based on smart constraints. Features real-time synchronization, a premium glassmorphism UI, and spectacular 3-second slot machine animations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## ✨ Features

- 🎯 **Smart Shuffling** - Maximizes diversity by college/organization
- ⚖️ **Gender Balance** - Optional balanced team composition
- ⚡ **Real-time Sync** - Everyone sees results instantly via Socket.io
- 🎨 **Glassmorphism UI** - Premium, modern design with neon accents
- 🎰 **Slot Machine Animation** - 3-second animated reveal
- 🌈 **Neon Team Colors** - Each team gets a unique vibrant color
- 🔒 **Room Codes** - Secure 6-digit codes for easy joining

## 🏗️ Architecture

```
theJumbler/
├── backend/              # Node.js + Express + Socket.io server
│   ├── src/
│   │   ├── index.ts      # Main server entry point
│   │   ├── types/        # TypeScript interfaces
│   │   ├── redis/        # Redis client & Pub/Sub
│   │   ├── managers/     # RoomManager for room logic
│   │   └── services/     # ShuffleService algorithm
│   └── package.json
├── frontend/             # React + Vite + Framer Motion
│   ├── src/
│   │   ├── App.tsx       # Main app component
│   │   ├── index.css     # Glassmorphism design system
│   │   ├── hooks/        # useSocket hook
│   │   └── components/   # UI components
│   └── package.json
└── docker-compose.yml    # Redis container
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **Docker** (for Redis)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd theJumbler
```

### 2. Start Redis

```bash
docker-compose up -d
```

Verify Redis is running:
```bash
docker ps
```

### 3. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend server will start on `http://localhost:3001`

### 4. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

### 5. Open the Application

Visit `http://localhost:5173` in your browser.

## 🎮 How to Use

### Host Flow

1. Click **"Create Room"** on the home page
2. Share the **6-digit room code** with participants
3. Configure shuffle settings:
   - Number of teams (2-10)
   - Gender balance toggle
4. Wait for participants to join
5. Click **"JUMBLE!"** to shuffle teams
6. Watch the 3-second slot machine animation
7. See synchronized team reveals with neon colors!

### Participant Flow

1. Click **"Join Room"** on the home page
2. Enter the **room code** from the host
3. Fill in your details:
   - Name
   - College/Organization
   - Gender
4. Wait for the host to trigger the jumble
5. Watch the synchronized animation
6. See your team assignment!

## 🧠 Shuffle Algorithm

The constrained weighted shuffle algorithm implements two primary strategies:

### College Diversity Mode
- Distributes members from the same college/organization across different teams
- Uses round-robin assignment to maximize diversity
- Calculates diversity score (0-100) based on unique colleges per team

### Gender Balance Mode
- Groups participants by gender
- Distributes each gender group evenly across all teams
- Calculates balance score based on gender ratio within teams

The algorithm automatically rebalances team sizes to ensure fairness.

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **TypeScript** - Type safety
- **Express** - Web server framework
- **Socket.io** - Real-time bidirectional communication
- **Redis (ioredis)** - In-memory data store and Pub/Sub
- **nanoid** - Unique room code generation

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Framer Motion** - Animation library
- **Socket.io-client** - Real-time client

### Infrastructure
- **Docker** - Redis containerization
- **Redis** - Data persistence and real-time Pub/Sub

## 📁 Environment Variables

### Backend `.env`

```env
PORT=3001
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CORS_ORIGIN=http://localhost:5173
```

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm test
```

### Test Shuffle Algorithm

The shuffle service includes comprehensive tests for:
- College diversity maximization
- Gender balance constraints
- Team size balancing
- Edge cases (odd numbers, same organization)

## 🎨 Design System

theJumbler uses a premium glassmorphism design with:

- **Color Palette**: Deep blue backgrounds with neon accent colors
- **Typography**: Inter (body), Outfit (headings)
- **Effects**: Backdrop blur, frosted glass, glow shadows
- **Animations**: Smooth transitions, slot machine effects
- **Team Colors**: 10 unique neon colors (Electric Blue, Neon Pink, Cyber Yellow, etc.)

## 🔧 Development

### Backend Development

```bash
cd backend
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run start    # Run production build
```

### Frontend Development

```bash
cd frontend
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📦 Production Deployment

### Backend

1. Build the TypeScript:
   ```bash
   cd backend
   npm run build
   ```

2. Set production environment variables

3. Start the server:
   ```bash
   npm start
   ```

### Frontend

1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```

2. Serve the `dist/` folder with a static file server

### Redis

For production, use a managed Redis service like:
- Redis Cloud
- AWS ElastiCache
- Google Cloud Memorystore

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by team collaboration tools
- Built with modern web technologies
- Designed for real-time experiences

---

**Made with ❤️ for better team formation**
