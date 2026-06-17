import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Send,
  Sparkles,
  MapPin,
  Star,
  Heart,
  ChevronRight,
  Phone,
  Globe,
  Clock,
  Tag
} from 'lucide-react';
import spotLogo from 'figma:asset/87d319d70a74f2182b104a15a264753a0cfb9143.png';
import { API_URL } from "../config/api";

interface ChatbotProps {
  onNavigate: (page: string, section?: string, tab?: any, serviceData?: any) => void;
  userName: string;
  userLocation: string;
  userPreferences?: {
    amenities: string[];
    budgetRange: [number, number];
    location: string;
    interests: string[];
  };
}

interface WorkingHour {
  day: string;
  time: string;
  isOpen: boolean;
}

interface ServiceItem {
  price_after: string | string;
  min_price?: number | string;
  max_price?: number | string;
  max_price_after?: number | string;
  min_price_after?: number | string;
  service_id?: number;
  name: string;
  service_category?: string;
  price?: string;
  duration?: string;
  description?: string;
  offer?: string;
  price_type?: string;
}

interface Recommendation {
  id: number;
  name: string;
  category: string;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  location: string;
  description: string;
  distance: string;
  price: string;
  hours?: WorkingHour[];
  amenities: string[];
  isOpen: boolean;
  phone?: string;
  website?: string;
  maps?: string;
  services?: ServiceItem[];
  sponsored?: boolean;
  claimed?: boolean;
  tag?: string;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  recommendations?: Recommendation[];
}

export const Chatbot: React.FC<ChatbotProps> = ({
  onNavigate,
  userName,
  userLocation,
  userPreferences
}) => {
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

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Convert recommendation → ServiceDetails format ──
  const convertToServiceData = (rec: Recommendation) => ({
    id: rec.id,
    name: rec.name,
    category: rec.category,
    rating: rec.rating,
    reviews: rec.reviews,
    location: rec.location,
    address: rec.location,
    phone: rec.phone || '',
    website: rec.website || '',
    description: rec.description || `Welcome to ${rec.name}.`,
    price: rec.price,
hours:
  rec.hours && rec.hours.length > 0
    ? rec.hours.map((h: any) => {
        // لو جاي open/close جاهز
        if (h.open && h.close) {
          return {
            day: h.day,
            open: h.open,
            close: h.close,
            isOpen: h.isOpen ?? true,
          };
        }

        // لو جاي time string
        const [open, close] = (h.time || '9:00 AM - 10:00 PM').split(' - ');

        return {
          day: h.day,
          open,
          close,
          isOpen: h.isOpen ?? true,
        };
      })
    : [
        {
          day: 'Monday',
          open: '9:00 AM',
          close: '10:00 PM',
          isOpen: true,
        },
        {
          day: 'Tuesday',
          open: '9:00 AM',
          close: '10:00 PM',
          isOpen: true,
        },
        {
          day: 'Wednesday',
          open: '9:00 AM',
          close: '10:00 PM',
          isOpen: true,
        },
        {
          day: 'Thursday',
          open: '9:00 AM',
          close: '10:00 PM',
          isOpen: true,
        },
        {
          day: 'Friday',
          open: '9:00 AM',
          close: '10:00 PM',
          isOpen: true,
        },
        {
          day: 'Saturday',
          open: '9:00 AM',
          close: '10:00 PM',
          isOpen: true,
        },
        {
          day: 'Sunday',
          open: 'Closed',
          close: '',
          isOpen: false,
        },
      ],
    amenities: rec.amenities || [],
    images: rec.images && rec.images.length > 0
      ? rec.images
      : ['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800'],
    maps: rec.maps || '',
services: rec.services?.map((s: any) => ({
  service_id: s.service_id,
  service_category: s.service_category,
  name: s.name,
  duration: s.duration,
  description: s.description,

  price: s.price,
  price_after: s.price_after,

  min_price: s.min_price,
  max_price: s.max_price,
  min_price_after: s.min_price_after,
  max_price_after: s.max_price_after,

  offer: s.offer,
  price_type: s.price_type,
})) || [],
    sponsored: rec.sponsored || false,
    claimed: rec.claimed || false,
    businessReviews: [
      {
        id: 1,
        userName: 'Ahmed Hassan',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Excellent service and great facilities! Highly recommended.',
        images: []
      },
      {
        id: 2,
        userName: 'Sara Mohamed',
        rating: 4,
        date: '1 month ago',
        comment: 'Very professional staff and clean environment.',
        images: []
      }
    ]
  });

  // ── Send message ─────────────────────────────────────
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          session_id: 'user_1',
          user_location: userLocation,
          user_preferences: userPreferences
        }),
      });

      const data = await response.json();

      const formattedRecommendations: Recommendation[] =
        (data.recommendations || []).map((rec: any, index: number) => ({
          id:          rec.id          || index + 1,
          name:        rec.name        || 'Unknown',
          category:    rec.category    || 'General',
          description: rec.description || '',
          image:       rec.image       || 'https://via.placeholder.com/400',
          images:      rec.images      || [],
          rating:      rec.rating      || 0,
          reviews:     rec.reviews     || 0,
          location:    rec.location    || userLocation,
          distance:    rec.distance    || '',
          price:       rec.price       || 'N/A',
          hours:       rec.hours       || [],
          amenities:   rec.amenities   || [],
          isOpen:      rec.isOpen      ?? true,
          phone:       rec.phone       || '',
          website:     rec.website     || '',
          maps:        rec.maps        || '',
          services:    rec.services    || [],
          sponsored:   rec.sponsored   || false,
          claimed:     rec.claimed     || false,
          tag:         rec.tag         || '',
        }));

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: data.reply || 'Here are some recommendations for you:',
        isUser: false,
        timestamp: new Date(),
        recommendations: formattedRecommendations,
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: '⚠️ Server error. Make sure backend is running.',
        isUser: false,
        timestamp: new Date(),
      }]);
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    '🏋️ Find me a gym nearby',
    '🍕 Best pizza restaurants',
    '💼 Co-working spaces',
    '🚗 Car wash nearby',
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  // ── Get today's open status from hours ──────────────
  const getTodayStatus = (hours?: WorkingHour[]) => {
    if (!hours || hours.length === 0) return null;
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = days[new Date().getDay()];
    return hours.find(h => h.day === today) || null;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-20 flex flex-col relative overflow-hidden">

      {/* Logo watermark */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none z-0">
        <img src={spotLogo} alt="" className="w-[1000px] h-[1000px] object-contain transform rotate-12" />
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Empty state */}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-24rem)] text-center">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-2xl mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  SPOT AI Assistant
                </h1>
                <p className="text-lg text-gray-600 mb-2">Hi {userName.split(' ')[0]}! 👋</p>
                <p className="text-gray-500 max-w-md mx-auto">
                  I can help you discover gyms, restaurants, cafes, co-working spaces, and car services in {userLocation}
                </p>
              </div>

              <div className="w-full max-w-2xl">
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

        {/* Bubble */}
        <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-2`}>
          <div className="flex items-start gap-3 max-w-[85%]">
            {!message.isUser && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <div className={`px-5 py-3 rounded-[18px] shadow-md ${
                message.isUser
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-tr-none'
                  : 'bg-white border-2 border-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                <p className="leading-relaxed">{message.text}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1 px-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.isUser && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-bold">{userName.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recommendation cards */}
        {message.recommendations && message.recommendations.length > 0 && (
          <div className="mt-4 ml-0 md:ml-14 space-y-4">
            {message.recommendations.map((rec) => {
              const todayStatus = getTodayStatus(rec.hours);
              return (
                <Card
                  key={rec.id}
className="cursor-pointer group rounded-[22px] border border-cyan-100 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"                            onClick={() => onNavigate('service-details', undefined, undefined, convertToServiceData(rec))}
                >
                  <div className="flex flex-col md:flex-row">

                    {/* Image */}
                    <div className="relative md:w-64 h-56 md:h-auto bg-gradient-to-br from-gray-50 to-gray-200 overflow-hidden flex-shrink-0">
                      <img
                        src={rec.image}
                        alt={rec.name}
                        className="w-full h-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/30 to-transparent" />

                      {/* Sponsored badge */}
                      {rec.sponsored && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-none text-xs">
                            Sponsored
                          </Badge>
                        </div>
                      )}

                      {/* Open/Closed */}
                      <div className="absolute bottom-3 left-3">
                        <Badge className={`${rec.isOpen ? 'bg-green-500' : 'bg-red-500'} text-white border-none text-xs`}>
                          {rec.isOpen ? '🟢 Open' : '🔴 Closed'}
                        </Badge>
                      </div>

                      {/* Heart */}
                      <button
                        className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 md:p-6 flex flex-col justify-between"> 
                    <div>
                        {/* Name + category */}
                        <div className="mb-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-gray-900 group-hover:text-cyan-600 transition-colors text-lg leading-tight">
                              {rec.name}
                            </h3>
                            {/* Rating */}
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full flex-shrink-0">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-sm">{rec.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{rec.category}</p>
                        </div>

                        {/* Location + price */}
                        <div className="flex flex-wrap items-center gap-3 mb-2 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                            <span>{rec.location}</span>
                        </div>
                        </div>

                        {/* Today's hours */}
                        {todayStatus && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                            <Clock className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Today: {todayStatus.time}</span>
                          </div>
                        )}

                        {/* Description */}
                        {rec.description && (
                          <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">
                            {rec.description}
                          </p>
                        )}

                        {/* Amenities */}
                        {rec.amenities && rec.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {rec.amenities.slice(0, 4).map((amenity, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 bg-cyan-50 text-cyan-700 border-cyan-200">
                                {amenity}
                              </Badge>
                            ))}
                            {rec.amenities.length > 4 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-500 border-gray-200">
                                +{rec.amenities.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}

  {/* Services */}
                    {rec.services && rec.services.length > 0 && (
  <div className="mt-3 mb-4">
    <p className="text-xs font-semibold text-gray-700 mb-2">
      Popular services
    </p>

    <div className="space-y-2">
      {rec.services.slice(0, 3).map((service) => (
        <div
          key={service.service_id}
          className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {service.name}
            </p>

            <p className="text-[11px] text-gray-500 truncate">
              {service.duration}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            {service.price_type === 'fixed' && (
              <>
                <p className="text-sm font-bold text-cyan-600">
                  EGP {service.price_after || service.price}
                </p>

                {service.offer && service.offer !== '0%' && service.price_after && service.price_after !== service.price && (
            <p
              className="text-[11px] text-gray-400"
              style={{
                textDecoration: 'line-through',
                textDecorationThickness: '2px',
                textDecorationColor: '#9CA3AF',
              }}
            >
              EGP {service.price}
            </p>
                )}
              </>
            )}

    {service.price_type === 'range' && (
  <>
    <p className="text-sm font-bold text-cyan-600">
      EGP {service.min_price_after || service.min_price}
      {' - '}
      {service.max_price_after || service.max_price}
    </p>

    {service.offer &&
      service.offer !== '0%' &&
      (
        service.min_price_after !== service.min_price ||
        service.max_price_after !== service.max_price
      ) && (
<p
  className="text-[11px] text-gray-400"
  style={{
    textDecoration: 'line-through',
    textDecorationThickness: '2px',
    textDecorationColor: '#9CA3AF',
  }}
>
  EGP {service.min_price} - {service.max_price}
</p>
      )}
  </>
)}

            {service.offer && service.offer !== '0%' && (
              <span className="inline-block mt-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                {service.offer} OFF
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

          {/* Contact */}
          {(rec.phone || rec.website) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
              {rec.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{rec.phone}</span>
                </div>
              )}
              {rec.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{rec.website}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Button */}
        <Button
          className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] font-bold group px-6"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('service-details', undefined, undefined, convertToServiceData(rec));
          }}
        >
          View Details
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  </Card>
);
})}
</div>
)}
</div>
))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white border-2 border-gray-100 px-5 py-3 rounded-[18px] rounded-tl-none shadow-md">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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

      {/* Input bar */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... (e.g., 'Find me a gym in Alexandria')"
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
    </div>
  );
};