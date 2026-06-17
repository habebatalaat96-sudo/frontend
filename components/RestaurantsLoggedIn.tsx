import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Star, MapPin, DollarSign, Clock, Phone, Heart, UtensilsCrossed } from 'lucide-react';
import { Button } from './ui/button';
import axios from "axios";
import { toast } from 'sonner';
import { API_URL } from "../config/api";
interface RestaurantsLoggedInProps {
  onNavigate: (page: 'home' | 'login' | 'gyms' | 'car-services' | 'restaurants' | 'coworking-spaces' | 'explore' | 'contact-us' | 'chatbot' | 'service-details', section?: string, tab?: any, serviceData?: any) => void;
}

interface RestaurantData {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];

  sponsored: boolean;
  price: string;
  hours: {
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }[];

  amenities: string[];
  isOpen: boolean;
  phone?: string;
  maps?: string;
  locationUrl?: string;
  distance?: string;
    businessLogo?: string; // ✅ أضف دي
    website?: string;

  description?: string;
}

export const RestaurantsLoggedIn: React.FC<RestaurantsLoggedInProps> = ({ onNavigate }) => {

  const convertToServiceData = (restaurant: RestaurantData) => ({
    id: restaurant.id,
    name: restaurant.name,
    category: 'Restaurants & Cafes',
    rating: restaurant.rating,
    reviews: restaurant.reviews,
    businessLogo: (restaurant as any).businessLogo || '',

    location: restaurant.location,
    address: restaurant.location,
    phone: restaurant.phone || '+20 2 XXXX XXXX',
    description: restaurant.description || 'Delightful dining experience with exceptional cuisine',
    images:
      restaurant.images && restaurant.images.length > 0
        ? restaurant.images.map((url: any) => String(url)).filter(Boolean)
        : restaurant.image ? [restaurant.image] : [],


    maps: restaurant.locationUrl || "",

    amenities: (restaurant.amenities || (restaurant as any).features || (restaurant as any).facilities || (restaurant as any).services || [])
      .map((s: string) => s.toLowerCase().replace(/\s+/g, '-')),

    price: restaurant.price,
    hours: restaurant.hours || [],
    services: (restaurant as any).services || [],

    // coordinates: { lat: 30.0444, lng: 31.2357 },
    businessReviews: [
      {
        id: 1,
        userName: 'Layla Hassan',
        rating: 5,
        date: '2 days ago',
        comment: 'Absolutely loved the food and atmosphere! The service was impeccable and the presentation was beautiful.'
      },
      {
        id: 2,
        userName: 'Omar Khalil',
        rating: 4,
        date: '1 week ago',
        comment: 'Great place with delicious food. A bit pricey but worth it for special occasions.'
      }
    ]
  });

  const [allRestaurants, setAllRestaurants] = useState<RestaurantData[]>([]);
  const [loading, setLoading] = useState(true);
    const [savedPlaces, setSavedPlaces] = useState<any[]>([]);

  // Properly mix sponsored and regular restaurants - interleave them
  const sponsoredRestaurants = allRestaurants.filter(restaurant => restaurant.sponsored);
  const regularRestaurants = allRestaurants.filter(restaurant => !restaurant.sponsored);

  const mixedRestaurants: RestaurantData[] = [];
  let sponsoredIndex = 0;
  let regularIndex = 0;

  // Interleave: 2 sponsored, 1 regular, 2 sponsored, 1 regular, etc.
  while (sponsoredIndex < sponsoredRestaurants.length || regularIndex < regularRestaurants.length) {
    // Add 2 sponsored restaurants
    for (let i = 0; i < 2 && sponsoredIndex < sponsoredRestaurants.length; i++) {
      mixedRestaurants.push(sponsoredRestaurants[sponsoredIndex++]);
    }
    // Add 1 regular restaurant
    if (regularIndex < regularRestaurants.length) {
      mixedRestaurants.push(regularRestaurants[regularIndex++]);
    }
  }
 const savePlace = async (restaurant: RestaurantData) => {
  
    try {
  
      const token = localStorage.getItem("token");
  
      const placeData = {
   placeId: restaurant.id,
  name: restaurant.name,
  location: restaurant.location,
  rating: restaurant.rating,
  image: restaurant.image,
  category: "restaurants",
  price: restaurant.price,
  phone: restaurant.phone,
  website: restaurant.website,
  distance: restaurant.distance
      };
  
      const res = await axios.post(
        `${API_URL}/saved-places/save`,
        placeData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      // update frontend immediately
  setSavedPlaces((prev) => {
    const exists = prev.some(p => p.placeId === restaurant.id);
    if (exists) return prev;
    return [...prev, placeData];
  });
      toast.success("Place saved successfully");
  
    } catch (error) {
  
      console.log(error);
  
      toast.error("Failed to save place");
    }
  };
    const isSaved = (id: number) => {
      return savedPlaces.some((place) => place.placeId === id);
    };
 useEffect(() => {
   
     const fetchSavedPlaces = async () => {
   
       try {
   
         const token = localStorage.getItem("token");
   
         const res = await axios.get(
           `${API_URL}/saved-places/my-saved-places`,
           {
             headers: {
               Authorization: `Bearer ${token}`
             }
           }
         );
   
         setSavedPlaces(res.data.data);
   
       } catch (error) {
   
         console.log(error);
       }
     };
   
     fetchSavedPlaces();
   
   }, []);

  useEffect(() => {

    const fetchRestaurants = async () => {

      try {

        const response = await fetch(
          `${API_URL}/business/restaurants`
        );

        const result = await response.json();

        console.log("RESTAURANTS:", result);

        setAllRestaurants(result.data || []);

      } catch (error) {

        console.log("Error fetching restaurants:", error);

      } finally {

        setLoading(false);

      }
    };

    fetchRestaurants();

  }, []);

  if (loading) {
    return (
      <div className="pt-40 text-center text-2xl">
        Loading...
      </div>
    );
  }

  const removePlace = async (placeId: number) => {
   
       try {
   
         await axios.delete(
           `${API_URL}/saved-places/remove/${placeId}`,
           {
             headers: {
               Authorization: `Bearer ${localStorage.getItem("token")}`
             }
           }
         );
   
         setSavedPlaces((prev) =>
           prev.filter((place) => place.placeId !== placeId)
         );
   
         toast.success("Place removed");
   
       } catch (error) {
   
         console.log(error);
   
         toast.error("Failed to remove place");
       }
     };


  // Render horizontal stacked card (for logged in view)
  const renderHorizontalCard = (restaurant: RestaurantData) => (
    <Card
      key={restaurant.id}
      className="overflow-hidden bg-white border-2 border-cyan-100 hover:shadow-2xl transition-all duration-300 group cursor-pointer hover:-translate-y-1 rounded-[18px]"
    >
      <div className="flex flex-col md:flex-row md:h-[280px]">
        {/* Image Section */}
        <div className="relative w-full md:w-[440px] h-48 md:h-full overflow-hidden flex-shrink-0">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 to-transparent"></div>

          {/* Sponsored Badge */}
          {restaurant.sponsored && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-none">
                Sponsored
              </Badge>
            </div>
          )}

          {/* Heart Icon */}
          <button
                    title='heart'
                    className="absolute top-3 right-3"
                    onClick={(e) => {
                      e.stopPropagation();
                  
                      if (isSaved(restaurant.id)) {
                        removePlace(restaurant.id);
                      } else {
                        savePlace(restaurant);
                      }
                    }}
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        isSaved(restaurant.id)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-700 hover:text-red-500"
                      }`}
                    />
                  </button>
                  

          {/* Status Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className={restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
              {restaurant.isOpen ? 'Open Now' : 'Closed'}
            </Badge>
          </div>
        </div>

        {/* Content Section - Horizontal Details */}
        <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
          <div>
            {/* Title & Rating Row */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg mb-1 truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                  {restaurant.name}
                </h3>
                {restaurant.description && (
                  <p className="text-xs text-gray-500 line-clamp-1">{restaurant.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-xs">{restaurant.rating}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              {/* Location */}
              {/* <div className="flex items-start gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-700 truncate">{restaurant.location}</p>
                  {restaurant.distance && <p className="text-gray-500 text-xs">{restaurant.distance} away</p>}
                </div>
              </div> */}

              {/* Price */}
              <div className="flex items-center gap-1.5 text-xs">
                <DollarSign className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <span className="text-purple-600 truncate">{restaurant.price}</span>
              </div>

              {/* Hours */}
              {/* <span>
  {restaurant.hours?.[0]
    ? `${restaurant.hours[0].day}: ${restaurant.hours[0].open} - ${restaurant.hours[0].close}`
    : "No hours available"}
</span> */}

              {/* Phone */}
              {restaurant.phone && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Phone className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{restaurant.phone}</span>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-1 mb-2">
              {((restaurant.amenities || (restaurant as any).services || (restaurant as any).features || []).slice(0, 3).map((amenity: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 bg-cyan-50 text-cyan-700 border-cyan-200">
                  {amenity}
                </Badge>
              )))}
              {((restaurant.amenities || (restaurant as any).services || (restaurant as any).features || []).length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-600 border-gray-200">
                  +{(restaurant.amenities || (restaurant as any).services || (restaurant as any).features || []).length - 3}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button
            className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] group px-4 py-2 text-sm h-auto"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('service-details', undefined, undefined, convertToServiceData(restaurant));
            }}
          >
            View Details
            <UtensilsCrossed className="w-3.5 h-3.5 ml-1.5 group-hover:rotate-12 transition-transform" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Restaurants & Cafes
          </h1>
          <p className="text-lg text-gray-600">
            Discover the best dining experiences in Egypt
          </p>
        </div>

        {/* Restaurants Display - Vertical stacked horizontal cards */}
        <div className="space-y-4">
          {mixedRestaurants.map((restaurant) => renderHorizontalCard(restaurant))}
        </div>
      </div>
    </div>
  );
};
