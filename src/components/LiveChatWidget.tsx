import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  X,
  Send,
  Phone,
  Video,
  Paperclip,
  Smile,
  MoreVertical,
  Minimize2,
  Maximize2,
  CheckCheck,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveChat } from "@/hooks/useLiveChat";
import type { ChatAgent } from "@/hooks/useLiveChat";
import { cn } from "@/lib/utils";

interface LiveChatWidgetProps {
  className?: string;
  defaultOpen?: boolean;
  agentId?: string;
  propertyId?: string;
}



const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
  className = "",
  defaultOpen = false,
  agentId,
  propertyId,
}) => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    currentConversation,
    sendMessage,
    createConversation,
    fetchMessages,
    markAsRead,
    isLoading,
    defaultAgents,
    unreadTotal,
    getTypingUsers,
    setTyping,
  } = useLiveChat();

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<ChatAgent | null>(
    agentId ? defaultAgents.find(a => a.id === agentId) || null : null
  );
  const [showAgentList, setShowAgentList] = useState(!selectedAgent);
  const [typingStatus, setTypingStatus] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<"chat" | "support">("chat");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get typing status for current conversation
  const typingUsers = currentConversation ? getTypingUsers(currentConversation) : [];
  const typingText = typingUsers.length > 0 ? `${selectedAgent?.name} is typing...` : null;

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Handle starting a new conversation
  const handleStartConversation = async (agent: ChatAgent) => {
    if (!user) return;

    setSelectedAgent(agent);
    setShowAgentList(false);
    
    // Try to find existing conversation or create new one
    const existingConversation = conversations.find(
      conv => conv.participants.includes(agent.id)
    );

    if (existingConversation) {
      fetchMessages(existingConversation.id);
    } else {
      const conversationId = await createConversation(agent.id, propertyId);
      if (conversationId) {
        fetchMessages(conversationId);
      }
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedAgent || !currentConversation || !user) return;

    const success = await sendMessage(
      currentConversation,
      messageText,
      selectedAgent.id
    );

    if (success) {
      setMessageText("");
      // Simulate agent typing
      setTypingStatus(`${selectedAgent.name} is typing...`);
      setTimeout(() => {
        setTypingStatus(null);
        // Simulate agent response for demo
        if (Math.random() > 0.5) {
          simulateAgentResponse();
        }
      }, 2000);
    }
  };

  // Simulate agent response for demo
  const simulateAgentResponse = () => {
    if (!selectedAgent || !currentConversation || !user) return;

    const responses = [
      "Thanks for your message! I'll get back to you shortly with more details.",
      "I'd be happy to help you with that property. Let me check the available options.",
      "That's a great question! Based on your requirements, I have some excellent suggestions.",
      "I'm currently reviewing the property details. Would you like to schedule a viewing?",
      "Perfect! I'll send you the property brochure and additional information right away.",
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    setTimeout(() => {
      sendMessage(currentConversation, randomResponse, user.id);
    }, 1000);
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get message status icon
  const getMessageStatusIcon = (message: any) => {
    if (message.sender_id === user?.id) {
      if (message.read_at) {
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      }
      return <Clock className="h-3 w-3 text-gray-400" />;
    }
    return null;
  };

  // Handle minimizing chat
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Handle closing chat
  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Render chat button when closed
  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadTotal > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadTotal > 9 ? "9+" : unreadTotal}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <Card className={cn(
        "w-80 shadow-2xl border-0 transition-all duration-300",
        isMinimized ? "h-14" : "h-96"
      )}>
        {/* Chat Header */}
        <CardHeader className="p-3 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {selectedAgent && !showAgentList ? (
                <>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedAgent.avatar} alt={selectedAgent?.name || "Agent"} />
                    <AvatarFallback>{selectedAgent?.name?.split(' ').map(n => n[0]).join('') || "A"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{selectedAgent?.name || "Agent"}</div>
                    <div className="flex items-center space-x-1 text-xs text-blue-100">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        selectedAgent.is_online ? "bg-green-400" : "bg-gray-400"
                      )} />
                      <span>{selectedAgent.is_online ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <CardTitle className="text-sm">Live Chat</CardTitle>
                  <div className="text-xs text-blue-100">Choose an agent to start chatting</div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {selectedAgent && !showAgentList && (
                <>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-blue-700">
                    <Phone className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-blue-700">
                    <Video className="h-3 w-3" />
                  </Button>
                </>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
                onClick={handleMinimize}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
                onClick={handleClose}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Chat Content */}
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {showAgentList ? (
              /* Agent Selection */
              <div className="flex-1 p-4">
                <div className="text-sm font-medium mb-3">Choose who you'd like to chat with:</div>
                <div className="space-y-2">
                  {defaultAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleStartConversation(agent)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={agent.avatar} alt={agent?.name || "Agent"} />
                        <AvatarFallback>{agent?.name?.split(' ').map(n => n[0]).join('') || "A"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{agent?.name || "Agent"}</div>
                        <div className="text-xs text-gray-500">{agent.role}</div>
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            agent.is_online ? "bg-green-400" : "bg-gray-400"
                          )} />
                          <span>{agent.response_time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-sm text-gray-500">Loading messages...</div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <MessageCircle className="h-8 w-8 text-gray-400 mb-2" />
                      <div className="text-sm text-gray-500">Start a conversation</div>
                      <div className="text-xs text-gray-400">Send a message to begin chatting</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.sender_id === user?.id ? "justify-end" : "justify-start"
                          )}
                        >
                          <div className={cn(
                            "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                            message.sender_id === user?.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          )}>
                            <div>{message.content}</div>
                            <div className={cn(
                              "flex items-center justify-end space-x-1 mt-1 text-xs",
                              message.sender_id === user?.id ? "text-blue-100" : "text-gray-500"
                            )}>
                              <span>{formatMessageTime(message.created_at)}</span>
                              {getMessageStatusIcon(message)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {typingStatus && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              </div>
                              <span className="text-xs">{typingStatus}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      ref={inputRef}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 h-8"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-8 px-3"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedAgent?.is_online ? (
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1" />
                        {selectedAgent.name} is online
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        We'll respond as soon as possible
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default LiveChatWidget;
