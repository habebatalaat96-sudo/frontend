import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Send, Sparkles, MapPin, Star, Heart, ChevronRight } from 'lucide-react';
// import spotLogo from 'figma:asset/87d319d70a74f2182b104a15a264753a0cfb9143.png';

interface ChatbotProps {
  onNavigate: (page: string) => void;
  userName: string;
  userLocation: string;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  recommendations?: Recommendation[];
}

interface Recommendation {
  id: number;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  price: string;
  amenities: string[];
  isOpen: boolean;
  phone?: string;
  website?: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onNavigate, userName, userLocation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Mock recommendations data
  const getMockRecommendations = (query: string): Recommendation[] => {
    const allRecommendations: Recommendation[] = [
      {
        id: 1,
        name: 'FitZone Gym & Fitness',
        category: 'Fitness & Gyms',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
        rating: 4.8,
        reviews: 230,
        location: 'Nasr City',
        distance: '3.5 km',
        price: 'EGP 800-1200/month',
        amenities: ['Kids Area', 'Parking', 'WiFi'],
        isOpen: true,
        phone: '+20 2 1234 5678',
        website: 'fitzone.eg',
      },
      {
        id: 2,
        name: 'PowerLift Elite Gym',
        category: 'Fitness & Gyms',
        image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400',
        rating: 4.9,
        reviews: 456,
        location: 'New Cairo',
        distance: '1.2 km',
        price: 'EGP 1000-1500/month',
        amenities: ['Personal Trainer', 'Sauna', 'Parking'],
        isOpen: true,
        phone: '+20 2 9876 5432',
        website: 'powerlift.eg',
      },
      {
        id: 3,
        name: 'FlexFit Studio',
        category: 'Fitness & Gyms',
        image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400',
        rating: 4.7,
        reviews: 189,
        location: 'Maadi',
        distance: '5.8 km',
        price: 'EGP 600-900/month',
        amenities: ['Yoga Classes', 'WiFi', 'Wheelchair Access'],
        isOpen: false,
        phone: '+20 2 5555 1234',
        website: 'flexfit.eg',
      },
      {
        id: 4,
        name: 'Paws & Coffee Café',
        category: 'Coffee & Cafes',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
        rating: 4.9,
        reviews: 342,
        location: 'Zamalek',
        distance: '2.1 km',
        price: 'EGP 50-150',
        amenities: ['Pet Friendly', 'WiFi', 'Outdoor Seating'],
        isOpen: true,
        phone: '+20 2 7777 8888',
      },
      {
        id: 5,
        name: 'The Green Kitchen',
        category: 'Casual Dining',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        rating: 4.6,
        reviews: 278,
        location: 'Heliopolis',
        distance: '4.3 km',
        price: 'EGP 200-500',
        amenities: ['Kids Friendly', 'Outdoor Seating', 'Wheelchair Access'],
        isOpen: true,
        phone: '+20 2 3333 4444',
      },
      {
        id: 6,
        name: 'WorkHub Co-working',
        category: 'Co-working Spaces',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
        rating: 4.8,
        reviews: 156,
        location: 'Sheikh Zayed',
        distance: '6.5 km',
        price: 'EGP 100-300/day',
        amenities: ['WiFi', 'Parking', 'Meeting Rooms'],
        isOpen: true,
        phone: '+20 2 9999 0000',
        website: 'workhub.eg',
      },
    ];

    // Simple keyword matching for demo
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('gym') || lowerQuery.includes('fitness') || lowerQuery.includes('workout')) {
      return allRecommendations.filter(r => r.category === 'Fitness & Gyms');
    }
    if (lowerQuery.includes('cafe') || lowerQuery.includes('coffee')) {
      return allRecommendations.filter(r => r.category === 'Coffee & Cafes');
    }
    if (lowerQuery.includes('restaurant') || lowerQuery.includes('food') || lowerQuery.includes('dining')) {
      return allRecommendations.filter(r => r.category === 'Casual Dining');
    }
    if (lowerQuery.includes('cowork') || lowerQuery.includes('workspace') || lowerQuery.includes('office')) {
      return allRecommendations.filter(r => r.category === 'Co-working Spaces');
    }

    // Default: return top 3 mixed recommendations
    return allRecommendations.slice(0, 3);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const recommendations = getMockRecommendations(inputValue);
      const botResponse: Message = {
        id: messages.length + 2,
        text: recommendations.length > 0
          ? `Great! I found ${recommendations.length} amazing ${recommendations[0].category.toLowerCase()} options near you in ${userLocation}. Here are my top recommendations:`
          : `I found some great options for you in ${userLocation}. Check these out:`,
        isUser: false,
        timestamp: new Date(),
        recommendations: recommendations.length > 0 ? recommendations : undefined,
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    '🏋️ Find me a gym nearby',
    '☕ Best cafes with WiFi',
    '🍽️ Kid-friendly restaurants',
    '💼 Co-working spaces',
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-20 flex flex-col relative overflow-hidden">
      {/* SPOT Logo Watermark */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none z-0">
        <img
          src="../assets/87d319d70a74f2182b104a15a264753a0cfb9143.png"
          alt=""
          className="w-[1000px] h-[1000px] object-contain transform rotate-12"
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Empty State - Welcome Screen */}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-24rem)] text-center">
              {/* SPOT Branding */}
              <div className="mb-8 animate-fadeIn">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-2xl mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  SPOT AI Assistant
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                  Hi {userName.split(' ')[0]}! 👋
                </p>
                <p className="text-gray-500 max-w-md mx-auto">
                  I can help you discover gyms, restaurants, cafes, car services, and co-working spaces in {userLocation}
                </p>
              </div>

              {/* Quick Suggestions */}
              <div className="w-full max-w-2xl animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <p className="text-sm font-medium text-gray-600 mb-4">Try asking me:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="group p-4 bg-white border-2 border-gray-200 rounded-[18px] hover:border-cyan-400 hover:shadow-lg transition-all duration-300 text-left hover:-translate-y-1"
                    >
                      <span className="text-gray-700 group-hover:text-cyan-600 transition-colors font-medium">
                        {prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="space-y-6 pb-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {/* Message Bubble */}
                  <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div className="flex items-start gap-3 max-w-[85%]">
                      {!message.isUser && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <div
                          className={`px-5 py-3 rounded-[18px] shadow-md ${message.isUser
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-tr-none'
                              : 'bg-white border-2 border-gray-100 text-gray-800 rounded-tl-none'
                            }`}
                        >
                          <p className="leading-relaxed">{message.text}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 px-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {message.isUser && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="text-white font-bold">
                            {userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommendations Horizontal Scroll */}
                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="mt-4 ml-0 md:ml-14">
                      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                        {message.recommendations.map((rec) => (
                          <Card
                            key={rec.id}
                            className="flex-shrink-0 w-[320px] cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-[18px] border-2 border-cyan-100 overflow-hidden bg-white snap-center"
                            onClick={() => {/* TODO: Navigate to business page */ }}
                          >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={rec.image}
                                alt={rec.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                              {/* Status Badge */}
                              <div className="absolute top-3 left-3">
                                <Badge className={`${rec.isOpen ? 'bg-green-500' : 'bg-red-500'} text-white border-none font-bold`}>
                                  {rec.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                                </Badge>
                              </div>

                              {/* Favorite Button */}
                              <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                                <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                              </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 bg-white">
                              <div className="mb-2">
                                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-cyan-600 transition-colors">
                                  {rec.name}
                                </h3>
                                <p className="text-sm text-gray-500">{rec.category}</p>
                              </div>

                              {/* Rating */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-bold text-sm">{rec.rating}</span>
                                </div>
                                <span className="text-sm text-gray-500">({rec.reviews} reviews)</span>
                              </div>

                              {/* Location & Distance */}
                              <div className="flex items-center gap-2 mb-3 text-sm">
                                <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                                <span className="text-gray-700 font-medium">{rec.location}</span>
                                <span className="text-gray-500">• {rec.distance} away</span>
                              </div>

                              {/* Price */}
                              <div className="mb-3">
                                <p className="text-sm text-purple-600 font-bold">{rec.price}</p>
                              </div>

                              {/* Amenities */}
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {rec.amenities.slice(0, 3).map((amenity, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs bg-cyan-50 text-cyan-700 border-cyan-200">
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>

                              {/* Action Button */}
                              <Button
                                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] font-bold group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  /* TODO: Navigate to business page */
                                }}
                              >
                                View Details
                                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>

                      {/* Scroll Hint */}
                      {message.recommendations && message.recommendations.length > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-400 animate-pulse">
                          <ChevronRight className="w-4 h-4 animate-bounce-horizontal" />
                          <span>Scroll to see {message.recommendations.length} options</span>
                          <ChevronRight className="w-4 h-4 animate-bounce-horizontal" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white border-2 border-gray-100 px-5 py-3 rounded-[18px] rounded-tl-none shadow-md">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input Bar at Bottom */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... (e.g., 'Find me a gym with parking')"
                className="w-full rounded-full border-2 border-gray-300 focus:border-cyan-400 px-6 py-6 text-base bg-white shadow-sm hover:border-cyan-300 transition-all"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="h-14 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-all hover:scale-105 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes bounce-horizontal {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(5px);
          }
        }
        .animate-bounce-horizontal {
          animation: bounce-horizontal 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
