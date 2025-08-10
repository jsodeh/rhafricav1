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
  agent_avatar?: string;
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

  // Real agents will be fetched from database when chat system is enabled
  const defaultAgents: ChatAgent[] = [
    {
      id: "support_team",
      name: "Real Estate Hotspot Support",
      avatar: "/placeholder.svg",
      role: "Customer Support",
      is_online: true,
      response_time: "Available 24/7",
      department: "Support",
    },
  ];

  // Fetch conversations from Supabase
  const fetchConversationsFromDb = useCallback(async (): Promise<ChatConversation[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('case_conversations')
      .select('*')
      .contains('participants', [user.id])
      .order('updated_at', { ascending: false });
    if (error) throw error;
    const convs = (data || []) as unknown as ChatConversation[];
    // Enrich with agent avatars
    const agentIds = Array.from(
      new Set(
        convs
          .map((c) => c.participants.find((p) => p !== user.id) || c.metadata?.agent_assigned)
          .filter((v): v is string => Boolean(v))
      )
    );
    if (agentIds.length > 0) {
      const { data: agents } = await supabase
        .from('real_estate_agents')
        .select('id, profile_image_url, agency_name, phone')
        .in('id', agentIds);
      const idToAvatar: Record<string, string> = {};
      (agents || []).forEach((a: any) => {
        idToAvatar[a.id] = a.profile_image_url || '/placeholder.svg';
      });
      return convs.map((c) => {
        const agentId = c.participants.find((p) => p !== user.id) || c.metadata?.agent_assigned || '';
        return { ...c, agent_avatar: idToAvatar[agentId] || '/placeholder.svg' };
      });
    }
    return convs;
  }, [user]);

  // Fetch messages from Supabase
  const fetchMessagesFromDb = useCallback(async (conversationId: string): Promise<ChatMessage[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('case_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []) as unknown as ChatMessage[];
  }, [user]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const convs = await fetchConversationsFromDb();
      setConversations(convs);
      // Compute unread counts for all conversations with one query
      const ids = convs.map((c) => c.id);
      if (ids.length > 0) {
        const { data: unreadRows } = await supabase
          .from('case_messages')
          .select('conversation_id, receiver_id, read_at')
          .in('conversation_id', ids);
        const unreadMap = new Map<string, number>();
        (unreadRows || []).forEach((m: any) => {
          if (m.receiver_id === user.id && !m.read_at) {
            unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) || 0) + 1);
          }
        });
        setConversations((prev) => prev.map((c) => ({ ...c, unread_count: unreadMap.get(c.id) || 0 })));
      }
      const totalUnread = (ids.length > 0)
        ? (await supabase
            .from('case_messages')
            .select('conversation_id, receiver_id, read_at')
            .in('conversation_id', ids)).data?.filter((m: any) => m.receiver_id === user.id && !m.read_at).length || 0
        : 0;
      setUnreadTotal(totalUnread);
    } catch (err) {
      setError('Failed to fetch conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchConversationsFromDb]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const dbMessages = await fetchMessagesFromDb(conversationId);
      setMessages(dbMessages);
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
  }, [user, fetchMessagesFromDb]);

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

      // Persist to Supabase
      await supabase.from('case_messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        message_type: messageType,
        read_at: null,
      });

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

      // Persist read status in Supabase
      await supabase
        .from('case_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', user.id)
        .is('read_at', null);
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
            sender_id: randomConv.participants.find(p => p !== user.id) || "support_team",
            receiver_id: user.id,
            content: randomResponse,
            message_type: "text",
            read_at: null,
            created_at: new Date().toISOString(),
            sender: {
              name: "Real Estate Hotspot Support",
              avatar: "/placeholder.svg",
              role: "Customer Support",
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
