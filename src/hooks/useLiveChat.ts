import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'file' | 'image' | 'system';
  read_at: string | null;
  created_at: string;
  sender?: {
    name: string;
    avatar?: string;
    role?: string;
  };
}

export interface ChatConversation {
  id: string;
  property_id?: string;
  participants: string[];
  last_message?: ChatMessage;
  unread_count: number;
  status: 'active' | 'waiting' | 'resolved' | 'escalated';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  metadata?: {
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    property_title?: string;
    agent_assigned?: string;
    tags?: string[];
  };
}

export interface ChatAgent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  is_online: boolean;
  response_time: string;
  department?: string;
}

interface TypingStatus {
  user_id: string;
  conversation_id: string;
  is_typing: boolean;
  timestamp: number;
}

export const useLiveChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  
  const subscriptionRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Available agents for chat
  const defaultAgents: ChatAgent[] = [
    {
      id: "agent_sarah",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg",
      role: "Senior Property Consultant",
      is_online: true,
      response_time: "Usually responds in 2 minutes",
      department: "Sales",
    },
    {
      id: "agent_michael",
      name: "Michael Adebayo",
      avatar: "/placeholder.svg",
      role: "Luxury Properties Specialist",
      is_online: true,
      response_time: "Usually responds in 5 minutes",
      department: "Luxury",
    },
    {
      id: "support_team",
      name: "Customer Support",
      avatar: "/placeholder.svg",
      role: "Support Team",
      is_online: true,
      response_time: "Available 24/7",
      department: "Support",
    },
  ];

  // Simulate conversation data
  const generateMockConversations = useCallback((): ChatConversation[] => {
    if (!user) return [];

    return [
      {
        id: "conv_1",
        property_id: "prop_1",
        participants: [user.id, "agent_sarah"],
        unread_count: 2,
        status: "active",
        priority: "high",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        last_message: {
          id: "msg_1",
          conversation_id: "conv_1",
          sender_id: "agent_sarah",
          receiver_id: user.id,
          content: "Hi! I have some great properties that match your criteria. Would you like to schedule a viewing?",
          message_type: "text",
          read_at: null,
          created_at: new Date(Date.now() - 300000).toISOString(),
          sender: {
            name: "Sarah Johnson",
            avatar: "/placeholder.svg",
            role: "Senior Property Consultant",
          },
        },
        metadata: {
          customer_name: user.email?.split('@')[0] || "Customer",
          customer_email: user.email,
          property_title: "Luxury 3-Bedroom Apartment - Victoria Island",
          agent_assigned: "agent_sarah",
          tags: ["property-inquiry", "high-priority"],
        },
      },
      {
        id: "conv_2",
        participants: [user.id, "support_team"],
        unread_count: 0,
        status: "waiting",
        priority: "medium",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        last_message: {
          id: "msg_2",
          conversation_id: "conv_2",
          sender_id: user.id,
          receiver_id: "support_team",
          content: "Thank you for the help! I'll review the documents and get back to you.",
          message_type: "text",
          read_at: new Date(Date.now() - 3600000).toISOString(),
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        metadata: {
          customer_name: user.email?.split('@')[0] || "Customer",
          customer_email: user.email,
          agent_assigned: "support_team",
          tags: ["support", "documentation"],
        },
      },
    ];
  }, [user]);

  // Generate mock messages for a conversation
  const generateMockMessages = useCallback((conversationId: string): ChatMessage[] => {
    if (!user) return [];

    const baseTime = Date.now() - 3600000; // 1 hour ago

    const mockMessages: ChatMessage[] = [
      {
        id: "msg_1",
        conversation_id: conversationId,
        sender_id: "agent_sarah",
        receiver_id: user.id,
        content: "Hello! Welcome to Real Estate Hotspot. How can I help you find your perfect property today?",
        message_type: "text",
        read_at: new Date(baseTime + 60000).toISOString(),
        created_at: new Date(baseTime).toISOString(),
        sender: {
          name: "Sarah Johnson",
          avatar: "/placeholder.svg",
          role: "Senior Property Consultant",
        },
      },
      {
        id: "msg_2",
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: "agent_sarah",
        content: "Hi! I'm looking for a 3-bedroom apartment in Victoria Island. My budget is around ₦50 million.",
        message_type: "text",
        read_at: new Date(baseTime + 120000).toISOString(),
        created_at: new Date(baseTime + 180000).toISOString(),
      },
      {
        id: "msg_3",
        conversation_id: conversationId,
        sender_id: "agent_sarah",
        receiver_id: user.id,
        content: "Perfect! I have several excellent options in Victoria Island within your budget. Let me share some properties that would be ideal for you.",
        message_type: "text",
        read_at: null,
        created_at: new Date(baseTime + 240000).toISOString(),
        sender: {
          name: "Sarah Johnson",
          avatar: "/placeholder.svg",
          role: "Senior Property Consultant",
        },
      },
      {
        id: "msg_4",
        conversation_id: conversationId,
        sender_id: "agent_sarah",
        receiver_id: user.id,
        content: "Would you be available for a viewing this weekend? I can arrange visits to 3-4 properties that match your criteria.",
        message_type: "text",
        read_at: null,
        created_at: new Date(baseTime + 300000).toISOString(),
        sender: {
          name: "Sarah Johnson",
          avatar: "/placeholder.svg",
          role: "Senior Property Consultant",
        },
      },
    ];

    return mockMessages;
  }, [user]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // In a real implementation, fetch from Supabase
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const mockConversations = generateMockConversations();
      setConversations(mockConversations);

      // Calculate total unread count
      const totalUnread = mockConversations.reduce((sum, conv) => sum + conv.unread_count, 0);
      setUnreadTotal(totalUnread);
    } catch (err) {
      setError('Failed to fetch conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, generateMockConversations]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // In a real implementation, fetch from Supabase
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockMessages = generateMockMessages(conversationId);
      setMessages(mockMessages);
      setCurrentConversation(conversationId);

      // Mark conversation as read
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, generateMockMessages]);

  // Send a message
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    receiverId: string,
    messageType: ChatMessage['message_type'] = 'text'
  ): Promise<ChatMessage | null> => {
    if (!user) return null;

    try {
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        message_type: messageType,
        read_at: null,
        created_at: new Date().toISOString(),
      };

      // Optimistic update
      setMessages(prev => [...prev, newMessage]);

      // Update conversation's last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                last_message: newMessage,
                updated_at: new Date().toISOString(),
              }
            : conv
        )
      );

      // In a real implementation, send to Supabase
      await new Promise(resolve => setTimeout(resolve, 500));

      return newMessage;
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      return null;
    }
  }, [user]);

  // Create a new conversation
  const createConversation = useCallback(async (
    agentId: string,
    propertyId?: string,
    initialMessage?: string
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const conversationId = `conv_${Date.now()}`;
      const agent = defaultAgents.find(a => a.id === agentId) || defaultAgents[0];
      
      const newConversation: ChatConversation = {
        id: conversationId,
        property_id: propertyId,
        participants: [user.id, agentId],
        unread_count: 0,
        status: 'active',
        priority: 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          customer_name: user.email?.split('@')[0] || "Customer",
          customer_email: user.email,
          agent_assigned: agentId,
          tags: ['new-conversation'],
        },
      };

      setConversations(prev => [newConversation, ...prev]);

      // Send initial message if provided
      if (initialMessage) {
        await sendMessage(conversationId, initialMessage, agentId);
      }

      return conversationId;
    } catch (err) {
      setError('Failed to create conversation');
      console.error('Error creating conversation:', err);
      return null;
    }
  }, [user, sendMessage]);

  // Handle typing indicators
  const setTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (!user) return;

    const typingStatus: TypingStatus = {
      user_id: user.id,
      conversation_id: conversationId,
      is_typing: isTyping,
      timestamp: Date.now(),
    };

    if (isTyping) {
      setTypingUsers(prev => {
        const filtered = prev.filter(t => !(t.user_id === user.id && t.conversation_id === conversationId));
        return [...filtered, typingStatus];
      });

      // Clear typing status after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers(prev => prev.filter(t => !(t.user_id === user.id && t.conversation_id === conversationId)));
      }, 3000);
    } else {
      setTypingUsers(prev => prev.filter(t => !(t.user_id === user.id && t.conversation_id === conversationId)));
    }
  }, [user]);

  // Get typing users for a conversation
  const getTypingUsers = useCallback((conversationId: string) => {
    return typingUsers.filter(t => 
      t.conversation_id === conversationId && 
      t.user_id !== user?.id &&
      Date.now() - t.timestamp < 5000 // Consider typing status valid for 5 seconds
    );
  }, [typingUsers, user]);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      setMessages(prev =>
        prev.map(msg =>
          msg.conversation_id === conversationId && msg.receiver_id === user.id && !msg.read_at
            ? { ...msg, read_at: new Date().toISOString() }
            : msg
        )
      );

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );

      // Update total unread count
      setUnreadTotal(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Simulate receiving messages occasionally
      if (Math.random() > 0.95 && conversations.length > 0) {
        const randomConv = conversations[Math.floor(Math.random() * conversations.length)];
        const agentResponses = [
          "Thanks for your patience! I'm reviewing the details now.",
          "I've found some additional properties that might interest you.",
          "Would you like to schedule a call to discuss this further?",
          "I've sent the property brochure to your email.",
          "Let me know if you have any questions about the viewing.",
        ];
        
        const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];
        
        // Only send if current conversation is not the one being updated
        if (randomConv.id !== currentConversation) {
          const newMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            conversation_id: randomConv.id,
            sender_id: randomConv.participants.find(p => p !== user.id) || "agent_sarah",
            receiver_id: user.id,
            content: randomResponse,
            message_type: "text",
            read_at: null,
            created_at: new Date().toISOString(),
            sender: {
              name: "Sarah Johnson",
              avatar: "/placeholder.svg",
              role: "Senior Property Consultant",
            },
          };

          setConversations(prev =>
            prev.map(conv =>
              conv.id === randomConv.id
                ? {
                    ...conv,
                    last_message: newMessage,
                    unread_count: conv.unread_count + 1,
                    updated_at: new Date().toISOString(),
                  }
                : conv
            )
          );

          setUnreadTotal(prev => prev + 1);
        }
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [user, conversations, currentConversation]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [fetchConversations, user]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data
    conversations,
    messages,
    currentConversation,
    defaultAgents,
    unreadTotal,
    
    // Status
    isLoading,
    error,
    
    // Actions
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    markAsRead,
    setCurrentConversation,
    
    // Real-time features
    setTyping,
    getTypingUsers,
    onlineUsers,
  };
};
