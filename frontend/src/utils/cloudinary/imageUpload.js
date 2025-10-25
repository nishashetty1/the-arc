/**
 * Cloudinary Image Upload Utility
 * Handles profile image uploads to Cloudinary
 */

import { getCloudinaryConfig } from './config';

/**
 * Validate image file before upload
 */
export const validateImageFile = (file) => {
  const errors = [];
  
  // Check if file exists
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
  }
  
  // Check file size (max 10MB for images)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    errors.push(`File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Upload image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with URL
 */
export const uploadImageToCloudinary = async (file, options = {}) => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const config = getCloudinaryConfig();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', config.uploadPreset);
    
    // Optional: Add folder parameter for organization
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    // Optional: Add tags
    if (options.tags) {
      formData.append('tags', options.tags.join(','));
    }
    
    console.log('Uploading image to Cloudinary...');
    console.log('File name:', file.name);
    console.log('File size:', (file.size / 1024).toFixed(2), 'KB');
    console.log('File type:', file.type);
    
    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload image');
    }
    
    const result = await response.json();
    
    console.log('Image uploaded successfully:', result.public_id);
    
    return {
      success: true,
      publicId: result.public_id,
      url: result.secure_url,
      thumbnail: result.eager?.[0]?.secure_url || result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
    
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image'
    };
  }
};

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Transformed image URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const config = getCloudinaryConfig();
  const {
    width = 400,
    height = 400,
    crop = 'fill',
    gravity = 'face',
    quality = 'auto',
    format = 'auto'
  } = options;
  
  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `g_${gravity}`,
    `q_${quality}`,
    `f_${format}`
  ].join(',');
  
  return `https://res.cloudinary.com/${config.cloudName}/image/upload/${transformations}/${publicId}`;
};

/**
 * Get avatar image URL (circular crop for profile pictures)
 * @param {string} publicId - Cloudinary public ID
 * @param {number} size - Avatar size (default 200px)
 * @returns {string} Transformed avatar URL
 */
export const getAvatarUrl = (publicId, size = 200) => {
  const config = getCloudinaryConfig();
  
  const transformations = [
    `w_${size}`,
    `h_${size}`,
    'c_fill',
    'g_face',
    'r_max', // Make it circular
    'q_auto',
    'f_auto'
  ].join(',');
  
  return `https://res.cloudinary.com/${config.cloudName}/image/upload/${transformations}/${publicId}`;
};
