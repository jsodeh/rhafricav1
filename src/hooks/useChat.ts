import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'file' | 'image';
  read_at: string | null;
  created_at: string;
  sender?: {
    name: string;
    profilePhoto?: string;
  };
}

interface Conversation {
  id: string;
  property_id?: string;
  participants: string[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
}

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch user's conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // This would need a conversations table in your database
      // For now, we'll simulate conversations
      const mockConversations: Conversation[] = [
        {
          id: 'conv_1',
          property_id: '660e8400-e29b-41d4-a716-446655440001',
          participants: [user.id, 'agent_1'],
          unread_count: 2,
          created_at: new Date().toISOString(),
          last_message: {
            id: 'msg_1',
            conversation_id: 'conv_1',
            sender_id: 'agent_1',
            receiver_id: user.id,
            content: 'Hi! I have some great properties that match your criteria.',
            message_type: 'text',
            read_at: null,
            created_at: new Date().toISOString(),
          },
        },
      ];

      setConversations(mockConversations);
    } catch (err) {
      setError('Failed to fetch conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Simulate fetching messages from Supabase
      const mockMessages: Message[] = [
        {
          id: 'msg_1',
          conversation_id: conversationId,
          sender_id: 'agent_1',
          receiver_id: user.id,
          content: 'Hi! I have some great properties that match your criteria.',
          message_type: 'text',
          read_at: null,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sender: {
            name: 'Sarah Johnson',
            profilePhoto: '/placeholder.svg',
          },
        },
        {
          id: 'msg_2',
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: 'agent_1',
          content: 'That sounds great! Can you send me more details?',
          message_type: 'text',
          read_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: 'msg_3',
          conversation_id: conversationId,
          sender_id: 'agent_1',
          receiver_id: user.id,
          content: 'Of course! I\'ll send you the property details right away.',
          message_type: 'text',
          read_at: null,
          created_at: new Date().toISOString(),
          sender: {
            name: 'Sarah Johnson',
            profilePhoto: '/placeholder.svg',
          },
        },
      ];

      setMessages(mockMessages);
      setCurrentConversation(conversationId);
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Send a message
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    receiverId: string,
    messageType: 'text' | 'file' | 'image' = 'text'
  ) => {
    if (!user) return;

    try {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        message_type: messageType,
        read_at: null,
        created_at: new Date().toISOString(),
      };

      // Add message to local state immediately for optimistic UI
      setMessages(prev => [...prev, newMessage]);

      // In a real implementation, you would insert to Supabase
      // const { error } = await supabase
      //   .from('messages')
      //   .insert(newMessage);

      // if (error) throw error;

      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return newMessage;
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      return null;
    }
  }, [user]);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.conversation_id === conversationId && msg.receiver_id === user.id
            ? { ...msg, read_at: new Date().toISOString() }
            : msg
        )
      );

      // In a real implementation, you would update Supabase
      // const { error } = await supabase
      //   .from('messages')
      //   .update({ read_at: new Date().toISOString() })
      //   .eq('conversation_id', conversationId)
      //   .eq('receiver_id', user.id)
      //   .is('read_at', null);

      // if (error) throw error;
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [user]);

  // Create a new conversation
  const createConversation = useCallback(async (
    participantIds: string[],
    propertyId?: string
  ) => {
    if (!user) return null;

    try {
      const conversationId = `conv_${Date.now()}`;
      const newConversation: Conversation = {
        id: conversationId,
        property_id: propertyId,
        participants: participantIds,
        unread_count: 0,
        created_at: new Date().toISOString(),
      };

      setConversations(prev => [...prev, newConversation]);
      return conversationId;
    } catch (err) {
      setError('Failed to create conversation');
      console.error('Error creating conversation:', err);
      return null;
    }
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Update conversation's last message
          setConversations(prev => 
            prev.map(conv => 
              conv.id === newMessage.conversation_id
                ? { ...conv, last_message: newMessage, unread_count: conv.unread_count + 1 }
                : conv
            )
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    messages,
    currentConversation,
    isLoading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    createConversation,
    setCurrentConversation,
  };
}; 