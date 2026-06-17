import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Clock,
  Heart,
  Share2,
  Calendar,
  CheckCircle2,
  Wifi,
  Car,
  Coffee,
  Users,
  Wind,
  Dumbbell,
  UtensilsCrossed,
  Baby,
  Accessibility,
  PawPrint,
  Sun,
  Camera,
  Upload,
  X,
  Shield,
  Award,
  CreditCard,
  Smartphone,
  Banknote,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { format } from 'date-fns';
import axios from "axios";
import { API_URL } from "../config/api";
interface ServiceData {
  businessLogo?: string;
  _id?: string;

  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  address: string;
  phone: string;
  description: string;
  images: string[];
  amenities: string[];
  price: string;
  maps?: string;
   coordinates?: {
    lat: number;
    lng: number;
  };
  hours: {
    day: string;
    open: string;
    close: string;
    isOpen?: boolean;
  }[];
  businessReviews?: {
    id: number;
    userName: string;
    userAvatar?: string;
    rating: number;
    date: string;
    comment: string;
    images?: string[];
  }[];
  services?: {
    service_id: number;
    service_category: string;
    name: string;
    duration: string;
    description: string;

    price?: number;
    price_after?: number;

    min_price?: number;
    max_price?: number;

    min_price_after?: number;
    max_price_after?: number;

    offer?: string;
    price_type?: string;
  }[];

  // Restaurant-specific: deposit amount
  depositAmount?: number;

  // Pre-booked slots from API — format: "YYYY-MM-DD|H:MM AM"
  bookedSlots?: string[];
}

interface ServiceDetailsProps {
  onNavigate: (page: string) => void;
  serviceData: ServiceData;
  userName?: string;
  userAvatar?: string;
  onSavePlace?: (place: any) => void;
  onAddBooking?: (booking: any) => void;
}

type PaymentMethod ='instapay' | 'cash' | null;
type BookingStep = 'service' | 'dateonly' | 'datetime' | 'payment' | 'verify' | 'confirm';
type BusinessType = 'gym' | 'restaurant_cafe' | 'coworking' | 'car_service' | 'other';

const getBusinessType = (category: string): BusinessType => {
  const cat = category.toLowerCase().trim().replace(/[\s&_\-]+/g, '');

  if (cat.includes('gym')) return 'gym';

  if (
    cat.startsWith('restaurant') ||
    cat.startsWith('cafe') ||
    cat.startsWith('caf') ||
    cat.includes('restaurant') ||
    cat.includes('cafe')
  ) return 'restaurant_cafe';

  if (cat === 'coworking' || cat.startsWith('coworking') || cat.includes('coworking')) return 'coworking';

  if (
    cat === 'carservices' ||
    cat.startsWith('car') ||
    cat.includes('carservice') ||
    cat.includes('carservices') ||
    cat.includes('autoservice')
  ) return 'car_service';

  return 'other';
};



const getSteps = (type: BusinessType): BookingStep[] => {
  if (type === 'gym') return ['service', 'dateonly', 'payment', 'verify', 'confirm'];
  if (type === 'coworking') return ['service', 'datetime', 'payment', 'verify', 'confirm'];
  if (type === 'restaurant_cafe') return ['datetime', 'payment', 'verify', 'confirm'];
  return ['service', 'datetime', 'confirm'];
};


export const ServiceDetails: React.FC<ServiceDetailsProps> = ({
  onNavigate, serviceData, userName, userAvatar, onSavePlace, onAddBooking
}) => {

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'reviews' | 'photos'>('overview');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);

  const [selectedService, setSelectedService] = useState<any>(null);

  // Booking flow state
  const [bookingStep, setBookingStep] = useState<BookingStep>('service');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);

  // Payment verification state
  const [instapayScreenshot, setInstapayScreenshot] = useState<string | null>(null);
  const [instapayRef, setInstapayRef] = useState('');

  // Restaurant: number of guests for table booking
  const [guestCount, setGuestCount] = useState(2);

  // Slot tracking
  const [localBookedSlots, setLocalBookedSlots] = useState<string[]>([]);
  const allBookedSlots = [...(serviceData.bookedSlots ?? []), ...localBookedSlots];

  const businessType = getBusinessType(serviceData.category);
  const steps = getSteps(businessType);

  // Deposit amount for restaurants (default 100 EGP if not specified)
  const depositAmount = serviceData.depositAmount ?? 100;

  const amenityIcons: { [key: string]: any } = {
    wifi: Wifi,
    parking: Car,
    'kids-friendly': Baby,
    'wheelchair-accessible': Accessibility,
    'pet-friendly': PawPrint,
    'outdoor-seating': Sun,
    'air-conditioned': Wind,
  };
const [instapayFile, setInstapayFile] = useState<File | null>(null);

  // ✅ جيب الـ reviews من الـ DB
  useEffect(() => {
    const getReviews = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/reviews/business/${serviceData.id}`
        );
        setReviews(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    getReviews();
  }, [serviceData.id]);

  const handleSave = async () => {
  try {
    const token = localStorage.getItem("token");

    // لو المكان متسجل بالفعل → احذفه
    if (isSaved) {

      await axios.delete(
        `${API_URL}/saved-places/remove/${serviceData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setIsSaved(false);

      toast.success("Removed from saved places");

    } else {

      // لو مش متسجل → خزنه
      const placeData = {
        placeId: serviceData.id,
        name: serviceData.name,
        location: serviceData.location,
        rating: serviceData.rating,
        image: serviceData.images[0],
        category: serviceData.category,
        price: serviceData.price,
        phone: serviceData.phone,
      };

      await axios.post(
        `${API_URL}/saved-places/save`,
        placeData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setIsSaved(true);

      toast.success("Saved to your places!");
    }

  } catch (error) {

    console.log(error);

    toast.error("Failed to update saved place");
  }
};
useEffect(() => {
  const fetchSavedPlaces = async () => {
    try {
      const token = localStorage.getItem("token"); // ✅ صح

      if (!token) return; // ✅ لو مفيش token متعملش الـ request

      const res = await axios.get(
        `${API_URL}/saved-places/my-saved-places`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const exists = res.data.data.some(
        (place: any) => String(place.placeId) === String(serviceData.id)
      );

      setIsSaved(exists);

    } catch (error) {
      console.log(error);
    }
  };

  fetchSavedPlaces();
}, [serviceData.id]);


  const handleShare = () => {
    toast.success('Link copied to clipboard!');
  };

const handleBooking = () => {
  const firstStep = steps[0];
  setBookingStep(firstStep);
  setSelectedService(null);
  setSelectedDate(undefined);
  setSelectedTimeSlot(null);
  setSelectedPayment(null);
  setInstapayScreenshot(null);
  setInstapayFile(null); // ✅ أضيفي ده
  setInstapayRef('');
  setGuestCount(2);
  setShowBookingDialog(true);
};
  const currentStepIndex = steps.indexOf(bookingStep);

  const handleNextStep = () => {
    const nextStep = steps[currentStepIndex + 1];

    if (bookingStep === 'service') {
      if (serviceData.services && serviceData.services.length > 0 && !selectedService) {
        toast.error('Please select a service');
        return;
      }
      setBookingStep(nextStep);

    } else if (bookingStep === 'dateonly') {
      if (!selectedDate) { toast.error('Please select a date'); return; }
      setBookingStep(nextStep);

    } else if (bookingStep === 'datetime') {
      if (!selectedDate) { toast.error('Please select a date'); return; }
      if (!selectedTimeSlot) { toast.error('Please select a time slot'); return; }
      setBookingStep(nextStep);

    } else if (bookingStep === 'payment') {
      if (!selectedPayment) { toast.error('Please select a payment method'); return; }
      setBookingStep(nextStep);

    } else if (bookingStep === 'verify') {
      if (selectedPayment === 'instapay' && !instapayScreenshot && !instapayRef.trim()) {
        toast.error('Please upload a screenshot or enter the reference number');
        return;
      }
      setBookingStep(nextStep);
    }
  };

  

  const handlePrevStep = () => {
    const prevStep = steps[currentStepIndex - 1];
    setBookingStep(prevStep);
  };



const createBooking = async () => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    const formData = new FormData();

    formData.append('businessId', serviceData.id);
    formData.append('businessName', serviceData.name);
    formData.append('businessCategory', serviceData.category);
    formData.append('businessLocation', serviceData.location || '');
    formData.append('businessPhone', serviceData.phone || '');
    formData.append('businessImage', serviceData.images?.[0] || '');
    formData.append('bookingDate', selectedDate?.toISOString() || '');
    formData.append('pointsEarned', '50');

    if (selectedPayment) {
      formData.append('paymentMethod', selectedPayment);
    }

    // ✅ الصورة كـ File
    if (selectedPayment === 'instapay' && instapayFile) {
      formData.append('instapayScreenshot', instapayFile);
      console.log("SENDING FILE:", instapayFile.name, instapayFile.size); // ✅
    }

    if (selectedService) {
      formData.append('selectedService', JSON.stringify(selectedService));
    }

    if (selectedTimeSlot) {
      formData.append('timeSlot', selectedTimeSlot);
    }

    if (businessType === 'restaurant_cafe') {
      formData.append('guestCount', String(guestCount));
      formData.append('depositAmount', String(depositAmount));
    }

    const response = await fetch(`${API_URL}/booking/create-booking`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ بدون Content-Type
      },
      body: formData,
    });

    const data = await response.json();
    console.log("BOOKING RESPONSE:", data);

    if (data.success) {
      if (selectedDate && selectedTimeSlot) {
        const slotKey = `${format(selectedDate, 'yyyy-MM-dd')}|${selectedTimeSlot}`;
        setLocalBookedSlots(prev => [...prev, slotKey]);
      }
      if (onAddBooking) onAddBooking(data.data ?? {});
      toast.success("Booking Confirmed! 🎉");
      setShowBookingDialog(false);
    } else {
      toast.error(data.message || "Something went wrong");
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to create booking");
  }
};

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setReviewImages([...reviewImages, ...newImages.slice(0, 3 - reviewImages.length)]);
    }
  };
const handleInstapayScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setInstapayFile(file);
  setInstapayScreenshot(URL.createObjectURL(file));
};



  const removeImage = (index: number) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index));
    setReviewFiles(reviewFiles.filter((_, i) => i !== index));
  };

const handleSubmitReview = async () => {
  // لازم يكون فيه Rating أو Comment
  if (reviewRating === 0 && !reviewText.trim()) {
    toast.error("Please provide either a rating or a review");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("businessId", serviceData.id);
    formData.append("businessName", serviceData.name);

    // ابعتي Rating لو موجود
    if (reviewRating > 0) {
      formData.append("rating", reviewRating.toString());
    }

    // ابعتي Comment لو موجود
    if (reviewText.trim()) {
      formData.append("comment", reviewText.trim());
    }

    reviewFiles.forEach((file) => {
      formData.append("images", file);
    });

    const res = await axios.post(
      `${API_URL}/reviews`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toast.success(
      res.data.message || "Review submitted successfully"
    );

    setReviewRating(0);
    setReviewText("");
    setReviewImages([]);
    setReviewFiles([]);
    setSelectedTab("reviews");

  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to submit review"
    );
  }
};

  const removeInstapayScreenshot = () => setInstapayScreenshot(null);


  const getCurrentStatus = () => {
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = serviceData?.hours?.find(h => h.day === currentDay);

    if (!todayHours) return 'Closed';

    const { open, close } = todayHours;

    // لو Open 24 Hours
    if (open?.toLowerCase().includes('open 24') || close?.toLowerCase().includes('open 24')) {
      return 'Open Now';
    }

    // لو Closed
    if (open?.toLowerCase().includes('closed') || close?.toLowerCase().includes('closed')) {
      return 'Closed';
    }

    // حسب الوقت الحالي
    try {
      const now = new Date();
      const parseTime = (timeStr: string) => {
        const [time, period] = timeStr.trim().split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period?.toUpperCase() === 'PM' && hours !== 12) hours += 12;
        if (period?.toUpperCase() === 'AM' && hours === 12) hours = 0;
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d;
      };

      const openTime = parseTime(open);
      const closeTime = parseTime(close);

      // لو الإغلاق بعد منتصف الليل
      if (closeTime < openTime) {
        return now >= openTime || now < closeTime ? 'Open Now' : 'Closed';
      }

      return now >= openTime && now < closeTime ? 'Open Now' : 'Closed';
    } catch {
      return 'Closed';
    }
  };

  const getServicePrice = (service: any) => {
    if (service.price_type === 'fixed') return `EGP ${service.price_after || service.price}`;
    if (service.price_type === 'range') return `EGP ${service.min_price_after || service.min_price} - ${service.max_price_after || service.max_price}`;
    return '';
  };

  const stepLabels: Record<BookingStep, string> = {
    service: 'Service',
    dateonly: 'Date',
    datetime: businessType === 'restaurant_cafe' ? 'Reservation' : 'Date & Time',
    payment: 'Payment',
    verify: 'Verify',
    confirm: 'Confirm'
  };

  const paymentMethods = [
    { id: 'instapay' as PaymentMethod, label: 'InstaPay', icon: Smartphone, description: 'Fast mobile payment', color: 'from-orange-500 to-pink-500' },
    { id: 'cash' as PaymentMethod, label: 'Cash', icon: Banknote, description: 'Pay in person at the venue', color: 'from-green-500 to-emerald-600' }
  ];

  // For restaurant, hide cash (deposit must be paid online)
  const availablePaymentMethods = businessType === 'restaurant_cafe'
    ? paymentMethods.filter(m => m.id !== 'cash')
    : paymentMethods;


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pb-20">
      {/* Hero Image Slider */}
      <div className="relative w-full h-[350px] lg:h-[450px] bg-gray-900">
        <img
          src={serviceData.images[currentImageIndex]}
          alt={serviceData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

        {serviceData.images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex((prev) => prev === 0 ? serviceData.images.length - 1 : prev - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentImageIndex((prev) => prev === serviceData.images.length - 1 ? 0 : prev + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto flex items-end justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-xl overflow-hidden">
                {serviceData.businessLogo ? (
                  <img
                    src={serviceData.businessLogo}
                    alt={`${serviceData.name} logo`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                    <span className="text-2xl lg:text-3xl">{serviceData.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl lg:text-5xl text-white mb-3 drop-shadow-lg">{serviceData.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className={`w-5 h-5 ${idx < Math.floor(serviceData.rating) ? 'fill-orange-400 text-orange-400' : 'fill-gray-400 text-gray-400'}`} />
                    ))}
                  </div>
                  <span className="text-white text-lg">{serviceData.rating} ({serviceData.reviews} reviews)</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-white">
                  <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white border-none">Claimed</Badge>
                </div>
                <div className="flex items-center gap-3 mt-2 text-white">
                  <Badge variant="outline" className={`border-2 ${getCurrentStatus() === 'Open Now' ? 'bg-green-500/20 border-green-400 text-green-100' : 'bg-red-500/20 border-red-400 text-red-100'}`}>
                    {getCurrentStatus()}
                  </Badge>
                </div>

              </div>
            </div>
            <button
              onClick={() => { setSelectedTab('photos'); setTimeout(() => document.getElementById('photos-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}
              className="hidden lg:flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-[18px] transition-all"
            >
              <Camera className="w-4 h-4" />
              See all {serviceData.images.length} photos
            </button>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-6 mb-6">
        <Button onClick={() => onNavigate('home')} variant="ghost" className="hover:bg-cyan-50 rounded-[18px]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <p className="text-gray-600 leading-relaxed flex-1 pr-4">{serviceData.description}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="outline" size="icon" onClick={handleSave} className={`rounded-[18px] ${isSaved ? 'bg-pink-50 border-pink-500' : ''}`}>
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare} className="rounded-[18px]">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tabs */}
            <div id="tabs-section">
              <div className="flex gap-4 mb-6 border-b">
                {['overview', 'reviews', 'photos'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab as any)}
                    className={`pb-3 px-2 capitalize transition-all ${selectedTab === tab ? 'border-b-2 border-cyan-500 text-cyan-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  <Card className="p-6 border-2 border-cyan-100 rounded-[18px]">
                    <h3 className="text-xl mb-4">Amenities & Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {serviceData.amenities.map((amenity, idx) => {
                        const Icon = amenityIcons[amenity] || CheckCircle2;
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-100 to-purple-100 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-cyan-600" />
                            </div>
                            <span className="capitalize">{amenity.replace('-', ' ')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Show services card for all business types */}
                  {serviceData.services && serviceData.services.length > 0 && (
                    <Card className="p-6 border-2 border-cyan-100 rounded-[18px]">
                      <h3 className="text-xl mb-4">Services</h3>
                      <div className="space-y-4">
                        {serviceData.services.map((service) => (
                          <div key={service.service_id} className="border rounded-xl p-4 hover:border-cyan-300 transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold">{service.name}</h4>
                                <p className="text-sm text-gray-500 mb-2">{service.service_category}</p>
                                <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                                <div className="flex flex-wrap gap-2 text-sm">
                                  <Badge variant="outline">⏱ {service.duration}</Badge>
                                </div>
                              </div>
                              <div className="text-right min-w-fit">
                                 {service.price_type === 'fixed' && (
                                  <>
                                    <p className="text-cyan-600 font-bold text-lg">EGP {service.price_after || service.price}</p>
                                    {service.offer && service.offer !== '0%' && service.price_after && (
                                      <p className="text-sm text-gray-400" style={{ textDecoration: 'line-through', textDecorationThickness: '1.5px' }}>EGP {service.price}</p>
                                    )}
                                  </>
                                )}
                                {service.price_type === 'range' && (
                                  <>
                                    <p className="text-cyan-600 font-bold text-lg">EGP {service.min_price_after || service.min_price} - {service.max_price_after || service.max_price}</p>
                                    {(service.offer && service.offer !== '0%' && (service.min_price_after || service.max_price_after)) && (
                                      <p className="text-sm text-gray-400" style={{ textDecoration: 'line-through', textDecorationThickness: '1.5px' }}>EGP {service.min_price} - {service.max_price}</p>
                                    )}
                                  </>
                                )}
                                {service.offer && service.offer.toString().trim() !== '0%' && (
                                  <Badge className="mt-2 bg-green-100 text-green-700 border-none">{service.offer} OFF</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}


                  {/* Restaurant: show deposit info */}
                  {businessType === 'restaurant_cafe' && (
                    <Card className="p-6 border-2 border-amber-100 bg-amber-50/50 rounded-[18px]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <UtensilsCrossed className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-amber-800 mb-1">Table Reservation Policy</h3>
                          <p className="text-sm text-amber-700 leading-relaxed">
                            A refundable deposit of <span className="font-bold">EGP {depositAmount}</span> is required to confirm your table reservation. This amount will be deducted from your final bill when you dine with us.
                          </p>
                          <ul className="text-sm text-amber-600 mt-2 space-y-1 list-disc list-inside">
                            <li>Deposit is fully refundable if cancelled 2+ hours in advance</li>
                            <li>Please arrive within 15 minutes of your reservation time</li>
                          </ul>
                        </div>
                      </div>
                    </Card>
                  )}


                   <Card className="p-6 border-2 border-cyan-100 rounded-[18px]">
                    <h3 className="text-xl mb-4">Hours of Operation</h3>
                    <div className="space-y-3">
                      {serviceData.hours.map((schedule, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-gray-700">{schedule.day}</span>
                          <span className={schedule.isOpen ? 'text-gray-900' : 'text-gray-400'}>{schedule.open} - {schedule.close}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Reviews Tab */}
              {selectedTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Trust Message */}
                  <Card className="p-4 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-[18px]">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">
                        <span className="font-bold">Authentic reviews you can trust.</span> Businesses cannot pay to alter or remove reviews on SPOT. Every review is from real customers sharing genuine experiences.
                      </p>
                    </div>
                  </Card>

                  {/* Write Review */}
                  <Card className="p-6 border-2 border-cyan-100 rounded-[18px]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl">Write a Review</h3>
                      <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
                        <Award className="w-4 h-4" />
                        <span>Earn 20 points</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 text-sm">Your Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setReviewRating(star)} className="transition-transform hover:scale-110">
                              <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block mb-2 text-sm">Your Review</label>
                        <Textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your experience..."
                          className="rounded-[18px] min-h-[120px]"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm">Add Photos (Optional)</label>
                        <div className="flex flex-wrap gap-3">
                          {reviewImages.map((img, idx) => (
                            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                              <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                              <button
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {reviewImages.length < 3 && (
                            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-colors">
                              <Upload className="w-6 h-6 text-gray-400" />
                              <span className="text-xs text-gray-500 mt-1">Upload</span>
                              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                            </label>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">You can upload up to 3 photos</p>
                      </div>
                      <Button
                        onClick={handleSubmitReview}
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]"
                      >
                        Submit Review
                      </Button>
                    </div>
                  </Card>

                  {/* ✅ Reviews List من الـ DB */}
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <Card key={review._id} className="p-6 border-2 border-gray-100 rounded-[18px]">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                            {review.userAvatar ? (
                              <img src={review.userAvatar} alt={review.userName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span>{review.userName?.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-bold">{review.userName}</p>
                                <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <Star key={idx} className={`w-4 h-4 ${idx < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>

                            {/* ✅ Review Images */}
                            {review.images?.length > 0 && (
                              <div className="flex gap-2 mt-3">
                                {review.images.map((img: string, idx: number) => (
                                  <img key={idx} src={img} alt={`Review ${idx + 1}`} className="w-20 h-20 rounded-lg object-cover" />
                                ))}
                              </div>
                            )}

                            {/* ✅ Owner Reply */}
                            {review.ownerReply?.text && (
                              <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-bold text-slate-700">🏢 Owner Response</span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(review.ownerReply.repliedAt).toLocaleDateString()}
                                  </span>
                                  {review.ownerReply.editedAt && (
                                    <span className="text-xs text-gray-400">(edited)</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{review.ownerReply.text}</p>
                              </div>
                            )}

                            {/* ✅ Owner Reaction */}
                            {review.ownerReaction && (
                              <div className="mt-2 text-sm text-gray-500">
                                {review.ownerReaction === "love" ? "❤️" : "👍"} Owner reacted
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}

                    {reviews.length === 0 && (
                      <p className="text-center text-gray-400 py-8">No reviews yet. Be the first to review!</p>
                    )}
                  </div>
                </div>
              )}

              {/* Photos Tab */}
              {selectedTab === 'photos' && (
                <div id="photos-section" className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {serviceData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square bg-gray-200 rounded-[18px] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => { setCurrentImageIndex(idx); setSelectedTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                      <img src={img} alt={`${serviceData.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border-2 border-cyan-100 rounded-[18px]">
              <div className="space-y-4 mb-6">
                <h3 className="font-bold">Contact Information</h3>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a href={`tel:${serviceData.phone}`} className="text-cyan-600 hover:underline">{serviceData.phone}</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-700">{serviceData.address}</p>
                    <p className="text-sm text-gray-500 mt-1">{serviceData.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-bold ${getCurrentStatus() === 'Open Now' ? 'text-green-600' : 'text-red-600'}`}>{getCurrentStatus()}</p>
                    <span className="text-sm">
                      {serviceData.hours.find(h => h.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }))
                        ? `${serviceData.hours.find(h => h.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }))?.open} - ${serviceData.hours.find(h => h.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }))?.close}`
                        : 'No hours available'}
                    </span>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <Button onClick={handleBooking} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-6">
                  <Calendar className="w-5 h-5 mr-2" />
                  {businessType === 'restaurant_cafe' ? 'Reserve a Table' : 'Book Now'}
                </Button>
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-purple-600">
                  <Award className="w-4 h-4" />
                  <span>
                    {businessType === 'restaurant_cafe'
                      ? `EGP ${depositAmount} deposit • Earn 50 points!`
                      : 'Earn 50 points + exclusive discounts!'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Map Card */}
            <Card className="p-0 border-2 border-cyan-100 rounded-[18px] overflow-hidden">
              <div className="w-full h-[300px] bg-gray-200 relative">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent((serviceData.address || serviceData.location) + ', Egypt')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <Button
                  variant="outline"
                  className="w-full rounded-[18px]"
                  onClick={() => window.open(
                    serviceData.maps && serviceData.maps.trim() !== ''
                      ? serviceData.maps
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((serviceData.address || serviceData.location) + ', Egypt')}`,
                    '_blank'
                  )}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-lg rounded-[18px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {businessType === 'restaurant_cafe' ? 'Reserve a Table' : 'Book Your Appointment'}
            </DialogTitle>
            <DialogDescription>
              {businessType === 'restaurant_cafe'
                ? `Reserve your table at ${serviceData.name}. A deposit of EGP ${depositAmount} is required.`
                : `Complete the steps below to book at ${serviceData.name}.`}
            </DialogDescription>
          </DialogHeader>

          {/* Step Progress Bar */}
          <div className="flex items-center gap-1 mb-6 mt-2">
            {steps.map((step, idx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${idx < currentStepIndex
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                    : idx === currentStepIndex
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white ring-4 ring-cyan-100'
                      : 'bg-gray-100 text-gray-400'
                    }`}>
                    {idx < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs mt-1 ${idx === currentStepIndex ? 'text-cyan-600 font-bold' : 'text-gray-400'}`}>
                    {stepLabels[step]}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mb-4 transition-all ${idx < currentStepIndex ? 'bg-gradient-to-r from-cyan-500 to-purple-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── STEP: Select Service (gym, coworking, car, other) ── */}
          {bookingStep === 'service' && (
            <div className="space-y-3">
              <h4 className="font-bold text-gray-800 mb-3">Choose a Service</h4>

              {serviceData.services && serviceData.services.length > 0 ? (
                serviceData.services.map((service) => (
                  <button
                    key={service.service_id}
                    onClick={() => setSelectedService(service)}
                    className={`w-full text-left border-2 rounded-[14px] p-4 transition-all ${selectedService?.service_id === service.service_id
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{service.service_category}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">⏱ {service.duration}</Badge>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-cyan-600 font-bold">{getServicePrice(service)}</p>
                        {service.offer && service.offer.toString().trim() !== '0%' && (
                          <Badge className="bg-green-100 text-green-700 border-none text-xs mt-1">{service.offer} OFF</Badge>
                        )}
                      </div>
                    </div>
                    {selectedService?.service_id === service.service_id && (
                      <div className="flex items-center gap-1 mt-2 text-cyan-600 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Selected
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No specific services listed.</p>
                  <p className="text-sm mt-1">We'll proceed with a general booking.</p>
                </div>
              )}

              <Button onClick={handleNextStep} className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* ── STEP: Date Only (Gym) ── */}
          {bookingStep === 'dateonly' && (
            <div className="space-y-5">
              {selectedService && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-[12px] p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Selected Service</p>
                    <p className="font-semibold text-gray-800">{selectedService.name}</p>
                  </div>
                  <p className="text-cyan-600 font-bold">{getServicePrice(selectedService)}</p>
                </div>
              )}

              <div>
                <label className="block mb-3 font-bold">Select Your Visit Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left border-2 border-gray-200 rounded-[18px] hover:border-cyan-500">
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : <span className="text-gray-400">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-[18px]" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => setSelectedDate(d)}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-400 mt-2">You can visit anytime during operating hours on the selected day.</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-[18px] py-5">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleNextStep} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP: Date & Time / Table Reservation ── */}
          {bookingStep === 'datetime' && (
            <div className="space-y-5">
              {/* Restaurant: deposit banner */}
              {businessType === 'restaurant_cafe' && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-[14px] p-4 flex items-start gap-3">
                  <UtensilsCrossed className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-amber-800 text-sm">Table Reservation Deposit</p>
                    <p className="text-amber-700 text-sm mt-0.5">
                      A deposit of <span className="font-bold">EGP {depositAmount}</span> is required to confirm your table. It will be deducted from your final bill.
                    </p>
                  </div>
                </div>
              )}

              {/* Non-restaurant: show selected service */}
              {selectedService && businessType !== 'restaurant_cafe' && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-[12px] p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Selected Service</p>
                    <p className="font-semibold text-gray-800">{selectedService.name}</p>
                  </div>
                  <p className="text-cyan-600 font-bold">{getServicePrice(selectedService)}</p>
                </div>
              )}

              {/* Restaurant: guest count */}
              {businessType === 'restaurant_cafe' && (
                <div>
                  <label className="block mb-3 font-bold">Number of Guests</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-cyan-500 hover:bg-cyan-50 transition-all"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-bold text-gray-800">{guestCount}</span>
                      <p className="text-sm text-gray-500 mt-0.5">{guestCount === 1 ? 'guest' : 'guests'}</p>
                    </div>
                    <button
                      onClick={() => setGuestCount(Math.min(20, guestCount + 1))}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-cyan-500 hover:bg-cyan-50 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-3 font-bold">
                  {businessType === 'restaurant_cafe' ? 'Reservation Date' : 'Select Date'}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left border-2 border-gray-200 rounded-[18px] hover:border-cyan-500">
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : <span className="text-gray-400">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-[18px]" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => { setSelectedDate(d); setSelectedTimeSlot(null); }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block mb-3 font-bold">
                  {businessType === 'restaurant_cafe' ? 'Reservation Time' : 'Available Time Slots'}
                </label>
                {(() => {
                  const allSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
                  const dateKey = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
                  const availableSlots = allSlots.filter((time: string) =>
                    !dateKey || !allBookedSlots.includes(`${dateKey}|${time}`)
                  );

                  if (!selectedDate) {
                    return <p className="text-sm text-gray-400 text-center py-4">👆 Please select a date first to see available slots</p>;
                  }
                  if (availableSlots.length === 0) {
                    return (
                      <div className="text-center py-6 bg-red-50 border-2 border-red-100 rounded-[14px]">
                        <p className="text-red-500 font-semibold">No available slots for this date</p>
                        <p className="text-sm text-gray-500 mt-1">Please choose a different date</p>
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((time: string) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTimeSlot(time)}
                          className={`px-3 py-3 rounded-[14px] border-2 transition-all text-sm ${selectedTimeSlot === time
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-700 font-bold'
                            : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                            }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="flex gap-3">
                {currentStepIndex > 0 && (
                  <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-[18px] py-5">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button onClick={handleNextStep} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP: Payment (gym, coworking, restaurant) ── */}
          {bookingStep === 'payment' && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 mb-1">Choose Payment Method</h4>

              {/* Restaurant: deposit amount reminder */}
              {businessType === 'restaurant_cafe' && (
                <div className="bg-amber-50 border border-amber-200 rounded-[14px] px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-amber-700 font-medium">Deposit Amount</span>
                  <span className="text-amber-800 font-bold text-lg">EGP {depositAmount}</span>
                </div>
              )}

              {availablePaymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full text-left border-2 rounded-[14px] p-4 transition-all flex items-center gap-4 ${selectedPayment === method.id
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${method.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{method.label}</p>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                    {selectedPayment === method.id && (
                      <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}

              {businessType === 'restaurant_cafe' && (
                <p className="text-xs text-gray-400 text-center">* Cash payment is not available for table reservations</p>
              )}

              <div className="flex gap-3 mt-2">
                <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-[18px] py-5">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleNextStep} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">
                  Review Booking <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP: Verify Payment ── */}
          {bookingStep === 'verify' && (
            <div className="space-y-4">

 
              {/* INSTAPAY */}
              {selectedPayment === 'instapay' && (
                <div className="space-y-4">
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-[14px] p-4 flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-orange-700 text-sm">Transfer to InstaPay Account</p>
                      <p className="text-orange-600 text-sm mt-0.5">Account : <span className="font-mono font-bold">shahd.el095827@instapay</span></p>
                      <p className="text-orange-600 text-sm">
                        Amount: <span className="font-bold">
                          {businessType === 'restaurant_cafe'
                            ? `EGP ${depositAmount} (Deposit)`
                            : selectedService ? getServicePrice(selectedService) : serviceData.price}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 font-bold text-sm">Upload Transfer Screenshot</label>
                    {instapayScreenshot ? (
                      <div className="relative w-full rounded-[14px] overflow-hidden border-2 border-cyan-300">
                        <img src={instapayScreenshot} alt="Transfer proof" className="w-full max-h-52 object-contain bg-gray-50" />
                        <button onClick={removeInstapayScreenshot} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full border-2 border-dashed border-gray-300 rounded-[14px] flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-colors py-8 gap-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500">Tap to upload screenshot</span>
                        <span className="text-xs text-gray-400">PNG, JPG supported</span>
                        <input type="file" accept="image/*" onChange={handleInstapayScreenshot} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-[18px] py-5">
                      <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button onClick={handleNextStep} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">
                      Verify & Continue <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* CASH (gym / coworking only) */}
              {selectedPayment === 'cash' && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                      <Banknote className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Pay at the Venue</h4>
                      <p className="text-gray-500 text-sm mt-1 max-w-xs">
                        Please prepare the exact amount when you arrive. Show your booking confirmation at the reception.
                      </p>
                    </div>
                    <div className="w-full bg-amber-50 border-2 border-amber-200 rounded-[14px] p-4 text-left space-y-2">
                      <p className="text-sm font-bold text-amber-700 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Important
                      </p>
                      <ul className="text-sm text-amber-600 space-y-1 list-disc list-inside">
                        <li>Amount due: <span className="font-bold">{selectedService ? getServicePrice(selectedService) : serviceData.price}</span></li>
                        <li>Arrive 5 minutes before your slot</li>
                        <li>Cancellation must be 2hrs in advance</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-[18px] py-5">
                      <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button onClick={handleNextStep} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">
                      Got it, Continue <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP: Confirm ── */}
          {bookingStep === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-cyan-50 p-4 rounded-[18px] border-2 border-purple-200">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Award className="w-5 h-5" />
                  <span className="font-bold">Booking Rewards</span>
                </div>
                <p className="text-sm text-gray-600">You'll earn 50 loyalty points after confirming!</p>
              </div>

              <div className="border-2 border-gray-100 rounded-[18px] divide-y divide-gray-100">
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-1">Business</p>
                  <p className="font-semibold text-gray-900">{serviceData.name}</p>
                </div>

                {/* Restaurant: guest count + deposit */}
                {businessType === 'restaurant_cafe' && (
                  <>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Table for</p>
                        <p className="font-semibold text-gray-900">{guestCount} {guestCount === 1 ? 'guest' : 'guests'}</p>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Deposit</p>
                        <p className="font-semibold text-gray-900">EGP {depositAmount}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Deducted from your final bill</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-none">Refundable</Badge>
                    </div>
                  </>
                )}

                {selectedService && businessType !== 'restaurant_cafe' && (
                  <div className="p-4 flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Service</p>
                      <p className="font-semibold text-gray-900">{selectedService.name}</p>
                      <p className="text-sm text-gray-500">{selectedService.duration}</p>
                    </div>
                    <p className="text-cyan-600 font-bold">{getServicePrice(selectedService)}</p>
                  </div>
                )}

                {selectedDate && selectedTimeSlot && (
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-1">
                      {businessType === 'restaurant_cafe' ? 'Reservation Date & Time' : 'Date & Time'}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {format(selectedDate, 'PPP')} at {selectedTimeSlot}
                    </p>
                  </div>
                )}

                {selectedDate && !selectedTimeSlot && businessType === 'gym' && (
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-1">Visit Date</p>
                    <p className="font-semibold text-gray-900">{format(selectedDate, 'PPP')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Anytime during operating hours</p>
                  </div>
                )}

                {selectedPayment && (
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {selectedPayment === 'instapay' ? 'InstaPay' : 'Cash'}
                    </p>
                   
                    {selectedPayment === 'instapay' && instapayRef && (
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">Ref: {instapayRef}</p>
                    )}
                    {selectedPayment === 'instapay' && instapayScreenshot && (
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Screenshot uploaded
                      </p>
                    )}
                    {selectedPayment === 'cash' && (
                      <p className="text-xs text-amber-600 mt-0.5">Pay at venue</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-[18px] py-5">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={createBooking} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {businessType === 'restaurant_cafe' ? 'Confirm Reservation' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};