import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Calendar,
  ArrowUpCircle,
  ArrowRightCircle,
  ArrowDownCircle,
  FileText,
  Paperclip,
  Send,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: "technical" | "billing" | "property" | "account" | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting_response" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  user_id: string;
  assigned_to?: string;
  tags: string[];
  messages: TicketMessage[];
  attachments: TicketAttachment[];
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: "user" | "agent" | "admin";
  message: string;
  created_at: string;
  is_internal?: boolean;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

interface SupportTicketsProps {
  className?: string;
}

const SupportTickets: React.FC<SupportTicketsProps> = ({ className = "" }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [newMessage, setNewMessage] = useState("");

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "general" as SupportTicket["category"],
    priority: "medium" as SupportTicket["priority"],
  });

  // Mock data for demo
  useEffect(() => {
    if (user) {
      const mockTickets: SupportTicket[] = [
        {
          id: "TKT-001",
          title: "Unable to upload property images",
          description: "I'm having trouble uploading images for my property listing. The upload fails after selecting files.",
          category: "technical",
          priority: "high",
          status: "in_progress",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          user_id: user.id,
          assigned_to: "support_agent_1",
          tags: ["upload", "images", "property"],
          messages: [
            {
              id: "msg_1",
              ticket_id: "TKT-001",
              sender_id: user.id,
              sender_name: user.email?.split("@")[0] || "User",
              sender_role: "user",
              message: "I'm having trouble uploading images for my property listing. The upload fails after selecting files.",
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: "msg_2",
              ticket_id: "TKT-001",
              sender_id: "support_agent_1",
              sender_name: "Support Agent",
              sender_role: "agent",
              message: "Thank you for contacting us. I can help you with the image upload issue. Can you tell me what browser you're using and the file sizes of the images you're trying to upload?",
              created_at: new Date(Date.now() - 82800000).toISOString(),
            },
          ],
          attachments: [],
        },
        {
          id: "TKT-002",
          title: "Payment verification delay",
          description: "My payment was processed 3 days ago but my account still shows as pending verification.",
          category: "billing",
          priority: "medium",
          status: "waiting_response",
          created_at: new Date(Date.now() - 259200000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
          user_id: user.id,
          assigned_to: "billing_agent_1",
          tags: ["payment", "verification"],
          messages: [
            {
              id: "msg_3",
              ticket_id: "TKT-002",
              sender_id: user.id,
              sender_name: user.email?.split("@")[0] || "User",
              sender_role: "user",
              message: "My payment was processed 3 days ago but my account still shows as pending verification.",
              created_at: new Date(Date.now() - 259200000).toISOString(),
            },
          ],
          attachments: [],
        },
      ];
      setTickets(mockTickets);
    }
  }, [user]);

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Create new ticket
  const handleCreateTicket = async () => {
    if (!user || !newTicket.title.trim() || !newTicket.description.trim()) return;

    setIsLoading(true);
    try {
      const ticket: SupportTicket = {
        id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
        title: newTicket.title,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority,
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
        tags: [],
        messages: [
          {
            id: `msg_${Date.now()}`,
            ticket_id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
            sender_id: user.id,
            sender_name: user.email?.split("@")[0] || "User",
            sender_role: "user",
            message: newTicket.description,
            created_at: new Date().toISOString(),
          },
        ],
        attachments: [],
      };

      setTickets(prev => [ticket, ...prev]);
      setNewTicket({ title: "", description: "", category: "general", priority: "medium" });
      setShowCreateForm(false);
      setSelectedTicket(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim() || !user) return;

    const message: TicketMessage = {
      id: `msg_${Date.now()}`,
      ticket_id: selectedTicket.id,
      sender_id: user.id,
      sender_name: user.email?.split("@")[0] || "User",
      sender_role: "user",
      message: newMessage,
      created_at: new Date().toISOString(),
    };

    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              messages: [...ticket.messages, message],
              updated_at: new Date().toISOString(),
            }
          : ticket
      )
    );

    setSelectedTicket(prev =>
      prev ? { ...prev, messages: [...prev.messages, message] } : null
    );

    setNewMessage("");
  };

  // Get status color
  const getStatusColor = (status: SupportTicket["status"]) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "waiting_response": return "bg-orange-100 text-orange-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority color
  const getPriorityColor = (priority: SupportTicket["priority"]) => {
    switch (priority) {
      case "urgent": return "text-red-600";
      case "high": return "text-orange-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: SupportTicket["priority"]) => {
    switch (priority) {
      case "urgent": return ArrowUpCircle;
      case "high": return ArrowUpCircle;
      case "medium": return ArrowRightCircle;
      case "low": return ArrowDownCircle;
      default: return ArrowRightCircle;
    }
  };

  return (
    <div className={cn("h-[600px] flex border rounded-lg overflow-hidden", className)}>
      {/* Tickets Sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Support Tickets</h2>
            <Button size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Ticket
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_response">Waiting Response</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tickets List */}
        <ScrollArea className="h-full">
          <div className="p-2 space-y-2">
            {filteredTickets.map((ticket) => {
              const PriorityIcon = getPriorityIcon(ticket.priority);
              return (
                <Card
                  key={ticket.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedTicket?.id === ticket.id
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <PriorityIcon 
                          className={cn("h-4 w-4", getPriorityColor(ticket.priority))} 
                        />
                        <span className="text-xs font-mono text-gray-500">
                          {ticket.id}
                        </span>
                      </div>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium text-sm line-clamp-2 mb-2">
                      {ticket.title}
                    </h4>
                    
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {ticket.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{ticket.messages.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredTickets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No tickets found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Ticket Detail / Create Form */}
      <div className="flex-1 flex flex-col">
        {showCreateForm ? (
          /* Create Ticket Form */
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Create Support Ticket</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
            
            <div className="space-y-4 max-w-lg">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the issue"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value as SupportTicket["category"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value as SupportTicket["priority"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide detailed information about your issue..."
                  rows={6}
                />
              </div>
              
              <Button 
                onClick={handleCreateTicket}
                disabled={isLoading || !newTicket.title.trim() || !newTicket.description.trim()}
                className="w-full"
              >
                {isLoading ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </div>
        ) : selectedTicket ? (
          /* Ticket Detail View */
          <>
            {/* Ticket Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-gray-500">{selectedTicket.id}</span>
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg">{selectedTicket.title}</h3>
                  <p className="text-sm text-gray-600">
                    Created {new Date(selectedTicket.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedTicket.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.sender_role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.sender_role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {message.sender_name}
                        </span>
                        <span className="text-xs opacity-70">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={2}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Ticket Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a ticket
              </h3>
              <p className="text-gray-600 mb-4">
                Choose a ticket from the sidebar to view details
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Ticket
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTickets;
