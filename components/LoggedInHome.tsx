import React, { useEffect, useState } from 'react';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MessageSquare, Sparkles, TrendingDown, MapPin, Star, Clock, Heart } from 'lucide-react';
import { UserPreferences } from './UserPreferences';

interface LoggedInHomeProps {
  onNavigate: (page: string, section?: string, tab?: any, serviceData?: any) => void;
  userPreferences: UserPreferences;
  userName: string;
}

export const LoggedInHome: React.FC<LoggedInHomeProps> = ({ onNavigate, userPreferences, userName }) => {
  const [deals, setDeals] = useState<any[]>([]);
  const [dealsOnly, setDealsOnly] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const matchingDeals = deals;
  const sponsoredDeals = matchingDeals.filter((d) => {
    if (!d.sponsered || !d.sponsor_end_date) return false;
    const today = new Date();
    const endDate = new Date(d.sponsor_end_date);
    return endDate >= today;
  });
  const regularDeals = matchingDeals.filter(d => !d.sponsered);
const INTEREST_TO_CATEGORY: Record<string, string[]> = {
  'Fitness & Gyms': ['gyms'],
  'Casual Dining': ['restaurants'],
  'Fine Dining': ['restaurants'],
  'Coffee & Cafes': ['restaurants'],
  'Family Restaurants': ['restaurants'],
  'Fast Food': ['restaurants'],
  'Healthy Food': ['restaurants'],
  'Co-working Spaces': ['coworking'],
  'Meeting Rooms': ['coworking'],
  'Car Maintenance': ['carservices'],
  'Car Detailing': ['carservices'],
};

const filterByPreferences = (data: any[]) => {
  const userCategories = userPreferences.interests.flatMap(
    interest => INTEREST_TO_CATEGORY[interest] || []
  );
  const userLocation = userPreferences.location?.toLowerCase();

  return data.filter(deal => {
    const categoryMatch = userCategories.length === 0 || 
      userCategories.includes(deal.category);
    const locationMatch = !userLocation || 
      deal.location?.toLowerCase().includes(userLocation);
    return categoryMatch && locationMatch;
  });
};
  const convertToServiceData = (deal: any) => {
    console.log("images array:", deal.images); // ← اضيف دي
    return {

      id: deal.id,
      name: deal.name,
      category: deal.category,
      rating: deal.rating || 0,
      reviews: deal.reviews || 0,
      location: deal.location,

      address: deal.address || deal.location,

      phone: deal.phone || '',

      description: deal.description || '',

      images:
        deal.images && deal.images.length > 0
          ? deal.images
          : [deal.image],

      amenities: deal.amenities || [],

      price: deal.price || '',

      maps: deal.location_url_on_maps || '',

      hours: (deal.working_hours || deal.hours || []).map(
        (item: any) => {

          if (typeof item === 'string') {

            const [dayPart, timePart] = item.split(': ');

            const [open, close] = (timePart || '').split(' – ');

            return {
              day: dayPart,
              open: open || '',
              close: close || '',
              isOpen: deal.isOpen
            };
          }

          return {
            ...item,
            isOpen: item.isOpen ?? deal.isOpen
          };
        }
      ),

      services: (deal.services || []).map((service: any) => ({
        service_id: service.service_id,

        service_category: service.service_category,

        name: service.name,

        duration: service.duration,

        description: service.description,

        price: service.price,

        price_after: service.price_after,

        min_price: service.min_price,

        max_price: service.max_price,

        min_price_after: service.min_price_after,

        max_price_after: service.max_price_after,

        offer: service.offer,

        price_type: service.price_type

      }
      )
      ),

      // أهم جزء للـ booking
      depositAmount: deal.depositAmount ?? 100,

      bookedSlots: deal.bookedSlots ?? [],

      businessReviews: deal.businessReviews || [],
    };
  };

  // Map category_code numbers to names matching getBusinessType in ServiceDetails
  const CATEGORY_MAP: Record<number, string> = {
    1: 'gyms',
    2: 'coworking',
    3: 'restaurants',
    4: 'carservices',
  };

  const formatBusinesses = (data: any[]) =>
    data.map((business: any) => ({

      id: business._id,

      name: business.name,

      // Use category_name if present, else fall back to code map
      category:
        business.category_name?.toLowerCase().trim() ||
        CATEGORY_MAP[business.category_code] ||
        'other',

      discount:
        business.services?.find(
          (service: any) =>
            service.offer &&
            service.offer.trim() !== '' &&
            service.offer !== '0%'
        )?.offer || null,
      description: business.description,
      image: business.photo_url?.[0] || '',
      images: business.photo_url || [],
      rating: business.average_rating || 0,
      reviews: business.business_number || 0,
      location: business.location,
      address: business.location,
      sponsered: business.sponsor,
      sponsor_end_date: business.sponsor_end_date,
      amenities: business.amenities || [],
      phone: business.phone_number,
      location_url_on_maps: business.location_url_on_maps || '',
      working_hours: business.working_hours || [],
      services: business.services || [],
      isOpen: business.isOpen,
      price: business.price,
      depositAmount: business.deposit_amount ?? undefined,
      bookedSlots: business.booked_slots ?? [],
    }));

useEffect(() => {
  const fetchBusinesses = async () => {
    try {
      const response = await fetch('http://localhost:5000/business/get-sponser');
      const data = await response.json();
      const formatted = formatBusinesses(data.data);
      
      const userLocation = userPreferences.location?.toLowerCase();
      const userCategories = userPreferences.interests.flatMap(
        interest => INTEREST_TO_CATEGORY[interest] || []
      );

      const filtered = formatted.filter(deal => {
        const locationMatch = !userLocation || 
  deal.location?.toLowerCase().replace(',', '').includes(userLocation.toLowerCase().replace(',', ''));
        const categoryMatch = userCategories.length === 0 || 
          userCategories.includes(deal.category);
        return locationMatch && categoryMatch;
      });

      setDeals(filtered);
    } catch (error) {
      console.error(error);
    }
  };
  fetchBusinesses();
}, [userPreferences.location, userPreferences.interests]);

useEffect(() => {
  const fetchDeals = async () => {
    try {
      const res = await fetch('http://localhost:5000/business/get-deals');
      const data = await res.json();
      const formatted = formatBusinesses(data.data);

      const userLocation = userPreferences.location?.toLowerCase();
      const userCategories = userPreferences.interests.flatMap(
        interest => INTEREST_TO_CATEGORY[interest] || []
      );

      const filtered = formatted.filter(deal => {
        const locationMatch = !userLocation || 
  deal.location?.toLowerCase().replace(',', '').includes(userLocation.toLowerCase().replace(',', ''));
        const categoryMatch = userCategories.length === 0 || 
          userCategories.includes(deal.category);
        return locationMatch && categoryMatch;
      });

      setDealsOnly(filtered);
    } catch (err) {
      console.log(err);
    }
  };
  fetchDeals();
}, [userPreferences.location, userPreferences.interests]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-24 pb-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-purple-100 px-6 py-2 rounded-full mb-4 border border-cyan-200/50">
            <Sparkles className="w-5 h-5 text-cyan-600" />
            <span className="text-cyan-700">Your Personalized Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl mb-3 font-bold">
            Welcome back, <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">{(userName || "").split(' ')[0]}</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals and services tailored just for you in {userPreferences.location}
          </p>
        </div>

        {/* AI Chatbot Section */}
        <Card id="ai-chatbot" className="mb-12 p-8 md:p-12 bg-gradient-to-br from-cyan-500 to-purple-600 border-none shadow-2xl overflow-hidden relative rounded-[18px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform -translate-x-48 translate-y-48"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white text-sm font-bold">AI-Powered Assistant</span>
              </div>
              <h2 className="text-3xl md:text-4xl text-white mb-4 font-bold">
                Ask SPOT Anything! 🤖
              </h2>
              <p className="text-white/90 text-lg mb-6 leading-relaxed">
                Get personalized recommendations, find the perfect spot for any occasion, compare services, and discover hidden gems near you - all through our intelligent AI chatbot.
              </p>
              <Button
                onClick={() => onNavigate('chatbot')}
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-[18px] font-bold transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Start Chatting
              </Button>
            </div>
            <div className="w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-[18px] p-6 border border-white/20 max-w-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-[18px] rounded-tl-none p-4 shadow-lg">
                      <p className="text-gray-800 text-sm">
                        "Find me a kid-friendly restaurant with outdoor seating near me"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="bg-gradient-to-r from-purple-500 to-cyan-500 rounded-[18px] rounded-tr-none p-4 shadow-lg">
                      <p className="text-white text-sm">
                        "I found 3 perfect matches within 2 km! Here are the top rated options..."
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Deals Section */}
        <div>
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-3xl mb-2 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent font-bold">
               Discounts
              </h2>
              <p className="text-gray-600">
                Personalized for you based on your preferences in {userPreferences.location}
              </p>
            </div>
          </div>

          {/* Sponsored */}
          {sponsoredDeals.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl text-gray-800 font-bold">Featured Offers</h3>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">Hot Deals</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sponsoredDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 border-purple-200 rounded-[18px]"
                    onClick={() => onNavigate('service-details', undefined, undefined, convertToServiceData(deal))}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={deal.image}
                        alt={deal.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none font-bold shadow-lg">
                          ⭐ Sponsored
                        </Badge>
                      </div>
                      {deal.discount && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                            {deal.discount}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5 bg-white">
                      <h3 className="text-lg mb-1 text-gray-900 font-bold group-hover:text-purple-600 transition-colors">
                        {deal.name}
                      </h3>
                      <p className="text-purple-600 mb-3 text-xs">{deal.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold">{deal.rating}</span>
                          <span className="text-gray-400">({deal.reviews})</span>
                        </div>
                        <span className="text-gray-700 font-bold">{deal.price}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 bg-cyan-50 px-3 py-2 rounded-full">
                        <MapPin className="w-4 h-4 mr-1 text-cyan-600" />
                        <span className="font-medium">{deal.location}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Deals Only */}
          {dealsOnly.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl text-gray-800 font-bold">Special Deals</h3>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">Hot Deals</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dealsOnly.map((deal) => (
                  <Card
                    key={deal.id}
                    className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 border-purple-200 rounded-[18px]"
                    onClick={() => onNavigate('service-details', undefined, undefined, convertToServiceData(deal))}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={deal.image}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {deal.discount && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                            {deal.discount}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5 bg-white">
                      <h3 className="text-lg mb-1 text-gray-900 font-bold group-hover:text-purple-600 transition-colors">
                        {deal.name}
                      </h3>
                      <p className="text-purple-600 mb-3 text-xs">{deal.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold">{deal.rating}</span>
                          <span className="text-gray-400">({deal.reviews})</span>
                        </div>
                        <span className="text-gray-700 font-bold">{deal.price}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 bg-cyan-50 px-3 py-2 rounded-full">
                        <MapPin className="w-4 h-4 mr-1 text-cyan-600" />
                        <span className="font-medium">{deal.location}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular Deals */}
          {regularDeals.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl text-gray-800 font-bold">Recommended for You</h3>
                <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">Personalized</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {regularDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 border-cyan-100 rounded-[18px]"
                    onClick={() => onNavigate('service-details', undefined, undefined, convertToServiceData(deal))}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={deal.image}
                        alt={deal.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      {deal.discount && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                            {deal.discount}
                          </div>
                        </div>
                      )}
                      <button className="absolute top-3 left-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                    <div className="p-5 bg-white">
                      <h3 className="text-lg mb-1 text-gray-900 font-bold group-hover:text-cyan-600 transition-colors">{deal.name}</h3>
                      <p className="text-cyan-600 mb-3 font-medium">{deal.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold">{deal.rating}</span>
                          <span className="text-gray-400">({deal.reviews})</span>
                        </div>
                        <span className="text-gray-700 font-bold">{deal.price}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 bg-purple-50 px-3 py-2 rounded-full">
                        <MapPin className="w-4 h-4 mr-1 text-purple-600" />
                        <span className="font-medium">{deal.location}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {matchingDeals.length === 0 && dealsOnly.length === 0 && (
            <Card className="p-12 text-center rounded-[18px] bg-gradient-to-br from-white to-cyan-50/30 border-2 border-dashed border-cyan-200">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-cyan-600" />
              </div>
              <h3 className="text-2xl text-gray-800 mb-2 font-bold">No deals available yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Check back soon for personalized offers based on your preferences in {userPreferences.location}!
              </p>
              <Button
                onClick={() => onNavigate('explore')}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] px-8 font-bold"
              >
                Explore All Services
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};