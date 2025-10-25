# The Arc Frontend

A React application for The Arc platform built with Vite, featuring video upload and streaming capabilities.

## Features

- User authentication with Firebase Auth
- Pitch video upload and management with Cloudinary
- Video player with custom controls
- Profile management
- Dashboard with analytics
- Video validation (60-second limit, vertical aspect ratio)
- Multiple video quality options

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Setup environment variables by copying the example file:

```bash
copy .env.example .env
```

4. Configure your environment variables in the `.env` file:

#### Firebase Configuration
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

#### Cloudinary Configuration (Required for video uploads)
```
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## Cloudinary Setup Guide

The application uses Cloudinary for video storage and processing. Follow these steps to set up Cloudinary:

### 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. After registration, go to your Dashboard

### 2. Get Your Credentials

From your Cloudinary Dashboard, copy:
- **Cloud Name**: Found in the "Account Details" section
- **API Key**: Found in the "Account Details" section  
- **API Secret**: Found in the "Account Details" section (click "Reveal")

### 3. Create an Upload Preset

1. Go to Settings → Upload in your Cloudinary console
2. Scroll down to "Upload presets" and click "Add upload preset"
3. Configure the preset:
   - **Preset name**: `pitch_videos` (or your preferred name)
   - **Signing Mode**: `Unsigned` (for frontend uploads)
   - **Resource Type**: `Video`
   - **Folder**: `pitch-videos` (optional, for organization)
   - **Allowed formats**: `mp4,mov,avi,quicktime,webm`
   - **Transformation**: Add transformations if needed (e.g., quality optimization)
4. Save the preset

### 4. Configure Environment Variables

Add these variables to your `.env` file with your actual Cloudinary values:

```
VITE_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
VITE_CLOUDINARY_API_KEY=your-actual-api-key
VITE_CLOUDINARY_API_SECRET=your-actual-api-secret
VITE_CLOUDINARY_UPLOAD_PRESET=pitch_videos
```

### 5. Optional: Configure Upload Security

For production, consider:
- Setting up signed uploads for better security
- Configuring upload restrictions (file size, duration limits)
- Setting up webhooks for upload notifications

### Development

Run the development server:

```bash
npm run dev
```

## Using Firebase Emulators (Recommended for Development)

To avoid CORS issues with Firebase Storage during development, we've implemented Firebase emulators for local development.

### Setup Emulators

1. Install the Firebase CLI and setup emulators:

```bash
npm run setup:emulators
```

This will:
- Install Firebase CLI (if not already installed)
- Guide you through Firebase login
- Initialize Firebase emulators

2. Run the application with emulators:

```bash
npm run dev:emulators
```

This will:
- Start Firebase emulators for Auth, Firestore, and Storage
- Start the Vite development server
- Connect your application to the local emulators

### Emulator Benefits

- No CORS issues
- Local data persistence
- Full control over authentication
- No production data impacts
- Faster development cycles

## Building for Production

Build the production version:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```
