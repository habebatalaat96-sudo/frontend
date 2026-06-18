import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
// import spotLogo from '../assets/87d319d70a74f2182b104a15a264753a0cfb9143.png';

// ChevronDown SVG component
const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

interface HeaderProps {
  onNavigate: (page: 'home' | 'login' | 'gyms' | 'car-services' | 'restaurants' | 'coworking-spaces' | 'explore' | 'contact-us' | 'businesses' | 'business-portal' | 'account', section?: string, tab?: 'list' | 'claim' | 'login') => void;
  isLoggedIn?: boolean;
  userName?: string;
  userAvatar?: string;
  onScrollToAbout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, isLoggedIn = false, userName = '', userAvatar, onScrollToAbout }) => {
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navItems = isLoggedIn ? ['Home', 'SPOT 🤖'] : ['Home', 'About Us'];
  const serviceCategories = ['Gyms', 'Co-working Spaces', 'Restaurants/Cafes', 'Car Services'];

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsServicesOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 150); // 150ms delay before closing
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest('.mobile-menu-container')) {
        closeMobileMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex-shrink-0 transform hover:scale-110 transition-transform duration-300 drop-shadow-lg"
          >
            <img 
              src="../assets/87d319d70a74f2182b104a15a264753a0cfb9143.png"
              alt="SPOT Logo" 
              className="h-12 w-auto max-w-none"
              style={{ minWidth: '120px' }}
            />
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (item === 'SPOT 🤖') {
                    // Navigate to chatbot page when logged in
                    onNavigate('chatbot' as any);
                  } else if (item === 'About Us') {
                    if (onScrollToAbout) {
                      onScrollToAbout();
                    } else {
                      onNavigate('home');
                      setTimeout(() => {
                        document.getElementById('about-us')?.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }, 100);
                    }
                  } else if (item === 'Home') {
                    onNavigate('home');
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className="relative text-[rgb(255,255,255)] hover:text-white transition-all duration-300 py-2 px-6 rounded-full hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 hover:shadow-lg transform hover:scale-105"
              >
                {item}
              </button>
            ))}
            
            {/* Services Dropdown */}
            <div 
              className="relative" 
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="relative text-[rgb(255,255,255)] hover:text-white transition-all duration-300 py-2 px-6 rounded-full hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 hover:shadow-lg transform hover:scale-105 flex items-center gap-1"
              >
                Services
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {/* Dropdown Menu */}
              {isServicesOpen && (
                <div 
                  className="absolute top-full mt-1 left-0 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 min-w-[200px] py-2 z-50"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {serviceCategories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsServicesOpen(false);
                        if (category === 'Gyms') {
                          onNavigate('gyms');
                        } else if (category === 'Car Services') {
                          onNavigate('car-services');
                        } else if (category === 'Restaurants/Cafes') {
                          onNavigate('restaurants');
                        } else if (category === 'Co-working Spaces') {
                          onNavigate('coworking-spaces');
                        }
                        // Handle other category selections here
                      }}
                      className="w-full text-left px-4 py-3 text-white/90 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 hover:text-white transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Businesses */}
            <button 
              onClick={() => onNavigate('businesses')}
              className="relative text-[rgb(255,255,255)] hover:text-white transition-all duration-300 py-2 px-6 rounded-full hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 hover:shadow-lg transform hover:scale-105"
            >
              Businesses
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => onNavigate('account')}
                className="flex items-center gap-3 py-2 px-4 rounded-full hover:bg-white/10 transition-all duration-300 transform hover:scale-105 border border-white/20"
              >
                <span className="text-white">{userName.split(' ')[0]}</span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm">{userName?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </div>
              </button>
            ) : (
              <button 
                onClick={() => onNavigate('login')}
                className="text-cyan-500 hover:text-white transition-all duration-300 py-2 px-6 border border-cyan-500 hover:border-transparent hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 rounded-full hover:shadow-lg transform hover:scale-105"
              >
                Login
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden mobile-menu-container">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleMobileMenu}
              className="text-white hover:text-white hover:bg-white/10"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mobile-menu-container">
          <div className="bg-black/20 backdrop-blur-md border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-2">
              {/* Navigation Items */}
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (item === 'SPOT 🤖') {
                      closeMobileMenu();
                      // Navigate to chatbot page when logged in
                      onNavigate('chatbot' as any);
                    } else if (item === 'About Us') {
                      closeMobileMenu();
                      if (onScrollToAbout) {
                        onScrollToAbout();
                      } else {
                        onNavigate('home');
                        setTimeout(() => {
                          document.getElementById('about-us')?.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                          });
                        }, 100);
                      }
                    } else if (item === 'Home') {
                      onNavigate('home');
                      closeMobileMenu();
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                  className="w-full text-left text-white/90 hover:text-white py-3 px-4 rounded-full hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 transition-all duration-200"
                >
                  {item}
                </button>
              ))}
              
              {/* Services Section */}
              <div className="border-t border-white/10 pt-2">
                <div className="text-white/70 text-sm font-medium px-4 py-2">Services</div>
                {serviceCategories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (category === 'Gyms') {
                        onNavigate('gyms');
                      } else if (category === 'Car Services') {
                        onNavigate('car-services');
                      } else if (category === 'Restaurants/Cafes') {
                        onNavigate('restaurants');
                      } else if (category === 'Co-working Spaces') {
                        onNavigate('coworking-spaces');
                      }
                      // Handle other category selections here
                      closeMobileMenu();
                    }}
                    className="w-full text-left text-white/90 hover:text-white py-3 px-4 ml-4 rounded-full hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 transition-all duration-200"
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Businesses */}
              <button 
                onClick={() => {
                  onNavigate('businesses');
                  closeMobileMenu();
                }}
                className="w-full text-left text-white/90 hover:text-white py-3 px-4 rounded-full hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 transition-all duration-200"
              >
                Businesses
              </button>

              {/* Login/Profile Button */}
              <div className="pt-2">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      onNavigate('account');
                      closeMobileMenu();
                    }}
                    className="w-full flex items-center gap-3 py-3 px-4 rounded-full hover:bg-white/10 transition-all duration-200 border border-white/20"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                      {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-sm">{userName?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <span className="text-white">{userName.split(' ')[0]}</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      onNavigate('login');
                      closeMobileMenu();
                    }}
                    className="w-full text-cyan-400 hover:text-white py-3 px-4 border border-cyan-400 hover:border-transparent hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 rounded-full transition-all duration-200"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};