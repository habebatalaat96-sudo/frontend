import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Mail, Phone, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { API_URL } from "../config/api";
interface ContactUsProps {
  onNavigate: (page: 'home' | 'login' | 'gyms' | 'car-services' | 'restaurants' | 'coworking-spaces' | 'explore' | 'contact-us' | 'businesses' | 'business-portal', section?: string, tab?: 'list' | 'claim' | 'login') => void;
}

export const ContactUs: React.FC<ContactUsProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{email?: string, phone?: string}>({});
const [loading, setLoading] = useState(false);
  const validateForm = () => {
    const newErrors: {email?: string, phone?: string} = {};
    
    // At least one contact method is required
    if (!formData.email && !formData.phone) {
      newErrors.email = 'Please provide either email or phone number';
      newErrors.phone = 'Please provide either email or phone number';
    }
    
    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/auth/support`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          subject: formData.name,
          message: formData.message,
          email: formData.email,
          phone: formData.phone,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to send ticket"
      );
    }

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);

  } catch (error: any) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question or want to add your business to SPOT? We'd love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Contact Form */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <h2 className="text-2xl mb-6 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
              Send us a Message
            </h2>
            
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-4 rounded-full mb-4">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl mb-2 text-gray-800">Thank You!</h3>
                <p className="text-gray-600">
                  We've received your message and will get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 bg-white/50 font-bold font-normal !border-gray-300"
                    placeholder="Your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 bg-white/50 ${errors.email ? '!border-red-500' : '!border-gray-300'}`}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`pl-10 bg-white/50 ${errors.phone ? '!border-red-500' : '!border-gray-300'}`}
                      placeholder="+1 (234) 567-890"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    * Please provide either email or phone number
                  </p>
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-1 min-h-32 bg-white/50 !border-gray-300"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                {/* Submit Button */}
               <Button
  type="submit"
  disabled={loading}
  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-3 rounded-[18px]"
>
  <Send className="w-4 h-4" />

  {loading ? "Sending..." : "Send Message"}
</Button>
              </form>
            )}
          </Card>

          {/* Info Cards */}
          <div className="space-y-6">
            {/* Contact Info Card */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-3 rounded-full">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl text-gray-800">Contact Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5 text-cyan-600" />
                  <a href="mailto:support@spot.com" className="hover:text-cyan-600 transition-colors">
                    support@spot.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5 text-purple-600" />
                  <a href="tel:+1234567890" className="hover:text-purple-600 transition-colors">
                    +1 (234) 567-890
                  </a>
                </div>
              </div>
            </Card>

            {/* For Users Card */}
            <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 backdrop-blur-sm border-white/20 shadow-xl">
              <h3 className="text-xl mb-3 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                Are you a User?
              </h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Join SPOT to access AI-powered recommendations for local services. Find the perfect gym, restaurant, car service, or co-working space near you!
              </p>
              <Button
                onClick={() => onNavigate('login')}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-2 rounded-[18px] transition-all duration-300"
              >
                Login / Sign Up
              </Button>
            </Card>

            {/* For Businesses Card */}
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-cyan-600/10 backdrop-blur-sm border-white/20 shadow-xl">
              <h3 className="text-xl mb-3 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Own a Business?
              </h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                List your gym, restaurant, car service, cafe, or co-working space on SPOT. Reach more customers and grow your business with our AI-powered platform!
              </p>
              <Button
                onClick={() => onNavigate('business-portal', undefined, 'list')}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 text-white py-2 rounded-[18px] transition-all duration-300"
              >
                List Your Business
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
