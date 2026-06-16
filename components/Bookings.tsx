import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ArrowLeft, Calendar, Clock, MapPin, Phone, Edit2, X,
  CheckCircle2, AlertCircle, Loader2, ChevronLeft, ChevronRight,
  Smartphone, Banknote, Award, Upload, UtensilsCrossed
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  serviceName: string;
  serviceId: number;
  serviceImage: string;
  serviceCategory: string;
  date: string;
  time: string;
  status: 'upcoming' | 'cancelled' | 'completed';
  createdAt: string;
  location: string;
  phone: string;
  selectedService?: string;
  guestCount?: number;
  depositAmount?: number;
  paymentMethod?: string;
  instapayRef?: string;
  instapayScreenshot?: string;
}

interface APIBooking {
  _id: string;
  businessName: string;
  businessId: string;
  businessImage: string;
  businessCategory: string;
  bookingDate: string;
  timeSlot?: string;
  status: 'upcoming' | 'cancelled' | 'completed';
  createdAt: string;
  businessLocation: string;
  businessPhone: string;
  selectedService?: string;
  guestCount?: number;
  depositAmount?: number;
  paymentMethod?: string;
  instapayRef?: string;
  instapayScreenshot?: string;
}

interface BookingsProps {
  onNavigate: (page: string) => void;
  bookings?: Booking[];
  onUpdateBooking?: (bookingId: string, updates: Partial<Booking>) => void;
  onCancelBooking?: (bookingId: string) => void;
}

// ─── Booking-flow types (mirrors ServiceDetails) ──────────────────────────────

type PaymentMethod ='instapay' | 'cash' | null;
type BookingStep = 'service' | 'dateonly' | 'datetime' | 'payment' | 'verify' | 'confirm';
type BusinessType = 'gym' | 'restaurant_cafe' | 'coworking' | 'car_service' | 'other';

const GYM_SERVICES       = ['Monthly Membership', 'Single Session', 'Personal Training', 'Group Class', 'Swimming'];
const COWORKING_SERVICES = ['Hot Desk', 'Private Office', 'Meeting Room', 'Day Pass', 'Monthly Plan'];
const CAR_SERVICES_LIST  = ['Oil Change', 'Car Wash', 'Tire Change', 'Battery Check', 'Full Service'];
const ALL_TIME_SLOTS     = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];

const getBusinessType = (category: string): BusinessType => {
  const cat = category.toLowerCase().trim().replace(/[\s&_\-]+/g, '');
  if (cat.startsWith('gym')) return 'gym';
  if (cat.startsWith('restaurant') || cat.startsWith('cafe') || cat.includes('restaurant') || cat.includes('cafe')) return 'restaurant_cafe';
  if (cat.startsWith('coworking') || cat.includes('coworking')) return 'coworking';
  if (cat.startsWith('car') || cat.includes('carservice') || cat.includes('autoservice')) return 'car_service';
  return 'other';
};

// gym:        service → dateonly → payment → verify → confirm
// coworking:  service → datetime → payment → verify → confirm
// restaurant: datetime → payment → verify → confirm
// car/other:  service → datetime → confirm
const getSteps = (type: BusinessType): BookingStep[] => {
  if (type === 'gym')            return ['service', 'dateonly', 'payment', 'verify', 'confirm'];
  if (type === 'coworking')      return ['service', 'datetime', 'payment', 'verify', 'confirm'];
  if (type === 'restaurant_cafe') return ['datetime', 'payment', 'verify', 'confirm'];
  return ['service', 'datetime', 'confirm'];
};

// ─── Mapper ───────────────────────────────────────────────────────────────────

const mapAPIBooking = (b: APIBooking): Booking => ({
  id: b._id,
  serviceName: b.businessName,
  serviceId: 0,
  serviceImage: b.businessImage || '',
  serviceCategory: b.businessCategory,
  date: b.bookingDate,
  time: b.timeSlot || '',
  status: b.status,
  createdAt: b.createdAt,
  location: b.businessLocation || '',
  phone: b.businessPhone || '',
  selectedService:    b.selectedService,
  guestCount:         b.guestCount,
  depositAmount:      b.depositAmount,
  paymentMethod:      b.paymentMethod,
  instapayRef:        b.instapayRef,
  instapayScreenshot: b.instapayScreenshot,
});

// ─── Step-progress bar (reused from ServiceDetails) ───────────────────────────

const stepLabels: Record<BookingStep, string> = {
  service: 'Service', dateonly: 'Date', datetime: 'Date & Time',
  payment: 'Payment', verify: 'Verify', confirm: 'Confirm',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const Bookings: React.FC<BookingsProps> = ({ onNavigate }) => {
  const [bookings, setBookings]               = useState<Booking[]>([]);
  const [loading, setLoading]                 = useState(true);

  // Cancel dialog
  const [showCancelDialog, setShowCancelDialog]   = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

  // ── Edit dialog (full booking flow) ────────────────────────────────────────
  const [showEditDialog, setShowEditDialog]   = useState(false);
  const [editingBooking, setEditingBooking]   = useState<Booking | null>(null);

  // flow state
  const [bookingStep, setBookingStep]         = useState<BookingStep>('service');
  const [selectedDate, setSelectedDate]       = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [guestCount, setGuestCount]           = useState(2);
  const [depositAmount, setDepositAmount]     = useState(100);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);

  // verify
  const [instapayScreenshot, setInstapayScreenshot] = useState<string | null>(null);
  const [instapayRef, setInstapayRef]               = useState('');

  // ── Fetch bookings ──────────────────────────────────────────────────────────
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res  = await fetch('http://localhost:5000/booking/my-bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setBookings(data.data.map(mapAPIBooking));
      else toast.error(data.message || 'Failed to load bookings');
    } catch { toast.error('Could not load bookings. Please try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  // ── Cancel ──────────────────────────────────────────────────────────────────
  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    try {
      const token = localStorage.getItem('token');
      const res  = await fetch(`http://localhost:5000/booking/cancel-booking/${cancellingBooking.id}`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === cancellingBooking.id ? { ...b, status: 'cancelled' } : b));
        toast.success('Booking cancelled successfully');
      } else toast.error(data.message || 'Failed to cancel booking');
    } catch { toast.error('Something went wrong'); }
    finally { setShowCancelDialog(false); setCancellingBooking(null); }
  };

  // ── Open Edit → reset all flow state ───────────────────────────────────────
  const handleEditClick = (booking: Booking) => {
    const bt    = getBusinessType(booking.serviceCategory);
    const steps = getSteps(bt);

    setEditingBooking(booking);
    setBookingStep(steps[0]);

    // Pre-fill from existing booking
    setSelectedDate(booking.date ? new Date(booking.date) : undefined);
    setSelectedTimeSlot(booking.time || null);
    setSelectedService(booking.selectedService || '');
    setGuestCount(booking.guestCount ?? 2);
    setDepositAmount(booking.depositAmount ?? 100);
    setSelectedPayment((booking.paymentMethod as PaymentMethod) || null);
    setInstapayRef(booking.instapayRef || '');
    setInstapayScreenshot(booking.instapayScreenshot || null);
    setShowEditDialog(true);
  };

  // ── Step navigation ─────────────────────────────────────────────────────────
  const steps              = editingBooking ? getSteps(getBusinessType(editingBooking.serviceCategory)) : [];
  const currentStepIndex   = steps.indexOf(bookingStep);
  const businessType       = editingBooking ? getBusinessType(editingBooking.serviceCategory) : 'other';

  const servicesList =
    businessType === 'gym'       ? GYM_SERVICES :
    businessType === 'coworking' ? COWORKING_SERVICES :
    businessType === 'car_service' ? CAR_SERVICES_LIST : [];

  const paymentMethods = [
    { id: 'instapay' as PaymentMethod, label: 'InstaPay', icon: Smartphone, description: 'Fast mobile payment', color: 'from-orange-500 to-pink-500' },
    { id: 'cash' as PaymentMethod, label: 'Cash', icon: Banknote, description: 'Pay in person at the venue', color: 'from-green-500 to-emerald-600' },
  ];
  const availablePaymentMethods = businessType === 'restaurant_cafe'
    ? paymentMethods.filter(m => m.id !== 'cash')
    : paymentMethods;

  const handleNextStep = () => {
    const next = steps[currentStepIndex + 1];

    if (bookingStep === 'service') {
      if (!selectedService) { toast.error('Please select a service'); return; }
      setBookingStep(next);
    } else if (bookingStep === 'dateonly') {
      if (!selectedDate) { toast.error('Please select a date'); return; }
      setBookingStep(next);
    } else if (bookingStep === 'datetime') {
      if (!selectedDate) { toast.error('Please select a date'); return; }
      if (!selectedTimeSlot) { toast.error('Please select a time slot'); return; }
      setBookingStep(next);
    } else if (bookingStep === 'payment') {
      if (!selectedPayment) { toast.error('Please select a payment method'); return; }
      setBookingStep(next);
    } else if (bookingStep === 'verify') {
      if (selectedPayment === 'instapay' && !instapayScreenshot && !instapayRef.trim()) {
        toast.error('Please upload a screenshot or enter the reference number'); return;
      }
      setBookingStep(next);
    }
  };

  const handlePrevStep = () => {
    setBookingStep(steps[currentStepIndex - 1]);
  };

  // ── Save edit → API ─────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editingBooking) return;

    const paymentFields: Record<string, any> = { paymentMethod: selectedPayment };
    if (selectedPayment === 'instapay') {
      if (instapayRef.trim()) paymentFields.instapayRef = instapayRef.trim();
      if (instapayScreenshot) paymentFields.instapayScreenshot = instapayScreenshot;
    }

    let payload: Record<string, any> = { bookingDate: selectedDate?.toISOString() };

    if (businessType === 'gym') {
      payload = { ...payload, selectedService, ...paymentFields };
    } else if (businessType === 'restaurant_cafe') {
      payload = { ...payload, timeSlot: selectedTimeSlot, guestCount, depositAmount, ...paymentFields };
    } else if (businessType === 'car_service') {
      payload = { ...payload, timeSlot: selectedTimeSlot, selectedService };
    } else {
      // coworking / other
      payload = { ...payload, timeSlot: selectedTimeSlot, selectedService, ...paymentFields };
    }

    try {
      const token = localStorage.getItem('token');
      const res  = await fetch(`http://localhost:5000/booking/update-booking/${editingBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b =>
          b.id === editingBooking.id
            ? {
                ...b,
                date:            selectedDate?.toISOString() ?? b.date,
                time:            selectedTimeSlot ?? b.time,
                selectedService: selectedService || b.selectedService,
                guestCount:      businessType === 'restaurant_cafe' ? guestCount : b.guestCount,
                depositAmount:   businessType === 'restaurant_cafe' ? depositAmount : b.depositAmount,
                paymentMethod:   selectedPayment ?? b.paymentMethod,
                instapayRef:     paymentFields.instapayRef ?? b.instapayRef,
              }
            : b
        ));
        toast.success('Booking updated successfully! 🎉');
        setShowEditDialog(false);
        setEditingBooking(null);
      } else toast.error(data.message || 'Failed to update booking');
    } catch { toast.error('Something went wrong'); }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getStatusColor = (status: string) => {
    if (status === 'upcoming')  return 'bg-green-100 text-green-700 border-green-300';
    if (status === 'cancelled') return 'bg-red-100 text-red-700 border-red-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };
  const getStatusIcon = (status: string) => {
    if (status === 'upcoming' || status === 'completed') return <CheckCircle2 className="w-4 h-4" />;
    if (status === 'cancelled') return <X className="w-4 h-4" />;
    return null;
  };

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings     = bookings.filter(b => b.status === 'cancelled' || b.status === 'completed');

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
          <p className="text-lg">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Button onClick={() => onNavigate('account')} variant="ghost" className="mb-6 hover:bg-cyan-50 rounded-[18px]">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Account
        </Button>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">My Bookings</h1>
          <p className="text-lg text-gray-600">Manage your appointments and reservations</p>
        </div>

        {/* Empty */}
        {bookings.length === 0 && (
          <Card className="p-12 text-center border-2 border-cyan-100 rounded-[18px]">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl mb-2 text-gray-600">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Start exploring services and make your first booking!</p>
            <Button onClick={() => onNavigate('home')} className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px]">
              Explore Services
            </Button>
          </Card>
        )}

        {/* Upcoming */}
        {upcomingBookings.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl mb-6 text-gray-800">Upcoming Bookings ({upcomingBookings.length})</h2>
            <div className="space-y-4">
              {upcomingBookings.map(booking => (
                <Card key={booking.id} className="overflow-hidden bg-white border-2 border-cyan-100 hover:shadow-xl transition-all rounded-[18px]">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative md:w-64 h-48 md:h-auto overflow-hidden flex-shrink-0">
                      {booking.serviceImage
                        ? <img src={booking.serviceImage} alt={booking.serviceName} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-purple-100 flex items-center justify-center"><Calendar className="w-12 h-12 text-cyan-400" /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/20 to-transparent" />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl mb-1 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">{booking.serviceName}</h3>
                          <p className="text-sm text-gray-500">{booking.serviceCategory}</p>
                        </div>
                        <Badge className={`border-2 rounded-full flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}<span className="capitalize">{booking.status}</span>
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-cyan-600" />
                          <span>{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        {booking.time && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-cyan-600" /><span>{booking.time}</span>
                          </div>
                        )}
                        {booking.location && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-cyan-600" /><span>{booking.location}</span>
                          </div>
                        )}
                        {booking.phone && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4 text-cyan-600" /><span>{booking.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={() => handleEditClick(booking)} variant="outline" className="rounded-[18px] border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50">
                          <Edit2 className="w-4 h-4 mr-2" /> Edit Booking
                        </Button>
                        <Button onClick={() => { setCancellingBooking(booking); setShowCancelDialog(true); }} variant="outline" className="rounded-[18px] border-2 border-red-500 text-red-600 hover:bg-red-50">
                          <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="text-2xl mb-6 text-gray-800">Past Bookings ({pastBookings.length})</h2>
            <div className="space-y-4">
              {pastBookings.map(booking => (
                <Card key={booking.id} className="overflow-hidden bg-white border-2 border-gray-100 rounded-[18px] opacity-75">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative md:w-64 h-48 md:h-auto overflow-hidden flex-shrink-0">
                      {booking.serviceImage
                        ? <img src={booking.serviceImage} alt={booking.serviceName} className="w-full h-full object-cover grayscale" />
                        : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Calendar className="w-12 h-12 text-gray-300" /></div>}
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl mb-1 text-gray-800">{booking.serviceName}</h3>
                          <p className="text-sm text-gray-500">{booking.serviceCategory}</p>
                        </div>
                        <Badge className={`border-2 rounded-full flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}<span className="capitalize">{booking.status}</span>
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        {booking.time && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" /><span>{booking.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ===================== EDIT DIALOG (Full booking flow) ===================== */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-lg rounded-[18px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {businessType === 'restaurant_cafe' ? 'Edit Table Reservation' : 'Edit Booking'}
              </DialogTitle>
              <DialogDescription>
                {businessType === 'restaurant_cafe'
                  ? `Update your reservation at ${editingBooking?.serviceName}. A deposit of EGP ${depositAmount} is required.`
                  : `Update your booking details for ${editingBooking?.serviceName}.`}
              </DialogDescription>
            </DialogHeader>

            {/* Step Progress Bar */}
            {editingBooking && (
              <>
                <div className="flex items-center gap-1 mb-6 mt-2">
                  {steps.map((step, idx) => (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          idx < currentStepIndex
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

                {/* ── STEP: Service ── */}
                {bookingStep === 'service' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-800 mb-3">Choose a Service</h4>
                    {servicesList.map(svc => (
                      <button
                        key={svc}
                        onClick={() => setSelectedService(svc)}
                        className={`w-full text-left border-2 rounded-[14px] p-4 transition-all ${
                          selectedService === svc
                            ? 'border-cyan-500 bg-cyan-50'
                            : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900">{svc}</p>
                          {selectedService === svc && <CheckCircle2 className="w-5 h-5 text-cyan-500" />}
                        </div>
                      </button>
                    ))}
                    <Button onClick={handleNextStep} className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">
                      Continue <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* ── STEP: Date Only (Gym) ── */}
                {bookingStep === 'dateonly' && (
                  <div className="space-y-5">
                    {selectedService && (
                      <div className="bg-cyan-50 border border-cyan-200 rounded-[12px] p-3">
                        <p className="text-sm text-gray-500">Selected Service</p>
                        <p className="font-semibold text-gray-800">{selectedService}</p>
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
                          <CalendarComponent mode="single" selected={selectedDate} onSelect={setSelectedDate}
                            disabled={date => date < new Date(new Date().setHours(0,0,0,0))} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-gray-400 mt-2">You can visit anytime during operating hours on the selected day.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-[18px] py-5"><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
                      <Button onClick={handleNextStep} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">Continue <ChevronRight className="w-4 h-4 ml-2" /></Button>
                    </div>
                  </div>
                )}

                {/* ── STEP: Date & Time ── */}
                {bookingStep === 'datetime' && (
                  <div className="space-y-5">
                    {businessType === 'restaurant_cafe' && (
                      <div className="bg-amber-50 border-2 border-amber-200 rounded-[14px] p-4 flex items-start gap-3">
                        <UtensilsCrossed className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-amber-800 text-sm">Table Reservation Deposit</p>
                          <p className="text-amber-700 text-sm mt-0.5">
                            A deposit of <span className="font-bold">EGP {depositAmount}</span> is required to confirm your table.
                          </p>
                        </div>
                      </div>
                    )}

                    {businessType === 'restaurant_cafe' && (
                      <div>
                        <label className="block mb-3 font-bold">Number of Guests</label>
                        <div className="flex items-center gap-4">
                          <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-cyan-500 hover:bg-cyan-50 transition-all">−</button>
                          <div className="flex-1 text-center">
                            <span className="text-3xl font-bold text-gray-800">{guestCount}</span>
                            <p className="text-sm text-gray-500 mt-0.5">{guestCount === 1 ? 'guest' : 'guests'}</p>
                          </div>
                          <button onClick={() => setGuestCount(Math.min(20, guestCount + 1))} className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-cyan-500 hover:bg-cyan-50 transition-all">+</button>
                        </div>
                      </div>
                    )}

                    {selectedService && businessType !== 'restaurant_cafe' && (
                      <div className="bg-cyan-50 border border-cyan-200 rounded-[12px] p-3">
                        <p className="text-sm text-gray-500">Selected Service</p>
                        <p className="font-semibold text-gray-800">{selectedService}</p>
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
                          <CalendarComponent mode="single" selected={selectedDate}
                            onSelect={d => { setSelectedDate(d); setSelectedTimeSlot(null); }}
                            disabled={date => date < new Date(new Date().setHours(0,0,0,0))} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="block mb-3 font-bold">
                        {businessType === 'restaurant_cafe' ? 'Reservation Time' : 'Available Time Slots'}
                      </label>
                      {!selectedDate
                        ? <p className="text-sm text-gray-400 text-center py-4">👆 Please select a date first</p>
                        : (
                          <div className="grid grid-cols-3 gap-2">
                            {ALL_TIME_SLOTS.map(time => (
                              <button key={time} onClick={() => setSelectedTimeSlot(time)}
                                className={`px-3 py-3 rounded-[14px] border-2 transition-all text-sm ${
                                  selectedTimeSlot === time
                                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700 font-bold'
                                    : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                                }`}>
                                {time}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                      {currentStepIndex > 0 && (
                        <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-[18px] py-5"><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
                      )}
                      <Button onClick={handleNextStep} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">Continue <ChevronRight className="w-4 h-4 ml-2" /></Button>
                    </div>
                  </div>
                )}

                {/* ── STEP: Payment ── */}
                {bookingStep === 'payment' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-800 mb-1">Choose Payment Method</h4>
                    {businessType === 'restaurant_cafe' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-[14px] px-4 py-3 flex items-center justify-between">
                        <span className="text-sm text-amber-700 font-medium">Deposit Amount</span>
                        <span className="text-amber-800 font-bold text-lg">EGP {depositAmount}</span>
                      </div>
                    )}
                    {availablePaymentMethods.map(method => {
                      const Icon = method.icon;
                      return (
                        <button key={method.id} onClick={() => setSelectedPayment(method.id)}
                          className={`w-full text-left border-2 rounded-[14px] p-4 transition-all flex items-center gap-4 ${
                            selectedPayment === method.id ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                          }`}>
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${method.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{method.label}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                          {selectedPayment === method.id && <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0" />}
                        </button>
                      );
                    })}
                    {businessType === 'restaurant_cafe' && (
                      <p className="text-xs text-gray-400 text-center">* Cash payment is not available for table reservations</p>
                    )}
                    <div className="flex gap-3 mt-2">
                      <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-[18px] py-5"><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
                      <Button onClick={handleNextStep} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">Review Booking <ChevronRight className="w-4 h-4 ml-2" /></Button>
                    </div>
                  </div>
                )}

                {/* ── STEP: Verify ── */}
                {bookingStep === 'verify' && (
                  <div className="space-y-4">

                    {/* INSTAPAY */}
                    {selectedPayment === 'instapay' && (
                      <div className="space-y-4">
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-[14px] p-4 flex items-start gap-3">
                          <Smartphone className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-orange-700 text-sm">Transfer to InstaPay Account</p>
                            <p className="text-orange-600 text-sm mt-0.5">Phone: <span className="font-mono font-bold">01X-XXXX-XXXX</span></p>
                          </div>
                        </div>
                        <div>
                          <label className="block mb-2 font-bold text-sm">Upload Transfer Screenshot</label>
                          {instapayScreenshot ? (
                            <div className="relative w-full rounded-[14px] overflow-hidden border-2 border-cyan-300">
                              <img src={instapayScreenshot} alt="Transfer proof" className="w-full max-h-52 object-contain bg-gray-50" />
                              <button onClick={() => setInstapayScreenshot(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="w-full border-2 border-dashed border-gray-300 rounded-[14px] flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-colors py-8 gap-2">
                              <Upload className="w-8 h-8 text-gray-400" />
                              <span className="text-sm text-gray-500">Tap to upload screenshot</span>
                              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setInstapayScreenshot(URL.createObjectURL(f)); }} className="hidden" />
                            </label>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">or</span><div className="flex-1 h-px bg-gray-200" />
                        </div>
                        <div>
                          <label className="block mb-2 font-bold text-sm">Reference / Transaction Number</label>
                          <input type="text" value={instapayRef} onChange={e => setInstapayRef(e.target.value)}
                            placeholder="e.g. 12345678"
                            className="w-full border-2 border-gray-200 rounded-[14px] px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 font-mono" />
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-[18px] py-5"><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
                          <Button onClick={handleNextStep} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">Verify & Continue <ChevronRight className="w-4 h-4 ml-2" /></Button>
                        </div>
                      </div>
                    )}

                    {/* CASH */}
                    {selectedPayment === 'cash' && (
                      <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                            <Banknote className="w-10 h-10 text-white" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">Pay at the Venue</h4>
                            <p className="text-gray-500 text-sm mt-1 max-w-xs">Please prepare the exact amount when you arrive. Show your booking confirmation at the reception.</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-[18px] py-5"><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
                          <Button onClick={handleNextStep} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">Got it, Continue <ChevronRight className="w-4 h-4 ml-2" /></Button>
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
                        <Award className="w-5 h-5" /><span className="font-bold">Booking Summary</span>
                      </div>
                      <p className="text-sm text-gray-600">Please review the updated details before saving.</p>
                    </div>

                    <div className="border-2 border-gray-100 rounded-[18px] divide-y divide-gray-100">
                      <div className="p-4">
                        <p className="text-sm text-gray-500 mb-1">Business</p>
                        <p className="font-semibold text-gray-900">{editingBooking?.serviceName}</p>
                      </div>

                      {selectedService && businessType !== 'restaurant_cafe' && (
                        <div className="p-4">
                          <p className="text-sm text-gray-500 mb-1">Service</p>
                          <p className="font-semibold text-gray-900">{selectedService}</p>
                        </div>
                      )}

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
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-none">Refundable</Badge>
                          </div>
                        </>
                      )}

                      {selectedDate && (
                        <div className="p-4">
                          <p className="text-sm text-gray-500 mb-1">{businessType === 'restaurant_cafe' ? 'Reservation Date & Time' : 'Date'}</p>
                          <p className="font-semibold text-gray-900">
                            {format(selectedDate, 'PPP')}
                            {selectedTimeSlot && ` at ${selectedTimeSlot}`}
                          </p>
                          {!selectedTimeSlot && businessType === 'gym' && (
                            <p className="text-xs text-gray-400 mt-0.5">Anytime during operating hours</p>
                          )}
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
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handlePrevStep} variant="outline" className="flex-1 rounded-[18px] py-5">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button onClick={handleSaveEdit} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-[18px] py-5">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {businessType === 'restaurant_cafe' ? 'Save Reservation' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ===================== CANCEL DIALOG ===================== */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="sm:max-w-md rounded-[18px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" /> Cancel Booking?
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your booking at{' '}
                <span className="font-bold">{cancellingBooking?.serviceName}</span>?
                <br /><br />
                <span className="text-sm text-gray-600">
                  Scheduled for:{' '}
                  {cancellingBooking && new Date(cancellingBooking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}{' '}
                  {cancellingBooking?.time && `at ${cancellingBooking.time}`}
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleConfirmCancel} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-[18px]">
                Yes, Cancel Booking
              </Button>
              <Button onClick={() => { setShowCancelDialog(false); setCancellingBooking(null); }} variant="outline" className="flex-1 rounded-[18px] border-2">
                Keep Booking
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};