import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/Toast';
import { 
  CheckCircle, 
  Circle, 
  User, 
  MapPin, 
  Phone, 
  FileText, 
  Camera, 
  Shield,
  AlertTriangle,
  Clock,
  X
} from 'lucide-react';

interface ProfileTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  required: boolean;
  userTypes: string[];
  icon: React.ReactNode;
  action: string;
  onClick: () => void;
}

interface ProfileSetupProgressProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSetupProgress: React.FC<ProfileSetupProgressProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<ProfileTask[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEditor, setActiveEditor] = useState<null | 'basic_info' | 'profile_photo' | 'location_setup'>(null);
  const [step, setStep] = useState<number>(1);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      // seed editor fields
      setEditFullName(data?.full_name || '');
      setEditPhone(data?.phone || '');
      setEditLocation(data?.location || '');
      setEditAvatarUrl(data?.avatar_url || '');
      generateTasks(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTasks = async (profileData: any) => {
    const userType = user?.accountType?.toLowerCase() || 'buyer';
    console.log('Generating tasks for user type:', userType, 'Profile data:', profileData);
    
    // Check agent verification status if user is an agent
    let agentData = null;
    if (userType === 'agent') {
      const { data } = await supabase
        .from('real_estate_agents')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      agentData = data;
    }
    
    const allTasks: ProfileTask[] = [
      // Basic Profile Tasks (All Users except admin/super_admin)
      {
        id: 'basic_info',
        title: 'Complete basic information',
        description: 'Add your full name, phone number, and location',
        priority: 'high',
        completed: !!(profileData?.full_name && profileData?.phone && profileData?.location),
        required: true,
        userTypes: ['buyer', 'agent', 'owner'],
        icon: <User className="w-4 h-4" />,
        action: 'Complete profile',
        onClick: () => setActiveEditor('basic_info')
      },
      {
        id: 'profile_photo',
        title: 'Upload profile picture',
        description: 'Add a profile picture to make your account more personal',
        priority: 'medium',
        completed: !!(profileData?.avatar_url),
        required: false,
        userTypes: ['buyer', 'agent', 'owner'],
        icon: <Camera className="w-4 h-4" />,
        action: 'Upload photo',
        onClick: () => setActiveEditor('profile_photo')
      },
      {
        id: 'location_setup',
        title: 'Set your location preferences',
        description: 'Help us show you relevant properties in your area',
        priority: 'medium',
        completed: !!(profileData?.location),
        required: false,
        userTypes: ['buyer'],
        icon: <MapPin className="w-4 h-4" />,
        action: 'Set location',
        onClick: () => setActiveEditor('location_setup')
      },

      // Agent-Specific Tasks
      {
        id: 'agent_profile',
        title: 'Complete agent profile',
        description: 'Add your agency details, license, and experience',
        priority: 'high',
        completed: !!(agentData?.agency_name && agentData?.license_number),
        required: true,
        userTypes: ['agent'],
        icon: <FileText className="w-4 h-4" />,
        action: 'Complete profile',
        onClick: () => window.location.href = '/agent-dashboard'
      },
      {
        id: 'agent_verification',
        title: 'Agent verification status',
        description: agentData?.verification_status === 'verified' ? 'Your agent account is verified!' : 
                    agentData?.verification_status === 'rejected' ? 'Verification rejected - contact support' :
                    'Waiting for admin verification',
        priority: 'high',
        completed: agentData?.verification_status === 'verified',
        required: true,
        userTypes: ['agent'],
        icon: agentData?.verification_status === 'verified' ? <CheckCircle className="w-4 h-4" /> : 
              agentData?.verification_status === 'rejected' ? <X className="w-4 h-4" /> :
              <Clock className="w-4 h-4" />,
        action: agentData?.verification_status === 'verified' ? 'Verified' : 
               agentData?.verification_status === 'rejected' ? 'Contact support' : 'Pending',
        onClick: () => window.location.href = '/agent-dashboard'
      },

      // Owner/Landlord Tasks
      {
        id: 'property_ownership',
        title: 'Verify property ownership',
        description: 'Upload property documents to list your properties',
        priority: 'high',
        completed: false,
        required: true,
        userTypes: ['owner'],
        icon: <FileText className="w-4 h-4" />,
        action: 'Upload documents',
        onClick: () => window.location.href = '/owner/verification'
      },
      {
        id: 'first_property',
        title: 'List your first property',
        description: 'Add your first property listing to get started',
        priority: 'medium',
        completed: false,
        required: false,
        userTypes: ['owner', 'agent'],
        icon: <FileText className="w-4 h-4" />,
        action: 'Add property',
        onClick: () => window.location.href = '/properties/add'
      },

      // Professional Tasks
      {
        id: 'professional_verification',
        title: 'Professional verification',
        description: 'Submit your professional credentials and certifications',
        priority: 'high',
        completed: false,
        required: true,
        userTypes: ['professional'],
        icon: <Shield className="w-4 h-4" />,
        action: 'Submit credentials',
        onClick: () => window.location.href = '/professional/verification'
      },

      // Buyer/Renter Preferences
      {
        id: 'search_preferences',
        title: 'Set search preferences',
        description: 'Tell us what type of property you\'re looking for',
        priority: 'low',
        completed: !!(profileData?.preferences?.property_type),
        required: false,
        userTypes: ['buyer', 'renter'],
        icon: <MapPin className="w-4 h-4" />,
        action: 'Set preferences',
        onClick: () => window.location.href = '/profile/preferences'
      },

      // Email Verification (always show if not verified)
      {
        id: 'email_verification',
        title: 'Verify your email address',
        description: 'Confirm your email to secure your account',
        priority: 'high',
        completed: !!(user?.emailVerified),
        required: true,
        userTypes: ['all'],
        icon: <Shield className="w-4 h-4" />,
        action: 'Verify email',
        onClick: () => window.location.href = '/profile/verify-email'
      },

      // Account Security
      {
        id: 'account_security',
        title: 'Secure your account',
        description: 'Add additional security measures to protect your account',
        priority: 'medium',
        completed: false, // This could check for 2FA, strong password, etc.
        required: false,
        userTypes: ['all'],
        icon: <Shield className="w-4 h-4" />,
        action: 'Enhance security',
        onClick: () => window.location.href = '/profile/security'
      }
    ];

    // Filter tasks based on user type
    const relevantTasks = allTasks.filter(task => 
      task.userTypes.includes('all') || 
      task.userTypes.includes(userType) ||
      task.userTypes.some(type => userType.includes(type))
    );

    console.log('Relevant tasks:', relevantTasks.length, 'Completed:', relevantTasks.filter(task => task.completed).length);
    
    setTasks(relevantTasks);
    setCompletedCount(relevantTasks.filter(task => task.completed).length);
  };

  const getProgressPercentage = () => {
    if (tasks.length === 0) return 0;
    return Math.round((completedCount / tasks.length) * 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountStatus = () => {
    const userType = user?.accountType?.toLowerCase() || 'buyer';
    const requiredTasks = tasks.filter(task => task.required);
    const completedRequired = requiredTasks.filter(task => task.completed);
    
    if (['agent', 'owner', 'professional'].includes(userType)) {
      if (completedRequired.length < requiredTasks.length) {
        return {
          status: 'pending',
          message: 'Account pending verification',
          color: 'text-yellow-600',
          icon: <Clock className="w-4 h-4" />
        };
      }
      return {
        status: 'verified',
        message: 'Account verified',
        color: 'text-green-600',
        icon: <CheckCircle className="w-4 h-4" />
      };
    }
    
    return {
      status: 'active',
      message: 'Account active',
      color: 'text-blue-600',
      icon: <CheckCircle className="w-4 h-4" />
    };
  };

  if (!isOpen) return null;

  const saveProfileEdits = async () => {
    try {
      setSaving(true);
      const payload: any = {
        full_name: editFullName,
        phone: editPhone,
        location: editLocation,
        avatar_url: editAvatarUrl,
        user_id: user?.id,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase
        .from('user_profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;
      await fetchUserProfile();
      setActiveEditor(null);
      setStep((s) => Math.min(s + 1, 3));
      showSuccess('Profile updated');
    } catch (e: any) {
      console.error('Failed to save profile edits', e);
      showError(e?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const accountStatus = getAccountStatus();
  const priorityTasks = tasks.filter(task => task.priority === 'high' && !task.completed);
  const otherTasks = tasks.filter(task => task.priority !== 'high' || task.completed);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[92vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Setup Progress</CardTitle>
                <p className="text-sm text-gray-600">
                  {completedCount} of {tasks.length} completed
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{getProgressPercentage()}%</span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Progress value={getProgressPercentage()} className="mt-2" />
          {/* Multi-step indicator */}
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>1. Basic</span>
            <span className={`px-2 py-1 rounded ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>2. Photo & Location</span>
            <span className={`px-2 py-1 rounded ${step === 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>3. Verify</span>
          </div>
          
          {/* Account Status */}
          <div className={`flex items-center space-x-2 mt-2 ${accountStatus.color}`}>
            {accountStatus.icon}
            <span className="text-sm font-medium">{accountStatus.message}</span>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[65vh]">
          {activeEditor && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              {activeEditor === 'basic_info' && (
                <div className="space-y-3">
                  <h3 className="font-medium">Update Basic Information</h3>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Full Name</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Phone</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Location</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveProfileEdits} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                    <Button size="sm" variant="outline" onClick={() => setActiveEditor(null)}>Cancel</Button>
                  </div>
                </div>
              )}
              {activeEditor === 'profile_photo' && (
                <div className="space-y-3">
                  <h3 className="font-medium">Update Profile Photo</h3>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Avatar URL</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={editAvatarUrl} onChange={(e) => setEditAvatarUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveProfileEdits} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                    <Button size="sm" variant="outline" onClick={() => setActiveEditor(null)}>Cancel</Button>
                  </div>
                </div>
              )}
              {activeEditor === 'location_setup' && (
                <div className="space-y-3">
                  <h3 className="font-medium">Set Location Preferences</h3>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Location</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="City, State" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveProfileEdits} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                    <Button size="sm" variant="outline" onClick={() => setActiveEditor(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading profile...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Step 1: Basic info */}
              {step === 1 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-sm">Step 1: Basic details</h3>
                  <TaskItem key={'basic_info'} task={tasks.find(t=>t.id==='basic_info')!} />
                  <div className="flex justify-end">
                    <Button onClick={() => setStep(2)} disabled={!tasks.find(t=>t.id==='basic_info') || !tasks.find(t=>t.id==='basic_info')!.completed}>Continue</Button>
                  </div>
                </div>
              )}
              {/* Step 2: Photo & location */}
              {step === 2 && (
                <div>
                  <h3 className="font-medium text-sm mb-3">Step 2: Photo & Location</h3>
                  {['profile_photo','location_setup'].map(id => {
                    const t = tasks.find(t=>t.id===id);
                    return t ? <TaskItem key={t.id} task={t} /> : null;
                  })}
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={() => setStep(3)}>Continue</Button>
                  </div>
                </div>
              )}
              {/* Step 3: Verify */}
              {step === 3 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-sm">Step 3: Verify & Security</h3>
                  {['email_verification','account_security'].map(id => {
                    const t = tasks.find(t=>t.id===id);
                    return t ? <TaskItem key={t.id} task={t} /> : null;
                  })}
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button onClick={onClose}>Finish</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TaskItem: React.FC<{ task: ProfileTask }> = ({ task }) => {
  return (
    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        {task.completed ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5 text-gray-400" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          {task.icon}
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {task.title}
          </h4>
          <Badge className={`text-xs ${task.completed ? 'bg-green-100 text-green-800' : getPriorityColor(task.priority)}`}>
            {task.completed ? 'Done' : task.priority}
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mb-2">{task.description}</p>
        {!task.completed && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            onClick={task.onClick}
          >
            {task.action}
          </Button>
        )}
      </div>
    </div>
  );
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default ProfileSetupProgress;