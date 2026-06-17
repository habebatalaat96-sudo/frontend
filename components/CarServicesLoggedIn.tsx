import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Star, MapPin, DollarSign, Clock, Phone, Heart, Wrench } from 'lucide-react';
import { Button } from './ui/button';
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { toast } from 'sonner';
import { API_URL } from "../config/api";

interface CarServicesLoggedInProps {
  onNavigate: (page: 'home' | 'login' | 'gyms' | 'car-services' | 'restaurants' | 'coworking-spaces' | 'explore' | 'contact-us' | 'chatbot' | 'service-details', section?: string, tab?: any, serviceData?: any) => void;
}

interface ServiceData {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  businessLogo?: string; // ✅ أضف دي

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
  description?: string;
  services?: any[];
  website?: string;
  distance?: string;

}

export const CarServicesLoggedIn: React.FC<CarServicesLoggedInProps> = ({ onNavigate }) => {

  const convertToServiceData = (service: ServiceData) => ({
    id: service.id,
    name: service.name,

    // "carservices" matches getBusinessType in ServiceDetails → car_service flow
    category: "carservices",

    rating: service.rating,
    reviews: service.reviews,
    location: service.location,
    address: service.location,
    phone: service.phone || "",
    description: service.description || "Professional automotive service with expert technicians",
    businessLogo: (service as any).businessLogo || '',

    // Use full images array — fall back to single image only if array missing
    images:
      service.images && service.images.length > 0
        ? service.images.map((url: any) => String(url)).filter(Boolean)
        : service.image ? [service.image] : [],

    amenities: (service.amenities || []).map((a: string) =>
      a.toLowerCase().replace(/\s+/g, '-')
    ),

    maps: service.locationUrl || service.maps || "",
    price: service.price,
    hours: service.hours || [],

    // Real services from API — NOT amenities
    services: (service.services || []).map((s: any) => ({
      service_id: s.service_id ?? s._id ?? Math.random(),
      service_category: s.service_category ?? "Car Service",
      name: s.name,
      duration: s.duration ?? "",
      description: s.description ?? "",
      price: s.price,
      price_after: s.price_after,
      min_price: s.min_price,
      max_price: s.max_price,
      min_price_after: s.min_price_after,
      max_price_after: s.max_price_after,
      offer: s.offer && s.offer !== '0%' && s.offer !== 0 ? s.offer : null,
      price_type: s.price_type,
    })),

    bookedSlots: (service as any).booked_slots ?? [],

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
        comment: 'Great service with excellent technicians. The only downside is it can get crowded during peak hours.'
      },
      {
        id: 3,
        userName: 'Omar Khalil',
        rating: 5,
        date: '3 weeks ago',
        comment: 'Best car service in Cairo! Love the modern equipment and professional staff.',
        images: [
          'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400'
        ]
      }
    ]
  });

  const [allServices, setAllServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);

  const sponsoredServices = allServices.filter(service => service.sponsored);
  const regularServices = allServices.filter(service => !service.sponsored);

  const mixedServices: ServiceData[] = [];
  let sponsoredIndex = 0;
  let regularIndex = 0;

  while (sponsoredIndex < sponsoredServices.length || regularIndex < regularServices.length) {
    for (let i = 0; i < 2 && sponsoredIndex < sponsoredServices.length; i++) {
      mixedServices.push(sponsoredServices[sponsoredIndex++]);
    }
    if (regularIndex < regularServices.length) {
      mixedServices.push(regularServices[regularIndex++]);
    }
  }

  const savePlace = async (service: ServiceData) => {

    try {

      const token = localStorage.getItem("token");

      const placeData = {
        placeId: service.id,
        name: service.name,
        location: service.location,
        rating: service.rating,
        image: service.image,
        category: "carservices",
        price: service.price,
        phone: service.phone,
        website: service.website,
        distance: service.distance
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
        const exists = prev.some(p => p.placeId === service.id);
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
    const fetchCarServices = async () => {
      try {
        const response = await fetch(`${API_URL}/business/car-services`);
        const result = await response.json();
        console.log("CAR SERVICES full result:", JSON.stringify(result));
console.log("CAR SERVICES data:", result.data);
console.log("CAR SERVICES status:", response.status);
        console.log("CAR SERVICES:", result);

        // Normalize API response to include images array
        const normalized = (result.data || []).map((b: any) => ({
          ...b,
          images: Array.isArray(b.photo_url)
            ? b.photo_url.map((url: any) => String(url)).filter(Boolean)
            : b.images || (b.image ? [b.image] : []),
          image: b.photo_url?.[0] || b.image || '',
          services: b.services || [],
        }));

        setAllServices(normalized);
      } catch (error) {
        console.log("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarServices();
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

  const renderHorizontalCard = (service: ServiceData) => (
    <Card
      key={service.id}
      className="overflow-hidden bg-white border-2 border-cyan-100 hover:shadow-2xl transition-all duration-300 group cursor-pointer hover:-translate-y-1 rounded-[18px]"
    >
      <div className="flex flex-col md:flex-row md:h-[280px]">
        {/* Image Section */}
        <div className="relative w-full md:w-[440px] h-48 md:h-full overflow-hidden flex-shrink-0">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 to-transparent"></div>

          {service.sponsored && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-none">
                Sponsored
              </Badge>
            </div>
          )}

          <button
            title='heart'
            className="absolute top-3 right-3"
            onClick={(e) => {
              e.stopPropagation();

              if (isSaved(service.id)) {
                removePlace(service.id);
              } else {
                savePlace(service);
              }
            }}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${isSaved(service.id)
                  ? "text-red-500 fill-red-500"
                  : "text-gray-700 hover:text-red-500"
                }`}
            />
          </button>
          <div className="absolute bottom-3 left-3">
            <Badge className={service.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
              {service.isOpen ? 'Open Now' : 'Closed'}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg mb-1 truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-xs text-gray-500 line-clamp-1">{service.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-xs">{service.rating}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs">
                <DollarSign className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <span className="text-purple-600 truncate">{service.price}</span>
              </div>

              {/* <div className="flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                <span>
                  {Array.isArray(service.hours) && service.hours.length > 0
                    ? `${service.hours[0].day}: ${service.hours[0].open} - ${service.hours[0].close}`
                    : "Hours not available"}
                </span>
              </div> */}

              {service.phone && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Phone className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{service.phone}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {(service.amenities || []).slice(0, 3).map((amenity: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 bg-cyan-50 text-cyan-700 border-cyan-200">
                  {amenity}
                </Badge>
              ))}
              {(service.amenities || []).length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-600 border-gray-200">
                  +{(service.amenities || []).length - 3}
                </Badge>
              )}
            </div>
          </div>

          <Button
            className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] group px-4 py-2 text-sm h-auto"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('service-details', undefined, undefined, convertToServiceData(service));
            }}
          >
            View Details
            <Wrench className="w-3.5 h-3.5 ml-1.5 group-hover:rotate-12 transition-transform" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Car Services
          </h1>
          <p className="text-lg text-gray-600">
            Find your perfect automotive service in Egypt
          </p>
        </div>

        <div className="space-y-4">
          {mixedServices.map((service) => renderHorizontalCard(service))}
        </div>
      </div>
    </div>
  );
};