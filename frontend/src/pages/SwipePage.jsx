import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  HiHeart, 
  HiX, 
  HiUserAdd, 
  HiShare,
  HiCheck,
  HiRefresh,
  HiArrowLeft,
  HiPlay,
  HiPause,
  HiVolumeOff,
  HiVolumeUp
} from 'react-icons/hi';
import useAuthStore from '../stores/authStore';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase/config';
import { sendConnectionRequest } from '../services/connections';
import { getVideoUrl, getThumbnailUrl } from '../utils/cloudinary/config';
import { toggleVideoLike } from '../services/video';
import { trackVideoView } from '../services/analytics';

const SwipePage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showFeedback, setShowFeedback] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const observerRef = useRef(null);

  // Fetch videos
  useEffect(() => {
    fetchVideos();
  }, [user]);

  const fetchVideos = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const videosRef = collection(db, 'pitchVideos');
      const snapshot = await getDocs(videosRef);
      
      const videosData = await Promise.all(
        snapshot.docs.map(async (videoDoc) => {
          const videoData = videoDoc.data();
          
          // Skip current user's videos
          if (videoData.userId === user.uid) {
            return null;
          }
          
          // Fetch user data
          const userDoc = await getDoc(doc(db, 'users', videoData.userId));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          return {
            id: videoDoc.id,
            ...videoData,
            user: {
              uid: videoData.userId,
              displayName: userData.displayName || 'Anonymous',
              photoURL: userData.photoURL || null,
              userType: userData.userType || 'individual',
              company: userData.company || null,
              location: userData.location || 'Unknown',
              bio: userData.bio || null
            }
          };
        })
      );
      
      setVideos(videosData.filter(video => video !== null));
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Intersection Observer for autoplay
  // Track which videos have been viewed
  const viewedVideosRef = useRef(new Set());
  const viewTimersRef = useRef({});

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5 // Video must be 50% visible to play
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        const videoId = video.dataset.videoId;
        
        if (entry.isIntersecting) {
          video.play().catch(err => console.log('Autoplay prevented:', err));
          
          // Start a timer to track the view after 3 seconds
          if (videoId && !viewedVideosRef.current.has(videoId)) {
            viewTimersRef.current[videoId] = setTimeout(async () => {
              try {
                await trackVideoView(videoId, user.uid);
                viewedVideosRef.current.add(videoId);
                console.log('📊 Video view tracked:', videoId);
              } catch (err) {
                console.error('Failed to track video view:', err);
              }
            }, 3000); // Track after 3 seconds of viewing
          }
        } else {
          video.pause();
          
          // Clear the timer if user scrolls away before 3 seconds
          if (videoId && viewTimersRef.current[videoId]) {
            clearTimeout(viewTimersRef.current[videoId]);
            delete viewTimersRef.current[videoId];
          }
        }
      });
    }, options);

    // Observe all video elements
    videoRefs.current.forEach(video => {
      if (video) observerRef.current.observe(video);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      // Clear all timers
      Object.values(viewTimersRef.current).forEach(timer => clearTimeout(timer));
    };
  }, [videos, user]);

  // Scroll to video by index
  const scrollToVideo = useCallback((index) => {
    const video = videoRefs.current[index];
    if (video) {
      video.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Handle swipe actions
  const handleSwipeComplete = async (direction, video) => {
    if (direction === 'right') {
      // Connect
      setShowFeedback('connect');
      try {
        // Fetch current user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {
          displayName: user.displayName,
          photoURL: user.photoURL,
          userType: user.userType || 'individual'
        };
        
        await sendConnectionRequest(user.uid, video.userId, userData);
        console.log('✅ Connection request sent successfully to:', video.user.displayName);
      } catch (err) {
        console.error('❌ Connection request failed:', err);
        // Show error feedback briefly
        setShowFeedback('connectError');
        setTimeout(() => {
          setShowFeedback(null);
        }, 1500);
        return; // Don't proceed to next video on error
      }
    } else if (direction === 'left') {
      // Pass
      setShowFeedback('pass');
    }

    setTimeout(() => {
      setShowFeedback(null);
      if (currentIndex < videos.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        scrollToVideo(nextIndex);
      }
    }, 800);
  };

  const handleLike = async (video) => {
    setShowFeedback('like');
    try {
      const result = await toggleVideoLike(video.id, user.uid);
      console.log('✅ Video like toggled:', video.id, result);
      // Update the video likes count in local state based on API response
      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === video.id 
            ? { ...v, likes: result.likes, isLiked: result.liked }
            : v
        )
      );
    } catch (err) {
      console.error('❌ Failed to like video:', err);
    }
    setTimeout(() => setShowFeedback(null), 1000);
  };

  const handleShare = (video) => {
    if (navigator.share) {
      navigator.share({
        title: video.title || 'Check out this pitch',
        text: `Watch ${video.user.displayName}'s pitch`,
        url: window.location.href
      }).catch(err => console.log('Share failed:', err));
    }
  };

  const handleRefresh = () => {
    setCurrentIndex(0);
    scrollToVideo(0);
    fetchVideos();
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white text-lg">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchVideos}
            className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center px-4">
          <div className="bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full p-6 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
            <HiCheck className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            No videos available
          </h3>
          <p className="text-gray-400 mb-6">
            Check back later for new content
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black overflow-hidden">
      {/* Minimal Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
        >
          <HiArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-white font-bold text-xl">Discover</h1>
        <button
          onClick={handleRefresh}
          className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
        >
          <HiRefresh className="h-6 w-6" />
        </button>
      </header>

      {/* Video Container - Vertical Scroll */}
      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video, index) => (
          <ReelsVideo
            key={video.id}
            video={video}
            index={index}
            isActive={index === currentIndex}
            videoRef={(el) => (videoRefs.current[index] = el)}
            onSwipeComplete={handleSwipeComplete}
            onLike={handleLike}
            onShare={handleShare}
            showFeedback={showFeedback}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-20 left-0 right-0 z-40 flex justify-center space-x-1 px-4">
        {videos.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 max-w-[60px] rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white' 
                : index < currentIndex 
                ? 'bg-white/50' 
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Individual Reels Video Component
const ReelsVideo = ({ 
  video, 
  index,
  isActive,
  videoRef, 
  onSwipeComplete, 
  onLike, 
  onShare,
  showFeedback,
  isMuted,
  setIsMuted
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onSwipeComplete(direction, video);
    }
  };

  const togglePlayPause = () => {
    const videoEl = videoRef.current;
    if (videoEl) {
      if (videoEl.paused) {
        videoEl.play();
        setIsPlaying(true);
      } else {
        videoEl.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.muted = !videoEl.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.div 
      className="relative h-screen w-full snap-start snap-always flex items-center justify-center"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
    >
      {/* Video Player */}
      <div className="relative h-full w-full max-w-[480px] mx-auto bg-black">
        <video
          ref={videoRef}
          data-video-id={video.id}
          src={getVideoUrl(video.cloudinaryPublicId)}
          poster={getThumbnailUrl(video.cloudinaryPublicId)}
          className="w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlayPause}
        />

        {/* Overlay Feedback */}
        <AnimatePresence>
          {showFeedback && isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none"
            >
              {showFeedback === 'like' && (
                <div className="bg-pink-500 rounded-full p-8">
                  <HiHeart className="h-16 w-16 text-white fill-current" />
                </div>
              )}
              {showFeedback === 'connect' && (
                <div className="bg-green-500 rounded-full p-8">
                  <HiCheck className="h-16 w-16 text-white" />
                </div>
              )}
              {showFeedback === 'connectError' && (
                <div className="bg-red-500 rounded-full p-8">
                  <HiX className="h-16 w-16 text-white" />
                </div>
              )}
              {showFeedback === 'pass' && (
                <div className="bg-red-500 rounded-full p-8">
                  <HiX className="h-16 w-16 text-white" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swipe Direction Indicators */}
        {/* When swiping RIGHT (connect), show CONNECT text on LEFT */}
        <motion.div
          className="absolute top-1/2 left-8 -translate-y-1/2 pointer-events-none z-10"
          style={{
            opacity: useTransform(x, [50, 200], [0, 1]),
          }}
        >
          <div className="bg-green-500 text-white font-bold text-3xl px-6 py-4 rounded-2xl transform rotate-12 border-4 border-white shadow-2xl">
            CONNECT
          </div>
        </motion.div>

        {/* When swiping LEFT (pass), show PASS text on RIGHT */}
        <motion.div
          className="absolute top-1/2 right-8 -translate-y-1/2 pointer-events-none z-10"
          style={{
            opacity: useTransform(x, [-200, -50], [1, 0]),
          }}
        >
          <div className="bg-red-500 text-white font-bold text-3xl px-6 py-4 rounded-2xl transform -rotate-12 border-4 border-white shadow-2xl">
            PASS
          </div>
        </motion.div>

        {/* Action Buttons - Right Side */}
        <div className="absolute right-4 bottom-32 flex flex-col space-y-6">
          {/* Connect Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onSwipeComplete('right', video)}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full p-4 shadow-lg backdrop-blur-sm"
          >
            <HiUserAdd className="h-7 w-7" />
          </motion.button>

          {/* Like Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onLike(video)}
            className="bg-white/20 backdrop-blur-sm text-white rounded-full p-4 shadow-lg hover:bg-pink-500 transition-colors"
          >
            <HiHeart className="h-7 w-7" />
          </motion.button>

          {/* Share Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onShare(video)}
            className="bg-white/20 backdrop-blur-sm text-white rounded-full p-4 shadow-lg hover:bg-blue-500 transition-colors"
          >
            <HiShare className="h-7 w-7" />
          </motion.button>

          {/* Pass Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onSwipeComplete('left', video)}
            className="bg-white/20 backdrop-blur-sm text-white rounded-full p-4 shadow-lg hover:bg-red-500 transition-colors"
          >
            <HiX className="h-7 w-7" />
          </motion.button>
        </div>

        {/* Play/Pause & Mute Controls */}
        <div className="absolute top-20 right-4 flex flex-col space-y-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            className="bg-black/50 backdrop-blur-sm text-white rounded-full p-3 shadow-lg"
          >
            {isPlaying ? <HiPause className="h-5 w-5" /> : <HiPlay className="h-5 w-5" />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className="bg-black/50 backdrop-blur-sm text-white rounded-full p-3 shadow-lg"
          >
            {isMuted ? <HiVolumeOff className="h-5 w-5" /> : <HiVolumeUp className="h-5 w-5" />}
          </motion.button>
        </div>

        {/* User Info Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6 pb-8 text-white">
          <div className="flex items-start space-x-3 mb-3">
            {video.user.photoURL ? (
              <img
                src={video.user.photoURL}
                alt={video.user.displayName}
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-lg cursor-pointer"
                onClick={() => window.open(`/profile/${video.userId}`, '_blank')}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-lg cursor-pointer">
                {video.user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-0.5 flex items-center">
                {video.user.displayName}
                <span className="ml-2 text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {video.user.userType === 'startup' ? '🚀 Startup' : 
                   video.user.userType === 'investor' ? '💰 Investor' : '👤 Individual'}
                </span>
              </h3>
              <p className="text-sm opacity-90">
                {video.user.userType === 'startup' && video.user.company ? video.user.company : video.user.location}
              </p>
            </div>
          </div>

          {/* Video Title & Bio */}
          {video.title && (
            <p className="text-sm font-medium mb-2">
              {video.title}
            </p>
          )}
          {video.user.bio && (
            <p className="text-sm opacity-80 line-clamp-2">
              {video.user.bio}
            </p>
          )}

          {/* Video Type Badge */}
          <div className="mt-3">
            <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {video.videoType === 'pitch' ? '🎯 Pitch Video' : '💼 Investment Opportunity'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipePage;
