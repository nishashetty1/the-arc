import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components';
import { Card, CardContent, Button, Spinner, Badge } from '../components';
import { HiMail, HiLocationMarker, HiBriefcase, HiUserGroup, HiArrowLeft, HiPlay } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase/config';
import { getOrCreateConversation } from '../services/messages';
import useAuthStore from '../stores/authStore';
import { getVideoUrl, getThumbnailUrl } from '../utils/cloudinary/config';

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [playingVideoId, setPlayingVideoId] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch user profile
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError('User not found');
        return;
      }

      const userData = userSnap.data();

      // Fetch user-specific profile data based on userType
      let additionalData = {};
      if (userData.userType === 'startup') {
        const startupRef = doc(db, 'startups', userId);
        const startupSnap = await getDoc(startupRef);
        if (startupSnap.exists()) {
          additionalData = startupSnap.data();
        }
      } else if (userData.userType === 'individual') {
        const individualRef = doc(db, 'individuals', userId);
        const individualSnap = await getDoc(individualRef);
        if (individualSnap.exists()) {
          additionalData = individualSnap.data();
        }
      } else if (userData.userType === 'investor') {
        const investorRef = doc(db, 'investors', userId);
        const investorSnap = await getDoc(investorRef);
        if (investorSnap.exists()) {
          additionalData = investorSnap.data();
        }
      }

      setProfile({
        ...userData,
        ...additionalData,
        uid: userId
      });

      // Fetch user's videos
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const videosRef = collection(db, 'pitchVideos');
      const videosQuery = query(videosRef, where('userId', '==', userId));
      const videosSnap = await getDocs(videosQuery);
      
      const videosData = videosSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setVideos(videosData);

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      const conversationId = await getOrCreateConversation(currentUser.uid, userId);
      navigate(`/messages?conversation=${conversationId}`);
    } catch (err) {
      console.error('Error opening message:', err);
      alert('Failed to open conversation');
    }
  };

  const toggleVideoPlay = (videoId) => {
    setPlayingVideoId(prev => prev === videoId ? null : videoId);
  };

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case 'startup':
        return 'bg-blue-100 text-blue-800';
      case 'individual':
        return 'bg-green-100 text-green-800';
      case 'investor':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center space-x-2"
      >
        <HiArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </Button>

      {/* Profile Header Card */}
      <Card className="mb-6 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
            {/* Profile Picture */}
            <div className="relative -mt-16 mb-4 md:mb-0">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="h-32 w-32 rounded-full border-4 border-white bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {profile.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    {profile.displayName || 'Unknown User'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={getUserTypeColor(profile.userType)}>
                      {profile.userType === 'startup' ? '🚀 Startup' :
                       profile.userType === 'investor' ? '💰 Investor' : '👤 Individual'}
                    </Badge>
                    {profile.userType === 'startup' && profile.companyName && (
                      <Badge variant="secondary">
                        <HiBriefcase className="h-3 w-3 mr-1" />
                        {profile.companyName}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {currentUser.uid !== userId && (
                  <div className="flex space-x-3 mt-4 md:mt-0">
                    <Button onClick={handleMessage} className="flex items-center space-x-2">
                      <HiMail className="h-5 w-5" />
                      <span>Message</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - About */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">About</h2>
              
              {profile.location && (
                <div className="flex items-center space-x-2 text-neutral-600 mb-3">
                  <HiLocationMarker className="h-5 w-5 text-neutral-400" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.email && (
                <div className="flex items-center space-x-2 text-neutral-600 mb-3">
                  <HiMail className="h-5 w-5 text-neutral-400" />
                  <span>{profile.email}</span>
                </div>
              )}

              {profile.description && (
                <div className="mt-4">
                  <h3 className="font-semibold text-neutral-900 mb-2">Description</h3>
                  <p className="text-neutral-700">{profile.description}</p>
                </div>
              )}

              {profile.bio && (
                <div className="mt-4">
                  <h3 className="font-semibold text-neutral-900 mb-2">Bio</h3>
                  <p className="text-neutral-700">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Videos Section */}
          {videos.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">
                  Videos ({videos.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videos.map((video) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-[9/16] bg-neutral-900 rounded-lg overflow-hidden group cursor-pointer"
                      onClick={() => toggleVideoPlay(video.id)}
                    >
                      {playingVideoId === video.id ? (
                        <video
                          src={getVideoUrl(video.cloudinaryPublicId)}
                          controls
                          autoPlay
                          className="w-full h-full object-cover"
                          onEnded={() => setPlayingVideoId(null)}
                        />
                      ) : (
                        <>
                          <img
                            src={getThumbnailUrl(video.cloudinaryPublicId)}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-white/90 rounded-full p-3">
                              <HiPlay className="h-8 w-8 text-primary-600" />
                            </div>
                          </div>
                          {video.title && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <p className="text-white text-sm font-medium line-clamp-2">
                                {video.title}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Startup Details */}
          {profile.userType === 'startup' && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Startup Info</h2>
                
                {profile.industry && (
                  <div className="mb-3">
                    <p className="text-sm text-neutral-600">Industry</p>
                    <p className="font-medium text-neutral-900">{profile.industry}</p>
                  </div>
                )}

                {profile.currentStage && (
                  <div className="mb-3">
                    <p className="text-sm text-neutral-600">Stage</p>
                    <p className="font-medium text-neutral-900 capitalize">{profile.currentStage}</p>
                  </div>
                )}

                {profile.teamSize && (
                  <div className="mb-3">
                    <p className="text-sm text-neutral-600">Team Size</p>
                    <p className="font-medium text-neutral-900">{profile.teamSize}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Individual Details */}
          {profile.userType === 'individual' && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Interests</h2>
                
                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}

                {profile.lookingFor && (
                  <div className="mt-4">
                    <p className="text-sm text-neutral-600 mb-1">Looking For</p>
                    <p className="font-medium text-neutral-900 capitalize">{profile.lookingFor}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Investor Details */}
          {profile.userType === 'investor' && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Investment Info</h2>
                
                {profile.investmentFocus && profile.investmentFocus.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-neutral-600 mb-2">Focus Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.investmentFocus.map((focus, index) => (
                        <Badge key={index} variant="secondary">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.stagePreference && (
                  <div className="mb-3">
                    <p className="text-sm text-neutral-600">Stage Preference</p>
                    <p className="font-medium text-neutral-900 capitalize">{profile.stagePreference}</p>
                  </div>
                )}

                {profile.investmentSize && (
                  <div className="mb-3">
                    <p className="text-sm text-neutral-600">Investment Size</p>
                    <p className="font-medium text-neutral-900">{profile.investmentSize}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PublicProfilePage;
