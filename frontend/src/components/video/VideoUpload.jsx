import React, { useState, useRef, useCallback } from 'react';
import { 
  HiUpload, 
  HiX, 
  HiCheck, 
  HiOutlineInformationCircle,
  HiOutlineFilm
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import { Alert, Button, Input, Select } from '../index';
import { VIDEO_CATEGORIES } from '../../services/video';

/**
 * Component for uploading pitch videos with validation for 60-second limit and vertical orientation
 */
const VideoUpload = ({ onUpload, isLoading = false, className = '', videoConfig = null }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [videoData, setVideoData] = useState({
    duration: 0,
    aspectRatio: 0,
    isValid: false,
  });
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Determine if this is an investor video
  const isInvestorVideo = videoConfig?.type === 'investment_criteria';
  const uploadTitle = isInvestorVideo ? 'Upload Investment Criteria Video' : 'Upload Pitch Video';
  const uploadSubtitle = isInvestorVideo 
    ? 'Share what kind of startups and ideas you are looking to invest in' 
    : 'Create your 60-second elevator pitch';

  // Handle drag events for the dropzone
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // Process the selected video file
  const processVideoFile = useCallback((file) => {
    if (!file || !file.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      return;
    }

    // Create a preview URL for the video
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    setSelectedFile(file);
    setError('');

    // Load the video to check its properties
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      // Check video duration (must be 60 seconds or less)
      const duration = video.duration;
      const width = video.videoWidth;
      const height = video.videoHeight;
      const aspectRatio = width / height;

      // Validate video constraints
      let isValid = true;
      let errorMessage = '';

      if (duration > 60) {
        isValid = false;
        errorMessage = 'Video must be 60 seconds or less.';
      } else if (aspectRatio > 0.65) { // Not vertical enough (9:16 is 0.5625)
        isValid = false;
        errorMessage = 'Video must have a vertical orientation (9:16 aspect ratio).';
      }
      
      console.log(`Video validation: duration=${duration}s, aspectRatio=${aspectRatio}, isValid=${isValid}`);
      

      setVideoData({
        duration,
        aspectRatio,
        isValid,
      });

      if (!isValid) {
        setError(errorMessage);
      }

      // Clean up the object URL
      URL.revokeObjectURL(fileUrl);
    };

    video.onerror = () => {
      setError('Failed to load video. Please select another file.');
      URL.revokeObjectURL(fileUrl);
    };

    video.src = fileUrl;
    
    // Make sure the video loads properly
    console.log('Loading video metadata from:', fileUrl);
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processVideoFile(files[0]);
    }
  }, [processVideoFile]);

  // Handle file selection from the file input
  const handleFileChange = useCallback((e) => {
    if (e.target.files.length > 0) {
      processVideoFile(e.target.files[0]);
    }
  }, [processVideoFile]);

  // Handle changes to metadata inputs
  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  // Handle category selection
  const handleCategoryChange = (value) => {
    setMetadata(prev => ({ ...prev, category: value }));
  };

  // Reset the form
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    setMetadata({
      title: '',
      description: '',
      category: '',
    });
    setVideoData({
      duration: 0,
      aspectRatio: 0,
      isValid: false,
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a video file.');
      return;
    }

    if (!videoData.isValid) {
      return; // Don't proceed if video validation failed
    }

    if (!metadata.title) {
      setError('Please enter a title for your pitch.');
      return;
    }

    if (!metadata.category) {
      setError('Please select a category for your pitch.');
      return;
    }

    // Call the onUpload function with file and metadata
    onUpload(selectedFile, {
      ...metadata,
      duration: videoData.duration,
      aspectRatio: videoData.aspectRatio,
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">{uploadTitle}</h2>
      <p className="text-sm text-gray-600 mb-4">{uploadSubtitle}</p>
      
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Video Upload Area */}
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors ${
              isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
            
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: isDragging ? 1.05 : 1 }}
              className="flex flex-col items-center"
            >
              <HiUpload className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {isInvestorVideo ? 'Upload Your Investment Video' : 'Upload Your Pitch Video'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop or click to browse
              </p>
              <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-600 w-full max-w-md">
                <div className="flex items-center mb-2">
                  <HiOutlineInformationCircle className="h-4 w-4 mr-1 text-gray-600" />
                  <span className="font-medium text-gray-700">Requirements:</span>
                </div>
                <ul className="list-disc list-inside pl-2 space-y-1 text-gray-600">
                  <li>Maximum 60 seconds</li>
                  <li>Vertical orientation (9:16 aspect ratio)</li>
                  <li>Maximum file size: 100MB</li>
                  {isInvestorVideo && <li>Clearly explain your investment criteria</li>}
                </ul>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">Video Preview</h3>
              <button
                type="button"
                onClick={handleReset}
                className="text-gray-500 hover:text-red-500"
              >
                <HiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative bg-black rounded-lg overflow-hidden mx-auto" style={{ maxWidth: '240px', aspectRatio: '9/16' }}>
              <video
                ref={videoRef}
                src={previewUrl}
                className="w-full h-full object-contain"
                controls
                playsInline
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 flex justify-between">
                <span>{videoData.duration.toFixed(1)}s</span>
                <span className="flex items-center">
                  {videoData.isValid ? (
                    <HiCheck className="h-4 w-4 text-green-400 mr-1" />
                  ) : (
                    <HiX className="h-4 w-4 text-red-400 mr-1" />
                  )}
                  {videoData.isValid ? "Valid" : "Invalid"}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Video Details */}
        <div className="space-y-4 mb-6">
          <Input
            label="Title"
            id="title"
            name="title"
            value={metadata.title}
            onChange={handleMetadataChange}
            placeholder={isInvestorVideo ? "e.g., Looking for AI/ML startups" : "Enter a title for your pitch"}
            leftIcon={<HiOutlineFilm className="h-5 w-5 text-gray-400" />}
            maxLength={60}
            required
          />
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={metadata.description}
              onChange={handleMetadataChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder={isInvestorVideo 
                ? "Describe what kind of startups you're looking for, investment range, and focus areas" 
                : "Describe your pitch in a few sentences"}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {metadata.description.length}/500 characters
            </p>
          </div>
          
          <Select
            label="Category"
            id="category"
            name="category"
            value={metadata.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            options={VIDEO_CATEGORIES.map(cat => ({ value: cat.id, label: cat.label }))}
            placeholder="Select a category"
            required
          />
        </div>
        
        {/* Actions */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="mr-2"
            disabled={isLoading}
          >
            Reset
          </Button>
          
          <Button
            type="submit"
            disabled={!selectedFile || !videoData.isValid || !metadata.title || !metadata.category || isLoading}
          >
            {isLoading ? "Uploading..." : (isInvestorVideo ? "Upload Investment Video" : "Upload Pitch")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VideoUpload;