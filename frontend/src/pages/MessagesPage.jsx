import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components';
import { Card, CardContent, Input, Button, Spinner, Avatar } from '../components';
import { HiSearch, HiPaperAirplane, HiUserCircle, HiArrowLeft } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
  getOrCreateConversation
} from '../services/messages';

const MessagesPage = () => {
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const conversationParam = searchParams.get('conversation');
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false); // For mobile view toggle
  
  const messagesEndRef = useRef(null);
  const unsubscribeConversationsRef = useRef(null);
  const unsubscribeMessagesRef = useRef(null);

  // Subscribe to conversations
  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);
    
    unsubscribeConversationsRef.current = subscribeToConversations(
      user.uid,
      (updatedConversations) => {
        console.log('Conversations updated:', updatedConversations.length);
        setConversations(updatedConversations);
        setIsLoading(false);
        
        // Auto-select conversation from URL parameter
        if (conversationParam && updatedConversations.length > 0) {
          const targetConversation = updatedConversations.find(c => c.id === conversationParam);
          if (targetConversation) {
            console.log('Auto-selecting conversation from URL:', conversationParam);
            setSelectedConversation(targetConversation);
          }
        }
      }
    );

    return () => {
      if (unsubscribeConversationsRef.current) {
        unsubscribeConversationsRef.current();
      }
    };
  }, [user, conversationParam]);

  // Subscribe to messages in selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    unsubscribeMessagesRef.current = subscribeToMessages(
      selectedConversation.id,
      (updatedMessages) => {
        setMessages(updatedMessages);
        scrollToBottom();
      }
    );

    // Mark messages as read
    markMessagesAsRead(selectedConversation.id, user.uid);

    return () => {
      if (unsubscribeMessagesRef.current) {
        unsubscribeMessagesRef.current();
      }
    };
  }, [selectedConversation, user]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowMobileChat(true); // Show chat on mobile
  };
  
  // Handle back to conversations list on mobile
  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedConversation(null);
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(
        selectedConversation.id,
        user.uid,
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <DashboardLayout user={user} userType={user?.userType}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-neutral-50">Messages</h3>
        <p className="mt-2 text-neutral-100">
          Chat with your connections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        {/* Conversations List - Hidden on mobile when chat is open */}
        <Card className={`lg:col-span-1 overflow-hidden flex flex-col ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
          <CardContent className="p-4 flex-1 flex flex-col">
            {/* Search */}
            <div className="relative mb-4">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <HiUserCircle className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500">
                    {searchQuery ? 'No conversations found' : 'No messages yet'}
                  </p>
                  <p className="text-sm text-neutral-400 mt-2">
                    Connect with others to start chatting
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => handleSelectConversation(conversation)}
                      className={`w-full p-3 rounded-lg transition-colors duration-200 flex items-start space-x-3 ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-primary-50 border-2 border-primary-500'
                          : 'bg-neutral-50 hover:bg-neutral-100'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {conversation.otherUser.photoURL ? (
                          <img
                            src={conversation.otherUser.photoURL}
                            alt={conversation.otherUser.displayName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold">
                            {conversation.otherUser.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-neutral-900 truncate">
                            {conversation.otherUser.displayName}
                          </h3>
                          {conversation.lastMessage && (
                            <span className="text-xs text-neutral-500 ml-2 flex-shrink-0">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        
                        {conversation.lastMessage && (
                          <p className="text-sm text-neutral-600 truncate">
                            {conversation.lastMessage.senderId === user.uid ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                        
                        {conversation.unreadCount > 0 && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                            {conversation.unreadCount} new
                          </span>
                        )}
                      </div>
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area - Full screen on mobile when selected */}
        <Card className={`lg:col-span-2 overflow-hidden flex flex-col ${!showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header with Back Button */}
              <div className="p-4 border-b border-neutral-200 bg-white">
                <div className="flex items-center space-x-3">
                  {/* Back button - visible only on mobile */}
                  <button
                    onClick={handleBackToList}
                    className="lg:hidden flex-shrink-0 p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    <HiArrowLeft className="h-6 w-6 text-neutral-600" />
                  </button>
                  
                  {selectedConversation.otherUser.photoURL ? (
                    <img
                      src={selectedConversation.otherUser.photoURL}
                      alt={selectedConversation.otherUser.displayName}
                      className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {selectedConversation.otherUser.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-neutral-900 truncate">
                      {selectedConversation.otherUser.displayName}
                    </h2>
                    <p className="text-xs text-neutral-500 truncate">
                      {selectedConversation.otherUser.userType}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
                <AnimatePresence>
                  {messages.map((message) => {
                    const isOwnMessage = message.senderId === user.uid;
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            isOwnMessage
                              ? 'bg-primary-500 text-white rounded-br-sm'
                              : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-sm shadow-sm'
                          }`}
                        >
                          <p className="break-words text-sm sm:text-base">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-primary-100' : 'text-neutral-500'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-200 bg-white">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    disabled={isSending}
                    autoFocus
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="flex-shrink-0 px-4 py-2"
                  >
                    {isSending ? (
                      <Spinner size="sm" />
                    ) : (
                      <HiPaperAirplane className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <HiUserCircle className="h-24 w-24 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-neutral-500 text-sm">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;
