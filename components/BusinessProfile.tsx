import React, { useState, useEffect } from 'react';
import {
  Camera, Clock, DollarSign, MapPin, Phone, Mail,
  Image as ImageIcon, Hash, User, FileText, X, Eye,
  Save, Upload, Star, CheckCircle, Plus, Trash2, Calendar,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { API_URL } from "../config/api";
// =========================
// Types
// =========================
interface Service {
  service_id: number;
  service_category: string;
  name: string;
  // availability: string;
  duration: string;
  price_type: 'fixed' | 'range';
  price?: number;
  price_after?:number,
  min_price?: number;
  max_price?: number;
  offer: string;
min_price_after?: number; // ✅
  max_price_after?: number; // ✅
    description: string;
}

type WorkingHour = {
  day: string;
  open: string;
  close: string;
};

// ✅ في BusinessProfileProps — أضف الـ prop
interface BusinessProfileProps {
  businessEmail: string;
  onLogoUpdate?: (logoUrl: string) => void;
  onNavigate: (page: string, data?: any) => void;
  businessId: string;
}
// =========================
// Constants
// =========================
const egyptianCities = [
  'Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said',
  'Suez', 'Luxor', 'Mansoura', 'El-Mahalla El-Kubra', 'Tanta',
  'Asyut', 'Ismailia', 'Fayyum', 'Zagazig', 'Aswan', 'Damietta',
  'Damanhur', 'Minya', 'Beni Suef', 'Qena', 'Sohag', 'Hurghada',
  'Sharm El Sheikh', '6th of October City', 'Shibin El Kom', 'Banha',
  'Kafr el-Sheikh', 'Arish', 'Mallawi',
];

const emptyService: Service = {
  service_id: Date.now(),
  service_category: 'Gym',
  name: '',
  // availability: '',
  duration: '',
  price_type: 'fixed',
  price: 0,
  min_price: undefined,
  max_price: undefined,
  offer: '0%',
  price_after: 0,
  description: '',
};

// =========================
// Helpers
// =========================
const parseOfferPercent = (offer: string): number => {
  const num = parseFloat(offer.replace('%', ''));
  return isNaN(num) ? 0 : num;
};

// =========================
// Component
// =========================
export const BusinessProfile: React.FC<BusinessProfileProps> = ({
  businessEmail,
  onLogoUpdate,
  onNavigate,  // ✅
  businessId,  // ✅

}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState<any>(null);

  const getServicesFromStorage = (): Service[] => {
    const business = JSON.parse(localStorage.getItem('business') || '{}');
    if (!Array.isArray(business.services) || business.services.length === 0) return [];
    return business.services.map((s: any) => ({
      service_id: s.service_id ?? crypto.randomUUID(),
      service_category: s.service_category || 'Gym',
      name: s.name || '',
      // availability: s.availability || '',
      duration: s.duration || '',
      price_type: s.price_type || 'fixed',
      price: s.price,
      min_price: s.min_price,
      max_price: s.max_price,
      offer: s.offer || '0%',
      price_after: s.price_after || 0,
      description: s.description || '',
    }));
  };

  const [services, setServices] = useState<Service[]>(getServicesFromStorage);
  const [logoPreview, setLogoPreview] = useState<string>(() => {
    const b = JSON.parse(localStorage.getItem('business') || '{}');
    return b.businessLogo || '';
  });

  // بدل logoPreview بس، احتفظ بالـ File نفسه
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // الصور الجديدة اللي هيترفعوا (Files مش URLs)
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);


  const [businessPhotos, setBusinessPhotos] = useState<string[]>(() => {
    const business = JSON.parse(localStorage.getItem('business') || '{}');
    return Array.isArray(business.photo_url) ? business.photo_url : [];
  });
  // ── Working Hours Handler (unified) ──────────────────────
  const handleWorkingHourChange = (
    index: number,
    field: 'open' | 'close',
    value: string
  ) => {
    setProfileData((prev) => {
      const updated = [...prev.working_hours];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, working_hours: updated };
    });
  };

  // ── Logo & Photos ─────────────────────────────────────────
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Logo must be under 5MB'); return; }

    setLogoFile(file);  // ✅ احتفظ بالـ File
    setLogoPreview(URL.createObjectURL(file));  // ✅ Preview فوري
  };
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArr = Array.from(files);
    if (businessPhotos.length + newPhotoFiles.length + filesArr.length > 10) {
      toast.error('Maximum 10 photos allowed');
      return;
    }

    // ✅ Preview فوري
    const previewUrls = filesArr.map(f => URL.createObjectURL(f));
    setBusinessPhotos(prev => [...prev, ...previewUrls]);

    // ✅ احتفظ بالـ Files
    setNewPhotoFiles(prev => [...prev, ...filesArr]);
  };


  const handleRemovePhoto = (index: number) => {
    const removedUrl = businessPhotos[index];

    // لو صورة جديدة (blob URL)، امسحها من newPhotoFiles كمان
    if (removedUrl.startsWith('blob:')) {
     // ✅ بعد
const blobIndex = businessPhotos
  .slice(0, index)
  .filter(p => p.startsWith('blob:'))
  .length;
      setNewPhotoFiles(prev => prev.filter((_, i) => i !== blobIndex));
    }

    setBusinessPhotos(prev => prev.filter((_, i) => i !== index));
  };
useEffect(() => {
  const fetchBusinessProfile = async () => {
    try {
      const token = localStorage.getItem('business_token');

      const res = await fetch(
        `${API_URL}/business/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log('FULL RESPONSE:', data);

      if (!res.ok) {
        toast.error(data.message || 'Failed to load profile');
        return;
      }

      const business = data.data;

      console.log('BUSINESS DATA:', business);

      setProfileData({
        businessId: business.businessCode || business._id || '',
        taxRegistrationNumber: business.taxNumber || '',
        ownerId: business.ownerId || '',

        businessName: business.name || '',
        category: business.category || '',
        ownerName: business.ownerName || '',
        email: business.email || '',
        phone: business.phone_number || '',

        address: business.location?.split(',')[0]?.trim() || '',
        city: business.location?.split(',')[1]?.trim() || '',

        district: business.district || '',

        location_url_on_maps:
          business.location_url_on_maps || '',

        description: business.description || '',
        pricingRange: business.pricingRange || '',

        amenities: Array.isArray(business.amenities)
          ? business.amenities.join(', ')
          : '',

        working_hours:
          Array.isArray(business.working_hours)
            ? business.working_hours.map((h: string) => {
                const colonIdx = h.indexOf(':');

                const day = h.substring(0, colonIdx).trim();

                const times = h.substring(colonIdx + 1).trim();

                if (
                  times.toLowerCase().includes('open 24')
                ) {
                  return {
                    day,
                    open: 'Open 24 Hours',
                    close: 'Open 24 Hours',
                  };
                }

                if (
                  times.toLowerCase().includes('closed')
                ) {
                  return {
                    day,
                    open: 'Closed',
                    close: 'Closed',
                  };
                }

                const [open, close] = times
                  .split('–')
                  .map((t: string) => t.trim());

                return {
                  day,
                  open: open || '',
                  close: close || '',
                };
              })
            : [],
      });

      // services
      setServices(
        Array.isArray(business.services)
          ? business.services
          : []
      );

      // photos
      setBusinessPhotos(
        Array.isArray(business.photo_url)
          ? business.photo_url
          : []
      );

      // ✅ logo handling
      const logo =
        business.businessLogo ||
        business.logo ||
        business.logo_url ||
        '';

      console.log('LOGO URL:', logo);

      setLogoPreview(logo);

      // localStorage
      localStorage.setItem(
        'business',
        JSON.stringify(business)
      );

    } catch (err) {
      console.error(err);
      toast.error('Network error');
    }
  };

  fetchBusinessProfile();
}, []);
if (!profileData) {
  return (
    <div className="text-white p-10">
      Loading...
    </div>
  );
}

  // ── Service Handlers ──────────────────────────────────────
  const handleAddService = () =>
    setServices((prev) => [...prev, { ...emptyService, service_id: Date.now() }]);

  const handleRemoveService = (index: number) =>
    setServices((prev) => prev.filter((_, i) => i !== index));

const handleServiceChange = (index: number, field: keyof Service, value: string | number) => {
  setServices((prev) =>
    prev.map((s, i) => {
      if (i !== index) return s;
      const updated: Service = { ...s, [field]: value };
      const percent = parseOfferPercent(field === 'offer' ? (value as string) : updated.offer);
      
      if (updated.price_type === 'fixed') {
        const basePrice = field === 'price' ? Number(value) : (updated.price ?? 0);
        updated.price_after = percent > 0 ? Math.round(basePrice * (1 - percent / 100)) : basePrice;
      } else {
        // ✅ range
        updated.price_after = 0;
        const minBase = field === 'min_price' ? Number(value) : (updated.min_price ?? 0);
        const maxBase = field === 'max_price' ? Number(value) : (updated.max_price ?? 0);
        updated.min_price_after = percent > 0 ? Math.round(minBase * (1 - percent / 100)) : minBase;
        updated.max_price_after = percent > 0 ? Math.round(maxBase * (1 - percent / 100)) : maxBase;
      }
      
      return updated;
    })
  );
};

  const handlePriceTypeChange = (index: number, type: 'fixed' | 'range') => {
    setServices((prev) =>
      prev.map((s, i) =>
        i !== index ? s : {
          ...s, price_type: type,
          price: type === 'fixed' ? 0 : undefined,
          min_price: type === 'range' ? 0 : undefined,
          max_price: type === 'range' ? 0 : undefined,
          price_after: 0,
        }
      )
    );
  };

  // ── ✅ Save — Real API Call ───────────────────────────────
  const handleSaveChanges = async () => {
    // ✅ حساب الصور الحالية + الجديدة
    const existingServerPhotos = businessPhotos.filter(p => !p.startsWith('blob:'));
    const totalPhotos = existingServerPhotos.length + newPhotoFiles.length;

    if (totalPhotos > 10) {
      toast.error(`Too many photos. You have ${existingServerPhotos.length} existing + ${newPhotoFiles.length} new = ${totalPhotos}. Max is 10.`);
      setIsSaving(false);
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem('business_token');
      const formData = new FormData();

      formData.append('name', profileData.businessName);
      formData.append('description', profileData.description);
      formData.append('phone_number', profileData.phone);
      formData.append('location', `${profileData.address}, ${profileData.city}`);
      formData.append('location_url_on_maps', profileData.location_url_on_maps);

      const amenitiesArr = profileData.amenities
        .split(',').map(a => a.trim()).filter(Boolean);
      formData.append('amenities', JSON.stringify(amenitiesArr));

      const workingHoursArr = profileData.working_hours.map((h) => {
        if (h.open.toLowerCase().includes('open 24')) return `${h.day}: Open 24 Hours`;
        if (h.open.toLowerCase().includes('closed')) return `${h.day}: Closed`;
        return `${h.day}: ${h.open} – ${h.close}`;
      });
      formData.append('working_hours', JSON.stringify(workingHoursArr));
      formData.append('services', JSON.stringify(services));

      // ✅ اللوجو
      if (logoFile) {
        formData.append('logo', logoFile);
      }

const existingServerPhotos = businessPhotos.filter(p => !p.startsWith('blob:'));
formData.append('existingPhotos', JSON.stringify(existingServerPhotos));

newPhotoFiles.forEach(file => {
  formData.append('photos', file);
});

      const res = await fetch(`${API_URL}/business/request-update`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.message || 'Failed'); return; }

      // ✅ حدّث الـ localStorage
      const stored = JSON.parse(localStorage.getItem('business') || '{}');

      if (data.businessLogo) {
        stored.businessLogo = data.businessLogo;
        setLogoPreview(data.businessLogo);
        if (onLogoUpdate) onLogoUpdate(data.businessLogo);
      }
// ✅ بعد
if (data.photo_urls?.length > 0) {
  stored.photo_url = data.photo_urls; // ✅ replace مش append
  setBusinessPhotos(data.photo_urls);
}


      localStorage.setItem('business', JSON.stringify(stored));
      setNewPhotoFiles([]); // ✅ امسح الـ files بعد الرفع

      toast.success(data.message || 'Update submitted! Pending admin review.');
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  // ── Service Card ──────────────────────────────────────────
  const renderServiceCard = (service: Service, index: number) => (
    <div key={service.service_id} className="bg-slate-800/50 rounded-xl p-5 border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <span className="text-white font-medium">Service #{index + 1}</span>
        <button onClick={() => handleRemoveService(index)} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">

        <div>
          <Label className="text-gray-400 text-xs mb-1 block">Service Name</Label>
          <Input value={service.name} onChange={(e) => handleServiceChange(index, 'name', e.target.value)} className="bg-slate-700/50 border-white/10 text-white" placeholder="Service Name" />
        </div>

        <div>
          <Label className="text-gray-400 text-xs mb-1 block">Category</Label>
          <select value={service.service_category} onChange={(e) => handleServiceChange(index, 'service_category', e.target.value)} className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-3 py-2 text-white">
            <option>Gym</option><option>Car Services</option><option>Restaurant</option><option>Co-working</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <Label className="text-gray-400 text-xs mb-2 block">Price Type</Label>
          <div className="flex gap-3">
            {(['fixed', 'range'] as const).map((type) => (
              <button key={type} onClick={() => handlePriceTypeChange(index, type)}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${service.price_type === type ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-slate-700/50 border-white/10 text-gray-400 hover:border-cyan-500/50'}`}>
                {type === 'fixed' ? 'Fixed Price' : 'Price Range'}
              </button>
            ))}
          </div>
        </div>

        {service.price_type === 'fixed' && (
          <div>
            <Label className="text-gray-400 text-xs mb-1 block">Price (EGP)</Label>
            <Input
              type="number"
              value={service.price ?? 0}
              onChange={(e) => handleServiceChange(index, 'price', Number(e.target.value))}
              className="bg-slate-700/50 border-white/10 text-white"
              placeholder="0"
            />
          </div>
        )}

        {service.price_type === 'range' && (
          <>
            <div>
              <Label className="text-gray-400 text-xs mb-1 block">Min Price (EGP)</Label>
              <Input type="number" value={service.min_price ?? 0} onChange={(e) => handleServiceChange(index, 'min_price', Number(e.target.value))} className="bg-slate-700/50 border-white/10 text-white" placeholder="0" />
            </div>
            <div>
              <Label className="text-gray-400 text-xs mb-1 block">Max Price (EGP)</Label>
              <Input type="number" value={service.max_price ?? 0} onChange={(e) => handleServiceChange(index, 'max_price', Number(e.target.value))} className="bg-slate-700/50 border-white/10 text-white" placeholder="0" />
            </div>
          </>
        )}

        <div>
          <Label className="text-gray-400 text-xs mb-1 block">Offer %</Label>
          <Input
            value={service.offer}
            onChange={(e) => handleServiceChange(index, 'offer', e.target.value)}
            className="bg-slate-700/50 border-white/10 text-white"
            placeholder="20%"
          />
        </div>

        <div className="md:col-span-2">
          <Label className="text-gray-400 text-xs mb-2 block">Pricing Summary</Label>
          <div className="flex items-center gap-3 bg-slate-700/30 rounded-xl p-4 border border-white/5">

            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 mb-1">Original Price</p>
              {service.price_type === 'fixed' ? (
                <p className="text-white text-lg">EGP {(service.price ?? 0).toLocaleString()}</p>
              ) : (
                <p className="text-white text-lg">
                  EGP {(service.min_price ?? 0).toLocaleString()} – {(service.max_price ?? 0).toLocaleString()}
                </p>
              )}
            </div>

            {service.offer !== '0%' && parseOfferPercent(service.offer) > 0 ? (
              <>
                <div className="flex flex-col items-center gap-1">
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full text-xs">
                    -{service.offer}
                  </span>
                  <span className="text-gray-500 text-lg">→</span>
                </div>

                <div className="flex-1 text-center">
                  <p className="text-xs text-gray-500 mb-1">After Offer</p>
                  {service.price_type === 'fixed' ? (
                    <p className="text-green-400 text-lg">EGP {service.price_after.toLocaleString()}</p>
                  ) : (
                    <p className="text-green-400 text-lg">
                      {(() => {
                        const percent = parseOfferPercent(service.offer);
                        const minAfter = Math.round((service.min_price ?? 0) * (1 - percent / 100));
                        const maxAfter = Math.round((service.max_price ?? 0) * (1 - percent / 100));
                        return `EGP ${minAfter.toLocaleString()} – ${maxAfter.toLocaleString()}`;
                      })()}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-500 mb-1">After Offer</p>
                <p className="text-gray-500 text-sm">No offer applied</p>
              </div>
            )}

          </div>
        </div>

        <div>
          <Label className="text-gray-400 text-xs mb-1 block">Duration</Label>
          <Input value={service.duration} onChange={(e) => handleServiceChange(index, 'duration', e.target.value)} className="bg-slate-700/50 border-white/10 text-white" placeholder="e.g. 1 Month" />
        </div>

        <div className="md:col-span-2">
          <Label className="text-gray-400 text-xs mb-1 block">Description</Label>
          <Textarea value={service.description} onChange={(e) => handleServiceChange(index, 'description', e.target.value)} rows={2} className="bg-slate-700/50 border-white/10 text-white resize-none" placeholder="Describe this service..." />
        </div>

      </div>
    </div>
  );

  // const ServicesSection = () => (
  //   <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
  //     <div className="flex items-center justify-between mb-6">
  //       <h3 className="text-xl text-white">Services</h3>
  //       <Button onClick={handleAddService} className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-[12px] flex items-center gap-2 text-sm">
  //         <Plus className="w-4 h-4" />Add Service
  //       </Button>
  //     </div>
  //     {services.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No services added yet.</p>}
  //     <div className="space-y-6">{services.map((service, index) => renderServiceCard(service, index))}</div>
  //   </div>
  // );

  // ── Preview Modal ─────────────────────────────────────────
const PreviewModal = () => (
  <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pb-20">
      <div className="relative w-full h-[350px] lg:h-[450px] bg-gray-900">
        <img src={businessPhotos[0] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'} alt={profileData.businessName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <button onClick={() => setShowPreview(false)} className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full z-20">
          <X className="w-6 h-6" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto flex items-end justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-xl overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                    <span className="text-2xl lg:text-3xl">{profileData.businessName.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl lg:text-5xl text-white mb-3 drop-shadow-lg">{profileData.businessName}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className={`w-5 h-5 ${idx < 4 ? 'fill-orange-400 text-orange-400' : 'fill-gray-400 text-gray-400'}`} />
                    ))}
                  </div>
                  <span className="text-white text-lg">4.8 (235 reviews)</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-white">
                  <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-sm">Claimed</span>
                  <span className="text-lg">•</span>
                  <span className="text-lg">{profileData.category}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-white">
                  <span className="border-2 bg-green-500/20 border-green-400 text-green-100 px-3 py-1 rounded-full text-sm">Open Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <p className="text-gray-600 leading-relaxed">{profileData.description}</p>
            <div className="h-px bg-gray-200" />

            {/* Amenities */}
            <div className="p-6 border-2 border-cyan-100 rounded-[18px] bg-white">
              <h3 className="text-xl mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profileData.amenities.split(',').map((a, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-100 to-purple-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-cyan-600" />
                    </div>
                    <span className="capitalize text-sm">{a.trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Services Preview */}
            {services.length > 0 && (
              <div className="p-6 border-2 border-cyan-100 rounded-[18px] bg-white">
                <h3 className="text-xl mb-4">Services</h3>
                <div className="space-y-4">
                  {services.map((service) => {
                    const percent = parseOfferPercent(service.offer);
                    const hasOffer = percent > 0 && service.offer !== '0%';
                    const minAfter = hasOffer ? Math.round((service.min_price ?? 0) * (1 - percent / 100)) : (service.min_price ?? 0);
                    const maxAfter = hasOffer ? Math.round((service.max_price ?? 0) * (1 - percent / 100)) : (service.max_price ?? 0);

                    return (
                      <div key={service.service_id} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-800">{service.name || 'Unnamed Service'}</span>
                            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">{service.service_category}</span>
                          </div>
                          {service.duration && <p className="text-sm text-gray-500 mb-1">Duration: {service.duration}</p>}
                          {service.description && <p className="text-sm text-gray-600 mt-2">{service.description}</p>}
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          {service.price_type === 'fixed' ? (
                            <>
                              {hasOffer && <p className="text-xs text-gray-400 line-through">EGP {(service.price ?? 0).toLocaleString()}</p>}
                              <p className="text-lg font-semibold text-cyan-600">EGP {service.price_after > 0 ? service.price_after.toLocaleString() : (service.price ?? 0).toLocaleString()}</p>
                            </>
                          ) : (
                            <>
                              {hasOffer && <p className="text-xs text-gray-400 line-through">EGP {(service.min_price ?? 0).toLocaleString()} – {(service.max_price ?? 0).toLocaleString()}</p>}
                              <p className="text-lg font-semibold text-cyan-600">EGP {minAfter.toLocaleString()} – {maxAfter.toLocaleString()}</p>
                            </>
                          )}
                          {hasOffer && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{service.offer} OFF</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hours */}
            <div className="p-6 border-2 border-cyan-100 rounded-[18px] bg-white">
              <h3 className="text-xl mb-4">Hours of Operation</h3>
              <div className="space-y-2">
                {profileData.working_hours.map((item) => {
                  const isOpen24 = item.open.toLowerCase().includes('open 24') || item.close.toLowerCase().includes('open 24');
                  const isClosed = item.open.toLowerCase().includes('closed') || item.close.toLowerCase().includes('closed');
                  return (
                    <div key={item.day} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-700 font-medium w-28">{item.day}</span>
                      {isOpen24 ? (
                        <span className="text-green-600 text-sm font-medium">Open 24 Hours</span>
                      ) : isClosed ? (
                        <span className="text-red-400 text-sm">Closed</span>
                      ) : (
                        <span className="text-gray-600 text-sm">{item.open} – {item.close}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ✅ Photos */}
            {businessPhotos.length > 0 && (
              <div className="p-6 border-2 border-cyan-100 rounded-[18px] bg-white">
                <h3 className="text-xl mb-4">Photos ({businessPhotos.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {businessPhotos.map((photo, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={photo}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ✅ Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 border-2 border-cyan-100 rounded-[18px] bg-white sticky top-6">
              <h3 className="text-xl mb-4">Contact Information</h3>
              <div className="space-y-4">

                {/* ✅ Location في سطر واحد */}
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                  <p className="text-sm text-gray-900">
                    {[profileData.address, profileData.district, profileData.city]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>

                {/* ✅ Email */}
                {profileData.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                    <a href={`mailto:${profileData.email}`} className="text-sm text-cyan-600 hover:underline break-all">
                      {profileData.email}
                    </a>
                  </div>
                )}

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                  <span className="text-sm text-gray-900">{profileData.phone}</span>
                </div>

                {profileData.establishedYear && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                    <span className="text-sm text-gray-900">Est. {profileData.establishedYear}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

  // ── Main Form ─────────────────────────────────────────────
  return (
    <>
      <div className="space-y-6">

        {/* Preview Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowPreview(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-[18px] border border-white/20 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />Preview Profile
          </Button>
        </div>

        {/* Logo */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-cyan-500/30">
          <h3 className="text-xl text-white mb-4">Business Logo</h3>
          <div className="relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 group">
            <div className="w-full h-full bg-white rounded-full shadow-xl overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                  <span className="text-2xl lg:text-3xl">{profileData.businessName.charAt(0)}</span>
                </div>
              )}
            </div>
            {/* ✅ زرار تغيير الـ logo */}
            <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>
          </div>
        </div>

        {/* Registration Details (read-only) */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl text-white">Business Registration Details</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">These details cannot be edited. Contact support if corrections are needed.</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
              <Label className="text-gray-400 text-xs mb-1 block">Business ID</Label>
              <div className="text-white flex items-center gap-2"><Hash className="w-4 h-4 text-cyan-400" />{profileData.businessId}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
              <Label className="text-gray-400 text-xs mb-1 block">Tax Registration Number</Label>
              <div className="text-white flex items-center gap-2"><FileText className="w-4 h-4 text-cyan-400" />{profileData.taxRegistrationNumber}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
              <Label className="text-gray-400 text-xs mb-1 block">Owner ID</Label>
              <div className="text-white flex items-center gap-2"><User className="w-4 h-4 text-cyan-400" />{profileData.ownerId}</div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl text-white mb-6">Basic Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="businessName" className="text-white mb-2 block">Business Name *</Label>
              <Input id="businessName" value={profileData.businessName} onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })} className="bg-slate-800/50 border-white/10 text-white" />
            </div>
            <div>
              <Label htmlFor="category" className="text-white mb-2 block">Category *</Label>
              <select id="category" value={profileData.category} onChange={(e) => setProfileData({ ...profileData, category: e.target.value })} className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500/50 focus:outline-none">
                <option>Gyms & Fitness</option><option>Car Services</option><option>Restaurants & Cafes</option><option>Co-working Spaces</option>
              </select>
            </div>
            <div>
              <Label htmlFor="ownerName" className="text-white mb-2 block">Owner Name *</Label>
              <Input id="ownerName" value={profileData.ownerName} onChange={(e) => setProfileData({ ...profileData, ownerName: e.target.value })} className="bg-slate-800/50 border-white/10 text-white" />
            </div>



          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl text-white mb-6">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="email" className="text-white mb-2 block flex items-center gap-2"><Mail className="w-4 h-4 text-cyan-400" />Email Address *</Label>
              <Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className="bg-slate-800/50 border-white/10 text-white" />
            </div>
            <div>
              <Label htmlFor="phone" className="text-white mb-2 block flex items-center gap-2"><Phone className="w-4 h-4 text-cyan-400" />Phone Number *</Label>
              <Input id="phone" type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="bg-slate-800/50 border-white/10 text-white" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl text-white mb-6 flex items-center gap-2"><MapPin className="w-5 h-5 text-cyan-400" />Location Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="address" className="text-white mb-2 block">Address *</Label>
              <Input id="address" value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} className="bg-slate-800/50 border-white/10 text-white" />
            </div>
            <div>
              <Label htmlFor="city" className="text-white mb-2 block">City *</Label>
              <select id="city" value={profileData.city} onChange={(e) => setProfileData({ ...profileData, city: e.target.value })} className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500/50 focus:outline-none">
                {egyptianCities.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="location_url" className="text-white mb-2 block">Google Maps URL</Label>
              <Input id="location_url" value={profileData.location_url_on_maps} onChange={(e) => setProfileData({ ...profileData, location_url_on_maps: e.target.value })} className="bg-slate-800/50 border-white/10 text-white" placeholder="https://maps.app.goo.gl/..." />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl text-white mb-6">Business Description</h3>
          <Label htmlFor="description" className="text-white mb-2 block">About Your Business *</Label>
          <Textarea id="description" value={profileData.description} onChange={(e) => setProfileData({ ...profileData, description: e.target.value })} rows={6} className="bg-slate-800/50 border-white/10 text-white resize-none" />
          <p className="text-xs text-gray-500 mt-2">{profileData.description.length} characters</p>
        </div>

        {/* ✅ Operating Hours — unified handler */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />Operating Hours
          </h3>
          <div className="space-y-4">
            {profileData.working_hours.map((item, index) => (
              <div key={item.day} className="grid grid-cols-3 gap-3 items-center">
                <div className="text-white font-medium">{item.day}</div>
                <Input
                  value={item.open}
                  onChange={(e) => handleWorkingHourChange(index, 'open', e.target.value)}
                  className="bg-slate-800/50 border-white/10 text-white"
                  placeholder="Open time"
                />
                <Input
                  value={item.close}
                  onChange={(e) => handleWorkingHourChange(index, 'close', e.target.value)}
                  className="bg-slate-800/50 border-white/10 text-white"
                  placeholder="Close time"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        {/* <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl text-white mb-6 flex items-center gap-2"><DollarSign className="w-5 h-5 text-cyan-400" />Pricing Information</h3>
          <Label htmlFor="pricingRange" className="text-white mb-2 block">Price Range *</Label>
          <Input id="pricingRange" value={profileData.pricingRange} onChange={(e) => setProfileData({ ...profileData, pricingRange: e.target.value })} className="bg-slate-800/50 border-white/10 text-white" placeholder="e.g., EGP 500 - EGP 2,000/month" />
        </div> */}

        {/* Amenities */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl text-white mb-6">Amenities</h3>
          <Label htmlFor="amenities" className="text-white mb-2 block">Amenities Offered *</Label>
          <Textarea id="amenities" value={profileData.amenities} onChange={(e) => setProfileData({ ...profileData, amenities: e.target.value })} rows={3} className="bg-slate-800/50 border-white/10 text-white resize-none" placeholder="Personal Training, Group Classes, Yoga..." />
          <p className="text-xs text-gray-500 mt-1">Separate each amenity with a comma</p>
        </div>

        {/* Services */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl text-white">Services</h3>
            <Button onClick={handleAddService} className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-[12px] flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />Add Service
            </Button>
          </div>
          {services.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No services added yet.</p>}
          <div className="space-y-6">{services.map((service, index) => renderServiceCard(service, index))}</div>
        </div>
        {/* Photo Gallery */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl text-white mb-6 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-cyan-400" />Photo Gallery</h3>
          <p className="text-gray-400 text-sm mb-4">Upload up to 10 photos (max 5MB each)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
            {businessPhotos.map((photo, index) => (
              <div key={index} className="relative aspect-square bg-slate-800/50 rounded-lg overflow-hidden group">
                <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                <button onClick={() => handleRemovePhoto(index)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {businessPhotos.length < 10 && (
              <label className="aspect-square bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-lg border-2 border-dashed border-cyan-500/30 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all group">
                <Camera className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs text-gray-400">Add Photo</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500">{businessPhotos.length} / 10 photos uploaded</p>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pb-8">
          <Button onClick={handleSaveChanges} disabled={isSaving}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-12 py-4 rounded-[18px] flex items-center gap-2 text-lg">
            <Save className="w-5 h-5" />
            {isSaving ? 'Submitting Request...' : 'Submit Update Request'}
          </Button>
        </div>
      </div>

      {showPreview && <PreviewModal />}
    </>
  );
};