import React from 'react';
import { Card } from './ui/card';
import { Star, MapPin, Lock } from 'lucide-react';
import { Button } from './ui/button';

interface GymsLoggedOutProps {
  onNavigate: (page: 'home' | 'login' | 'gyms' | 'car-services' | 'restaurants' | 'coworking-spaces' | 'explore' | 'contact-us') => void;
}

export const GymsLoggedOut: React.FC<GymsLoggedOutProps> = ({ onNavigate }) => {

  const [sponsoredGyms, setSponsoredGyms] = React.useState<any[]>([]);
  const [nonSponsoredGyms, setNonSponsoredGyms] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);


  React.useEffect(() => {
    const fetchGyms = async () => {
      try {
        const res = await fetch("http://localhost:5000/business/gyms-logged-out");
        const data = await res.json();
        const all = data.data || [];

        setSponsoredGyms(all.filter((g: any) => g.sponsored === true));
        setNonSponsoredGyms(all.filter((g: any) => g.sponsored !== true).slice(0, 6));

      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Gyms & Fitness Centers
          </h1>
          <p className="text-lg text-gray-600">
            Find trusted gyms and fitness centers near you
          </p>
        </div>

        {/* Sponsored Section */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm">
              Sponsored
            </div>
            <p className="text-gray-500 text-sm">Premium fitness centers</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsoredGyms.map((gym) => (
              <Card key={gym.id} className="overflow-hidden bg-white/80 backdrop-blur-sm border-white/20 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={gym.image}
                    alt={gym.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
             
                </div>

                <div className="p-5">
                  <h3 className="text-xl mb-3 text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {gym.name}
                  </h3>
                  <div className="flex items-start gap-2 mb-3 text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-600" />
                    <span className="text-sm">{gym.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`w-4 h-4 ${index < Math.floor(gym.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : index < gym.rating
                                ? 'fill-yellow-200 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-700">{gym.rating}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Non-Sponsored Section (Blurred) */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm">
              All Gyms
            </div>
            <p className="text-gray-500 text-sm">Login to view complete directory</p>
          </div>

          <div className="relative">
            <div className="blur-sm pointer-events-none select-none">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nonSponsoredGyms.map((gym) => (
                  <Card key={gym.id} className="overflow-hidden bg-white/80 backdrop-blur-sm border-white/20">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={gym.image}
                        alt={gym.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl mb-3 text-gray-800">{gym.name}</h3>
                      <div className="flex items-start gap-2 mb-3 text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-600" />
                        <span className="text-sm">{gym.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={index}
                              className={`w-4 h-4 ${index < Math.floor(gym.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-gray-200 text-gray-200'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-700">{gym.rating}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
              <div className="text-center bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md mx-4 border border-gray-200">
                <div className="mb-4 flex justify-center">
                  <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-4 rounded-full">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl mb-3 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  Login to View All Gyms
                </h3>
                <p className="text-gray-600 mb-6">
                  Access our complete directory of gyms and fitness centers with AI-powered recommendations tailored to your needs
                </p>
                <Button
                  onClick={() => onNavigate('login')}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-2.5 rounded-[18px] shadow-lg transition-all duration-300 transform hover:scale-105 text-[14px]"
                >
                  Login Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};