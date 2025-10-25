import React, { useState, useRef } from 'react';
import { HiCamera, HiX } from 'react-icons/hi';
import Button from './Button';
import Spinner from './Spinner';
import { uploadImageToCloudinary } from '../../utils/cloudinary/imageUpload';

const ImageUpload = ({ currentImageUrl, onUploadSuccess, onUploadError, className = '' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setIsUploading(true);
    try {
      const result = await uploadImageToCloudinary(file, {
        folder: 'profile_images',
        tags: ['profile', 'avatar']
      });

      if (result.success) {
        onUploadSuccess(result);
      } else {
        setPreview(currentImageUrl);
        onUploadError(result.error || 'Upload failed');
      }
    } catch (error) {
      setPreview(currentImageUrl);
      onUploadError(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="relative group">
        {/* Image preview */}
        <div className="h-32 w-32 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center border-4 border-white shadow-lg">
          {preview ? (
            <img 
              src={preview} 
              alt="Profile preview" 
              className="h-full w-full object-cover"
            />
          ) : (
            <HiCamera className="h-12 w-12 text-neutral-400" />
          )}
          
          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Spinner size="md" />
            </div>
          )}
        </div>
        
        {/* Upload button overlay */}
        {!isUploading && (
          <button
            type="button"
            onClick={handleButtonClick}
            className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center"
          >
            <HiCamera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        )}
        
        {/* Remove button */}
        {preview && !isUploading && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors duration-200"
          >
            <HiX className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Upload button (alternative to click on image) */}
      <div className="mt-4 text-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : preview ? 'Change Photo' : 'Upload Photo'}
        </Button>
        <p className="mt-2 text-xs text-neutral-500">
          JPG, PNG, WebP or GIF (max 10MB)
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;
