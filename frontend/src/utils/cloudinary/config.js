// Cloudinary configuration for video uploads
import { Cloudinary } from '@cloudinary/url-gen';

// Cloudinary configuration
const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET || 'your-api-secret'
};

// Initialize Cloudinary instance
export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: cloudinaryConfig.cloudName
  }
});

// Upload preset for unsigned uploads (you'll need to create this in Cloudinary dashboard)
export const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

// Cloudinary upload URL
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/video/upload`;

// Video transformation presets
export const VIDEO_TRANSFORMATIONS = {
  // Optimize for mobile viewing
  mobile: {
    quality: 'auto:good',
    format: 'mp4',
    width: 360,
    height: 640,
    crop: 'fill',
    gravity: 'center'
  },
  // High quality for desktop
  desktop: {
    quality: 'auto:best',
    format: 'mp4',
    width: 720,
    height: 1280,
    crop: 'fill',
    gravity: 'center'
  },
  // Thumbnail for previews - using first frame
  thumbnail: {
    format: 'jpg',
    quality: 'auto:good',
    width: 300,
    height: 533,
    crop: 'fill',
    gravity: 'center'
  }
};

// Helper function to generate video URLs with transformations
export const getVideoUrl = (publicId, transformation = 'desktop') => {
  if (!publicId) return null;
  
  // Return simple video URL without heavy transformations for better playback
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/video/upload/${publicId}`;
};

// Helper function to generate thumbnail URLs - extracts first frame
export const getThumbnailUrl = (publicId) => {
  if (!publicId) return null;
  
  // Extract first frame (0 seconds) as thumbnail
  // Using so_0 (start offset 0) to get the first frame
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/video/upload/so_0,w_300,h_533,c_fill,g_center,f_jpg,q_auto:good/${publicId}.jpg`;
};

// Get Cloudinary configuration for image uploads
export const getCloudinaryConfig = () => {
  return {
    cloudName: cloudinaryConfig.cloudName,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_PROFILE_UPLOAD_PRESET || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'profile_images',
    apiKey: cloudinaryConfig.apiKey
  };
};

// Validate Cloudinary configuration
export const validateCloudinaryConfig = () => {
  const errors = [];
  
  if (!cloudinaryConfig.cloudName || cloudinaryConfig.cloudName === 'your-cloud-name') {
    errors.push('VITE_CLOUDINARY_CLOUD_NAME is not configured');
  }
  
  if (!UPLOAD_PRESET) {
    errors.push('VITE_CLOUDINARY_UPLOAD_PRESET is not configured');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    config: cloudinaryConfig
  };
};

export default cloudinaryConfig;