

import React from "react";
import {
  Building2,
  FileText,
  Star,
  BarChart3,
  Clock,
  Camera,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import { Button } from "./ui/button";
import { ProfileManagementMockup } from "./mockups/ProfileManagementMockup";
import { NotificationMockup } from "./mockups/NotificationMockup";
import { ReviewResponseMockup } from "./mockups/ReviewResponseMockup";
import { AnalyticsDashboardMockup } from "./mockups/AnalyticsDashboardMockup";

interface BusinessesProps {
  onNavigate: (
    page:
      | "home"
      | "login"
      | "gyms"
      | "car-services"
      | "restaurants"
      | "coworking-spaces"
      | "explore"
      | "contact-us"
      | "businesses"
      | "business-portal",
    section?: string,
    tab?: "list" | "claim" | "login",
  ) => void;
}

export const Businesses: React.FC<BusinessesProps> = ({
  onNavigate,
}) => {
  const features = [
    {
      icon: FileText,
      title: "Create & Manage Profiles",
      description:
        "Build comprehensive service profiles with your business name, category, pricing, hours of operation, and stunning photo galleries. Complete control at your fingertips.",
      highlights: [
        "Business Details",
        "Service Categories",
        "Pricing Options",
        "Operating Hours",
        "Photo Galleries",
      ],
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description:
        "Keep your information accurate and up-to-date with instant updates. Change your hours, update prices, or add new services - all reflected immediately to potential customers.",
      highlights: [
        "Instant Changes",
        "Live Updates",
        "No Delays",
        "Always Current",
        "Flexible Management",
      ],
    },
    {
      icon: Star,
      title: "Engage with Reviews",
      description:
        "View customer feedback and respond to reviews directly from your dashboard. Build trust and improve customer relationships through authentic engagement.",
      highlights: [
        "Read Reviews",
        "Respond Publicly",
        "Build Trust",
        "Improve Service",
        "Customer Insights",
      ],
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Access powerful analytics to track profile views, booking trends, and customer engagement. Make data-driven decisions to optimize your offerings and grow your business.",
      highlights: [
        "Profile Views",
        "Booking Analytics",
        "Customer Trends",
        "Performance Metrics",
        "Growth Insights",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-600/10" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 rounded-full mb-6 backdrop-blur-sm">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 text-sm">
                For Business Owners
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Grow Your Business
              <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mt-2">
                with SPOT
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join the platform that connects local gyms, car
              services, restaurants, cafes, and co-working
              spaces with customers actively searching for your
              services.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() =>
                  onNavigate(
                    "business-portal",
                    undefined,
                    "list",
                  )
                }
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-6 rounded-[18px] text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                List Your Business
              </Button>
              <Button
                onClick={() =>
                  onNavigate(
                    "business-portal",
                    undefined,
                    "claim",
                  )
                }
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-6 rounded-[18px] text-lg backdrop-blur-sm transition-all duration-300 border border-white/20 transform hover:scale-105"
              >
                Claim Your Business
              </Button>
              <Button
                onClick={() =>
                  onNavigate(
                    "business-portal",
                    undefined,
                    "login",
                  )
                }
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-6 rounded-[18px] text-lg backdrop-blur-sm transition-all duration-300 border border-white/20 transform hover:scale-105"
              >
                Business Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose SPOT Section */}
      <div className="py-20 px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Partner with SPOT?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powered by AI and designed for growth. Our
              platform puts your business in front of the right
              customers at the right time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-600/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI-Powered Matching
              </h3>
              <p className="text-gray-300 text-sm">
                Our intelligent algorithm connects you with
                customers searching for exactly what you offer.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-600/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Direct Engagement
              </h3>
              <p className="text-gray-300 text-sm">
                Connect directly with potential customers
                through reviews, bookings, and inquiries.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-600/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Boost Revenue
              </h3>
              <p className="text-gray-300 text-sm">
                Increase visibility and attract more customers
                to grow your revenue and market presence.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-600/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Showcase Your Brand
              </h3>
              <p className="text-gray-300 text-sm">
                Beautiful profiles with photos, descriptions,
                and all the details that make your business
                unique.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Tools for Business Owners
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to manage and grow your
              business presence, all in one place.
            </p>
          </div>

          <div className="space-y-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 items-center`}
              >
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-purple-600/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">
                        {feature.title}
                      </h3>
                    </div>

                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {feature.highlights.map(
                        (highlight, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-white/5 border border-cyan-500/30 rounded-full text-cyan-400 text-sm"
                          >
                            {highlight}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  {index === 0 && <ProfileManagementMockup />}
                  {index === 1 && <NotificationMockup />}
                  {index === 2 && <ReviewResponseMockup />}
                  {index === 3 && <AnalyticsDashboardMockup />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 lg:px-8 bg-gradient-to-r from-cyan-500/10 to-purple-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Join hundreds of local businesses already thriving
            on SPOT. List your business today and start
            connecting with customers who are actively looking
            for your services.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() =>
                onNavigate("business-portal", undefined, "list")
              }
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-10 py-6 rounded-[20px] text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Get Started Now
            </Button>
            <Button
              onClick={() => onNavigate("home")}
              className="bg-white/10 hover:bg-white/20 text-white px-10 py-6 rounded-[20px] text-lg backdrop-blur-sm transition-all duration-300 border border-white/20 transform hover:scale-105"
            >
              Learn More
            </Button>
          </div>

          <p className="text-gray-400 text-sm mt-8">
            Questions?{" "}
            <button
              onClick={() => onNavigate("contact-us")}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Contact us
            </button>{" "}
            - we're here to help!
          </p>
        </div>
      </div>
    </div>
  );
};