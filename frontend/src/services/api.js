// API service for handling API requests
import { auth, db } from '../utils/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

// User API
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User profile not found");
    }
    
    return { data: userDoc.data() };
  } catch (error) {
    return { error };
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);
    
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Startup API
export const createStartup = async (startupData, userId) => {
  try {
    // Create a new startup document with a generated ID
    const startupRef = doc(collection(db, "startups"));
    
    await setDoc(startupRef, {
      ...startupData,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update user document with startup reference
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      startupId: startupRef.id,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, startupId: startupRef.id };
  } catch (error) {
    return { error };
  }
};

export const getStartup = async (startupId) => {
  try {
    const startupRef = doc(db, "startups", startupId);
    const startupDoc = await getDoc(startupRef);
    
    if (!startupDoc.exists()) {
      throw new Error("Startup not found");
    }
    
    return { data: startupDoc.data() };
  } catch (error) {
    return { error };
  }
};

// Investor API
export const createInvestorProfile = async (investorData, userId) => {
  try {
    // Create a new investor document
    const investorRef = doc(collection(db, "investors"));
    
    await setDoc(investorRef, {
      ...investorData,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update user document with investor reference
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      investorId: investorRef.id,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, investorId: investorRef.id };
  } catch (error) {
    return { error };
  }
};

export const getInvestorProfile = async (investorId) => {
  try {
    const investorRef = doc(db, "investors", investorId);
    const investorDoc = await getDoc(investorRef);
    
    if (!investorDoc.exists()) {
      throw new Error("Investor profile not found");
    }
    
    return { data: investorDoc.data() };
  } catch (error) {
    return { error };
  }
};

// Export all API functions
const api = {
  getUserProfile,
  updateUserProfile,
  createStartup,
  getStartup,
  createInvestorProfile,
  getInvestorProfile
};

export default api;
