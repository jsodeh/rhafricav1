import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, X, MessageCircle, Sparkles } from 'lucide-react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI assistant. I can help you find properties, schedule viewings, and answer any questions about real estate. How can I help you today?',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai' as const,
        content: 'I understand you\'re looking for properties. Let me help you find the perfect match. What type of property are you interested in?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg border-0 p-0 overflow-hidden group"
          style={{
            background: 'linear-gradient(45deg, #1e40af, #3b82f6, #1e40af)',
            backgroundSize: '200% 200%'
          }}
        >
          <div className="absolute inset-1 rounded-full bg-white/10 backdrop-blur-sm"></div>
          <MessageCircle className="h-6 w-6 text-white relative z-10" />
          
          {/* Animated gradient border */}
          <div 
            className="absolute inset-0 rounded-full opacity-75 animate-spin-slow"
            style={{
              background: 'conic-gradient(from 0deg, #fbbf24, #3b82f6, #8b5cf6, #fbbf24)'
            }}
          />
        </Button>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end justify-start p-6">
          <Card className="w-96 h-[500px] flex flex-col shadow-2xl">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    <p className="text-xs text-white/80">Real Estate Hotspot</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything about properties..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    variant="blue"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
