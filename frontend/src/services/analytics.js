// Analytics service for user metrics and insights
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../utils/firebase/config';

/**
 * Get user video analytics (likes, views over time)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Analytics data
 */
export const getUserVideoAnalytics = async (userId) => {
  try {
    console.log('📊 Fetching video analytics for user:', userId);
    
    // Get all user's videos
    const videosQuery = query(
      collection(db, 'pitchVideos'),
      where('userId', '==', userId)
    );
    const videosSnap = await getDocs(videosQuery);
    console.log('📹 Found videos:', videosSnap.size);
    
    // Get all video likes for user's videos
    const videoIds = videosSnap.docs.map(doc => doc.id);
    const likesData = [];
    
    for (const videoId of videoIds) {
      const likesQuery = query(
        collection(db, 'videoLikes'),
        where('videoId', '==', videoId),
        orderBy('createdAt', 'desc')
      );
      const likesSnap = await getDocs(likesQuery);
      likesData.push(...likesSnap.docs.map(doc => ({
        videoId,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })));
    }
    console.log('❤️ Found likes:', likesData.length);
    
    // Get video views
    const viewsData = [];
    for (const videoId of videoIds) {
      const viewsQuery = query(
        collection(db, 'videoViews'),
        where('videoId', '==', videoId),
        orderBy('viewedAt', 'desc')
      );
      const viewsSnap = await getDocs(viewsQuery);
      viewsData.push(...viewsSnap.docs.map(doc => ({
        videoId,
        ...doc.data(),
        viewedAt: doc.data().viewedAt?.toDate() || new Date()
      })));
    }
    console.log('👁️ Found views:', viewsData.length);
    
    // Calculate daily metrics for last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyMetrics = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyMetrics[dateStr] = {
        date: dateStr,
        likes: 0,
        views: 0
      };
    }
    
    // Populate daily likes
    likesData.forEach(like => {
      const dateStr = like.createdAt.toISOString().split('T')[0];
      if (dailyMetrics[dateStr]) {
        dailyMetrics[dateStr].likes += 1;
      }
    });
    
    // Populate daily views
    viewsData.forEach(view => {
      const dateStr = view.viewedAt.toISOString().split('T')[0];
      if (dailyMetrics[dateStr]) {
        dailyMetrics[dateStr].views += 1;
      }
    });
    
    return {
      totalLikes: likesData.length,
      totalViews: viewsData.length,
      totalVideos: videoIds.length,
      dailyMetrics: Object.values(dailyMetrics),
      recentLikes: likesData.slice(0, 10),
      recentViews: viewsData.slice(0, 10)
    };
  } catch (error) {
    console.error('Error fetching video analytics:', error);
    throw error;
  }
};

/**
 * Get user connections analytics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Connections analytics
 */
export const getUserConnectionsAnalytics = async (userId) => {
  try {
    console.log('🔗 Fetching connections analytics for user:', userId);
    
    // Get all connections (removed orderBy to avoid index requirement)
    const connectionsQuery = query(
      collection(db, 'connections'),
      where('participants', 'array-contains', userId)
    );
    const connectionsSnap = await getDocs(connectionsQuery);
    console.log('👥 Found connections:', connectionsSnap.size);
    
    const connections = connectionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })).sort((a, b) => b.createdAt - a.createdAt); // Sort in memory instead
    
    // Calculate daily connections for last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyConnections = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyConnections[dateStr] = {
        date: dateStr,
        count: 0
      };
    }
    
    // Populate daily connections
    connections.forEach(conn => {
      const dateStr = conn.createdAt.toISOString().split('T')[0];
      if (dailyConnections[dateStr]) {
        dailyConnections[dateStr].count += 1;
      }
    });
    
    // Calculate cumulative connections
    let cumulative = 0;
    const cumulativeConnections = Object.values(dailyConnections).map(day => {
      cumulative += day.count;
      return {
        ...day,
        cumulative
      };
    });
    
    return {
      totalConnections: connections.length,
      dailyConnections: Object.values(dailyConnections),
      cumulativeConnections,
      recentConnections: connections.slice(0, 10)
    };
  } catch (error) {
    console.error('Error fetching connections analytics:', error);
    throw error;
  }
};

/**
 * Track video view
 * @param {string} videoId - Video ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const trackVideoView = async (videoId, userId) => {
  try {
    await addDoc(collection(db, 'videoViews'), {
      videoId,
      viewerId: userId,
      viewedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error tracking video view:', error);
  }
};

/**
 * Get recently viewed videos for a user
 * @param {string} userId - User ID
 * @param {number} limitCount - Number of videos to return
 * @returns {Promise<Array>} - Recently viewed videos
 */
export const getRecentlyViewedVideos = async (userId, limitCount = 10) => {
  try {
    // Simplified query without orderBy to avoid index requirement
    const viewsQuery = query(
      collection(db, 'videoViews'),
      where('viewerId', '==', userId)
    );
    const viewsSnap = await getDocs(viewsQuery);
    
    // Sort in memory and limit
    const sortedViews = viewsSnap.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        viewedAt: doc.data().viewedAt?.toDate() || new Date()
      }))
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, limitCount);
    
    // Get unique video IDs
    const videoIds = [...new Set(sortedViews.map(view => view.videoId))];
    
    // Fetch video details
    const videos = [];
    for (const videoId of videoIds.slice(0, limitCount)) {
      const videoDoc = await getDoc(doc(db, 'pitchVideos', videoId));
      if (videoDoc.exists()) {
        // Get video owner details
        const userId = videoDoc.data().userId;
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        videos.push({
          id: videoDoc.id,
          ...videoDoc.data(),
          user: {
            uid: userId,
            displayName: userData.displayName || 'Unknown',
            photoURL: userData.photoURL || null,
            userType: userData.userType || 'individual'
          }
        });
      }
    }
    
    return videos;
  } catch (error) {
    console.error('Error fetching recently viewed videos:', error);
    throw error;
  }
};

/**
 * Get overview analytics for dashboard
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Overview analytics
 */
export const getDashboardAnalytics = async (userId) => {
  try {
    const [videoAnalytics, connectionsAnalytics] = await Promise.all([
      getUserVideoAnalytics(userId),
      getUserConnectionsAnalytics(userId)
    ]);
    
    return {
      videos: videoAnalytics,
      connections: connectionsAnalytics,
      summary: {
        totalLikes: videoAnalytics.totalLikes,
        totalViews: videoAnalytics.totalViews,
        totalVideos: videoAnalytics.totalVideos,
        totalConnections: connectionsAnalytics.totalConnections
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    throw error;
  }
};
