// Connections service for managing user connections and connection requests
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  or,
  and
} from 'firebase/firestore';
import { db } from '../utils/firebase/config';

const CONNECTIONS_COLLECTION = 'connections';
const CONNECTION_REQUESTS_COLLECTION = 'connectionRequests';

/**
 * Connection status types
 */
export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  BLOCKED: 'blocked'
};

/**
 * Send a connection request
 * @param {string} fromUserId - ID of user sending request
 * @param {string} toUserId - ID of user receiving request
 * @param {Object} fromUserData - Data of user sending request
 * @returns {Promise<Object>} - Created request
 */
export const sendConnectionRequest = async (fromUserId, toUserId, fromUserData) => {
  try {
    console.log('Sending connection request:', { fromUserId, toUserId, fromUserData });
    
    // Check if request already exists
    const existingRequest = await getConnectionRequest(fromUserId, toUserId);
    if (existingRequest) {
      console.log('Connection request already exists:', existingRequest);
      throw new Error('Connection request already sent');
    }

    // Check if already connected
    const existingConnection = await getConnection(fromUserId, toUserId);
    if (existingConnection) {
      console.log('Already connected:', existingConnection);
      throw new Error('Already connected');
    }

    const requestData = {
      fromUserId,
      toUserId,
      fromUserName: fromUserData.displayName || 'Unknown',
      fromUserPhoto: fromUserData.photoURL || null,
      fromUserType: fromUserData.userType || 'individual',
      status: CONNECTION_STATUS.PENDING,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('Creating connection request with data:', requestData);
    
    const docRef = await addDoc(collection(db, CONNECTION_REQUESTS_COLLECTION), requestData);

    console.log('Connection request created successfully with ID:', docRef.id);

    return {
      id: docRef.id,
      ...requestData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error sending connection request:', error);
    throw error;
  }
};

/**
 * Accept a connection request
 * @param {string} requestId - ID of the connection request
 * @returns {Promise<Object>} - Created connection
 */
export const acceptConnectionRequest = async (requestId) => {
  try {
    const requestRef = doc(db, CONNECTION_REQUESTS_COLLECTION, requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      throw new Error('Connection request not found');
    }

    const requestData = requestSnap.data();

    // Create connection
    const connectionData = {
      user1Id: requestData.fromUserId,
      user2Id: requestData.toUserId,
      participants: [requestData.fromUserId, requestData.toUserId],
      status: 'accepted',
      createdAt: serverTimestamp(),
      lastInteraction: serverTimestamp()
    };

    const connectionRef = await addDoc(collection(db, CONNECTIONS_COLLECTION), connectionData);

    // Update request status
    await updateDoc(requestRef, {
      status: CONNECTION_STATUS.ACCEPTED,
      updatedAt: serverTimestamp()
    });

    return {
      id: connectionRef.id,
      ...connectionData,
      createdAt: new Date(),
      lastInteraction: new Date()
    };
  } catch (error) {
    console.error('Error accepting connection request:', error);
    throw error;
  }
};

/**
 * Reject a connection request
 * @param {string} requestId - ID of the connection request
 * @returns {Promise<boolean>} - Success status
 */
export const rejectConnectionRequest = async (requestId) => {
  try {
    const requestRef = doc(db, CONNECTION_REQUESTS_COLLECTION, requestId);
    
    await updateDoc(requestRef, {
      status: CONNECTION_STATUS.REJECTED,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error rejecting connection request:', error);
    throw error;
  }
};

/**
 * Get pending connection requests for a user
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} - Array of connection requests
 */
export const getPendingConnectionRequests = async (userId) => {
  try {
    console.log('Fetching pending connection requests for user:', userId);
    
    // Simplified query without orderBy to avoid index requirements
    const q = query(
      collection(db, CONNECTION_REQUESTS_COLLECTION),
      where('toUserId', '==', userId),
      where('status', '==', CONNECTION_STATUS.PENDING)
    );

    const querySnapshot = await getDocs(q);
    
    console.log('Found pending requests count:', querySnapshot.size);

    // Sort in application code instead
    const requests = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Pending request:', doc.id, data);
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    });

    // Sort by createdAt descending
    requests.sort((a, b) => b.createdAt - a.createdAt);

    return requests;
  } catch (error) {
    console.error('Error fetching pending connection requests:', error);
    throw error;
  }
};

/**
 * Get user's connections
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} - Array of connections
 */
export const getUserConnections = async (userId) => {
  try {
    console.log('Fetching connections for user:', userId);
    
    const q = query(
      collection(db, CONNECTIONS_COLLECTION),
      or(
        where('user1Id', '==', userId),
        where('user2Id', '==', userId)
      )
    );

    const querySnapshot = await getDocs(q);
    
    console.log('Found connections count:', querySnapshot.size);

    const connections = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Connection:', doc.id, data);
      return {
        id: doc.id,
        ...data,
        // Ensure participants array exists
        participants: data.participants || [data.user1Id, data.user2Id],
        createdAt: data.createdAt?.toDate() || new Date(),
        lastInteraction: data.lastInteraction?.toDate() || new Date()
      };
    });

    return connections;
  } catch (error) {
    console.error('Error fetching user connections:', error);
    throw error;
  }
};

/**
 * Check if connection request exists
 * @param {string} fromUserId - Sender user ID
 * @param {string} toUserId - Receiver user ID
 * @returns {Promise<Object|null>} - Connection request or null
 */
export const getConnectionRequest = async (fromUserId, toUserId) => {
  try {
    const q = query(
      collection(db, CONNECTION_REQUESTS_COLLECTION),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId),
      where('status', '==', CONNECTION_STATUS.PENDING)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error checking connection request:', error);
    return null;
  }
};

/**
 * Check if users are connected
 * @param {string} user1Id - First user ID
 * @param {string} user2Id - Second user ID
 * @returns {Promise<Object|null>} - Connection or null
 */
export const getConnection = async (user1Id, user2Id) => {
  try {
    const q = query(
      collection(db, CONNECTIONS_COLLECTION),
      or(
        and(
          where('user1Id', '==', user1Id),
          where('user2Id', '==', user2Id)
        ),
        and(
          where('user1Id', '==', user2Id),
          where('user2Id', '==', user1Id)
        )
      )
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error checking connection:', error);
    return null;
  }
};

/**
 * Remove a connection
 * @param {string} connectionId - ID of the connection to remove
 * @returns {Promise<boolean>} - Success status
 */
export const removeConnection = async (connectionId) => {
  try {
    await deleteDoc(doc(db, CONNECTIONS_COLLECTION, connectionId));
    return true;
  } catch (error) {
    console.error('Error removing connection:', error);
    throw error;
  }
};