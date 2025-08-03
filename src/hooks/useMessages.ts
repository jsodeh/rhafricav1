import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, subscribeToMessages } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  property_id: string;
  user_id: string;
  agent_id: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'read';
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
  agent?: {
    agency_name: string;
    phone: string;
  };
}

export interface Conversation {
  id: string;
  property_id: string;
  property_title: string;
  user_id: string;
  agent_id: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  user?: {
    name: string;
    email: string;
  };
  agent?: {
    agency_name: string;
    phone: string;
  };
}

export const useMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Fetch conversations for the current user
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('property_inquiries')
        .select(`
          id,
          property_id,
          user_id,
          agent_id,
          message,
          created_at,
          properties (
            title
          ),
          real_estate_agents (
            agency_name,
            phone
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation (property + agent combination)
      const conversationMap = new Map<string, Conversation>();
      
      data?.forEach((inquiry) => {
        const conversationKey = `${inquiry.property_id}_${inquiry.agent_id}`;
        
        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            id: conversationKey,
            property_id: inquiry.property_id,
            property_title: inquiry.properties?.title || 'Unknown Property',
            user_id: inquiry.user_id,
            agent_id: inquiry.agent_id,
            last_message: inquiry.message,
            last_message_time: inquiry.created_at,
            unread_count: 0, // TODO: Implement unread count
            agent: inquiry.real_estate_agents,
          });
        }
      });

      return Array.from(conversationMap.values());
    },
    enabled: !!user,
  });

  // Fetch messages for a specific conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', activeConversation],
    queryFn: async () => {
      if (!activeConversation || !user) return [];

      const [propertyId, agentId] = activeConversation.split('_');

      const { data, error } = await supabase
        .from('property_inquiries')
        .select(`
          id,
          property_id,
          user_id,
          agent_id,
          message,
          status,
          created_at
        `)
        .eq('property_id', propertyId)
        .eq('agent_id', agentId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!activeConversation && !!user,
  });

  // Send a new message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, propertyId, agentId }: {
      message: string;
      propertyId: string;
      agentId: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('property_inquiries')
        .insert({
          property_id: propertyId,
          user_id: user.id,
          agent_id: agentId,
          message,
          status: 'sent',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch conversations and messages
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      if (activeConversation) {
        queryClient.invalidateQueries({ queryKey: ['messages', activeConversation] });
      }
    },
  });

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const subscription = subscribeToMessages(user.id, (payload) => {
      console.log('New message received:', payload);
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
      if (activeConversation) {
        queryClient.invalidateQueries({ queryKey: ['messages', activeConversation] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, activeConversation, queryClient]);

  // Send message function
  const sendMessage = useCallback(async (message: string, propertyId: string, agentId: string) => {
    try {
      await sendMessageMutation.mutateAsync({ message, propertyId, agentId });
      return { success: true };
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }, [sendMessageMutation]);

  // Mark conversation as active
  const setConversation = useCallback((conversationId: string | null) => {
    setActiveConversation(conversationId);
  }, []);

  return {
    conversations: conversations || [],
    messages: messages || [],
    activeConversation,
    conversationsLoading,
    messagesLoading,
    sendMessage,
    setConversation,
    isSending: sendMessageMutation.isPending,
  };
}; 