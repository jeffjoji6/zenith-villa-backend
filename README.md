# Zenith Villa Backend API

Backend server for the Zenith Villa photo gallery application, handling Cloudinary Admin API operations.

## Features

- ✅ Fetch all photos from Cloudinary
- ✅ Delete photos from Cloudinary
- ✅ Get individual photo details
- ✅ CORS enabled for frontend access
- ✅ Health check endpoint
- ✅ Error handling and logging

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Copy `env.example` to `.env` and fill in your Cloudinary credentials:

```bash
cp env.example .env
```

Required environment variables:

- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `FRONTEND_URL` - Your frontend URL (for CORS)
- `PORT` - Server port (default: 3000)

### 3. Run Development Server

```bash
npm run dev
```

### 4. Run Production Server

```bash
npm start
```

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Photos

- `GET /api/photos` - Get all photos
- `GET /api/photos/:photoId` - Get specific photo
- `DELETE /api/photos/:photoId` - Delete photo

## Deployment on Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the following:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Add environment variables in Render dashboard
5. Deploy!

## Environment Variables for Render

Add these in your Render service settings:

```
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

## Development

The server uses:

- **Express.js** - Web framework
- **Cloudinary** - Image management
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

## Security Notes

- API keys are kept secure on the server
- CORS is configured for specific frontend domains
- No sensitive data is exposed in client responses
