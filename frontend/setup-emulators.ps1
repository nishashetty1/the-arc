# Firebase Emulator Setup Script
# This script installs the Firebase CLI and sets up emulators for local development

# Check if Firebase CLI is installed
if (!(Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
} else {
    Write-Host "Firebase CLI is already installed."
}

# Login to Firebase (if not already logged in)
firebase login

# Initialize Firebase project if firebase.json doesn't exist
if (!(Test-Path -Path "./firebase.json")) {
    Write-Host "Initializing Firebase project..."
    firebase init emulators
} else {
    Write-Host "Firebase project already initialized."
}

# Start emulators
Write-Host "Starting Firebase emulators..."
firebase emulators:start