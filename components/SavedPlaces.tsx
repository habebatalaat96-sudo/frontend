import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Star, MapPin, ArrowLeft, Trash2, Phone, Globe } from 'lucide-react';
import axios from "axios";
import { toast } from 'sonner';

interface SavedPlacesProps {
  onNavigate: (page: string, section?: string, tab?: any, serviceData?: any) => void;
}
export const SavedPlaces: React.FC<SavedPlacesProps> = ({ onNavigate }) => {

  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // const savedPlaces = userSavedPlaces && userSavedPlaces.length > 0 
  //   ? userSavedPlaces 
  //   : defaultSavedPlaces;

  // Convert saved place to service details format
  const convertToServiceData = (place: any) => {
    return {
      id: place.placeId,
      name: place.name,
      category: place.category,
      rating: place.rating,
      reviews: place.reviews,
      location: place.location,
      address: place.location,
      phone: place.phone || '+20 2 1234 5678',
      website: place.website,
      description: `Welcome to ${place.name}, a premier ${place.category.toLowerCase()} in ${place.location}. We offer top-notch facilities and services to meet all your needs.`,
      price: place.price,
      hours: [
        { day: 'Monday', time: '6:00 AM - 10:00 PM', isOpen: true },
        { day: 'Tuesday', time: '6:00 AM - 10:00 PM', isOpen: true },
        { day: 'Wednesday', time: '6:00 AM - 10:00 PM', isOpen: true },
        { day: 'Thursday', time: '6:00 AM - 10:00 PM', isOpen: true },
        { day: 'Friday', time: '8:00 AM - 8:00 PM', isOpen: true },
        { day: 'Saturday', time: '8:00 AM - 8:00 PM', isOpen: true },
        { day: 'Sunday', time: 'Closed', isOpen: false }
      ],
      amenities: place.amenities || ['WiFi', 'Parking', 'Wheelchair Access'],
      images: [
        place.image,
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
      ],
      coordinates: {
        lat: 30.0444,
        lng: 31.2357
      },
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
    };
  };

  useEffect(() => {
    const getSavedPlaces = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/saved-places/my-saved-places",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("saved places:", res.data.data);

        setSavedPlaces(res.data.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getSavedPlaces();
  }, []);


  const removePlace = async (placeId: number) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/saved-places/remove/${placeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // update UI immediately (optimistic update)
      setSavedPlaces((prev) =>
        prev.filter((place) => place.placeId !== placeId)
      );

      toast.success("Place removed");
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove place");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          onClick={() => onNavigate('account')}
          variant="ghost"
          className="mb-6 hover:bg-cyan-50 rounded-[18px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account
        </Button>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Saved Places
          </h1>
          <p className="text-lg text-gray-600">
            Your favorite gyms, cafes, and services ({savedPlaces.length} saved)
          </p>
        </div>

        {/* Saved Places List */}
        <div className="space-y-4">
          {!loading && savedPlaces.map((place) => (<Card
            key={place.placeId}
            className="overflow-hidden bg-white border-2 border-cyan-100 hover:shadow-2xl transition-all duration-300 group cursor-pointer rounded-[18px] h-[280px]"
          >
            <div className="flex flex-col md:flex-row h-full">
              {/* Image */}
              <div className="relative md:w-80 h-40 md:h-full overflow-hidden flex-shrink-0">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/20 to-transparent"></div>

                {/* Heart Icon - Filled */}
                <button
                  className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("clicked delete");


                  }}
                >

                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </button>


              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
                <div>
                  {/* Title & Rating */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                        {place.name}
                      </h3>
                      <p className="text-xs text-gray-500">{place.category}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-xs">{place.rating}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <div className="flex items-start gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-cyan-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-gray-700 font-medium truncate">{place.location}</p>
                        <p className="text-gray-500">{place.distance} away</p>
                      </div>
                    </div>

                    <div className="text-xs">
                      <span className="text-purple-600 font-bold">{place.price}</span>
                    </div>

                    {place.phone && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                        <span className="text-gray-700 truncate">{place.phone}</span>
                      </div>
                    )}

                    {place.website && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Globe className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                        <span className="text-gray-700 truncate">{place.website}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mb-2">Saved {place.savedDate}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] font-bold text-sm h-auto py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      const serviceData = convertToServiceData(place);
                      onNavigate('service-details', undefined, undefined, serviceData);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    className="w-auto px-3 rounded-[18px] border-red-200 text-red-600 hover:bg-red-50 h-auto py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Remove from saved
                      removePlace(place.placeId);

                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          ))}
        </div>

        {/* Empty State (if no saved places) */}
        {savedPlaces.length === 0 && (
          <Card className="p-12 bg-white border-2 border-cyan-100 shadow-xl rounded-[18px] text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl mb-2 text-gray-800">No Saved Places Yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring and save your favorite places!
            </p>
            <Button
              onClick={() => onNavigate('home')}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 py-3 rounded-[18px]"
            >
              Explore Now
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};
