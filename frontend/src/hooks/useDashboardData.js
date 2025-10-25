// Hook for fetching and managing dashboard data
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, getDoc, doc } from "firebase/firestore";
import { db } from "../utils/firebase/config";
import { getUnreadMessagesCount } from "../services/messages";

export const useDashboardData = (user) => {
  const [dashboardData, setDashboardData] = useState({
    connections: 0,
    messages: 0,
    profileCompletion: 0,
    recentActivity: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (user) => {
    if (!user) return 0;
    
    let completed = 0;
    let total = 0;
    
    // Count basic fields
    const basicFields = ['displayName', 'email', 'photoURL'];
    basicFields.forEach(field => {
      total++;
      if (user[field]) completed++;
    });
    
    // Count type-specific fields
    if (user.userType === 'startup') {
      const startupFields = ['companyName', 'industry', 'description', 'currentStage', 'teamSize'];
      startupFields.forEach(() => {
        total++;
        // We don't have these fields in the auth store, so we'll assume they're completed if onboarding is completed
        if (user.onboardingCompleted) completed++;
      });
    } else if (user.userType === 'investor') {
      const investorFields = ['investmentFocus', 'stagePreference', 'investmentSize'];
      investorFields.forEach(() => {
        total++;
        if (user.onboardingCompleted) completed++;
      });
    } else if (user.userType === 'individual') {
      const individualFields = ['interests', 'ideaDescription', 'lookingFor'];
      individualFields.forEach(() => {
        total++;
        if (user.onboardingCompleted) completed++;
      });
    }
    
    return Math.round((completed / total) * 100);
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !user.uid) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Initialize default data structure
        const data = {
          connections: 0,
          messages: 0,
          profileCompletion: calculateProfileCompletion(user),
          recentActivity: []
        };
        
        // Fetch connections (using participants array)
        console.log('📊 Dashboard: Fetching connections for user:', user.uid);
        const connectionsQuery = query(
          collection(db, "connections"),
          where("participants", "array-contains", user.uid)
        );
        const connectionsSnapshot = await getDocs(connectionsQuery);
        data.connections = connectionsSnapshot.size;
        console.log('📊 Dashboard: Found connections:', data.connections);
        
        // Fetch messages (unread count) using messages service
        const unreadCount = await getUnreadMessagesCount(user.uid);
        data.messages = unreadCount;
        console.log('📊 Dashboard: Unread messages:', data.messages);
        
        // Note: Skipping recent activity query as it requires a Firestore index
        // You can create the index in Firebase Console if needed
        data.recentActivity = [];
        
        console.log('📊 Dashboard: Final data:', data);
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
        
        // Set fallback data in case of error
        setDashboardData({
          connections: 0,
          messages: 0,
          profileCompletion: calculateProfileCompletion(user),
          recentActivity: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  return { dashboardData, isLoading, error };
};