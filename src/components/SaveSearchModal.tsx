import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { BookmarkPlus, Bell, Mail, Smartphone } from 'lucide-react';

interface SearchFilters {
  location: string;
  saleType: string;
  priceMin: number;
  priceMax: number;
  bedrooms: string;
  bathrooms: string;
  homeType: string[];
  sqftMin: number;
  sqftMax: number;
  yearBuiltMin: number;
  yearBuiltMax: number;
  lotSizeMin: number;
  lotSizeMax: number;
  parking: string;
  amenities: string[];
  keywords: string;
  locationRadius: number;
  listingDate: string;
  priceReduced: boolean;
  openHouse: boolean;
  virtualTour: boolean;
  newConstruction: boolean;
  foreclosure: boolean;
  furnished: boolean;
}

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchFilters: SearchFilters;
  resultCount?: number;
}

export const SaveSearchModal: React.FC<SaveSearchModalProps> = ({
  isOpen,
  onClose,
  searchFilters,
  resultCount = 0,
}) => {
  const [searchName, setSearchName] = useState('');
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [alertFrequency, setAlertFrequency] = useState('daily');
  const [alertMethods, setAlertMethods] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuth();

  const generateSearchName = () => {
    let name = '';
    if (searchFilters.location) {
      name += `${searchFilters.location} `;
    }
    if (searchFilters.homeType.length > 0) {
      name += `${searchFilters.homeType.join(', ')} `;
    }
    if (searchFilters.bedrooms) {
      name += `${searchFilters.bedrooms} bed `;
    }
    if (searchFilters.bathrooms) {
      name += `${searchFilters.bathrooms} bath `;
    }
    name += `(${searchFilters.saleType})`;
    return name.trim();
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please login to save searches');
      return;
    }

    if (!searchName.trim()) {
      alert('Please enter a name for your search');
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, this would save to backend
      const savedSearch = {
        id: Date.now().toString(),
        name: searchName,
        filters: searchFilters,
        userId: user.id,
        createdAt: new Date().toISOString(),
        alertSettings: enableAlerts ? {
          frequency: alertFrequency,
          methods: alertMethods,
        } : null,
        isPublic,
        resultCount,
      };

      // Save to localStorage for demo purposes
      const existingSaves = JSON.parse(localStorage.getItem('savedSearches') || '[]');
      existingSaves.push(savedSearch);
      localStorage.setItem('savedSearches', JSON.stringify(existingSaves));

      // Show success message
      alert(`Search "${searchName}" saved successfully!${enableAlerts ? ' You will receive alerts for new properties.' : ''}`);
      
      onClose();
    } catch (error) {
      console.error('Error saving search:', error);
      alert('Failed to save search. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSearchName('');
    setEnableAlerts(true);
    setAlertFrequency('daily');
    setAlertMethods({ email: true, push: true, sms: false });
    setIsPublic(false);
    onClose();
  };

  React.useEffect(() => {
    if (isOpen && !searchName) {
      setSearchName(generateSearchName());
    }
  }, [isOpen, searchFilters]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkPlus className="h-5 w-5" />
            Save Search
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Summary */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900">
              {resultCount > 0 ? `${resultCount} properties found` : 'Current search'}
            </div>
            <div className="text-xs text-blue-700 mt-1">
              {searchFilters.location && `📍 ${searchFilters.location}`}
              {searchFilters.homeType.length > 0 && ` • ${searchFilters.homeType.join(', ')}`}
              {searchFilters.bedrooms && ` • ${searchFilters.bedrooms} bed`}
              {searchFilters.bathrooms && ` • ${searchFilters.bathrooms} bath`}
            </div>
          </div>

          {/* Search Name */}
          <div>
            <Label htmlFor="searchName">Search Name</Label>
            <Input
              id="searchName"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="e.g. 3BR Houses in Lagos"
            />
          </div>

          {/* Alert Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableAlerts"
                checked={enableAlerts}
                onCheckedChange={(checked) => setEnableAlerts(checked as boolean)}
              />
              <Label htmlFor="enableAlerts" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Get alerts for new properties
              </Label>
            </div>

            {enableAlerts && (
              <div className="ml-6 space-y-3">
                {/* Alert Frequency */}
                <div>
                  <Label className="text-sm">Alert Frequency</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[
                      { value: 'instant', label: 'Instant' },
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                    ].map(freq => (
                      <Button
                        key={freq.value}
                        variant={alertFrequency === freq.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAlertFrequency(freq.value)}
                        className="h-8"
                      >
                        {freq.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Alert Methods */}
                <div>
                  <Label className="text-sm">Alert Methods</Label>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailAlerts"
                        checked={alertMethods.email}
                        onCheckedChange={(checked) =>
                          setAlertMethods(prev => ({ ...prev, email: checked as boolean }))
                        }
                      />
                      <Label htmlFor="emailAlerts" className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        Email notifications
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pushAlerts"
                        checked={alertMethods.push}
                        onCheckedChange={(checked) =>
                          setAlertMethods(prev => ({ ...prev, push: checked as boolean }))
                        }
                      />
                      <Label htmlFor="pushAlerts" className="flex items-center gap-2 text-sm">
                        <Bell className="h-3 w-3" />
                        Push notifications
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smsAlerts"
                        checked={alertMethods.sms}
                        onCheckedChange={(checked) =>
                          setAlertMethods(prev => ({ ...prev, sms: checked as boolean }))
                        }
                      />
                      <Label htmlFor="smsAlerts" className="flex items-center gap-2 text-sm">
                        <Smartphone className="h-3 w-3" />
                        SMS notifications
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked as boolean)}
            />
            <Label htmlFor="isPublic" className="text-sm">
              Make this search public (others can see and use it)
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !searchName.trim()}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : 'Save Search'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
