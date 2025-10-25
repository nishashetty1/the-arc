import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components';
import { Card, CardContent, Button, Spinner, Tabs, TabsList, TabsTrigger, TabsContent } from '../components';
import { HiUserAdd, HiCheck, HiX, HiUser } from 'react-icons/hi';
import { motion } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import {
  getUserConnections,
  getPendingConnectionRequests,
  acceptConnectionRequest,
  rejectConnectionRequest
} from '../services/connections';
import { getOrCreateConversation } from '../services/messages';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase/config';

const ConnectionsPage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.uid) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch existing connections
      const connectionsData = await getUserConnections(user.uid);
      
      // Enrich connections with user details
      const enrichedConnections = await Promise.all(
        connectionsData.map(async (connection) => {
          const otherUserId = connection.participants.find(id => id !== user.uid);
          const userRef = doc(db, 'users', otherUserId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};
          
          return {
            ...connection,
            otherUser: {
              id: otherUserId,
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
      setConnections(enrichedConnections);

      // Fetch pending connection requests
      const requestsData = await getPendingConnectionRequests(user.uid);
      
      // Enrich requests with sender details
      const enrichedRequests = await Promise.all(
        requestsData.map(async (request) => {
          const userRef = doc(db, 'users', request.fromUserId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};
          
          return {
            ...request,
            sender: {
              id: request.fromUserId,
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
      setPendingRequests(enrichedRequests);

    } catch (err) {
      console.error('Error fetching connections data:', err);
      setError('Failed to load connections. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setProcessingRequests(prev => ({ ...prev, [requestId]: 'accepting' }));
    
    try {
      await acceptConnectionRequest(requestId);
      
      // Refresh data
      await fetchData();
      
    } catch (err) {
      console.error('Error accepting request:', err);
      alert('Failed to accept connection request. Please try again.');
    } finally {
      setProcessingRequests(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
    }
  };

  const handleRejectRequest = async (requestId) => {
    setProcessingRequests(prev => ({ ...prev, [requestId]: 'rejecting' }));
    
    try {
      await rejectConnectionRequest(requestId);
      
      // Refresh data
      await fetchData();
      
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject connection request. Please try again.');
    } finally {
      setProcessingRequests(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleMessage = async (otherUserId) => {
    try {
      console.log('Creating/getting conversation with user:', otherUserId);
      const conversationId = await getOrCreateConversation(user.uid, otherUserId);
      console.log('Navigating to conversation:', conversationId);
      navigate(`/messages?conversation=${conversationId}`);
    } catch (err) {
      console.error('Error opening message:', err);
      alert('Failed to open conversation. Please try again.');
    }
  };

  return (
    <DashboardLayout user={user} userType={user?.userType}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Connections</h1>
        <p className="mt-2 text-neutral-600">
          Manage your network and connection requests
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="connections">
            My Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Pending Requests 
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Connections Tab */}
        <TabsContent value="connections">
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchData}>Try Again</Button>
              </CardContent>
            </Card>
          ) : connections.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <HiUserAdd className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No connections yet
                </h3>
                <p className="text-neutral-600 mb-4">
                  Start connecting with others by browsing pitch videos
                </p>
                <Button onClick={() => window.location.href = '/browse'}>
                  Browse Videos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((connection) => (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {connection.otherUser.photoURL ? (
                          <img
                            src={connection.otherUser.photoURL}
                            alt={connection.otherUser.displayName}
                            className="h-16 w-16 rounded-full object-cover cursor-pointer hover:ring-4 hover:ring-primary-200 transition-all"
                            onClick={() => navigate(`/profile/${connection.otherUser.id}`)}
                          />
                        ) : (
                          <div 
                            className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold text-xl cursor-pointer hover:ring-4 hover:ring-primary-200 transition-all"
                            onClick={() => navigate(`/profile/${connection.otherUser.id}`)}
                          >
                            {connection.otherUser.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-semibold text-neutral-900 truncate cursor-pointer hover:text-primary-600 transition-colors"
                            onClick={() => navigate(`/profile/${connection.otherUser.id}`)}
                          >
                            {connection.otherUser.displayName}
                          </h3>
                          <p className="text-sm text-neutral-600 truncate">
                            {connection.otherUser.userType === 'startup' 
                              ? connection.otherUser.company || 'Startup' 
                              : connection.otherUser.userType === 'investor' 
                              ? 'Investor' 
                              : 'Individual'}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {connection.otherUser.location}
                          </p>
                          <p className="text-xs text-neutral-400 mt-2">
                            Connected {formatDate(connection.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      {connection.otherUser.bio && (
                        <p className="text-sm text-neutral-600 mt-4 line-clamp-2">
                          {connection.otherUser.bio}
                        </p>
                      )}
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => navigate(`/profile/${connection.otherUser.id}`)}
                        >
                          <HiUser className="mr-2" />
                          View Profile
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => handleMessage(connection.otherUser.id)}
                        >
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Requests Tab */}
        <TabsContent value="requests">
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchData}>Try Again</Button>
              </CardContent>
            </Card>
          ) : pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <HiUser className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No pending requests
                </h3>
                <p className="text-neutral-600">
                  You don't have any connection requests at the moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-4">
                        {/* User Info Section */}
                        <div className="flex items-start space-x-4">
                          {request.sender.photoURL ? (
                            <img
                              src={request.sender.photoURL}
                              alt={request.sender.displayName}
                              className="h-16 w-16 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                              {request.sender.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-neutral-900 text-lg">
                              {request.sender.displayName}
                            </h3>
                            <p className="text-sm text-neutral-600">
                              {request.sender.userType === 'startup' 
                                ? request.sender.company || 'Startup' 
                                : request.sender.userType === 'investor' 
                                ? 'Investor' 
                                : 'Individual'}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {request.sender.location}
                            </p>
                            <p className="text-xs text-neutral-400 mt-2">
                              Requested {formatDate(request.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Message if exists */}
                        {request.message && (
                          <div className="bg-neutral-50 rounded-lg p-3">
                            <p className="text-sm text-neutral-700 italic">
                              "{request.message}"
                            </p>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            className="flex-1"
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={processingRequests[request.id] === 'accepting'}
                          >
                            {processingRequests[request.id] === 'accepting' ? (
                              <Spinner size="sm" />
                            ) : (
                              <>
                                <HiCheck className="h-5 w-5 mr-2" />
                                <span>Accept</span>
                              </>
                            )}
                          </Button>
                          
                          <Button
                            className="flex-1"
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={processingRequests[request.id] === 'rejecting'}
                          >
                            {processingRequests[request.id] === 'rejecting' ? (
                              <Spinner size="sm" />
                            ) : (
                              <>
                                <HiX className="h-5 w-5 mr-2" />
                                <span>Decline</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ConnectionsPage;
