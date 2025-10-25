import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  HiPlay, 
  HiPause, 
  HiVolumeUp, 
  HiVolumeOff,
  HiOutlineHeart,
  HiHeart,
  HiOutlineShare,
} from 'react-icons/hi';
import { motion } from 'framer-motion';

/**
 * Custom video player designed for vertical/portrait videos (9:16 aspect ratio)
 * Optimized for pitch videos with mobile-inspired controls
 */
const VerticalVideoPlayer = ({
  videoUrl,
  thumbnailUrl,
  title = '',
  description = '',
  userName = '',
  userAvatar = '',
  likes = 0,
  isLiked = false,
  onLikeToggle = () => {},
  onShareClick = () => {},
  autoPlay = false,
  loop = true,
  muted = false,
  className = '',
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [liked, setLiked] = useState(isLiked);
  const controlsTimeoutRef = useRef(null);

  // Setup video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set loop attribute
    video.loop = loop;

    // Play video if autoPlay is true
    if (autoPlay) {
      video.play().catch(error => {
        console.error("Autoplay prevented:", error);
        setIsPlaying(false);
      });
    }

    // Set up event listeners
    const onTimeUpdate = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(isNaN(currentProgress) ? 0 : currentProgress);
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const onEnded = () => {
      if (!loop) {
        setIsPlaying(false);
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('ended', onEnded);
    };
  }, [autoPlay, loop]);

  // Handle click to toggle play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error("Play prevented:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute state
  const toggleMute = (e) => {
    e.stopPropagation(); // Prevent triggering play/pause
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle video container interaction (show/hide controls)
  const handleVideoContainerInteraction = () => {
    setShowControls(true);
    resetControlsTimeout();
  };

  // Reset the timeout for hiding controls
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000); // Hide controls after 3 seconds of inactivity
  };

  // Format time (seconds) to MM:SS
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle like button click
  const handleLike = (e) => {
    e.stopPropagation(); // Prevent triggering play/pause
    setLiked(!liked);
    onLikeToggle(!liked);
  };

  // Handle share button click
  const handleShare = (e) => {
    e.stopPropagation(); // Prevent triggering play/pause
    onShareClick();
  };

  // Seek to position in video when clicking on the progress bar
  const handleProgressBarClick = (e) => {
    e.stopPropagation(); // Prevent triggering play/pause
    
    if (!videoRef.current) return;
    
    const progressBar = e.currentTarget;
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
    const progressBarWidth = progressBar.offsetWidth;
    const seekPosition = (clickPosition / progressBarWidth) * videoRef.current.duration;
    
    videoRef.current.currentTime = seekPosition;
  };

  return (
    <div 
      className={`relative flex flex-col overflow-hidden bg-black rounded-lg ${className}`}
      style={{ aspectRatio: '9/16' }}
      onMouseEnter={handleVideoContainerInteraction}
      onMouseMove={handleVideoContainerInteraction}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlayPause}
      onTouchStart={handleVideoContainerInteraction}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-contain bg-black z-10"
        playsInline
        muted={isMuted}
        poster={thumbnailUrl}
      />

      {/* Gradient Overlay for Text Readability */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-20 transition-opacity duration-300" />
      )}

      {/* Video Controls */}
      <motion.div
        className="absolute inset-0 z-30 flex flex-col justify-between p-4"
        initial={{ opacity: 1 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Top controls - Title & User */}
        <div className="flex items-center">
          {userName && (
            <div className="flex items-center">
              {userAvatar && (
                <img 
                  src={userAvatar} 
                  alt={userName} 
                  className="w-8 h-8 rounded-full border border-white/30"
                />
              )}
              <span className="ml-2 text-white text-sm font-medium drop-shadow-md">
                {userName}
              </span>
            </div>
          )}
        </div>

        {/* Middle controls - Play/Pause button */}
        <div className="flex items-center justify-center flex-1">
          {!isPlaying && (
            <button 
              className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
              onClick={togglePlayPause}
            >
              <HiPlay className="w-8 h-8 text-white" />
            </button>
          )}
        </div>

        {/* Bottom controls - Progress, volume, like, share */}
        <div className="space-y-2">
          {/* Video details */}
          {(title || description) && (
            <div className="mb-2">
              {title && <h3 className="text-white font-medium text-sm">{title}</h3>}
              {description && <p className="text-white/80 text-xs line-clamp-2">{description}</p>}
            </div>
          )}

          {/* Progress bar */}
          <div 
            className="h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
            onClick={handleProgressBarClick}
          >
            <div 
              className="h-full bg-primary-500" 
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time and controls */}
          <div className="flex items-center justify-between">
            {/* Time display */}
            <div className="text-white/80 text-xs">
              {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-4">
              {/* Volume button */}
              <button
                className="text-white hover:text-primary-300 transition-colors"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? 
                  <HiVolumeOff className="w-5 h-5" /> : 
                  <HiVolumeUp className="w-5 h-5" />
                }
              </button>

              {/* Like button */}
              <button
                className={`${liked ? 'text-red-500' : 'text-white'} hover:scale-110 transition-all`}
                onClick={handleLike}
                aria-label={liked ? "Unlike" : "Like"}
              >
                {liked ? 
                  <HiHeart className="w-5 h-5" /> : 
                  <HiOutlineHeart className="w-5 h-5" />
                }
                <span className="text-xs ml-1">{liked ? likes + 1 : likes}</span>
              </button>

              {/* Share button */}
              <button
                className="text-white hover:text-primary-300 transition-colors"
                onClick={handleShare}
                aria-label="Share"
              >
                <HiOutlineShare className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

VerticalVideoPlayer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  thumbnailUrl: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  userName: PropTypes.string,
  userAvatar: PropTypes.string,
  likes: PropTypes.number,
  isLiked: PropTypes.bool,
  onLikeToggle: PropTypes.func,
  onShareClick: PropTypes.func,
  autoPlay: PropTypes.bool,
  loop: PropTypes.bool,
  muted: PropTypes.bool,
  className: PropTypes.string,
};

export default VerticalVideoPlayer;