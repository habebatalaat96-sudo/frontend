import React from 'react';
import { Camera, Clock, DollarSign, MapPin, Phone, Mail, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';

export const ProfileManagementMockup: React.FC = () => {
  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-purple-500/30 shadow-2xl max-h-[500px] overflow-y-auto">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-xl text-white mb-1">Manage Business Profile</h3>
        <p className="text-gray-400 text-sm">Update your information in real-time</p>
      </div>

      {/* Profile Photo Section */}
      <div className="mb-5">
        <label className="text-white text-sm mb-2 block">Business Photo</label>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-xl border-2 border-dashed border-cyan-500/30 flex items-center justify-center group cursor-pointer hover:border-cyan-500/50 transition-all">
            <Camera className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <p className="text-gray-300 text-sm mb-1">Upload logo or photo</p>
            <p className="text-gray-500 text-xs">JPG, PNG (max. 5MB)</p>
          </div>
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        {/* Business Name */}
        <div>
          <label className="text-white text-sm mb-2 block">Business Name</label>
          <input 
            type="text"
            defaultValue="Elite Fitness Center"
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500/50 focus:outline-none transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-white text-sm mb-2 block">Category</label>
          <select className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500/50 focus:outline-none transition-colors">
            <option>Gyms & Fitness</option>
            <option>Car Services</option>
            <option>Restaurants & Cafes</option>
            <option>Co-working Spaces</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="text-white text-sm mb-2 block flex items-center gap-2">
            <Phone className="w-4 h-4 text-cyan-400" />
            Phone Number
          </label>
          <input 
            type="tel"
            defaultValue="+1 (555) 123-4567"
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500/50 focus:outline-none transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-white text-sm mb-2 block flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            Email Address
          </label>
          <input 
            type="email"
            defaultValue="info@elitefitness.com"
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500/50 focus:outline-none transition-colors"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="text-white text-sm mb-2 block flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Business Address
          </label>
          <input 
            type="text"
            defaultValue="123 Main Street, Downtown District"
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Hours & Pricing */}
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-white text-sm mb-2 block flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Operating Hours
          </label>
          <div className="bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
            Mon-Fri: 6 AM - 10 PM
          </div>
        </div>

        <div>
          <label className="text-white text-sm mb-2 block flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-purple-400" />
            Pricing
          </label>
          <input 
            type="text"
            defaultValue="$49 - $99/month"
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="mb-5">
        <label className="text-white text-sm mb-2 block flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          Photo Gallery
        </label>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className="aspect-square bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-lg border-2 border-dashed border-cyan-500/30 flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all group"
            >
              <Camera className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-5 py-2 rounded-lg text-sm transition-all duration-300">
          Save Changes
        </Button>
        <Button className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 text-sm transition-all duration-300">
          Preview
        </Button>
      </div>
    </div>
  );
};
