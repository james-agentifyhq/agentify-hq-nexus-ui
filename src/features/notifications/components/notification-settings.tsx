'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bell, Moon, Volume2, Mail, Smartphone, Monitor, HelpCircle, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationSettingsProps {
  workspaceId: Id<'workspaces'>;
  userId: Id<'users'>;
  className?: string;
}

interface GlobalPreferences {
  mentions: boolean;
  directMessages: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  mobile: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
}

interface ChannelPreference {
  channelId: Id<'channels'>;
  channelName?: string;
  mentions: 'inherit' | 'enabled' | 'disabled';
  allMessages: 'inherit' | 'enabled' | 'disabled';
  threads: 'inherit' | 'enabled' | 'disabled';
  keywords: string[];
  mutedUntil?: number;
}

/**
 * Notification Settings Component
 * Story 1.2 AC4: Control @mention notifications per channel and globally
 */
export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  workspaceId,
  userId,
  className,
}) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [keywordInput, setKeywordInput] = useState('');
  const [timeError, setTimeError] = useState<string | null>(null);

  // Fetch current preferences
  const preferences = useQuery(api.notificationPreferences.getByUserWorkspace, {
    userId,
    workspaceId,
  });

  // Fetch workspace channels for channel preferences
  const channels = useQuery(api.channels.get, { workspaceId });

  // Mutation functions
  const updateGlobalPrefs = useMutation(api.notificationPreferences.updateGlobal);
  const updateChannelPrefs = useMutation(api.notificationPreferences.updateChannel);
  const createDefaults = useMutation(api.notificationPreferences.createDefaults);

  // Initialize preferences if they don't exist
  useEffect(() => {
    if (preferences === null) {
      createDefaults({ userId, workspaceId });
    }
  }, [preferences, createDefaults, userId, workspaceId]);

  const showSaveStatus = useCallback((status: 'saved' | 'error') => {
    setSaveStatus(status);
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, []);

  const handleGlobalPreferenceChange = useCallback(async (
    key: keyof GlobalPreferences,
    value: any
  ) => {
    if (!preferences) return;

    setSaveStatus('saving');
    try {
      await updateGlobalPrefs({
        userId,
        workspaceId,
        preferences: { [key]: value },
      });
      showSaveStatus('saved');
    } catch (error) {
      console.error('Failed to update global preference:', error);
      showSaveStatus('error');
    }
  }, [preferences, updateGlobalPrefs, userId, workspaceId, showSaveStatus]);

  const handleChannelPreferenceChange = useCallback(async (
    channelId: Id<'channels'>,
    key: string,
    value: any
  ) => {
    setSaveStatus('saving');
    try {
      await updateChannelPrefs({
        userId,
        workspaceId,
        channelId,
        preferences: { [key]: value },
      });
      showSaveStatus('saved');
    } catch (error) {
      console.error('Failed to update channel preference:', error);
      showSaveStatus('error');
    }
  }, [updateChannelPrefs, userId, workspaceId, showSaveStatus]);

  const handleMuteChannel = useCallback(async (channelId: Id<'channels'>, duration: number) => {
    const mutedUntil = Date.now() + duration;
    await handleChannelPreferenceChange(channelId, 'mutedUntil', mutedUntil);
  }, [handleChannelPreferenceChange]);

  const handleUnmuteChannel = useCallback(async (channelId: Id<'channels'>) => {
    await handleChannelPreferenceChange(channelId, 'mutedUntil', null);
  }, [handleChannelPreferenceChange]);

  const addKeyword = useCallback(async (channelId: Id<'channels'>, keyword: string) => {
    if (!preferences || !keyword.trim()) return;

    const channelPref = preferences.channelPreferences.find(cp => cp.channelId === channelId);
    const currentKeywords = channelPref?.keywords || [];

    if (!currentKeywords.includes(keyword.trim())) {
      const newKeywords = [...currentKeywords, keyword.trim()];
      await handleChannelPreferenceChange(channelId, 'keywords', newKeywords);
    }
  }, [preferences, handleChannelPreferenceChange]);

  const removeKeyword = useCallback(async (channelId: Id<'channels'>, keywordToRemove: string) => {
    if (!preferences) return;

    const channelPref = preferences.channelPreferences.find(cp => cp.channelId === channelId);
    const currentKeywords = channelPref?.keywords || [];
    const newKeywords = currentKeywords.filter(k => k !== keywordToRemove);

    await handleChannelPreferenceChange(channelId, 'keywords', newKeywords);
  }, [preferences, handleChannelPreferenceChange]);

  const validateTimeFormat = useCallback((time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }, []);

  const handleQuietHoursChange = useCallback(async (field: string, value: any) => {
    if (!preferences) return;

    if (field === 'startTime' || field === 'endTime') {
      if (!validateTimeFormat(value)) {
        setTimeError('Invalid time format. Use HH:mm (e.g., 22:00)');
        return;
      } else {
        setTimeError(null);
      }
    }

    const newQuietHours = {
      ...preferences.globalPreferences.quietHours,
      [field]: value,
    };

    await handleGlobalPreferenceChange('quietHours', newQuietHours);
  }, [preferences, handleGlobalPreferenceChange, validateTimeFormat]);

  if (!preferences) {
    return (
      <div data-testid="notification-settings-panel" className="p-6">
        <div className="animate-spin w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full mx-auto" />
      </div>
    );
  }

  const getChannelPreference = (channelId: Id<'channels'>): ChannelPreference => {
    const channel = channels?.find(c => c._id === channelId);
    const channelPref = preferences.channelPreferences.find(cp => cp.channelId === channelId);

    return {
      channelId,
      channelName: channel?.name || 'Unknown Channel',
      mentions: channelPref?.mentions || 'inherit',
      allMessages: channelPref?.allMessages || 'disabled',
      threads: channelPref?.threads || 'enabled',
      keywords: channelPref?.keywords || [],
      mutedUntil: channelPref?.mutedUntil,
    };
  };

  const isChannelMuted = (mutedUntil?: number): boolean => {
    return mutedUntil ? mutedUntil > Date.now() : false;
  };

  const formatMuteDuration = (mutedUntil: number): string => {
    const remaining = mutedUntil - Date.now();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <TooltipProvider>
      <div data-testid="notification-settings-panel" className={cn("space-y-6", className)}>
        {/* Save Status Indicator */}
        {saveStatus !== 'idle' && (
          <div
            data-testid="settings-saved-indicator"
            className={cn(
              "fixed top-4 right-4 px-4 py-2 rounded-md text-sm font-medium z-50",
              saveStatus === 'saving' && "bg-blue-100 text-blue-800",
              saveStatus === 'saved' && "bg-green-100 text-green-800",
              saveStatus === 'error' && "bg-red-100 text-red-800"
            )}
          >
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Settings saved'}
            {saveStatus === 'error' && 'Error saving settings'}
          </div>
        )}

        {/* Global Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Global Notification Preferences
            </CardTitle>
            <CardDescription>
              Control your default notification settings across all channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mention Notifications */}
            <div data-testid="pref-mentions" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="mentions">@Mention notifications</Label>
                <Tooltip>
                  <TooltipTrigger data-testid="pref-mentions-help">
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent data-testid="mentions-tooltip">
                    <p>Get notified when someone mentions your @username</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch
                id="mentions"
                checked={preferences.globalPreferences.mentions}
                onCheckedChange={(checked) => handleGlobalPreferenceChange('mentions', checked)}
              />
            </div>

            {/* Direct Messages */}
            <div data-testid="pref-direct-messages" className="flex items-center justify-between">
              <Label htmlFor="directMessages">Direct message notifications</Label>
              <Switch
                id="directMessages"
                checked={preferences.globalPreferences.directMessages}
                onCheckedChange={(checked) => handleGlobalPreferenceChange('directMessages', checked)}
              />
            </div>

            <Separator />

            {/* Sound Notifications */}
            <div data-testid="pref-sound" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <Label htmlFor="sound">Sound notifications</Label>
              </div>
              <Switch
                id="sound"
                checked={preferences.globalPreferences.sound}
                onCheckedChange={(checked) => handleGlobalPreferenceChange('sound', checked)}
              />
            </div>

            {/* Desktop Notifications */}
            <div data-testid="pref-desktop" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <Label htmlFor="desktop">Desktop notifications</Label>
              </div>
              <Switch
                id="desktop"
                checked={preferences.globalPreferences.desktop}
                onCheckedChange={(checked) => handleGlobalPreferenceChange('desktop', checked)}
              />
            </div>

            {/* Email Notifications */}
            <div data-testid="pref-email" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Label htmlFor="email">Email notifications</Label>
              </div>
              <Switch
                id="email"
                checked={preferences.globalPreferences.email}
                onCheckedChange={(checked) => handleGlobalPreferenceChange('email', checked)}
              />
            </div>

            {/* Mobile Notifications */}
            <div data-testid="pref-mobile" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <Label htmlFor="mobile">Mobile push notifications</Label>
              </div>
              <Switch
                id="mobile"
                checked={preferences.globalPreferences.mobile}
                onCheckedChange={(checked) => handleGlobalPreferenceChange('mobile', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card data-testid="quiet-hours-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Automatically disable notifications during specific hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quietHoursEnabled">Enable quiet hours</Label>
              <Switch
                id="quietHoursEnabled"
                data-testid="quiet-hours-enabled"
                checked={preferences.globalPreferences.quietHours.enabled}
                onCheckedChange={(checked) => handleQuietHoursChange('enabled', checked)}
              />
            </div>

            {preferences.globalPreferences.quietHours.enabled && (
              <div className="space-y-4 pl-6 border-l-2 border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start time</Label>
                    <Input
                      id="startTime"
                      data-testid="quiet-hours-start"
                      type="time"
                      value={preferences.globalPreferences.quietHours.startTime}
                      onChange={(e) => handleQuietHoursChange('startTime', e.target.value)}
                      className={cn(timeError && "border-red-500")}
                    />
                    {timeError && (
                      <div data-testid="quiet-hours-start-error" className="text-sm text-red-600 mt-1">
                        {timeError}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="endTime">End time</Label>
                    <Input
                      id="endTime"
                      data-testid="quiet-hours-end"
                      type="time"
                      value={preferences.globalPreferences.quietHours.endTime}
                      onChange={(e) => handleQuietHoursChange('endTime', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={preferences.globalPreferences.quietHours.timezone}
                    onValueChange={(value) => handleQuietHoursChange('timezone', value)}
                  >
                    <SelectTrigger data-testid="quiet-hours-timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Channel-Specific Preferences */}
        <Card data-testid="channel-preferences-section">
          <CardHeader>
            <CardTitle>Channel Preferences</CardTitle>
            <CardDescription>
              Override global settings for specific channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div data-testid="channels-preferences-list" className="space-y-4">
              {channels?.map((channel) => {
                const channelPref = getChannelPreference(channel._id);
                const isMuted = isChannelMuted(channelPref.mutedUntil);

                return (
                  <div
                    key={channel._id}
                    data-testid="channel-pref-item"
                    className="border border-slate-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span data-testid="channel-name" className="font-medium">
                          #{channelPref.channelName}
                        </span>
                        {isMuted && (
                          <Badge data-testid="muted-indicator" variant="secondary" className="text-xs">
                            Muted for {formatMuteDuration(channelPref.mutedUntil!)}
                          </Badge>
                        )}
                      </div>

                      {/* Mute/Unmute Controls */}
                      <div className="flex items-center gap-2">
                        {isMuted ? (
                          <Button
                            data-testid="unmute-channel-button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnmuteChannel(channel._id)}
                          >
                            Unmute
                          </Button>
                        ) : (
                          <div className="relative">
                            <Button
                              data-testid="mute-channel-button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // For simplicity, mute for 1 hour directly
                                // In a real app, this would show a dropdown menu
                                handleMuteChannel(channel._id, 60 * 60 * 1000);
                              }}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Mute
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preference Controls */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-slate-600">@Mentions</Label>
                        <Select
                          value={channelPref.mentions}
                          onValueChange={(value) =>
                            handleChannelPreferenceChange(channel._id, 'mentions', value)
                          }
                        >
                          <SelectTrigger data-testid="channel-mentions-select" className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inherit">Inherit global</SelectItem>
                            <SelectItem value="enabled">Always notify</SelectItem>
                            <SelectItem value="disabled">Never notify</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs text-slate-600">All messages</Label>
                        <Select
                          value={channelPref.allMessages}
                          onValueChange={(value) =>
                            handleChannelPreferenceChange(channel._id, 'allMessages', value)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inherit">Inherit global</SelectItem>
                            <SelectItem value="enabled">Always notify</SelectItem>
                            <SelectItem value="disabled">Never notify</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs text-slate-600">Thread replies</Label>
                        <Select
                          value={channelPref.threads}
                          onValueChange={(value) =>
                            handleChannelPreferenceChange(channel._id, 'threads', value)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inherit">Inherit global</SelectItem>
                            <SelectItem value="enabled">Always notify</SelectItem>
                            <SelectItem value="disabled">Never notify</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <Label className="text-xs text-slate-600">Custom keywords</Label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {channelPref.keywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            data-testid="keyword-tag"
                            variant="secondary"
                            className="text-xs"
                          >
                            {keyword}
                            <X
                              data-testid="remove-keyword"
                              className="h-3 w-3 ml-1 cursor-pointer hover:text-red-600"
                              onClick={() => removeKeyword(channel._id, keyword)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <Input
                        data-testid="keywords-input"
                        placeholder="Add keywords (comma-separated)"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const keywords = keywordInput.split(',').map(k => k.trim()).filter(Boolean);
                            keywords.forEach(keyword => addKeyword(channel._id, keyword));
                            setKeywordInput('');
                          }
                        }}
                        className="h-8"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            data-testid="save-preferences-button"
            onClick={() => showSaveStatus('saved')}
            disabled={!!timeError || saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};