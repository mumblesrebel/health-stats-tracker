# Health Stats Tracker API

Backend API for the Health Stats Tracker application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

3. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Deployment

1. Push changes to the repository
2. The server will automatically deploy to Render
3. Environment variables must be set in the Render dashboard:
   - `PORT`
   - `MONGODB_URI`
   - `JWT_SECRET`
