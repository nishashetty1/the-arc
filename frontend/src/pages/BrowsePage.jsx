import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../components';
import { Button, Spinner, Select } from '../components';
import { HiHeart, HiShare, HiUserAdd, HiPlay, HiFilter, HiCheck, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase/config';
import { sendConnectionRequest } from '../services/connections';
import { getVideoUrl, getThumbnailUrl } from '../utils/cloudinary/config';
import { trackVideoView } from '../services/analytics';
import { toggleVideoLike } from '../services/video';

const BrowsePage = () => {
  const user = useAuthStore((state) => state.user);
  
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    userType: 'all',
    location: 'all',
    videoType: 'all',
    sortBy: 'recent'
  });
  
  // Connection request states
  const [connectionRequests, setConnectionRequests] = useState({});
  const [likedVideos, setLikedVideos] = useState(new Set());

  // Get unique locations from all videos
  const uniqueLocations = useMemo(() => {
    const locations = videos
      .map(video => video.user.location)
      .filter(location => location && location !== 'Unknown');
    return [...new Set(locations)].sort();
  }, [videos]);

  // Fetch videos
  useEffect(() => {
    fetchVideos();
  }, [user]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [videos, filters]);

  const fetchVideos = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError('');

    try {
      const videosRef = collection(db, 'pitchVideos');
      const videosSnapshot = await getDocs(videosRef);
      
      const videosData = await Promise.all(
        videosSnapshot.docs.map(async (videoDoc) => {
          const videoData = videoDoc.data();
          
          // Skip current user's videos
          if (videoData.userId === user.uid) {
            return null;
          }
          
          // Fetch user details
          const userRef = doc(db, 'users', videoData.userId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};
          
          return {
            id: videoDoc.id,
            ...videoData,
            createdAt: videoData.createdAt?.toDate() || new Date(),
            user: {
              id: videoData.userId,
              displayName: userData.displayName || 'Unknown User',
              photoURL: userData.photoURL || null,
              userType: userData.userType || 'individual',
              location: userData.location || 'Unknown',
              company: userData.company || '',
              bio: userData.bio || ''
            }
          };
        })
      );

      const filteredVideos = videosData.filter(video => video !== null);
      filteredVideos.sort((a, b) => b.createdAt - a.createdAt);

      setVideos(filteredVideos);
      
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...videos];

    // Filter by user type
    if (filters.userType !== 'all') {
      filtered = filtered.filter(video => video.user.userType === filters.userType);
    }

    // Filter by location
    if (filters.location !== 'all') {
      filtered = filtered.filter(video => video.user.location === filters.location);
    }

    // Filter by video type
    if (filters.videoType !== 'all') {
      filtered = filtered.filter(video => video.videoType === filters.videoType);
    }

    // Sort
    switch (filters.sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.createdAt - b.createdAt);
        break;
      default:
        break;
    }

    setFilteredVideos(filtered);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLike = async (videoId) => {
    try {
      const result = await toggleVideoLike(videoId, user.uid);
      console.log('✅ Video like toggled:', videoId, result);
      
      // Update local state based on API response
      if (result.liked) {
        setLikedVideos(prev => new Set([...prev, videoId]));
      } else {
        setLikedVideos(prev => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });
      }
      
      // Update the videos array with new like count
      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === videoId 
            ? { ...v, likes: result.likes }
            : v
        )
      );
    } catch (err) {
      console.error('❌ Failed to toggle like:', err);
    }
  };

  const handleShare = async (video) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${video.user.displayName}'s Pitch`,
          text: `Check out this pitch from ${video.user.displayName}!`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleConnect = async (video) => {
    try {
      setConnectionRequests(prev => ({
        ...prev,
        [video.user.id]: 'sending'
      }));

      await sendConnectionRequest(user.uid, video.user.id, {
        displayName: user.displayName,
        photoURL: user.photoURL,
        userType: user.userType
      });
      
      setConnectionRequests(prev => ({
        ...prev,
        [video.user.id]: 'sent'
      }));

      setTimeout(() => {
        setConnectionRequests(prev => {
          const newState = { ...prev };
          delete newState[video.user.id];
          return newState;
        });
      }, 3000);

    } catch (err) {
      console.error('Error sending connection request:', err);
      setConnectionRequests(prev => ({
        ...prev,
        [video.user.id]: 'error'
      }));
      
      setTimeout(() => {
        setConnectionRequests(prev => {
          const newState = { ...prev };
          delete newState[video.user.id];
          return newState;
        });
      }, 3000);
    }
  };

  return (
    <DashboardLayout user={user} userType={user?.userType}>
      {/* Header with Filters */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Explore</h1>
            <p className="text-neutral-600">
              Discover amazing pitch videos • {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
            </p>
          </div>
          
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <HiFilter className="h-5 w-5" />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          </Button>
        </div>

        {/* Filters Bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* User Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      User Type
                    </label>
                    <Select
                      value={filters.userType}
                      onChange={(e) => handleFilterChange('userType', e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="startup">🚀 Startups</option>
                      <option value="individual">👤 Individuals</option>
                      <option value="investor">💰 Investors</option>
                    </Select>
                  </div>

                  {/* Location Filter - Dropdown with unique locations */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Location
                    </label>
                    <Select
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    >
                      <option value="all">All Locations</option>
                      {uniqueLocations.map(location => (
                        <option key={location} value={location}>
                          📍 {location}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Video Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Video Type
                    </label>
                    <Select
                      value={filters.videoType}
                      onChange={(e) => handleFilterChange('videoType', e.target.value)}
                    >
                      <option value="all">All Videos</option>
                      <option value="pitch">🎯 Pitch Videos</option>
                      <option value="investment_criteria">💼 Investment Criteria</option>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Sort By
                    </label>
                    <Select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                      <option value="recent">🕒 Most Recent</option>
                      <option value="oldest">📅 Oldest First</option>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filters.userType !== 'all' || filters.location !== 'all' || filters.videoType !== 'all') && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-sm font-medium text-neutral-700">Active filters:</span>
                      {filters.userType !== 'all' && (
                        <span className="inline-flex items-center space-x-1 bg-primary-100 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">
                          <span>{filters.userType}</span>
                          <button onClick={() => handleFilterChange('userType', 'all')} className="hover:text-primary-900">
                            <HiX className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                      {filters.location !== 'all' && (
                        <span className="inline-flex items-center space-x-1 bg-secondary-100 text-secondary-700 text-xs font-medium px-3 py-1 rounded-full">
                          <span>{filters.location}</span>
                          <button onClick={() => handleFilterChange('location', 'all')} className="hover:text-secondary-900">
                            <HiX className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                      {filters.videoType !== 'all' && (
                        <span className="inline-flex items-center space-x-1 bg-accent-100 text-accent-700 text-xs font-medium px-3 py-1 rounded-full">
                          <span>{filters.videoType}</span>
                          <button onClick={() => handleFilterChange('videoType', 'all')} className="hover:text-accent-900">
                            <HiX className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                      <button 
                        onClick={() => setFilters({ userType: 'all', location: 'all', videoType: 'all', sortBy: 'recent' })}
                        className="text-xs text-neutral-600 hover:text-neutral-900 underline"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Spinner size="lg" />
          <p className="text-neutral-600 mt-4">Loading videos...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <HiX className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <Button onClick={fetchVideos}>Try Again</Button>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
          <div className="bg-neutral-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <HiPlay className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">
            No videos found
          </h3>
          <p className="text-neutral-600 mb-6">
            {videos.length === 0 
              ? "Be the first to upload a pitch video!" 
              : "Try adjusting your filters to see more content."}
          </p>
          {(filters.userType !== 'all' || filters.location !== 'all' || filters.videoType !== 'all') && (
            <Button 
              variant="outline"
              onClick={() => setFilters({ userType: 'all', location: 'all', videoType: 'all', sortBy: 'recent' })}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2">
          {filteredVideos.map((video, index) => (
            <ExploreVideoCard
              key={video.id}
              video={video}
              index={index}
              onSelect={() => setSelectedVideo(video)}
              onLike={() => handleLike(video.id)}
              isLiked={likedVideos.has(video.id)}
            />
          ))}
        </div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
            onConnect={handleConnect}
            onLike={handleLike}
            onShare={handleShare}
            connectionRequest={connectionRequests[selectedVideo.user.id]}
            isLiked={likedVideos.has(selectedVideo.id)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

// Instagram Explore-style Video Card
const ExploreVideoCard = ({ video, index, onSelect, onLike, isLiked }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className="relative aspect-[9/16] bg-neutral-900 rounded-lg overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <img
        src={getThumbnailUrl(video.cloudinaryPublicId)}
        alt={video.user.displayName}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />

      {/* Hover Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform transition-transform duration-300 group-hover:scale-110">
            <HiPlay className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        {/* User Info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center space-x-2 mb-2">
            {video.user.photoURL ? (
              <img
                src={video.user.photoURL}
                alt={video.user.displayName}
                className="h-8 w-8 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-xs border-2 border-white">
                {video.user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{video.user.displayName}</p>
              <p className="text-white/80 text-xs truncate">{video.user.location}</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">
              {video.user.userType === 'startup' ? '🚀 Startup' : 
               video.user.userType === 'investor' ? '💰 Investor' : '👤 Individual'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <HiHeart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Video Type Badge - Top Right */}
      <div className="absolute top-2 right-2">
        <span className="text-xs bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full">
          {video.videoType === 'pitch' ? '🎯' : '💼'}
        </span>
      </div>
    </motion.div>
  );
};

// Video Modal Component
const VideoModal = ({ video, onClose, onConnect, onLike, onShare, connectionRequest, isLiked }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const videoRef = React.useRef(null);
  const viewTimerRef = React.useRef(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Start timer to track view after 3 seconds
    if (!hasTrackedView && user && video) {
      viewTimerRef.current = setTimeout(async () => {
        try {
          await trackVideoView(video.id, user.uid);
          setHasTrackedView(true);
          console.log('📊 Video view tracked (Browse):', video.id);
        } catch (err) {
          console.error('Failed to track video view:', err);
        }
      }, 3000);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }
    };
  }, [hasTrackedView, user, video]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="relative bg-black rounded-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <HiX className="h-6 w-6" />
        </button>

        {/* Video Player */}
        <div className="relative aspect-[9/16] bg-black">
          <video
            ref={videoRef}
            src={getVideoUrl(video.cloudinaryPublicId)}
            poster={getThumbnailUrl(video.cloudinaryPublicId)}
            className="w-full h-full object-contain"
            loop
            playsInline
            onClick={togglePlayPause}
          />

          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
              onClick={togglePlayPause}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-6">
                <HiPlay className="h-12 w-12 text-primary-600" />
              </div>
            </div>
          )}
        </div>

        {/* Video Info & Actions */}
        <div className="bg-white p-6">
          {/* User Info */}
          <div className="flex items-start space-x-3 mb-4">
            {video.user.photoURL ? (
              <img
                src={video.user.photoURL}
                alt={video.user.displayName}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-lg">
                {video.user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-neutral-900">{video.user.displayName}</h3>
              <p className="text-sm text-neutral-600">
                {video.user.userType === 'startup' && video.user.company ? video.user.company : 
                 video.user.userType === 'investor' ? 'Investor' : 'Individual'}
                {' • '}
                {video.user.location}
              </p>
            </div>

            {/* Connect Button */}
            <Button
              size="sm"
              onClick={() => onConnect(video)}
              disabled={connectionRequest === 'sending' || connectionRequest === 'sent'}
              className="flex items-center space-x-2"
            >
              {connectionRequest === 'sending' ? (
                <>
                  <Spinner size="sm" />
                  <span>Sending...</span>
                </>
              ) : connectionRequest === 'sent' ? (
                <>
                  <HiCheck className="h-4 w-4" />
                  <span>Sent</span>
                </>
              ) : (
                <>
                  <HiUserAdd className="h-4 w-4" />
                  <span>Connect</span>
                </>
              )}
            </Button>
          </div>

          {/* Video Title & Description */}
          {video.title && (
            <p className="text-neutral-900 font-medium mb-2">{video.title}</p>
          )}
          {video.user.bio && (
            <p className="text-neutral-600 text-sm mb-4">{video.user.bio}</p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4 border-t border-neutral-200">
            <button
              onClick={() => onLike(video.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                isLiked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <HiHeart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{isLiked ? 'Liked' : 'Like'}</span>
            </button>

            <button
              onClick={() => onShare(video)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
            >
              <HiShare className="h-5 w-5" />
              <span className="text-sm font-medium">Share</span>
            </button>

            <div className="flex-1"></div>

            <span className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-full">
              {video.videoType === 'pitch' ? '🎯 Pitch Video' : '💼 Investment Opportunity'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BrowsePage;
