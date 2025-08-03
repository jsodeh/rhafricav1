import React, { useState } from 'react';
import { Bell, Check, Trash2, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    preferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
  } = useNotifications();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Mark all read
                </Button>
              )}
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 w-6 p-0"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Notification Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Notification Methods</h4>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <Switch
                          id="email-notifications"
                          checked={preferences.email}
                          onCheckedChange={(checked) =>
                            updatePreferences({ email: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <Switch
                          id="push-notifications"
                          checked={preferences.push}
                          onCheckedChange={(checked) =>
                            updatePreferences({ push: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                        <Switch
                          id="sms-notifications"
                          checked={preferences.sms}
                          onCheckedChange={(checked) =>
                            updatePreferences({ sms: checked })
                          }
                        />
                      </div>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Notification Categories</h4>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="property-notifications">Property Updates</Label>
                        <Switch
                          id="property-notifications"
                          checked={preferences.categories.property}
                          onCheckedChange={(checked) =>
                            updatePreferences({
                              categories: {
                                ...preferences.categories,
                                property: checked,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="booking-notifications">Booking Updates</Label>
                        <Switch
                          id="booking-notifications"
                          checked={preferences.categories.booking}
                          onCheckedChange={(checked) =>
                            updatePreferences({
                              categories: {
                                ...preferences.categories,
                                booking: checked,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="payment-notifications">Payment Updates</Label>
                        <Switch
                          id="payment-notifications"
                          checked={preferences.categories.payment}
                          onCheckedChange={(checked) =>
                            updatePreferences({
                              categories: {
                                ...preferences.categories,
                                payment: checked,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="message-notifications">Messages</Label>
                        <Switch
                          id="message-notifications"
                          checked={preferences.categories.message}
                          onCheckedChange={(checked) =>
                            updatePreferences({
                              categories: {
                                ...preferences.categories,
                                message: checked,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="system-notifications">System Updates</Label>
                        <Switch
                          id="system-notifications"
                          checked={preferences.categories.system}
                          onCheckedChange={(checked) =>
                            updatePreferences({
                              categories: {
                                ...preferences.categories,
                                system: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.slice(0, 10).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-3 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
          
          {notifications.length > 10 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-blue-600 hover:text-blue-700">
                View all notifications
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationCenter; 