// Cloudinary upload service for video files
import { CLOUDINARY_UPLOAD_URL, UPLOAD_PRESET, validateCloudinaryConfig } from './config';

/**
 * Upload a video file to Cloudinary
 * @param {File} videoFile - The video file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result with public_id, secure_url, etc.
 */
export const uploadVideoToCloudinary = async (videoFile, options = {}) => {
  // Validate configuration first
  const configValidation = validateCloudinaryConfig();
  if (!configValidation.isValid) {
    throw new Error(`Cloudinary configuration error: ${configValidation.errors.join(', ')}`);
  }

  try {
    // Create FormData for the upload
    const formData = new FormData();
    
    // Required fields
    formData.append('file', videoFile);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    // Optional fields
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }
    
    // Video-specific options
    formData.append('resource_type', 'video');
    
    // Add tags for organization
    const tags = ['pitch-video', ...(options.tags || [])];
    formData.append('tags', tags.join(','));
    
    // Add context metadata
    if (options.context) {
      const contextString = Object.entries(options.context)
        .map(([key, value]) => `${key}=${value}`)
        .join('|');
      formData.append('context', contextString);
    }
    
    // Note: Transformations cannot be applied during unsigned upload
    // They will be applied when generating URLs for playback
    
    console.log('Starting Cloudinary upload...');
    console.log('File size:', videoFile.size);
    console.log('File type:', videoFile.type);
    
    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: { message: `HTTP ${response.status}: ${response.statusText}` }
      }));
      throw new Error(errorData.error?.message || 'Upload failed');
    }
    
    const result = await response.json();
    
    console.log('Cloudinary upload successful:', result.public_id);
    
    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      url: result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      duration: result.duration,
      bytes: result.bytes,
      createdAt: result.created_at,
      resourceType: result.resource_type,
      version: result.version,
      thumbnailUrl: generateThumbnailUrl(result.public_id)
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Generate a thumbnail URL for a video
 * @param {string} publicId - The public ID of the video
 * @returns {string} - Thumbnail URL
 */
export const generateThumbnailUrl = (publicId) => {
  const { cloudName } = validateCloudinaryConfig().config;
  return `https://res.cloudinary.com/${cloudName}/video/upload/c_fill,w_200,h_356,so_3.0,f_jpg/${publicId}`;
};

/**
 * Generate video URL with specific quality/size
 * @param {string} publicId - The public ID of the video
 * @param {string} quality - Quality preset ('mobile', 'desktop', 'hd')
 * @returns {string} - Video URL
 */
export const generateVideoUrl = (publicId, quality = 'mobile') => {
  const { cloudName } = validateCloudinaryConfig().config;
  
  const qualityMap = {
    mobile: 'c_fill,w_360,h_640,q_auto:good',
    desktop: 'c_fill,w_720,h_1280,q_auto:best',
    hd: 'c_fill,w_1080,h_1920,q_auto:best'
  };
  
  const transformation = qualityMap[quality] || qualityMap.mobile;
  
  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformation}/${publicId}`;
};

/**
 * Delete a video from Cloudinary
 * @param {string} publicId - The public ID of the video to delete
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteVideoFromCloudinary = async (publicId) => {
  // Note: For security reasons, deletion should typically be done from the backend
  // This is a placeholder for the frontend implementation
  console.warn('Video deletion should be implemented on the backend for security');
  
  // You would typically call your backend API here
  // which would then use the Cloudinary Admin API to delete the video
  
  throw new Error('Video deletion must be implemented on the backend');
};

/**
 * Validate a video file before upload
 * @param {File} file - The video file to validate
 * @returns {Object} - Validation result
 */
export const validateVideoFile = (file) => {
  const errors = [];
  const warnings = [];
  
  // Check file type
  const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime', 'video/webm'];
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Unsupported file type: ${file.type}. Supported types: ${allowedTypes.join(', ')}`);
  }
  
  // Check file size (100MB limit for free Cloudinary accounts)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (100MB)`);
  }
  
  // Warn about large files
  const warnSize = 50 * 1024 * 1024; // 50MB
  if (file.size > warnSize) {
    warnings.push(`Large file size (${(file.size / 1024 / 1024).toFixed(1)}MB) may take longer to upload`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};