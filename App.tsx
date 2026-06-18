// ✅ صلح الـ import
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutUs } from './components/AboutUs';
import { Login } from './components/Login';
import { GymsLoggedOut } from './components/GymsLoggedOut';
import { GymsLoggedIn } from './components/GymsLoggedIn';
import { CarServicesLoggedOut } from './components/CarServicesLoggedOut';
import { CarServicesLoggedIn } from './components/CarServicesLoggedIn';
import { RestaurantsLoggedOut } from './components/RestaurantsLoggedOut';
import { RestaurantsLoggedIn } from './components/RestaurantsLoggedIn';
import { CoWorkingSpacesLoggedOut } from './components/CoWorkingSpacesLoggedOut';
import { CoWorkingSpacesLoggedIn } from './components/CoWorkingSpacesLoggedIn';
import { Explore } from './components/Explore';
import { ContactUs } from './components/ContactUs';
import { Businesses } from './components/Businesses';
import { BusinessOwnerPortal } from './components/BusinessOwnerPortal';
import { UserPreferences, UserPreferences as UserPreferencesType } from './components/UserPreferences';
import { LoggedInHome } from './components/LoggedInHome';
import { Account } from './components/Account';
import { ProfileSettings } from './components/ProfileSettings';
import { SavedPlaces } from './components/SavedPlaces';
import { NotificationSettings } from './components/NotificationSettings';
import { Chatbot } from './components/Chatbot';
import { FloatingChatButton } from './components/FloatingChatButton';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/sonner';
import { ServiceDetails } from './components/ServiceDetails';
import { Bookings } from './components/Bookings';
import { AdminDashboard } from './components/AdminDashboard';
import { pdfjs } from "react-pdf";
import { BusinessDashboard } from './components/BusinessDashboard';
import { API_URL } from "./config/api.ts";

export default function App() {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  
  const [currentPage, setCurrentPage] = useState<
    'home' |
    'login' |
    'gyms' |
    'car-services' |
    'restaurants' |
    'coworking-spaces' |
    'explore' |
    'contact-us' |
    'businesses' |
    'business-portal' |
    'preferences' |
    'account' |
    'chatbot' |
    'profile-settings' |
    'saved-places' |

    'notification-settings' |
    'service-details' |
    'bookings' |
    'admin-login' |
    'admin-dashboard' |
    'business-dashboard'
  >('home');
  const [scrollToSection, setScrollToSection] = useState<string | undefined>(undefined);
  const [portalTab, setPortalTab] = useState<'list' | 'claim' | 'login'>('list');
  const [selectedService, setSelectedService] = useState<any>(null);
const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{
  name: string;
  email: string;

  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;

  loyaltyPoints: number;
  walletBalance: number;
  tier: string;

  createdAt?: string;
}>({
  name: '',
  email: '',

  loyaltyPoints: 0,
  walletBalance: 0,
  tier: "Bronze",
});

  const [userPreferences, setUserPreferences] = useState<UserPreferencesType | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showChatLabel, setShowChatLabel] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch(`${API_URL}/check-maintenance`);
        if (res.status === 503) {
          setIsUnderMaintenance(true);
        } else {
          setIsUnderMaintenance(false);
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    checkMaintenance();
    const interval = setInterval(checkMaintenance, 5000); // ✅ كل 5 ثواني
    return () => clearInterval(interval);
  }, []);

  // Restore session from localStorage on app load
  
  
  React.useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserData(user);
      setIsLoggedIn(true);
      setHasCompletedOnboarding(true);
      // Set default preferences for returning user - matches available deals
      setUserPreferences({
        amenities: ['wifi', 'parking', 'kids-friendly'],
        budgetRange: [100, 1500],
        location: 'Cairo',
        interests: ['Fitness & Gyms', 'Coffee & Cafes', 'Car Detailing', 'Casual Dining', 'Co-working Spaces']
      });
      // Load saved places
      const userSavedPlaces = localStorage.getItem(`savedPlaces_${user.email}`);
      if (userSavedPlaces) {
        setSavedPlaces(JSON.parse(userSavedPlaces));
      }
      // Load bookings
      const userBookings = localStorage.getItem(`bookings_${user.email}`);
      if (userBookings) {
        setBookings(JSON.parse(userBookings));
      }
     }
  }, []);
useEffect(() => {
  if (localStorage.getItem("adminToken")) {
    setIsAdminLoggedIn(true);
  }
}, [currentPage]);

  const handleSavePlace = (place: any) => {
    const updatedSavedPlaces = [...savedPlaces, place];
    setSavedPlaces(updatedSavedPlaces);
    // Save to localStorage
    localStorage.setItem(`savedPlaces_${userData.email}`, JSON.stringify(updatedSavedPlaces));
  };

  const handleAddBooking = (booking: any) => {

  setBookings(prev => [...prev, booking]);

  setUserData(prev => {

    const newPoints = prev.loyaltyPoints + 100;

    return {
      ...prev,

      loyaltyPoints: newPoints,

      walletBalance:
        prev.walletBalance + 20,

      tier:
        newPoints >= 3000
          ? "Platinum"
          : newPoints >= 1500
          ? "Gold"
          : newPoints >= 500
          ? "Silver"
          : "Bronze"
    };
  });
};
    // Save to localStorage
    // localStorage.setItem(`bookings_${userData.email}`, JSON.stringify(updatedBookings));
  

 const handleUpdateBooking = (
  bookingId: string,
  updates: any
) => {

  setBookings(prev =>
    prev.map(booking =>
      booking.id === bookingId
        ? { ...booking, ...updates }
        : booking
    )
  );
};

const handleRefreshSelectedService = () => {
  const business = JSON.parse(localStorage.getItem('business') || '{}');
  if (!business._id) return;

  const updatedServiceData = {
    ...selectedService,
    businessLogo: business.businessLogo || selectedService?.businessLogo,
    images: business.photo_url || selectedService?.images || [],
  };

  setSelectedService(updatedServiceData);
};


  const handleCancelBooking = (bookingId: string) => {

  setBookings(prev =>
    prev.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: "cancelled" }
        : booking
    )
  );
};

  // Track scroll position to show chat button after AI assistant section
  React.useEffect(() => {
    if (!isLoggedIn || currentPage !== 'home') {
      setShowChatLabel(false);
      return;
    }

    const handleScroll = () => {
      const aiChatbotSection = document.getElementById('ai-chatbot');
      if (aiChatbotSection) {
        const rect = aiChatbotSection.getBoundingClientRect();
        // Show button when user has scrolled past the AI assistant section
        setShowChatLabel(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoggedIn, currentPage]);

  const handleNavigate = (page: 'home' | 'login' | 'gyms' | 'car-services' | 'restaurants' | 'coworking-spaces' | 'explore' | 'contact-us' | 'businesses' | 'business-portal' | 'preferences' | 'account' | 'chatbot' | 'profile-settings' | 'saved-places' | 'notification-settings' | 'service-details' | 'bookings' | 'admin-login' | 'admin-dashboard', section?: string, tab?: 'list' | 'claim' | 'login', serviceData?: any) => {
    setCurrentPage(page);
    setScrollToSection(section);
    if (tab) {
      setPortalTab(tab);
    }
    if (serviceData) {
      setSelectedService(serviceData);
    }
    // Set isEditingPreferences to true when navigating to preferences from account
    if (page === 'preferences' && isLoggedIn && hasCompletedOnboarding) {
      setIsEditingPreferences(true);
    } else if (page !== 'preferences') {
      setIsEditingPreferences(false);
    }
    window.scrollTo(0, 0);
  };
const handleLoginSuccess = (data, isNewUser = false) => {

  let finalUser = {
    ...data,
    avatar: data.avatar || "",
  };

  if (!isNewUser) {
    const storedUser = localStorage.getItem(`user_${data.email}`);
    console.log("LOGIN EMAIL:", data.email);
    console.log("STORED USER:", storedUser);
    finalUser = {
      ...data,
      avatar: data.avatar || "",
    };
  }

  localStorage.setItem(
    `user_${finalUser.email}`,
    JSON.stringify(finalUser)
  );

  setUserData(finalUser);
  localStorage.setItem(
    "currentUser",
    JSON.stringify(finalUser)
  );
  setIsLoggedIn(true);

  // ✅ لو isNewUser → preferences، غير كده → home
  if (isNewUser) {
    setUserPreferences(null);
    setHasCompletedOnboarding(false);
    setCurrentPage('preferences');
  } else {
    setUserPreferences({
      amenities: ['wifi', 'parking', 'kids-friendly'],
      budgetRange: [100, 1500],
      location: 'Cairo',
      interests: [
        'Fitness & Gyms',
        'Coffee & Cafes',
        'Car Detailing',
        'Casual Dining',
        'Co-working Spaces'
      ]
    });
    setHasCompletedOnboarding(true);
    setCurrentPage('home');
  }
};


 const handleProfileUpdate = (updatedUser: any) => {

  const avatarUrl =
    updatedUser?.profilePicture?.secure_url ||
    updatedUser?.avatar ||
    "";

  const formattedUser = {
    ...userData,

    name: `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim(),

    email: updatedUser.email,

    avatar: avatarUrl,

    phone: updatedUser.phone,
    location: updatedUser.location,
    bio: updatedUser.bio
  };

  console.log("FINAL USER:", formattedUser);

  setUserData(formattedUser);

  localStorage.setItem(
    "currentUser",
    JSON.stringify(formattedUser)
  );

  localStorage.setItem(
  `user_${formattedUser.email}`,
  JSON.stringify({
    ...formattedUser,
    avatar: avatarUrl
  })
);
};
React.useEffect(() => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const user = JSON.parse(currentUser);
    setUserData(user);
    setIsLoggedIn(true);
    setHasCompletedOnboarding(true);

    // ✅ جيب الـ preferences من الـ backend
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/preferences/my-preferences`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.data) {
            setUserPreferences(data.data);
          } else {
            setUserPreferences({
              amenities: ['wifi', 'parking', 'kids-friendly'],
              budgetRange: [100, 1500],
              location: 'Cairo',
              interests: ['Fitness & Gyms', 'Coffee & Cafes', 'Car Detailing', 'Casual Dining', 'Co-working Spaces']
            });
          }
        })
        .catch(() => {});
    }
  }
}, []);

const handlePreferencesComplete = (preferences: UserPreferencesType) => {
  setUserPreferences(preferences); // ← ده بيحدث الـ location تلقائياً
  setHasCompletedOnboarding(true);
  if (isEditingPreferences) {
    setCurrentPage('account');
    setIsEditingPreferences(false);
  } else {
    setCurrentPage('home');
  }
};

  const handleLogout = () => {
    // Clear localStorage on logout
    localStorage.removeItem('currentUser');

    setIsLoggedIn(false);
setUserData({
  name: '',
  email: '',
  avatar: '',
  phone: '',
  location: '',
  bio: '',
  loyaltyPoints: 0,
  walletBalance: 0,
  tier: "Bronze"
});    setUserPreferences(null);
    setHasCompletedOnboarding(false);
    setIsEditingPreferences(false);
    setCurrentPage('home');
  };

  const handleScrollToAbout = () => {
    if (isLoggedIn) {
      // If logged in, scroll to AI chatbot section on logged-in home
      setCurrentPage('home');
      setTimeout(() => {
        document.getElementById('ai-chatbot')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    } else {
      // If logged out, scroll to About Us section
      setCurrentPage('home');
      setTimeout(() => {
        document.getElementById('about-us')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" richColors />
{isUnderMaintenance && !isAdminLoggedIn ? (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white text-center px-4">
        <div className="text-6xl mb-6">🚧</div>
        <h1 className="text-3xl font-bold mb-3">Under Maintenance</h1>
        <p className="text-gray-400 text-lg max-w-md">
          We're working hard to improve your experience. Please check back soon.
        </p>
      </div>
    ) : (
       <>
        {currentPage === 'admin-login' ? (
          <AdminLogin
            onLogin={() => {
              setIsAdminLoggedIn(true);
              
              setCurrentPage('admin-dashboard');
            }}
            onBack={() => setCurrentPage('home')}
          />
      ) : currentPage === 'admin-dashboard' ? (
  (isAdminLoggedIn || !!localStorage.getItem("adminToken")) ? (
    <AdminDashboard
      onLogout={() => {
        setIsAdminLoggedIn(false);
        setCurrentPage('home');
      }}
    />
  ) : null
        ) : currentPage === 'business-dashboard' ? (
          <BusinessDashboard
            businessEmail={
              JSON.parse(localStorage.getItem("business") || "{}")?.email
            }
            onLogout={() => {
              localStorage.removeItem("business_token");
              localStorage.removeItem("business");
              setCurrentPage('home');
            }}
            onNavigateToPreview={(serviceData: any) => {
              setSelectedService(serviceData);
              setCurrentPage('service-details');
            }}
          />
        ) : (
          <>
          <Header
            onNavigate={handleNavigate}
            isLoggedIn={isLoggedIn}
            userName={userData.name}
            userAvatar={userData.avatar}
            onScrollToAbout={isLoggedIn ? handleScrollToAbout : undefined}
          />
          {/* Chatbot gets full screen without footer */}
          {currentPage === 'chatbot' ? (
            isLoggedIn && userPreferences ? (
              <Chatbot
                onNavigate={handleNavigate}
                userName={userData.name}
                userLocation={userPreferences.location}
              />
            ) : null
          ) : (
            <>
              <div className="flex-grow">
                {currentPage === 'preferences' ? (
                  <UserPreferences
                    onComplete={handlePreferencesComplete}
                    isEditing={isEditingPreferences}
                    existingPreferences={isEditingPreferences ? userPreferences || undefined : undefined}
                  />
                ) : currentPage === 'account' ? (
                  isLoggedIn && userPreferences ? (
                <Account
  onNavigate={handleNavigate}
  onLogout={handleLogout}
  user={{
    userName: userData.name,
    email: userData.email,

    profilePicture: userData.avatar || "",

    loyaltyPoints: userData.loyaltyPoints,
    walletBalance: userData.walletBalance,
    tier: userData.tier,

    createdAt: userData.createdAt || new Date().toISOString()
  }}
  userPreferences={userPreferences}
  bookingsCount={
    bookings.filter(b => b.status === 'upcoming').length
  }
/>
                  ) : null
                ) : currentPage === 'bookings' ? (
                  isLoggedIn ? (
                    <Bookings
                      onNavigate={handleNavigate}
                      bookings={bookings}
                      onAddBooking={handleAddBooking}

                      onUpdateBooking={handleUpdateBooking}
                      onCancelBooking={handleCancelBooking}

                    />
                  ) : null
                ) : currentPage === 'profile-settings' ? (
                  isLoggedIn ? (
                    <ProfileSettings
                      onNavigate={handleNavigate}
                      userName={userData.name}
                      userEmail={userData.email}
                      userAvatar={userData.avatar}
                      userPhone={userData.phone}
                      userLocation={userData.location}
                      userBio={userData.bio}
                      onSaveProfile={handleProfileUpdate}
                    />
                  ) : null
                ) : currentPage === 'saved-places' ? (
                  isLoggedIn ? (
                    <SavedPlaces onNavigate={handleNavigate} savedPlaces={savedPlaces} />
                  ) : null
                ) : currentPage === 'notification-settings' ? (
                  isLoggedIn ? (
                    <NotificationSettings onNavigate={handleNavigate} />
                  ) : null
                ) : currentPage === 'home' ? (
                  isLoggedIn && hasCompletedOnboarding && userPreferences ? (
                    <LoggedInHome
                      onNavigate={handleNavigate}
                      userPreferences={userPreferences}
                      userName={userData.name}
                    />
                  ) : (
                    <>
                      <Hero onNavigate={handleNavigate} />
                      <AboutUs />
                    </>
                  )
                ) : currentPage === 'login' ? (
                  <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
                ) : currentPage === 'service-details' ? (
                  isLoggedIn && selectedService ? (
                    <ServiceDetails
                      onNavigate={handleNavigate}
                      serviceData={selectedService}
                      userName={userData.name}
                      userAvatar={userData.avatar}
                      onSavePlace={handleSavePlace}
                      onAddBooking={handleAddBooking}
                    />
                  ) : null
                ) : currentPage === 'gyms' ? (
                  isLoggedIn ? (
                    <GymsLoggedIn onNavigate={handleNavigate} />
                  ) : (
                    <GymsLoggedOut onNavigate={handleNavigate} />
                  )
                ) : currentPage === 'car-services' ? (
                  isLoggedIn ? (
                    <CarServicesLoggedIn onNavigate={handleNavigate} />
                  ) : (
                    <CarServicesLoggedOut onNavigate={handleNavigate} />
                  )
                ) : currentPage === 'restaurants' ? (
                  isLoggedIn ? (
                    <RestaurantsLoggedIn onNavigate={handleNavigate} />
                  ) : (
                    <RestaurantsLoggedOut onNavigate={handleNavigate} />
                  )
                ) : currentPage === 'coworking-spaces' ? (
                  isLoggedIn ? (
                    <CoWorkingSpacesLoggedIn onNavigate={handleNavigate} />
                  ) : (
                    <CoWorkingSpacesLoggedOut onNavigate={handleNavigate} />
                  )
                ) : currentPage === 'explore' ? (
                  <Explore onNavigate={handleNavigate} scrollToSection={scrollToSection} />
                ) : currentPage === 'contact-us' ? (
                  <ContactUs onNavigate={handleNavigate} />
                ) : currentPage === 'businesses' ? (
                  <Businesses onNavigate={handleNavigate} />
                ) : currentPage === 'business-portal' ? (
 <BusinessOwnerPortal
                      onNavigate={handleNavigate}
                      defaultTab={portalTab}
                      onPasswordChanged={() => setCurrentPage("business-dashboard")}
                    />          ) : null}
              </div>
              <Footer onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />

              {/* Floating Chat Button - Only show after scrolling past AI section on home, or always on other pages when logged in */}
              {isLoggedIn && currentPage !== 'chatbot' && (currentPage !== 'home' || showChatLabel) && (
                <FloatingChatButton
                  onOpenChat={() => handleNavigate('chatbot')}
                />
              )}
            </>
          )}
        </>
         )}
      </>
      )}
    </div>
  );
}