import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Home, 
  DollarSign, 
  Upload, 
  X, 
  Plus,
  Bed,
  Bath,
  Square,
  Calendar,
  Shield
} from 'lucide-react';

interface PropertyFormData {
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area_sqm: string;
  address: string;
  city: string;
  state: string;
  year_built: string;
  parking_spaces: string;
  furnishing_status: string;
  amenities: string[];
  images: File[];
}

const AddProperty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    property_type: '',
    listing_type: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area_sqm: '',
    address: '',
    city: '',
    state: '',
    year_built: '',
    parking_spaces: '',
    furnishing_status: '',
    amenities: [],
    images: []
  });

  const propertyTypes = [
    'apartment',
    'house',
    'duplex',
    'penthouse',
    'land',
    'commercial',
    'office'
  ];

  const listingTypes = [
    { value: 'sale', label: 'For Sale' },
    { value: 'rent', label: 'For Rent' }
  ];

  const furnishingOptions = [
    'Fully Furnished',
    'Semi Furnished',
    'Unfurnished'
  ];

  const commonAmenities = [
    'Swimming Pool',
    'Gym',
    'Security',
    'Generator',
    'Parking',
    'Garden',
    'Balcony',
    'Elevator',
    'Air Conditioning',
    'Water Treatment',
    'CCTV',
    'Playground',
    'Shopping Mall',
    'School Nearby',
    'Hospital Nearby'
  ];

  const nigerianStates = [
    'Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Delta', 'Edo', 'Ogun',
    'Kaduna', 'Kwara', 'Plateau', 'Borno', 'Imo', 'Cross River', 'Osun',
    'Bauchi', 'Jigawa', 'Enugu', 'Kebbi', 'Sokoto', 'Katsina', 'Yobe',
    'Taraba', 'Adamawa', 'Gombe', 'Benue', 'Niger', 'Anambra', 'Zamfara',
    'Nasarawa', 'Akwa Ibom', 'Ebonyi', 'Kogi', 'Abia', 'Bayelsa', 'Ekiti'
  ];

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 10 images.",
        variant: "destructive",
      });
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.property_type && formData.listing_type;
      case 2:
        return formData.price && formData.address && formData.city && formData.state;
      case 3:
        return formData.description;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before continuing.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add a property.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const image of formData.images) {
        const fileName = `${Date.now()}-${image.name}`;
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, image);

        if (error) {
          console.error('Image upload error:', error);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        imageUrls.push(publicUrl);
      }

      // Create property record
      const propertyData = {
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : 0,
        furnishing_status: formData.furnishing_status || null,
        amenities: formData.amenities,
        images: imageUrls,
        owner_id: user.id,
        featured: false,
        verified: false,
        seo_slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };

      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Property Added Successfully",
        description: "Your property has been listed and is pending verification.",
      });

      navigate(`/properties/${data.id}`);

    } catch (error: any) {
      console.error('Error adding property:', error);
      toast({
        title: "Error Adding Property",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-base font-medium">Property Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Modern 3-Bedroom Apartment in Victoria Island"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label className="text-base font-medium">Property Type *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('property_type', type)}
                    className={`p-3 rounded-lg border-2 transition-all capitalize ${
                      formData.property_type === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Listing Type *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {listingTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('listing_type', type.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.listing_type === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="price" className="text-base font-medium">
                Price (₦) * {formData.listing_type === 'rent' && '(Annual)'}
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="e.g., 45000000"
                className="mt-2"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms" className="text-base font-medium">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  placeholder="3"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bathrooms" className="text-base font-medium">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  placeholder="2"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="area_sqm" className="text-base font-medium">Area (sqm)</Label>
                <Input
                  id="area_sqm"
                  type="number"
                  value={formData.area_sqm}
                  onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                  placeholder="150"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-base font-medium">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="e.g., 15 Ahmadu Bello Way"
                className="mt-2"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="text-base font-medium">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g., Lagos"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-base font-medium">State *</Label>
                <select
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select State</option>
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="description" className="text-base font-medium">Property Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your property in detail..."
                className="mt-2 min-h-[120px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year_built" className="text-base font-medium">Year Built</Label>
                <Input
                  id="year_built"
                  type="number"
                  value={formData.year_built}
                  onChange={(e) => handleInputChange('year_built', e.target.value)}
                  placeholder="2022"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="parking_spaces" className="text-base font-medium">Parking Spaces</Label>
                <Input
                  id="parking_spaces"
                  type="number"
                  value={formData.parking_spaces}
                  onChange={(e) => handleInputChange('parking_spaces', e.target.value)}
                  placeholder="2"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Furnishing Status</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {furnishingOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleInputChange('furnishing_status', option)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.furnishing_status === option
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {commonAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`p-2 text-sm rounded-lg border transition-all ${
                      formData.amenities.includes(amenity)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Property Images</Label>
              <p className="text-sm text-gray-600 mt-1">Upload up to 10 high-quality images of your property</p>
              
              <div className="mt-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload images</span>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Property ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Review Your Listing</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Title:</strong> {formData.title}</p>
                <p><strong>Type:</strong> {formData.property_type} for {formData.listing_type}</p>
                <p><strong>Price:</strong> ₦{formData.price ? parseInt(formData.price).toLocaleString() : '0'}</p>
                <p><strong>Location:</strong> {formData.address}, {formData.city}, {formData.state}</p>
                <p><strong>Images:</strong> {formData.images.length} uploaded</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Property</h1>
          <p className="text-gray-600">List your property and reach thousands of potential buyers or tenants</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-full h-1 mx-4 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Basic Info</span>
            <span>Details</span>
            <span>Description</span>
            <span>Images</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Step {currentStep} of 4: {
                currentStep === 1 ? 'Basic Information' :
                currentStep === 2 ? 'Property Details' :
                currentStep === 3 ? 'Description & Features' :
                'Images & Review'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Publishing...' : 'Publish Property'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddProperty;