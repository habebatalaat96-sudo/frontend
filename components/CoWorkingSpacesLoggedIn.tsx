import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Star, MapPin, DollarSign, Clock, Phone, Heart, Wifi, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import axios from "axios";
import { toast } from 'sonner';

interface CoWorkingSpacesLoggedInProps {
  onNavigate: (page: 'home' | 'login' | 'gyms' | 'car-services' | 'restaurants' | 'coworking-spaces' | 'explore' | 'contact-us' | 'chatbot' | 'service-details', section?: string, tab?: any, serviceData?: any) => void;
}

interface CoWorkingSpaceData {
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

export const CoWorkingSpacesLoggedIn: React.FC<CoWorkingSpacesLoggedInProps> = ({ onNavigate }) => {

  const convertToServiceData = (space: CoWorkingSpaceData) => ({
    id: space.id,
    name: space.name,
    category: 'Co-working Spaces',
      businessLogo: (space as any).businessLogo || '',

    rating: space.rating,
    reviews: space.reviews,
    location: space.location,
    address: space.location,
    phone: space.phone || '+20 2 XXXX XXXX',
    description: space.description ||
      'Professional co-working space with modern amenities',
   images:
      space.images && space.images.length > 0
        ? space.images.map((url: any) => String(url)).filter(Boolean)
        : space.image ? [space.image] : [],

     maps: space.locationUrl || "",

 amenities: (space.amenities || (space as any).features || (space as any).facilities || (space as any).services || [])
  .map((s: string) => s.toLowerCase().replace(/\s+/g, '-')),
    price: space.price,
      hours: space.hours || [],
   services: (space as any).services || [],

   
  });

  const [allSpaces, setAllSpaces] = useState<CoWorkingSpaceData[]>([]);
  const [loading, setLoading] = useState(true);
    const [savedPlaces, setSavedPlaces] = useState<any[]>([]);

  // Properly mix sponsored and regular spaces - interleave them
  const sponsoredSpaces = allSpaces.filter(space => space.sponsored);
  const regularSpaces = allSpaces.filter(space => !space.sponsored);

  const mixedSpaces: CoWorkingSpaceData[] = [];
  let sponsoredIndex = 0;
  let regularIndex = 0;

const savePlace = async (space: CoWorkingSpaceData) => {
  
    try {
  
      const token = localStorage.getItem("token");
  
      const placeData = {
   placeId: space.id,
  name: space.name,
  location: space.location,
  rating: space.rating,
  image: space.image,
  category: "Co-working Spaces",
  price: space.price,
  phone: space.phone,
  website: space.website,
  distance: space.distance
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
    const exists = prev.some(p => p.placeId === space.id);
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
    const fetchCoworkingSpaces = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/business/coworking-spaces"
        );

        const result = await response.json();

        
        console.log("COWORKING SPACES:", result);

        setAllSpaces(result.data || []);
      } catch (error) {
        console.log("Error fetching coworking spaces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoworkingSpaces();
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

       // Interleave: 2 sponsored, 1 regular, 2 sponsored, 1 regular, etc.
  while (sponsoredIndex < sponsoredSpaces.length || regularIndex < regularSpaces.length) {
    // Add 2 sponsored spaces
    for (let i = 0; i < 2 && sponsoredIndex < sponsoredSpaces.length; i++) {
      mixedSpaces.push(sponsoredSpaces[sponsoredIndex++]);
    }
    // Add 1 regular space
    if (regularIndex < regularSpaces.length) {
      mixedSpaces.push(regularSpaces[regularIndex++]);
    }
  }

  // Render horizontal stacked card (for logged in view)
  const renderHorizontalCard = (space: CoWorkingSpaceData) => (
    <Card
      key={space.id}
      className="overflow-hidden bg-white border-2 border-cyan-100 hover:shadow-2xl transition-all duration-300 group cursor-pointer hover:-translate-y-1 rounded-[18px]"
    >
      <div className="flex flex-col md:flex-row md:h-[280px]">
        {/* Image Section */}
        <div className="relative w-full md:w-[440px] h-48 md:h-full overflow-hidden flex-shrink-0">
          <img
            src={space.image}
            alt={space.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 to-transparent"></div>

          {/* Sponsored Badge */}
          {space.sponsored && (
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
                  
                      if (isSaved(space.id)) {
                        removePlace(space.id);
                      } else {
                        savePlace(space);
                      }
                    }}
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        isSaved(space.id)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-700 hover:text-red-500"
                      }`}
                    />
                  </button>

          {/* Status Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className={space.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
              {space.isOpen ? 'Open Now' : 'Closed'}
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
                  {space.name}
                </h3>
                {space.description && (
                  <p className="text-xs text-gray-500 line-clamp-1">{space.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-xs">{space.rating}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              {/* Location */}
              {/* <div className="flex items-start gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-700 truncate">{space.location}</p>
                  {space.distance && <p className="text-gray-500 text-xs">{space.distance} away</p>}
                </div>
              </div> */}

              {/* Price */}
              <div className="flex items-center gap-1.5 text-xs">
                <DollarSign className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <span className="text-purple-600 truncate">{space.price}</span>
              </div>

              {/* Hours */}
                {/* <span>
  {space.hours?.[0]
    ? `${space.hours[0].day}: ${space.hours[0].open} - ${space.hours[0].close}`
    : "No hours available"}
</span> */}

              {/* Phone */}
              {space.phone && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Phone className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{space.phone}</span>
                </div>
              )}
            </div>

        {/* Amenities */}
<div className="flex flex-wrap gap-1 mb-2">
  {((space.amenities || (space as any).services || (space as any).features || []).slice(0, 3).map((amenity: string, idx: number) => (
    <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 bg-cyan-50 text-cyan-700 border-cyan-200">
      {amenity}
    </Badge>
  )))}
  {((space.amenities || (space as any).services || (space as any).features || []).length > 3 && (
    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-600 border-gray-200">
      +{(space.amenities || (space as any).services || (space as any).features || []).length - 3}
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
    onNavigate('service-details', undefined, undefined, convertToServiceData(space));
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
            Co-working Spaces
          </h1>
          <p className="text-lg text-gray-600">
            Find your perfect workspace in Egypt
          </p>
        </div>

        {/* Spaces Display - Vertical stacked horizontal cards */}
        <div className="space-y-4">
          {mixedSpaces.map((space) => renderHorizontalCard(space))}
        </div>
      </div>
    </div>
  );
};