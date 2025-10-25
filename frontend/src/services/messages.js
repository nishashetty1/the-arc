/**
 * Messages Service
 * Handles real-time messaging with Firestore
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  Timestamp,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../utils/firebase/config';

/**
 * Get or create a conversation between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<string>} Conversation ID
 */
export const getOrCreateConversation = async (userId1, userId2) => {
  try {
    // Check if conversation already exists (bidirectional check)
    const conversationsRef = collection(db, 'conversations');
    
    // Query for existing conversation
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId1)
    );
    
    const snapshot = await getDocs(q);
    
    // Check if any conversation includes both users
    let existingConversation = null;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.participants.includes(userId2)) {
        existingConversation = { id: doc.id, ...data };
      }
    });
    
    if (existingConversation) {
      return existingConversation.id;
    }
    
    // Create new conversation
    const newConversation = {
      participants: [userId1, userId2],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0
      }
    };
    
    const conversationRef = await addDoc(conversationsRef, newConversation);
    return conversationRef.id;
    
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    throw error;
  }
};

/**
 * Send a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} senderId - Sender user ID
 * @param {string} content - Message content
 * @param {string} type - Message type (text, image, etc.)
 * @returns {Promise<string>} Message ID
 */
export const sendMessage = async (conversationId, senderId, content, type = 'text') => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    
    const message = {
      senderId,
      content,
      type,
      createdAt: serverTimestamp(),
      read: false
    };
    
    const messageRef = await addDoc(messagesRef, message);
    
    // Update conversation with last message
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (conversationSnap.exists()) {
      const data = conversationSnap.data();
      const otherUserId = data.participants.find(id => id !== senderId);
      
      await updateDoc(conversationRef, {
        lastMessage: {
          content,
          senderId,
          createdAt: Timestamp.now()
        },
        updatedAt: serverTimestamp(),
        [`unreadCount.${otherUserId}`]: (data.unreadCount?.[otherUserId] || 0) + 1
      });
    }
    
    return messageRef.id;
    
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Subscribe to messages in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {Function} callback - Callback function for updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToMessages = (conversationId, callback) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    
    callback(messages);
  }, (error) => {
    console.error('Error subscribing to messages:', error);
    callback([]);
  });
};

/**
 * Subscribe to user's conversations
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function for updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToConversations = (userId, callback) => {
  const conversationsRef = collection(db, 'conversations');
  
  // Simplified query without orderBy to avoid index requirements
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId)
  );
  
  return onSnapshot(q, async (snapshot) => {
    const conversations = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const otherUserId = data.participants.find(id => id !== userId);
        
        // Fetch other user's info
        const userRef = doc(db, 'users', otherUserId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : null;
        
        return {
          id: docSnap.id,
          ...data,
          otherUser: {
            id: otherUserId,
            displayName: userData?.displayName || 'Unknown User',
            photoURL: userData?.photoURL || null,
            userType: userData?.userType || 'individual'
          },
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            createdAt: data.lastMessage.createdAt?.toDate() || new Date()
          } : null,
          unreadCount: data.unreadCount?.[userId] || 0
        };
      })
    );
    
    // Sort by updatedAt in JavaScript
    conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    
    callback(conversations);
  }, (error) => {
    console.error('Error subscribing to conversations:', error);
    callback([]);
  });
};

/**
 * Mark messages as read in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - Current user ID
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    // Reset unread count for this user
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0
    });
    
    // Mark individual messages as read
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      where('senderId', '!=', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(docSnap => 
      updateDoc(doc(db, 'conversations', conversationId, 'messages', docSnap.id), {
        read: true
      })
    );
    
    await Promise.all(updatePromises);
    
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message ID
 */
export const deleteMessage = async (conversationId, messageId) => {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, {
      deleted: true,
      content: 'This message has been deleted'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Check if two users are connected (to allow messaging)
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<boolean>} True if connected
 */
export const checkConnection = async (userId1, userId2) => {
  try {
    const connectionsRef = collection(db, 'connections');
    
    // Check for connection document
    const q = query(
      connectionsRef,
      where('participants', 'array-contains', userId1)
    );
    
    const snapshot = await getDocs(q);
    
    let isConnected = false;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.participants.includes(userId2) && data.status === 'accepted') {
        isConnected = true;
      }
    });
    
    return isConnected;
    
  } catch (error) {
    console.error('Error checking connection:', error);
    return false;
  }
};

/**
 * Get total unread messages count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Total unread count
 */
export const getUnreadMessagesCount = async (userId) => {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId)
    );
    
    const snapshot = await getDocs(q);
    
    let totalUnread = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      totalUnread += data.unreadCount?.[userId] || 0;
    });
    
    return totalUnread;
    
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};
