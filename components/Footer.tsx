import React from 'react';
import { Mail, Phone, Facebook, Instagram, Twitter, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';

interface FooterProps {
  onNavigate: (page: 'home' | 'login' | 'gyms' | 'car-services' | 'restaurants' | 'coworking-spaces' | 'explore' | 'contact-us' | 'businesses' | 'business-portal' | 'admin-login', section?: string, tab?: 'list' | 'claim' | 'login') => void;
  isLoggedIn?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, isLoggedIn = false }) => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className={`grid ${isLoggedIn ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-10`}>
          {/* Contact Us Section */}
          <div>
            <h3 className="text-xl mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Contact Us
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <Mail className="w-5 h-5 text-cyan-400" />
                <a href="mailto:support@spot.com" className="text-sm">
                  support@spot.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <Phone className="w-5 h-5 text-cyan-400" />
                <a href="tel:+1234567890" className="text-sm">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 rounded-full transition-all duration-300"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 rounded-full transition-all duration-300"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 rounded-full transition-all duration-300"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
              <Button
                onClick={() => onNavigate('contact-us')}
                className="mt-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 py-2 rounded-[18px] text-sm flex items-center gap-2 transition-all duration-300"
              >
                <MessageSquare className="w-4 h-4" />
                Message Us
              </Button>
            </div>
          </div>

          {/* For Users Section - Only show when logged out */}
          {!isLoggedIn && (
            <div>
              <h3 className="text-xl mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                For Users
              </h3>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                Join SPOT today and discover local services powered by AI! Get personalized recommendations for gyms, car services, restaurants, cafes, and co-working spaces.
              </p>
              <Button
                onClick={() => onNavigate('login')}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 py-2 rounded-[18px] text-sm transition-all duration-300"
              >
                Login Now
              </Button>
            </div>
          )}

          {/* For Businesses Section */}
          <div>
            <h3 className="text-xl mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              For Businesses
            </h3>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              List your business on SPOT and reach more customers! We help local gyms, car services, restaurants, cafes, and co-working spaces grow their presence.
            </p>
            <Button
              onClick={() => onNavigate('businesses')}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 py-2 rounded-[18px] text-sm transition-all duration-300"
            >
              Add Your Business
            </Button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 relative">
            <p className="text-gray-400 text-sm leading-tight py-0 my-0 text-center">
              © 2025 SPOT. All rights reserved. | Connecting you with local services through AI
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
