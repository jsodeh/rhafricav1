import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Send,
  Phone,
  Video,
  Paperclip,
  Star,
  Archive,
  MoreHorizontal,
  CheckCheck,
  Clock,
  AlertCircle,
  Filter,
  Users,
  MessageSquare,
  Zap,
  Settings,
  Tag,
  Clock3,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface ChatManagementProps {
  className?: string;
  mode?: "agent" | "support" | "admin";
}

interface ChatConversation {
  id: string;
  customerName: string;
  customerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  status: "active" | "waiting" | "resolved" | "escalated";
  priority: "high" | "medium" | "low";
  unreadCount: number;
  tags: string[];
  propertyId?: string;
  propertyTitle?: string;
  customerInfo: {
    email: string;
    phone?: string;
    location?: string;
    joinedDate: string;
  };
}

const mockConversations: ChatConversation[] = [
  {
    id: "conv_1",
    customerName: "John Smith",
    customerAvatar: "/placeholder.svg",
    lastMessage: "I'm interested in the 3-bedroom apartment in Victoria Island",
    lastMessageTime: "2 minutes ago",
    status: "active",
    priority: "high",
    unreadCount: 2,
    tags: ["new-inquiry", "urgent"],
    propertyId: "prop_1",
    propertyTitle: "Luxury 3-Bedroom Apartment - Victoria Island",
    customerInfo: {
      email: "john.smith@email.com",
      phone: "+234 901 234 5678",
      location: "Lagos, Nigeria",
      joinedDate: "2024-01-15",
    },
  },
  {
    id: "conv_2",
    customerName: "Sarah Wilson",
    customerAvatar: "/placeholder.svg",
    lastMessage: "Can you schedule a viewing for tomorrow?",
    lastMessageTime: "15 minutes ago",
    status: "waiting",
    priority: "medium",
    unreadCount: 1,
    tags: ["viewing", "follow-up"],
    propertyId: "prop_2",
    propertyTitle: "4-Bedroom Duplex - Lekki Phase 1",
    customerInfo: {
      email: "sarah.wilson@email.com",
      phone: "+234 802 345 6789",
      location: "Lagos, Nigeria",
      joinedDate: "2024-02-20",
    },
  },
  {
    id: "conv_3",
    customerName: "Michael Johnson",
    customerAvatar: "/placeholder.svg",
    lastMessage: "Thank you for the information. I'll get back to you.",
    lastMessageTime: "1 hour ago",
    status: "resolved",
    priority: "low",
    unreadCount: 0,
    tags: ["resolved", "satisfied"],
    propertyId: "prop_3",
    propertyTitle: "2-Bedroom Flat - Ikeja GRA",
    customerInfo: {
      email: "michael.j@email.com",
      location: "Abuja, Nigeria",
      joinedDate: "2024-01-08",
    },
  },
];

const ChatManagement: React.FC<ChatManagementProps> = ({
  className = "",
  mode = "agent",
}) => {
  const { user } = useAuth();
  const { messages, sendMessage, fetchMessages, isLoading } = useChat();
  
  const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentTab, setCurrentTab] = useState("active");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter conversations based on search and filters
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || conv.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Group conversations by status for tabs
  const groupedConversations = {
    active: filteredConversations.filter(c => c.status === "active"),
    waiting: filteredConversations.filter(c => c.status === "waiting"),
    resolved: filteredConversations.filter(c => c.status === "resolved"),
    escalated: filteredConversations.filter(c => c.status === "escalated"),
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle conversation selection
  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    
    // Mark as read
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user) return;

    const success = await sendMessage(
      selectedConversation.id,
      messageText,
      selectedConversation.customerName // Simplified for demo
    );

    if (success) {
      setMessageText("");
      
      // Update conversation's last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                lastMessage: messageText,
                lastMessageTime: "Just now",
              }
            : conv
        )
      );
    }
  };

  // Handle status change
  const handleStatusChange = (conversationId: string, newStatus: ChatConversation["status"]) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, status: newStatus }
          : conv
      )
    );
  };

  // Handle priority change
  const handlePriorityChange = (conversationId: string, newPriority: ChatConversation["priority"]) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, priority: newPriority }
          : conv
      )
    );
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "waiting": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-blue-100 text-blue-800";
      case "escalated": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn("h-[600px] flex border rounded-lg overflow-hidden", className)}>
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        {/* Search and Filters */}
        <div className="p-4 border-b bg-white">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conversation Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 m-2">
            <TabsTrigger value="active" className="text-xs">
              Active ({groupedConversations.active.length})
            </TabsTrigger>
            <TabsTrigger value="waiting" className="text-xs">
              Waiting ({groupedConversations.waiting.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="text-xs">
              Resolved ({groupedConversations.resolved.length})
            </TabsTrigger>
            <TabsTrigger value="escalated" className="text-xs">
              Escalated ({groupedConversations.escalated.length})
            </TabsTrigger>
          </TabsList>

          {/* Conversations List */}
          <div className="flex-1 overflow-hidden">
            {Object.entries(groupedConversations).map(([status, convs]) => (
              <TabsContent key={status} value={status} className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-2 space-y-2">
                    {convs.map((conversation) => (
                      <Card
                        key={conversation.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          selectedConversation?.id === conversation.id
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : "hover:bg-gray-50"
                        )}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.customerAvatar} alt={conversation.customerName} />
                              <AvatarFallback>
                                {conversation.customerName?.split(' ').map(n => n[0]).join('') || "C"}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-sm truncate">
                                  {conversation.customerName}
                                </h4>
                                {conversation.unreadCount > 0 && (
                                  <Badge className="bg-blue-600 text-white text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {conversation.lastMessage}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex space-x-1">
                                  <Badge className={cn("text-xs", getStatusBadgeColor(conversation.status))}>
                                    {conversation.status}
                                  </Badge>
                                  <Badge className={cn("text-xs", getPriorityBadgeColor(conversation.priority))}>
                                    {conversation.priority}
                                  </Badge>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {conversation.lastMessageTime}
                                </span>
                              </div>
                              
                              {conversation.propertyTitle && (
                                <div className="mt-2 text-xs text-blue-600 truncate">
                                  📍 {conversation.propertyTitle}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.customerAvatar} alt={selectedConversation.customerName} />
                    <AvatarFallback>
                      {selectedConversation.customerName?.split(' ').map(n => n[0]).join('') || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.customerName}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{selectedConversation.customerInfo.email}</span>
                      {selectedConversation.customerInfo.phone && (
                        <>
                          <span>•</span>
                          <span>{selectedConversation.customerInfo.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Select
                    value={selectedConversation.status}
                    onValueChange={(value: any) => handleStatusChange(selectedConversation.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={selectedConversation.priority}
                    onValueChange={(value: any) => handlePriorityChange(selectedConversation.id, value)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-1" />
                    Video
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {selectedConversation.propertyTitle && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                  <strong>Property:</strong> {selectedConversation.propertyTitle}
                </div>
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-sm text-gray-500">Loading messages...</div>
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
                        "max-w-[70%] rounded-lg px-4 py-2",
                        message.sender_id === user?.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      )}>
                        <div className="text-sm">{message.content}</div>
                        <div className={cn(
                          "flex items-center justify-end space-x-1 mt-1 text-xs",
                          message.sender_id === user?.id ? "text-blue-100" : "text-gray-500"
                        )}>
                          <span>{formatMessageTime(message.created_at)}</span>
                          {message.sender_id === user?.id && (
                            message.read_at ? 
                              <CheckCheck className="h-3 w-3" /> : 
                              <Clock className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  ref={inputRef}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600">
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManagement;
