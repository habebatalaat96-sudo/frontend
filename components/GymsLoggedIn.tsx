import React, { useEffect, useState } from 'react';import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Star, MapPin, DollarSign, Clock, Phone, Heart, Wifi, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import axios from "axios";
import { toast } from 'sonner';

interface GymsLoggedInProps {
  onNavigate: (page: 'home' | 'login' | 'gyms' | 'car-services' | 'restaurants' | 'coworking-spaces' | 'explore' | 'contact-us' | 'chatbot' | 'service-details', section?: string, tab?: any, serviceData?: any) => void;
}

interface GymData {
   id: number;
  name: string;
  location: string;
  businessLogo?: string; // ✅ أضف دي

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
 website?: string;
    distance?: string;
    
    description?: string;
}

export const GymsLoggedIn: React.FC<GymsLoggedInProps> = ({ onNavigate }) => {
  
  const convertToServiceData = (gym: GymData ,    autoBook=false
) => ({
    
    id: gym.id,
    name: gym.name,
    category: 'gyms',
    rating: gym.rating,
    reviews: gym.reviews,
    location: gym.location,
      businessLogo: (gym as any).businessLogo || '',

    address: gym.location,
    phone: gym.phone || '+20 2 XXXX XXXX',
    description: gym.description || 'Premium fitness center with state-of-the-art equipment',
   images:
      gym.images && gym.images.length > 0
        ? gym.images.map((url: any) => String(url)).filter(Boolean)
        : gym.image ? [gym.image] : [],


            maps: gym.locationUrl || "",

amenities: (gym.amenities || (gym as any).features || (gym as any).facilities || (gym as any).services || [])
  .map((s: string) => s.toLowerCase().replace(/\s+/g, '-')),
  
  price: gym.price,
   hours: gym.hours || [],

   services: (gym as any).services || [],
       autoBook,

    // coordinates: { lat: 30.0444, lng: 31.2357 },
    businessReviews: [
      {
        id: 1,
        userName: 'Ahmed Hassan',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Amazing facilities and very professional staff! The equipment is top-notch and always clean.',
        images: [
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
          'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400'
        ]
      },
      {
        id: 2,
        userName: 'Sara Mohamed',
        rating: 4,
        date: '1 month ago',
        comment: 'Great gym with excellent trainers. The only downside is it can get crowded during peak hours.'
      },
      {
        id: 3,
        userName: 'Omar Khalil',
        rating: 5,
        date: '3 weeks ago',
        comment: 'Best gym in Cairo! Love the modern equipment and spacious workout areas.',
        images: [
          'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400'
        ]
      }
      
    ]
    
  }
);

const [allGyms, setAllGyms] = useState<GymData[]>([]);
const [loading, setLoading] = useState(true);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);


  // Properly mix sponsored and regular gyms - interleave them
  const sponsoredGyms = allGyms.filter(gym => gym.sponsored);
  const regularGyms = allGyms.filter(gym => !gym.sponsored);
  
  const mixedGyms: GymData[] = [];
  let sponsoredIndex = 0;
  let regularIndex = 0;
  
  // Interleave: 2 sponsored, 1 regular, 2 sponsored, 1 regular, etc.
  while (sponsoredIndex < sponsoredGyms.length || regularIndex < regularGyms.length) {
    // Add 2 sponsored gyms
    for (let i = 0; i < 2 && sponsoredIndex < sponsoredGyms.length; i++) {
      mixedGyms.push(sponsoredGyms[sponsoredIndex++]);
    }
    // Add 1 regular gym
    if (regularIndex < regularGyms.length) {
      mixedGyms.push(regularGyms[regularIndex++]);
    }
  }

   const savePlace = async (gym: GymData) => {
  
    try {
  
      const token = localStorage.getItem("token");
  
      const placeData = {
   placeId: gym.id,
  name: gym.name,
  location: gym.location,
  rating: gym.rating,
  image: gym.image,
  category: "Fitness & Gyms",
  price: gym.price,
  phone: gym.phone,
  website: gym.website,
  distance: gym.distance
      };
  
      const res = await axios.post(
        "http://localhost:5000/saved-places/save",
        placeData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      // update frontend immediately
  setSavedPlaces((prev) => {
    const exists = prev.some(p => p.placeId === gym.id);
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
           "http://localhost:5000/saved-places/my-saved-places",
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
    const fetchGyms = async () => {
      try {
        const response = await fetch("http://localhost:5000/business/gyms");
        const result = await response.json();
        console.log("GYMS:", result);
        const normalized = (result.data || []).map((b: any) => ({
          ...b,
          images: Array.isArray(b.photo_url)
            ? b.photo_url.map((url: any) => String(url)).filter(Boolean)
            : b.images || (b.image ? [b.image] : []),
          image: b.photo_url?.[0] || b.image || '',
          services: b.services || [],
        }));
        setAllGyms(normalized);
      } catch (error) {
        console.log("Error fetching gyms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, []);


if (loading) {
  return (
    <div className="pt-40 text-center text-2xl">
      Loading...
    </div>
  );
}
  // Render horizontal stacked card (for logged in view)
const removePlace = async (placeId: number) => {
   
       try {
   
         await axios.delete(
           `http://localhost:5000/saved-places/remove/${placeId}`,
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
   
  
  const renderHorizontalCard = (gym: GymData) => (
    <Card 
      key={gym.id} 
      className="overflow-hidden bg-white border-2 border-cyan-100 hover:shadow-2xl transition-all duration-300 group cursor-pointer hover:-translate-y-1 rounded-[18px]"
    >
      <div className="flex flex-col md:flex-row md:h-[280px]">
        {/* Image Section */}
        <div className="relative w-full md:w-[440px] h-48 md:h-full overflow-hidden flex-shrink-0">
          <img
            src={gym.image}
            alt={gym.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 to-transparent"></div>
          
          {/* Sponsored Badge */}
          {gym.sponsored && (
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
         
             if (isSaved(gym.id)) {
               removePlace(gym.id);
             } else {
               savePlace(gym);
             }
           }}
         >
           <Heart
             className={`w-5 h-5 transition-colors ${
               isSaved(gym.id)
                 ? "text-red-500 fill-red-500"
                 : "text-gray-700 hover:text-red-500"
             }`}
           />
         </button>

          {/* Status Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className={gym.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
              {gym.isOpen ? 'Open Now' : 'Closed'}
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
                  {gym.name}
                </h3>
                {gym.description && (
                  <p className="text-xs text-gray-500 line-clamp-1">{gym.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-xs">{gym.rating}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              {/* Location */}
              {/* <div className="flex items-start gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-700 truncate">{gym.location}</p>
                  {gym.distance && <p className="text-gray-500 text-xs">{gym.distance} away</p>}
                </div>
              </div> */}

              {/* Price */}
              <div className="flex items-center gap-1.5 text-xs">
                <DollarSign className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <span className="text-purple-600 truncate">{gym.price}</span>
              </div>

              {/* Hours */}
           {/* <span>
  {gym.hours?.[0]
    ? `${gym.hours[0].day}: ${gym.hours[0].open} - ${gym.hours[0].close}`
    : "No hours available"}
</span> */}

              {/* Phone */}
              {gym.phone && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Phone className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{gym.phone}</span>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-1 mb-2">
              {((gym.amenities || (gym as any).services || (gym as any).features || []).slice(0, 3).map((amenity: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 bg-cyan-50 text-cyan-700 border-cyan-200">
                  {amenity}
                </Badge>
              )))}
              {((gym.amenities || (gym as any).services || (gym as any).features || []).length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-600 border-gray-200">
                  +{(gym.amenities || (gym as any).services || (gym as any).features || []).length - 3}
                </Badge>
              ))}
            </div>
                      </div>

          {/* Action Button */}
          <Button
  type="button"
  className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] group px-4 py-2 text-sm h-auto relative z-10"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("clicked"); // 👈 للتأكد
    onNavigate('service-details', undefined, undefined, convertToServiceData(gym));
  }}
>
            View Details
            <Briefcase className="w-3.5 h-3.5 ml-1.5 group-hover:rotate-12 transition-transform" />
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
            Gyms & Fitness Centers
          </h1>
          <p className="text-lg text-gray-600">
            Find your perfect workout spot in Egypt
          </p>
        </div>

        {/* Gyms Display - Vertical stacked horizontal cards */}
        <div className="space-y-4">
          {mixedGyms.map((gym) => renderHorizontalCard(gym))}
        </div>
      </div>
    </div>
  );
};
