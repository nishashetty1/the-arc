import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiOutlineVideoCamera, HiExclamationCircle } from 'react-icons/hi';
import { Button, Card, Spinner } from '../components';
import VideoUpload from '../components/video/VideoUpload';
import VerticalVideoPlayer from '../components/video/VerticalVideoPlayer';
import { uploadPitchVideo, getUserPitchVideos, deletePitchVideo, VIDEO_CATEGORIES, getVideoTypeConfig } from '../services/video';
import useAuthStore from '../stores/authStore';
import { validateCloudinaryConfig } from '../utils/cloudinary/config';
import { validateVideoFile } from '../utils/cloudinary/upload';

const PitchVideoPage = () => {
  const { user } = useAuthStore();
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [error, setError] = useState('');
  const [configStatus, setConfigStatus] = useState(null);
  
  // Get video type configuration based on user type
  const videoConfig = user ? getVideoTypeConfig(user.userType) : getVideoTypeConfig('individual');

  // Check Cloudinary configuration on mount
  useEffect(() => {
    const configValidation = validateCloudinaryConfig();
    if (!configValidation.isValid) {
      setError(`Cloudinary configuration error: ${configValidation.errors.join(', ')}`);
      setConfigStatus({ success: false, errors: configValidation.errors });
    } else {
      setConfigStatus({ success: true, config: configValidation.config });
      console.log('✅ Cloudinary is properly configured');
    }
  }, []);

  // Fetch user's videos
  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) {
        console.log('No user logged in, skipping video fetch');
        return;
      }
      
      try {
        setIsLoading(true);
        setError('');
        console.log('Fetching videos for user:', user.uid);
        const userVideos = await getUserPitchVideos(user.uid);
        console.log('Fetched videos:', userVideos);
        setVideos(userVideos);
      } catch (err) {
        console.error('Error fetching videos:', err);
        
        // Check if it's an index error
        if (err.message && err.message.includes('index')) {
          const indexUrlMatch = err.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
          const indexUrl = indexUrlMatch ? indexUrlMatch[0] : null;
          
          if (indexUrl) {
            setError(
              <div>
                <p className="font-medium mb-2">Firestore Index Required</p>
                <p className="text-sm mb-3">
                  Your videos are saved, but we need to create a database index to display them.
                </p>
                <a
                  href={indexUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Create Index in Firebase →
                </a>
                <p className="text-xs mt-3 text-gray-600">
                  After creating the index (takes 1-2 minutes), refresh this page.
                </p>
              </div>
            );
          } else {
            setError(`Database index required: ${err.message}`);
          }
        } else {
          setError(`Failed to load your videos: ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [user]);

  // Handle video upload
  const handleUpload = async (videoFile, metadata) => {
    if (!user) {
      setError('You must be logged in to upload videos.');
      return;
    }
    
    try {
      setIsUploading(true);
      setError('');
      
      console.log('Starting video upload process...');
      console.log('Video file size:', (videoFile.size / 1024 / 1024).toFixed(2) + ' MB');
      console.log('Video metadata:', metadata);
      console.log('User ID:', user.uid);
      
      // Upload video with metadata
      const uploadedVideo = await uploadPitchVideo(videoFile, user.uid, {
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        duration: metadata.duration,
        aspectRatio: metadata.aspectRatio,
        videoType: videoConfig.type,
        userType: user.userType
      });
      
      console.log('Upload completed successfully:', uploadedVideo);
      
      // Add the new video to the list
      setVideos(prevVideos => [uploadedVideo, ...prevVideos]);
      setShowUploadForm(false);
    } catch (err) {
      console.error('Error uploading video:', err);
      // Show a more specific error message if available
      setError(err.message || 'Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle video deletion
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await deletePitchVideo(videoId);
      setVideos(prevVideos => prevVideos.filter(v => v.id !== videoId));
      if (selectedVideo && selectedVideo.id === videoId) {
        setSelectedVideo(null);
      }
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Failed to delete video. Please try again.');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{videoConfig.pageTitle}</h1>
          <p className="text-gray-600 mt-1">
            {videoConfig.pageSubtitle}
          </p>
        </div>
        
        <Button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          leftIcon={showUploadForm ? null : <HiPlus />}
        >
          {showUploadForm ? 'Cancel' : videoConfig.uploadButtonText}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start">
          <HiExclamationCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium mb-1">Configuration Error</p>
            <p>{error}</p>
            <p className="text-sm mt-2">
              Please check your environment variables for Cloudinary configuration.
            </p>
            {configStatus && !configStatus.success && (
              <div className="mt-2 text-sm">
                <p className="font-medium">Missing/Invalid:</p>
                <ul className="list-disc list-inside pl-2">
                  {configStatus.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {configStatus && configStatus.success && !error && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-start">
          <HiExclamationCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium mb-1">✅ Cloudinary Ready</p>
            <p className="text-sm">
              Cloud Name: <span className="font-mono">{configStatus.config.cloudName}</span>
            </p>
            <p className="text-sm mt-1">
              Video uploads are configured and ready to use.
            </p>
          </div>
        </div>
      )}

      {/* Video Upload Form */}
      {showUploadForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <VideoUpload 
            onUpload={handleUpload}
            isLoading={isUploading}
            videoConfig={videoConfig}
          />
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Video List */}
        <div className="md:w-1/2 lg:w-2/3">
          <h2 className="text-xl font-semibold mb-4">Your Videos</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : videos.length === 0 ? (
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 text-center">
              <HiOutlineVideoCamera className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No videos yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                {user?.userType === 'investor' 
                  ? 'Get started by creating your first investment criteria video.'
                  : 'Get started by creating your first 60-second pitch video.'}
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => setShowUploadForm(true)}
                  leftIcon={<HiPlus />}
                >
                  {videoConfig.uploadButtonText}
                </Button>
              </div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {videos.map(video => (
                <motion.div key={video.id} variants={itemVariants}>
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedVideo?.id === video.id ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="aspect-[9/16] bg-black relative rounded overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <HiOutlineVideoCamera className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <div className="text-white text-sm font-medium truncate">
                          {video.title}
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {video.createdAt instanceof Date ? video.createdAt.toLocaleDateString() : new Date(video.createdAt).toLocaleDateString()}
                        </div>
                        <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          {VIDEO_CATEGORIES.find(cat => cat.id === video.category)?.label || video.category}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {Math.round(video.duration)}s
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVideo(video.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
        
        {/* Video Player */}
        <div className="md:w-1/2 lg:w-1/3">
          <h2 className="text-xl font-semibold mb-4">Video Preview</h2>
          
          {selectedVideo ? (
            <div className="sticky top-24">
              <VerticalVideoPlayer
                videoUrl={selectedVideo.videoUrl}
                thumbnailUrl={selectedVideo.thumbnailUrl}
                title={selectedVideo.title}
                description={selectedVideo.description}
                userName={selectedVideo.displayName}
                userAvatar={selectedVideo.userPhotoURL}
                likes={selectedVideo.likes || 0}
              />
              <div className="mt-4 bg-white rounded-lg shadow p-4">
                <h3 className="font-medium text-lg">{selectedVideo.title}</h3>
                <div className="flex items-center mt-1 mb-3">
                  <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                    {VIDEO_CATEGORIES.find(cat => cat.id === selectedVideo.category)?.label || selectedVideo.category}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {Math.round(selectedVideo.duration)}s
                  </span>
                </div>
                {selectedVideo.description && (
                  <p className="text-gray-700 text-sm mt-2">
                    {selectedVideo.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-lg h-96 flex flex-col items-center justify-center text-center p-6">
              <HiOutlineVideoCamera className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No video selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a video from the list to preview it here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PitchVideoPage;