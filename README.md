# 🎨 Draw & Guess Game

A beautiful, real-time multiplayer drawing and guessing game built with React, TypeScript, Socket.IO, and Tailwind CSS.

## ✨ Features

- **Real-time Multiplayer**: Play with friends in real-time using WebSocket connections
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Smart Game Logic**:
  - Dynamic scoring system with time bonuses
  - Multiple word categories (animals, objects, food, nature, activities)
  - Automatic round management
  - Player disconnection handling
- **Enhanced Drawing Tools**:
  - Multiple color options
  - Adjustable brush width
  - Clear canvas functionality
- **Game Features**:
  - 5 rounds per game
  - 60-second drawing time
  - 10-second word selection time
  - Score tracking and leaderboards
  - Chat system with different message types

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd draw-guess
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Game

1. **Start the server** (from the `server` directory)

   ```bash
   cd server
   npm run dev
   ```

   The server will start on `http://localhost:3001`

2. **Start the client** (from the `client` directory)

   ```bash
   cd client
   npm run dev
   ```

   The client will start on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## 🎮 How to Play

1. **Create or Join a Room**:

   - Enter your name
   - Create a new room or join with a room code
   - Share the room code with friends

2. **Game Flow**:

   - Each round, one player becomes the drawer
   - The drawer chooses from 3 random words
   - Other players try to guess the word by watching the drawing
   - Points are awarded based on speed and accuracy
   - After 5 rounds, the player with the highest score wins!

3. **Scoring System**:
   - **Correct Guess**: 100 base points + time bonus (up to 30 additional points)
   - **Drawer Bonus**: 25 points per correct guess
   - **Time Bonus**: Faster guesses earn more points

## 🛠️ Technical Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.IO Client** for real-time communication

### Backend

- **Node.js** with TypeScript
- **Express.js** for HTTP server
- **Socket.IO** for WebSocket connections
- **CORS** enabled for cross-origin requests

## 🎯 Game Rules

1. **Minimum Players**: 2 players required to start
2. **Round Duration**: 60 seconds for drawing
3. **Word Selection**: 10 seconds to choose a word
4. **Game Length**: 5 rounds total
5. **Scoring**:
   - Guessing correctly: 100 + time bonus
   - Drawing successfully: 25 points per correct guess
6. **Disconnections**: Players can rejoin, but rooms are cleaned up when empty

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the client directory:

```env
VITE_WS_URL=http://localhost:3001
```

### Server Configuration

The server runs on port 3001 by default. You can change this by setting the `PORT` environment variable.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🎉 Have Fun!

Enjoy playing Draw & Guess with your friends! The game is designed to be fun, engaging, and easy to use. Happy drawing and guessing! 🎨✨
