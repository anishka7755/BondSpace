import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Home,
  ChevronLeft,
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Heart,
  Check,
  CheckCheck,
} from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(0);
  const [newMessage, setNewMessage] = useState("");

  const conversations = [
    {
      id: 1,
      name: "Sarah Chen",
      lastMessage: "That sounds perfect! When would you like to meet?",
      time: "2m ago",
      unread: 2,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616c375484b?w=150",
      online: true,
      compatibility: 95,
    },
    {
      id: 2,
      name: "Maya Patel",
      lastMessage: "I love that we both enjoy quiet evenings!",
      time: "1h ago",
      unread: 0,
      avatar:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150",
      online: false,
      compatibility: 88,
    },
    {
      id: 3,
      name: "Jessica Rodriguez",
      lastMessage: "Thanks for connecting! I'd love to chat more.",
      time: "3h ago",
      unread: 1,
      avatar:
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=150",
      online: true,
      compatibility: 82,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "Sarah Chen",
      message:
        "Hi! I saw we're a 95% match. I'd love to learn more about your living preferences!",
      time: "10:30 AM",
      isMe: false,
      read: true,
    },
    {
      id: 2,
      sender: "Me",
      message:
        "Hi Sarah! Yes, I'm really excited about our compatibility score too! I'm looking for someone who values cleanliness and quiet study time.",
      time: "10:35 AM",
      isMe: true,
      read: true,
    },
    {
      id: 3,
      sender: "Sarah Chen",
      message:
        "That's exactly what I'm looking for too! I work early hours so I'm usually asleep by 10 PM. Is that compatible with your schedule?",
      time: "10:37 AM",
      isMe: false,
      read: true,
    },
    {
      id: 4,
      sender: "Me",
      message:
        "Perfect! I'm also an early bird. I do yoga at 6 AM most mornings. Would you be interested in a video call this weekend to chat more?",
      time: "10:40 AM",
      isMe: true,
      read: true,
    },
    {
      id: 5,
      sender: "Sarah Chen",
      message: "That sounds perfect! When would you like to meet?",
      time: "10:42 AM",
      isMe: false,
      read: false,
    },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add message sending logic here
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-blush-50 to-lavender-50 dark:from-black dark:via-black dark:to-black transition-colors">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-rose-100/20 dark:border-rose-800/30 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                <span className="text-gray-600 dark:text-gray-200">
                  Back to Dashboard
                </span>
              </Link>
            </div>

            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-rose-500 to-lavender-500 p-2 rounded-lg shadow-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-lavender-600 dark:from-rose-400 dark:to-lavender-400 bg-clip-text text-transparent">
                BondSpace
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900/60 backdrop-blur-sm h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Messages</span>
                  <Badge
                    variant="secondary"
                    className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                  >
                    3 active
                  </Badge>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="space-y-1">
                  {conversations.map((conversation, index) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedChat(index)}
                      className={`p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                        selectedChat === index
                          ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={conversation.avatar}
                            alt={conversation.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {conversation.online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {conversation.name}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              >
                                {conversation.compatibility}%
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {conversation.time}
                              </span>
                              {conversation.unread > 0 && (
                                <div className="bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unread}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-900/60 backdrop-blur-sm h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={conversations[selectedChat]?.avatar}
                        alt={conversations[selectedChat]?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {conversations[selectedChat]?.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {conversations[selectedChat]?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {conversations[selectedChat]?.online
                          ? "Online"
                          : "Last seen 2h ago"}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    >
                      <Heart className="h-3 w-3 mr-1" />
                      {conversations[selectedChat]?.compatibility}% Match
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isMe
                            ? "bg-gradient-to-r from-rose-500 to-lavender-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <div
                          className={`flex items-center justify-between mt-2 text-xs ${
                            message.isMe ? "text-rose-100" : "text-gray-500"
                          }`}
                        >
                          <span>{message.time}</span>
                          {message.isMe && (
                            <div className="flex items-center">
                              {message.read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-rose-500 to-lavender-500 hover:from-rose-600 hover:to-lavender-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
