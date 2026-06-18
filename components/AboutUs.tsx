import React from 'react';
// import spotLogo from 'figma:asset/87d319d70a74f2182b104a15a264753a0cfb9143.png';
import { Eye, Zap, Lightbulb, MapPin, MessageSquare, Sparkles, Dumbbell, Coffee, Car, Briefcase, TrendingUp, Users, Shield } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <section id="about-us" className="relative min-h-screen py-24 px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 overflow-hidden">
      {/* Watermark Logo Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img
          src="../assets/87d319d70a74f2182b104a15a264753a0cfb9143.png"

          alt=""
          className="w-[800px] h-[800px] object-contain transform rotate-12"
          aria-hidden="true"
        />
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-cyan-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" aria-hidden="true"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} aria-hidden="true"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-4xl lg:text-5xl mb-6 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            About SPOT
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connecting you to the perfect local services through intelligent technology
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 animate-fadeIn">
          {/* Vision */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[18px] p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <Eye className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">Our Vision</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To revolutionize how people discover and connect with local services by creating a seamless,
              intelligent platform that understands individual needs and delivers personalized recommendations
              instantly, making every search for the perfect "spot" effortless and rewarding.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[18px] p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-full flex items-center justify-center mr-4">
                <Zap className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">Our Mission</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To provide a centralized, user-friendly, and secure platform that connects users with local services
              including restaurants, gyms, car services, and co-working spaces, while leveraging
              cutting-edge AI technology to streamline the discovery process and enhance user experience.
            </p>
          </div>
        </div>

        {/* What We Do */}
        <div className="mb-12">
          <h3 className="text-3xl text-center mb-8 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            What We Do
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-[18px] p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <h4 className="text-xl mb-3 text-gray-800">AI-Powered Discovery</h4>
              <p className="text-gray-600 leading-relaxed">
                Our intelligent system uses advanced AI and NLP to understand your needs and deliver personalized service recommendations.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-[18px] p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <h4 className="text-xl mb-3 text-gray-800">Location-Based Services</h4>
              <p className="text-gray-600 leading-relaxed">
                Integrated with Google Maps API to provide accurate, location-specific recommendations based on your preferences and budget.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-[18px] p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <h4 className="text-xl mb-3 text-gray-800">Conversational AI</h4>
              <p className="text-gray-600 leading-relaxed">
                Our intelligent chatbot provides real-time assistance, making it easy to find exactly what you're looking for through natural conversation.
              </p>
            </div>
          </div>
        </div>

        {/* Services We Connect */}
        <div className="text-center">
          <h3 className="text-3xl mb-8 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Services We Connect You To
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Dumbbell, label: "Gyms" },
              { icon: Briefcase, label: "Co-working Spaces" },
              { icon: Coffee, label: "Restaurants/Cafes" },
              { icon: Car, label: "Car Services" }
            ].map((service, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-white/30">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <service.icon className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <p className="text-gray-700">{service.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};