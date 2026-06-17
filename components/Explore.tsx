import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Star, MapPin, MessageCircle, Sparkles, TrendingUp, Zap, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { API_URL } from "../config/api";
interface ExploreProps {
  onNavigate: (page: 'home' | 'login' | 'gyms' | 'car-services' | 'restaurants' | 'coworking-spaces' | 'explore' | 'contact-us') => void;
  scrollToSection?: string;
}


interface ServiceData {
  id: number;
  name: string;
  category: string;
  location: string;
  rating: number;
  image: string;
  sponsor?: boolean;
}
function mapBusinessToService(business: any): ServiceData {
  return {
    id: business._id ?? business.id,
    name: business.businessName ?? business.name,
    category: business.category ?? business.type ?? 'Service',
    location: business.location ?? business.address ?? '',
    rating: business.average_rating ?? business.rating ?? 0,
    image: (Array.isArray(business.photo_url) && business.photo_url.length > 0)
      ? business.photo_url[0]
      : business.image ?? business.imageUrl ?? business.photo ?? '',
    sponsor: business.sponsor,
  };
}

export const Explore: React.FC<ExploreProps> = ({ onNavigate, scrollToSection }) => {
  const [featuredServices, setFeaturedServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSponsored = async () => {
      try {
        setLoading(true);
        setError(null);
        // 🔁 Replace with your actual API base URL if needed
const response = await fetch(`${API_URL}/business/get-sponser`);
        if (!response.ok) throw new Error('Failed to fetch sponsored services');
        const json = await response.json();
        // json.data is the array returned from getSponsered
        const mapped: ServiceData[] = (json.data ?? []).map(mapBusinessToService);
        setFeaturedServices(mapped);
      } catch (err: any) {
        console.error('Fetch sponsored error:', err);
        setError('Could not load featured services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSponsored();
  }, []);

  useEffect(() => {
    if (scrollToSection) {
      setTimeout(() => {
        const element = document.getElementById(scrollToSection);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [scrollToSection]);

  const moreServices: ServiceData[] = [
    {
      id: 7,
      name: "Fine Dining Experience",
      category: "Restaurant",
      location: "234 Sunset Drive, Beach Area",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NTk5ODIzNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 8,
      name: "Creative Labs",
      category: "Co-working Space",
      location: "567 River Road, Riverside",
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1519217651866-847339e674d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NTk5NTA4ODl8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 9,
      name: "Premium Auto Service",
      category: "Car Service",
      location: "890 Park Avenue, Garden District",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1758767355046-1986dda2d967?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWhpY2xlJTIwc2VydmljZSUyMGNlbnRlcnxlbnwxfHx8fDE3NjAwMjM0MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 10,
      name: "Mechanic Masters",
      category: "Car Service",
      location: "111 Mountain View, Hillside",
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1642399299924-c9c97617bf86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBtZWNoYW5pYyUyMHNlcnZpY2V8ZW58MXx8fHwxNzU5OTY2NjczfDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 11,
      name: "Collaborative Workspace",
      category: "Co-working Space",
      location: "222 Valley Street, Central",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1560821630-1a7c45c3286e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3dvcmtpbmclMjBvZmZpY2UlMjBzcGFjZXxlbnwxfHx8fDE3NTk5MzQyNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 12,
      name: "Fitness Power House",
      category: "Gym",
      location: "333 Commerce Plaza, Business District",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1632077804406-188472f1a810?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwZ3ltJTIwZXF1aXBtZW50fGVufDF8fHx8MTc2MDAwMTg2N3ww&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Explore Local Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the best gyms, car services, restaurants, cafes, and co-working spaces near you
          </p>
        </div>

        {/* Featured Services */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Featured for You
            </div>
            <p className="text-gray-500 text-sm">Handpicked local services</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading sponsored services...</span>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-10 text-red-500 text-sm">{error}</div>
          )}

          {/* Featured Services Grid */}
          {!loading && !error && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
              {featuredServices.map((service) => (
                <Card
                  key={service.id}
                  className="overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  // ✅ Clicking any service card navigates to login
                  onClick={() => onNavigate('login')}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-700">
                      {service.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs shadow-lg">
                      Sponsored
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl mb-3 text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                      {service.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-start gap-2 mb-3 text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-600" />
                      <span className="text-sm">{service.location}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${
                              index < Math.floor(service.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : index < service.rating
                                ? 'fill-yellow-200 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-700">{service.rating}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* AI Chatbot Advertisement Section */}
          <div id="ai-assistant" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-purple-600 to-indigo-700 p-12 shadow-2xl mb-20">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <div className="mb-6 flex justify-center">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full animate-pulse">
                  <MessageCircle className="w-12 h-12 text-white" />
                </div>
              </div>

              <h2 className="text-4xl mb-4 text-white">
                Meet Your AI-Powered Assistant
              </h2>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Can't find what you're looking for? Our intelligent chatbot uses <span className="font-semibold">AI, NLP, and geolocation</span> to understand your needs and recommend the perfect local services—whether it's a gym, car service, restaurant, cafe, or co-working space.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Sparkles className="w-8 h-8 text-white mb-3 mx-auto" />
                  <h3 className="text-lg text-white mb-2">Smart Recommendations</h3>
                  <p className="text-white/80 text-sm">Personalized suggestions based on your preferences and location</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Zap className="w-8 h-8 text-white mb-3 mx-auto" />
                  <h3 className="text-lg text-white mb-2">Instant Answers</h3>
                  <p className="text-white/80 text-sm">Get responses in seconds with our advanced NLP technology</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <TrendingUp className="w-8 h-8 text-white mb-3 mx-auto" />
                  <h3 className="text-lg text-white mb-2">Always Learning</h3>
                  <p className="text-white/80 text-sm">AI that gets smarter with every interaction</p>
                </div>
              </div>

              <Button
                onClick={() => onNavigate('login')}
                className="bg-white text-purple-600 hover:bg-white/90 px-10 py-6 text-lg rounded-[18px] shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Try the AI Chatbot Now
              </Button>
            </div>
          </div>
        </div>

        {/* More Services Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm">
              More Services
            </div>
            <p className="text-gray-500 text-sm">Discover hundreds more in your area</p>
          </div>

          <div className="relative rounded-3xl overflow-hidden">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 blur-sm">
              {moreServices.map((service) => (
                <Card key={service.id} className="overflow-hidden bg-white/80 backdrop-blur-sm border-white/20">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-700">
                      {service.category}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl mb-3 text-gray-800">{service.name}</h3>

                    <div className="flex items-start gap-2 mb-3 text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-600" />
                      <span className="text-sm">{service.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${
                              index < Math.floor(service.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : index < service.rating
                                ? 'fill-yellow-200 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-700">{service.rating}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(6, 182, 212, 0.15) 0px, rgba(6, 182, 212, 0.15) 10px, rgba(147, 51, 234, 0.15) 10px, rgba(147, 51, 234, 0.15) 20px)',
            }}></div>

            <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-md">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 max-w-lg text-center border border-white/40">
                <div className="mb-4 flex justify-center">
                  <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-5 rounded-full">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  Unlock All Services
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Join SPOT to access our complete directory of local services with AI-powered recommendations tailored just for you
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => onNavigate('login')}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-10 py-4 text-lg rounded-[18px] shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Login to Continue
                  </Button>
                  <p className="text-sm text-gray-500">
                    Access AI chatbot • Personalized recommendations • Exclusive deals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};