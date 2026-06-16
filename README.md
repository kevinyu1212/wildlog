# WildLog (와일드로그) 🐾

WildLog is a comprehensive ecological observation and archiving platform designed for nature enthusiasts and researchers. It allows users to record, map, and share their wildlife sightings, fostering a community dedicated to biodiversity conservation.

## 🚀 Features

- **Species Archiving**: Record detailed observations of various species (mammals, reptiles, amphibians, insects, etc.).
- **Interactive Biology Map**: Visualize observations geographically using an interactive map.
- **Ecological Gallery**: A personalized gallery for each user to showcase their sightings.
- **Mission System**: Participate in ecological missions and contribute to conservation efforts.
- **Community Engagement**: Like and comment on other observers' posts.
- **Elite Observer Status**: Earn recognition for consistent and high-quality contributions.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **State Management**: Context API
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Mapping**: React-Leaflet (OpenStreetMap)

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: SQLite (via `sqlite3`)
- **Authentication**: Custom Auth with Context
- **File Storage**: Local filesystem for image uploads

## 📁 Project Structure

```text
wildlog/
├── wildlog-frontend/    # React application
│   ├── src/
│   │   ├── api/         # API integration
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components (Home, Map, Board, etc.)
│   │   └── context/     # Auth and Global state
├── wildlog-backend/     # Express server
│   ├── server.js        # Main entry point
│   ├── wildlog.db       # SQLite database
│   └── uploads/         # Observation images
└── package.json         # Root configuration
```

## 🚥 Getting Started

### Prerequisites
- Node.js (v16+)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kevinyu1212/wildlog.git
   cd wildlog
   ```

2. **Frontend Setup**
   ```bash
   cd wildlog-frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd ../wildlog-backend
   npm install
   node server.js
   ```

## 📄 License

This project is licensed under the MIT License.

---
Developed by [kevinyu1212](https://github.com/kevinyu1212)
