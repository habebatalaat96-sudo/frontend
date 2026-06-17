import React, { useState , useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { MapPin, Heart, DollarSign, Users, Sparkles } from 'lucide-react';
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "../config/api";
interface UserPreferencesProps {
  onComplete: (preferences: UserPreferences) => void;
  isEditing?: boolean;
  existingPreferences?: UserPreferences;
}

export interface UserPreferences {
  amenities: string[];
  budgetRange: [number, number];
  location: string;
  interests: string[];
}

export const UserPreferences: React.FC<UserPreferencesProps> = ({ onComplete, isEditing = false, existingPreferences }) => {
const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
  existingPreferences?.amenities || []
);
const [budgetRange, setBudgetRange] = useState<[number, number]>(
  existingPreferences?.budgetRange || [50, 2000]
);
const [selectedInterests, setSelectedInterests] = useState<string[]>(
  existingPreferences?.interests || []
);
const [location, setLocation] = useState(
  existingPreferences?.location || ''
);
  const egyptianCities = [
    'Cairo',
    'Giza',
    'Alexandria',
    'Heliopolis',
    'Nasr City',
    'Maadi',
    'Zamalek',
    'New Cairo',
    '6th of October City',
    'Sheikh Zayed',
    'Dokki',
    'Mohandessin',
    'Shorouk City',
    'El Rehab',
    'Tagamoa',
    'Garden City',
    'Downtown Cairo'
  ];

  const amenities = [
    { id: 'kids-friendly', label: 'Kids Friendly', icon: Users },
    { id: 'pet-friendly', label: 'Pet Friendly', icon: Heart },
    { id: 'parking', label: 'Parking Available', icon: MapPin },
    { id: 'wifi', label: 'Free WiFi', icon: Sparkles },
    { id: 'outdoor-seating', label: 'Outdoor Seating', icon: Users },
    { id: 'wheelchair-accessible', label: 'Wheelchair Accessible', icon: Users },
    { id: 'valet-service', label: 'Valet Service', icon: MapPin },
    { id: 'air-conditioned', label: 'Air Conditioned', icon: Sparkles },
    { id: 'smoking-area', label: 'Smoking Area', icon: Users },
    { id: 'non-smoking', label: 'Non-Smoking', icon: Heart },
    { id: 'private-rooms', label: 'Private Rooms', icon: Users },
    { id: 'family-friendly', label: 'Family Friendly', icon: Users },
    { id: 'group-discounts', label: 'Group Discounts', icon: DollarSign },
    { id: 'student-discounts', label: 'Student Discounts', icon: DollarSign },
    { id: 'senior-discounts', label: 'Senior Discounts', icon: DollarSign },
    { id: 'prayer-room', label: 'Prayer Room', icon: Heart },
    { id: 'locker-rooms', label: 'Locker Rooms', icon: Users },
    { id: 'showers', label: 'Showers Available', icon: Sparkles },
    { id: 'changing-rooms', label: 'Changing Rooms', icon: Users },
    { id: 'daycare', label: 'Daycare Service', icon: Users },
    { id: 'reservation-required', label: 'Reservation Available', icon: MapPin },
  ];

  const interests = [
    'Fitness & Gyms',
    'Fine Dining',
    'Casual Dining',
    'Coffee & Cafes',
    'Car Maintenance',
    'Car Detailing',
    'Co-working Spaces',
    'Meeting Rooms',
    'Vegan/Vegetarian Options',
    'Late Night Services',
    '24/7 Access',
    'Luxury Services',
    'Budget-Friendly',
    'Family Restaurants',
    'Fast Food',
    'Healthy Food',
    'Organic Options',
    'Gluten-Free Options',
    'Halal Food',
    'Kosher Food',
    'Delivery Available',
    'Takeout Available',
    'Personal Training',
    'Group Classes',
    'Yoga & Pilates',
    'Swimming Pools',
    'Spa Services',
    'Massage Therapy',
  ];

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

 const handleSubmit = async () => {

  try {

    const token = localStorage.getItem("token");

    const preferencesData = {
      amenities: selectedAmenities,
      budgetRange,
      location,
      interests: selectedInterests
    };

    const res = await axios.post(
      `${API_URL}/preferences/save-preferences`,
      preferencesData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log(preferencesData);
console.log(token);

    // SUCCESS ALERT
// بعد
toast.success("Preferences saved! Welcome to SPOT 🎉");
onComplete(preferencesData);
    // أو لو عايزة alert عادي:
    // alert("Preferences saved successfully!");


  } catch (error: any) {

    console.log(error);

    toast.error(
      error.response?.data?.message ||
      "Failed to save preferences"
    );
  }
};
useEffect(() => {
  if (!isEditing) return;  // ← السطر الجديد المهم

  const getPreferences = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/preferences/my-preferences`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = res.data.data;
      if (data) {
        setSelectedAmenities(data.amenities || []);
        setBudgetRange(data.budgetRange || [50, 2000]);
        setLocation(data.location || "");
        setSelectedInterests(data.interests || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  getPreferences();
}, [isEditing]); // ← كمان غيّر [] لـ [isEditing]
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            {isEditing ? 'Edit Your Preferences' : 'Personalize Your Experience'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isEditing 
              ? 'Update your preferences to get better recommendations tailored to you!'
              : 'Help us understand your preferences so we can recommend the best local services tailored just for you!'
            }
          </p>
        </div>

        {/* Preferences Summary - Only show when editing */}
        {isEditing && existingPreferences && (
          <Card className="p-8 bg-white border-2 border-cyan-100 shadow-xl mb-8 rounded-[18px]">
            <h2 className="text-2xl mb-6 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent font-bold">
              Current Preferences Summary
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-500 mb-3">Preferred Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAmenities.map((amenity) => (
                    <Badge key={amenity} variant="outline" className="px-4 py-2 bg-cyan-50 text-cyan-700 border-cyan-200 rounded-[12px]">
                      {amenity.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-500 mb-3">Budget Range</h3>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-4 py-2 rounded-[12px]">
                  {budgetRange[0]} EGP - {budgetRange[1]}+ EGP
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-500 mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <Badge key={interest} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 rounded-[12px]">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-8 bg-white/80 backdrop-blur-sm border-white/20 shadow-xl space-y-8">
          {/* Amenities Section */}
          <div>
            <h2 className="text-2xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Heart className="w-6 h-6 text-cyan-600" />
              Amenities & Features
            </h2>
            <p className="text-gray-600 mb-4">Select all that apply to you:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
              {amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedAmenities.includes(amenity.id)
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-cyan-300'
                  }`}
                  onClick={() => handleAmenityToggle(amenity.id)}
                >
                  <Checkbox
                    id={amenity.id}
                    checked={selectedAmenities.includes(amenity.id)}
                    onCheckedChange={() => handleAmenityToggle(amenity.id)}
                  />
                  <Label
                    htmlFor={amenity.id}
                    className="flex-1 cursor-pointer text-gray-700 text-sm"
                  >
                    {amenity.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Range Section */}
          <div>
            <h2 className="text-2xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-purple-600" />
              Budget Range
            </h2>
            <p className="text-gray-600 mb-4">
              Set your typical spending range per visit:
            </p>
            <div className="space-y-4">
              <div className="px-4">
                <Slider
                  min={50}
                  max={2000}
                  step={50}
                  value={budgetRange}
                  onValueChange={(value) => setBudgetRange(value as [number, number])}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-lg bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  {budgetRange[0]} EGP
                </span>
                <span className="text-gray-500">to</span>
                <span className="text-lg bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  {budgetRange[1]}+ EGP
                </span>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h2 className="text-2xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <MapPin className="w-6 h-6 text-cyan-600" />
              Your Location
            </h2>
            <p className="text-gray-600 mb-4">
              Select your city in Egypt:
            </p>
            <div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all bg-white"
              >
                <option value="">Select a city...</option>
                {egyptianCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interests Section */}
          <div>
            <h2 className="text-2xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Your Interests
            </h2>
            <p className="text-gray-600 mb-4">
              What type of services are you most interested in?
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
              {interests.map((interest) => (
                <div
                  key={interest}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedInterests.includes(interest)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  <Checkbox
                    id={interest}
                    checked={selectedInterests.includes(interest)}
                    onCheckedChange={() => handleInterestToggle(interest)}
                  />
                  <Label
                    htmlFor={interest}
                    className="flex-1 cursor-pointer text-sm text-gray-700"
                  >
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              onClick={handleSubmit}
              disabled={!location || selectedInterests.length === 0}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isEditing ? 'Save Preferences' : 'Complete Setup & Continue'}
            </Button>
            {(!location || selectedInterests.length === 0) && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Please select at least one interest and provide your location
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
