# File Sharing API with Expiry Links

A secure file sharing API built with Express.js and MongoDB that allows users to upload files and share them via temporary links that expire after a specified time.

## 🚀 Project Roadmap

### ✅ Step 1: Project Initialization
- [x] Initialize Node.js project (`npm init`)
- [x] Install dependencies: express, multer, mongoose, dotenv, uuid, cors
- [x] Setup folder structure
- [x] Create `.env` & `.gitignore`
- [x] Connect MongoDB using mongoose
- [x] Basic server setup

### ✅ Step 2: Backend - Core Logic
- [x] **File Upload API - POST /upload**
  - [x] Setup multer (for file upload)
  - [x] Store file locally or to S3 (based on env)
  - [x] Validate file + optional `expiresInHours`
  - [x] Generate UUID as `fileId`
  - [x] Calculate expiry time (default: 24h)
  - [x] Save metadata in MongoDB
  - [x] Return response with fileId, download URL, and expiresAt

- [x] **File Download API - GET /download/:fileId**
  - [x] Fetch file metadata from DB by `fileId`
  - [x] Check if file is expired
  - [x] If expired: return 410 Gone
  - [x] If not expired: stream file to client
  - [x] Increment download count (optional)

- [x] **File Status API - GET /status/:fileId**
  - [x] Return: expiresIn, originalName, fileSize

### ✅ Step 3: Database Design (MongoDB)
- [x] **File Schema**
  - [x] fileId: String (UUID)
  - [x] originalName: String
  - [x] storagePath / s3Key: String
  - [x] mimeType: String
  - [x] fileSize: Number
  - [x] uploadedAt: Date
  - [x] expiresAt: Date (used for TTL)
  - [x] downloadCount: Number (optional)
  - [x] index on expiresAt (TTL)

### ✅ Step 4: File Expiry Handling
- [x] **File Expiry System**
  - [x] TTL Index on `expiresAt` (MongoDB auto-deletion)
  - [ ] (Optional) Create cleanup script
  - [ ] Schedule cleanup script with `node-cron` (hourly)

### ✅ Step 5: Validation & Error Handling
- [x] **Error Handling**
  - [x] Handle missing file upload
  - [x] Handle expired file
  - [x] Handle invalid fileId
  - [x] Return clean JSON error messages
  - [x] Set multer limits (e.g. 50MB max)

### 🔄 Step 6: Local vs S3 Storage (Optional Switch)
- [ ] **Add Storage Abstraction**
  - [ ] Create a `storageService.js`
  - [ ] If local mode: Save to `/uploads/`
  - [ ] If S3 mode: Upload using `@aws-sdk/client-s3`
  - [ ] Use `.env` to toggle mode

### 🔄 Step 7: Optional Frontend (or Docs)
- [ ] **Frontend (optional)**
  - [ ] Simple upload form
  - [ ] Show download link after upload
  - [ ] Show time remaining (if implementing `/status`)

- [ ] **Documentation (Postman or Swagger)**
  - [ ] Create Postman collection
  - [ ] Document all endpoints
  - [ ] Add sample payloads & responses

### 🔄 Step 8: Deployment
- [ ] **Deployment**
  - [ ] Push to GitHub
  - [ ] Use Railway / Render to deploy backend
  - [ ] Use MongoDB Atlas (remote DB)
  - [ ] Setup environment variables

### 🔄 Step 9: Bonus Features (Optional Enhancements)
- [ ] **Bonus Enhancements**
  - [ ] Download counter
  - [ ] Delete-on-download (one-time share)
  - [ ] Email file link (Nodemailer)
  - [ ] Dockerize the app
  - [ ] Rate limiting middleware
  - [ ] Logging with Winston

## 📁 Project Structure

```
file-sharing-api/
├── src/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── uploads/             # File storage directory
├── .env                 # Environment variables
├── .gitignore          # Git ignore file
└── package.json        # Dependencies and scripts
```

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd file-sharing-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📋 API Endpoints

- `GET /` - API information
- `POST /upload` - Upload a file
- `GET /download/:fileId` - Download a file
- `GET /status/:fileId` - Get file status

## 🔧 Environment Variables

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/file-sharing-api
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
DEFAULT_EXPIRY_HOURS=24
BASE_URL=http://localhost:3000
```

## 🚀 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

## 📝 License

ISC

---

**Current Status**: Steps 1-5 Complete ✅ | Step 6 In Progress 🔄 

### �� Supabase Migration
- [x] **Phase 1: Setup**
  - [x] Create Supabase account & project
  - [x] Install @supabase/supabase-js
  - [x] Configure environment variables
- [x] **Phase 2: Database**
  - [x] Create PostgreSQL table schema
  - [x] Set up RLS policies
  - [x] Test database connection
- [x] **Phase 3: Storage**
  - [x] Create storage bucket
  - [x] Configure storage policies
  - [x] Test file operations
- [x] **Phase 4: Code Migration**
  - [x] Update upload route
  - [x] Update download route
  - [x] Update status route
  - [x] Remove local storage
- [ ] **Phase 5: Testing**
  - [ ] Test all endpoints
  - [ ] Optimize performance
  - [ ] Update documentation