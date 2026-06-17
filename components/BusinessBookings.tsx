import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, MapPin, CheckCircle, XCircle, AlertTriangle, Send, Filter, Search, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { API_URL } from "../config/api";
interface Booking {
  _id: string;

  userId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };

  businessName: string;
  businessImage?: string;

  selectedService?: {
    name?: string;
  };

  bookingDate: string;
  timeSlot?: string;
  status:
  | "upcoming"
  | "completed"
  | "cancelled"
  | "no_show";
}

// const mockBookings: Booking[] = [
//   {
//     id: 'BK-001',
//     customerName: 'Sarah Ahmed',
//     customerEmail: 'sarah.ahmed@email.com',
//     customerPhone: '+20 100 123 4567',
//     service: 'Personal Training Session',
//     date: '2025-10-22',
//     time: '10:00 AM',
//     status: 'confirmed',
//     price: 'EGP 350',
//     notes: 'First time client, focus on cardio'
//   },
//   {
//     id: 'BK-002',
//     customerName: 'Mohamed Ali',
//     customerEmail: 'mohamed.ali@email.com',
//     customerPhone: '+20 101 234 5678',
//     service: 'Group Yoga Class',
//     date: '2025-10-23',
//     time: '6:00 PM',
//     status: 'confirmed',
//     price: 'EGP 150',
//   },
//   {
//     id: 'BK-003',
//     customerName: 'Nour Hassan',
//     customerEmail: 'nour.hassan@email.com',
//     customerPhone: '+20 102 345 6789',
//     service: 'Swimming Pool - Day Pass',
//     date: '2025-10-24',
//     time: '2:00 PM',
//     status: 'pending',
//     price: 'EGP 100',
//   },
//   {
//     id: 'BK-004',
//     customerName: 'Omar Khaled',
//     customerEmail: 'omar.khaled@email.com',
//     customerPhone: '+20 103 456 7890',
//     service: 'Membership Renewal',
//     date: '2025-10-25',
//     time: '9:00 AM',
//     status: 'completed',
//     price: 'EGP 1,200',
//   },
//   {
//     id: 'BK-005',
//     customerName: 'Layla Ibrahim',
//     customerEmail: 'layla.ibrahim@email.com',
//     customerPhone: '+20 104 567 8901',
//     service: 'Nutrition Consultation',
//     date: '2025-10-26',
//     time: '11:00 AM',
//     status: 'cancelled',
//     price: 'EGP 250',
//     notes: 'Customer requested cancellation'
//   }
// ];

export const BusinessBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]); const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  const getStatusColor =
    (status: string) => {
      switch (status) {
        case "completed":
          return "bg-green-500/20 text-green-400 border-green-500/30";

        case "cancelled":
          return "bg-red-500/20 text-red-400 border-red-500/30";

        case "no_show":
          return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";

        case "upcoming":
          return "bg-blue-500/20 text-blue-400 border-blue-500/30";

        default:
          return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      }
    };

  const getStatusIcon =
    (status: string) => {
      switch (status) {
        case "completed":
          return (
            <CheckCircle className="w-4 h-4" />
          );

        case "cancelled":
          return (
            <XCircle className="w-4 h-4" />
          );

        case "no_show":
          return (
            <AlertTriangle className="w-4 h-4" />
          );

        case "upcoming":
          return (
            <Clock className="w-4 h-4" />
          );

        default:
          return (
            <Clock className="w-4 h-4" />
          );
      }
    };

  const filteredBookings = bookings.filter(
    (booking) => {
      const matchesFilter =
        filterStatus === "all" ||
        booking.status === filterStatus;

      const matchesSearch =
        booking.businessName
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||

        booking.userId?.email
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||

        booking._id
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||

        booking.selectedService?.name
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      return (
        matchesFilter &&
        matchesSearch
      );
    }
  );
  const handleSendAlert = async () => {
    if (!selectedBooking || !alertMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSendingAlert(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`Alert sent to ${selectedBooking.userId?.firstName
        } successfully!`);
      setShowAlertModal(false);
      setAlertMessage('');
      setSelectedBooking(null);
    } catch (error) {
      toast.error('Failed to send alert. Please try again.');
    } finally {
      setIsSendingAlert(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      setBookings(bookings.map(b =>
        b._id === bookingId ? { ...b, status: newStatus } : b
      ));
      toast.success('Booking status updated!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const stats = {
    total: bookings.length,

    upcoming:
      bookings.filter(
        (b) =>
          b.status ===
          "upcoming"
      ).length,

    completed:
      bookings.filter(
        (b) =>
          b.status ===
          "completed"
      ).length,

    cancelled:
      bookings.filter(
        (b) =>
          b.status ===
          "cancelled"
      ).length,

    noShow:
      bookings.filter(
        (b) =>
          b.status ===
          "no_show"
      ).length,
  };

  const fetchBookings = async () => {
    try {
      const token =
        localStorage.getItem(
          "business_token"
        );
      console.log("TOKEN FROM STORAGE:", localStorage.getItem("business_token"));

      const res = await fetch(
        `${API_URL}/business/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.message ||
          "Failed to fetch bookings"
        );
        return;
      }

      setBookings(data.data || []);
    } catch (err) {
      toast.error(
        "Failed to load bookings"
      );
    }
  };
  useEffect(() => {
    fetchBookings();
  }, []);


  const handleBookingStatus =
    async (
      bookingId: string,
      status: string
    ) => {
      try {
        const token =
          localStorage.getItem(
            "business_token"
          );

        const res = await fetch(
          `${API_URL}/business/bookings/${bookingId}/status`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              status,
            }),
          }
        );

        const data =
          await res.json();

        if (!res.ok) {
          toast.error(
            data.message
          );
          return;
        }

        toast.success(
          "Booking updated"
        );

        fetchBookings();
      } catch {
        toast.error(
          "Failed to update booking"
        );
      }
    };





  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 rounded-2xl p-5 border border-cyan-500/30">
          <div className="text-3xl text-white mb-1">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Bookings</div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-5 border border-green-500/30">
          <div className="text-3xl text-white mb-1">{stats.upcoming}</div>
          <div className="text-sm text-gray-400">Upcoming</div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-5 border border-yellow-500/30">
          <div className="text-3xl text-white mb-1">{stats.noShow}</div>
          <div className="text-sm text-gray-400">Noshow</div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-5 border border-blue-500/30">
          <div className="text-3xl text-white mb-1">{stats.completed}</div>
          <div className="text-sm text-gray-400">Completed</div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-5 border border-red-500/30">
          <div className="text-3xl text-white mb-1">{stats.cancelled}</div>
          <div className="text-sm text-gray-400">Cancelled</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-cyan-500/50 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="confirmed">No-show</option>
              <option value="pending">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-gray-400 text-sm">Booking ID</th>
                <th className="text-left py-4 px-4 text-gray-400 text-sm">Customer</th>
                <th className="text-left py-4 px-4 text-gray-400 text-sm">Service</th>
                <th className="text-left py-4 px-4 text-gray-400 text-sm">Date & Time</th>
                <th className="text-left py-4 px-4 text-gray-400 text-sm">Status</th>
                <th className="text-left py-4 px-4 text-gray-400 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4 text-cyan-400">{booking._id}</td>
                    <td className="py-4 px-4">
                      <div className="text-white">{booking.userId?.firstName}</div>
                      <div className="text-xs text-gray-400">{booking.userId?.email}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-300">{booking.selectedService?.name}</td>
                    <td className="py-4 px-4">
                      <div className="text-white">
                        {new Date(
                          booking.bookingDate
                        ).toLocaleDateString()}
                      </div>

                      <div className="text-xs text-cyan-400">
                        {booking.timeSlot || "No Slot"}
                      </div>
                    </td>
                    {/* <td className="py-4 px-4 text-white">{booking.price}</td> */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">


                        {booking.status === 'upcoming' && (
                          <Button
                            onClick={() => handleBookingStatus(booking._id, 'completed')}
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-3 py-1 text-xs rounded-lg"
                          >
                            Complete
                          </Button>

                        )}
                        <div className="flex gap-2">

                          <Button
                            onClick={() =>
                              handleBookingStatus(
                                booking._id,
                                "cancelled"
                              )
                            }
                          >
                            Cancel
                          </Button>

                          <Button
                            onClick={() =>
                              handleBookingStatus(
                                booking._id,
                                "no_show"
                              )
                            }
                          >
                            No Show
                          </Button>

                          <Button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowAlertModal(true);
                            }}
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-3 py-1 text-xs rounded-lg"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Alert
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Modal */}
      {showAlertModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-cyan-500/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl text-white">Send Alert to Customer</h3>
              <button
                onClick={() => {
                  setShowAlertModal(false);
                  setAlertMessage('');
                  setSelectedBooking(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-white/10">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-white">{selectedBooking.userId?.firstName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300 text-sm">{selectedBooking.userId?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300 text-sm">{selectedBooking.userId?.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300 text-sm">{new Date(
                    selectedBooking.bookingDate
                  ).toLocaleString()}
                  </span>

                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="mb-6">
              <div className="text-white mb-2">Booking: {selectedBooking._id}</div>
              <div className="text-gray-400 text-sm">Service: {selectedBooking.selectedService?.name}</div>
            </div>

            {/* Quick Templates */}
            {/* <div className="mb-4">
              <label className="text-white text-sm mb-2 block">Quick Templates</label>
              <div className="grid md:grid-cols-2 gap-2">
                <button
                  onClick={() => setAlertMessage(`Hi ${selectedBooking.userId?.firstName}, your booking for ${selectedBooking.service} on ${selectedBooking.date} at ${selectedBooking.time} has been confirmed. Looking forward to seeing you!`)}
                  className="text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  Confirmation Message
                </button>
                <button
                  onClick={() => setAlertMessage(`Hi ${selectedBooking.userId?.firstName}, we need to reschedule your ${selectedBooking.service} appointment. Please contact us to arrange a new time.`)}
                  className="text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  Reschedule Request
                </button>
                <button
                  onClick={() => setAlertMessage(`Hi ${selectedBooking.userId?.firstName}, this is a reminder about your ${selectedBooking.service} appointment tomorrow at ${selectedBooking.time}. See you soon!`)}
                  className="text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  Reminder
                </button>
                <button
                  onClick={() => setAlertMessage(`Hi ${selectedBooking.userId?.firstName}, there's a special offer on ${selectedBooking.service}! Book your next session and get 20% off.`)}
                  className="text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  Special Offer
                </button>
              </div>
            </div> */}

            {/* Message Input */}
            <div className="mb-6">
              <label className="text-white text-sm mb-2 block">Message *</label>
              <Textarea
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be sent via email and SMS to the customer
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSendAlert}
                disabled={isSendingAlert || !alertMessage.trim()}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-3 rounded-[18px]"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSendingAlert ? 'Sending...' : 'Send Alert'}
              </Button>
              <Button
                onClick={() => {
                  setShowAlertModal(false);
                  setAlertMessage('');
                  setSelectedBooking(null);
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-[18px] border border-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
