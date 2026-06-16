import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { TypewriterEffect } from "./TypewriterEffect";
import { Sparkles, Search, MapPin, TrendingUp } from "lucide-react";

interface HeroProps {
  onNavigate: (page: 'home' | 'login' | 'gyms' | 'car-services' | 'restaurants' | 'coworking-spaces' | 'explore' | 'contact-us', section?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const businessImages = [
    "https://images.unsplash.com/photo-1655228004877-4f1577ead669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbW9iaWxlJTIwcmVwYWlyJTIwc2hvcHxlbnwxfHx8fDE3NTk4NzMzNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1744551472726-24a3eb12e82a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBneW0lMjBmaXRuZXNzfGVufDF8fHx8MTc1OTc5OTc1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1739672597445-9ca3f4cdfc7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBzZXJ2aWNlJTIwZ2FyYWdlfGVufDF8fHx8MTc1OTg3MzM2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1683758507025-6e74ad3ca1e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwY2VudGVyJTIwZXF1aXBtZW50fGVufDF8fHx8MTc1OTg3MzM2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % businessImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [businessImages.length]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      {businessImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      {/* Slider indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {businessImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-2xl mx-auto">
        <h1 className="text-4xl lg:text-5xl mb-6 leading-tight font-bold">
          Welcome to <span className="bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">SPOT</span>
        </h1>

        <p className="text-lg lg:text-xl text-gray-200 mb-8 font-bold">
          Find your right SPOT!
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <Search className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span className="text-sm">AI-Powered Search</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <MapPin className="w-4 h-4 text-purple-400" aria-hidden="true" />
            <span className="text-sm">Location-Based</span>
          </div>
        
        </div>

        <div className="mb-8">
          <Button
            size="lg"
            onClick={() => onNavigate('explore')}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-2.5 rounded-[18px] shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Get Started!
          </Button>
        </div>

        <div className="text-base text-gray-300 mb-4">
          <TypewriterEffect
            texts={["Discover SPOT: Your AI-powered platform for finding the best local services"]}
            speed={50}
            deleteSpeed={40}
            pauseTime={5000}
          />
        </div>

        <div className="text-base text-gray-300 mb-4">
          Try our chatbot and save time!
        </div>

        <div className="max-w-md mx-auto">
          <div 
            onClick={() => onNavigate('explore', 'ai-assistant')}
            className="relative p-0.5 rounded-full bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-500 shadow-2xl shadow-cyan-500/25 transition-all duration-500 cursor-pointer hover:shadow-cyan-500/40 hover:scale-105 transform"
          >
            <div className="w-full px-4 py-3 rounded-full bg-white/95 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/30 to-purple-50/30 transition-opacity duration-500 hover:from-cyan-50/50 hover:to-purple-50/50"></div>
              <div className="relative z-10">
                <TypewriterEffect
                  texts={[
                    "Find the nearest auto repair shop",
                    "Looking for a medical clinic?",
                    "Need a gym with good equipment?",
                    "Search for car service centers",
                    "Locate healthcare facilities nearby",
                    "Discover fitness centers in your area"
                  ]}
                  speed={60}
                  deleteSpeed={40}
                  pauseTime={2000}
                  className="text-gray-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
