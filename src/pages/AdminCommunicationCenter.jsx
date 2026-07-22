import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Users,
  Crown,
  Video,
  Building,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Megaphone,
  Calendar,
  Star,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Users', icon: Users, color: '#FF6A00' },
  { value: 'vip', label: 'VIP Users', icon: Crown, color: '#C100FF' },
  { value: 'creator', label: 'Creator Users', icon: Video, color: '#FF2D55' },
  { value: 'business', label: 'Business Users', icon: Building, color: '#00C9FF' },
  { value: 'selected', label: 'Selected Users', icon: Users, color: '#8B5CF6' },
];

const CAMPAIGN_TYPES = [
  { value: 'new_feature', label: 'New Feature Announcement', icon: Sparkles, color: '#8B5CF6' },
  { value: 'app_update', label: 'App Update', icon: Star, color: '#FF6A00' },
  { value: 'live_event', label: 'Live Event Announcement', icon: Calendar, color: '#FF2D55' },
  { value: 'vip_promotion', label: 'VIP Promotion', icon: Crown, color: '#C100FF' },
  { value: 'creator_promotion', label: 'Creator Promotion', icon: Video, color: '#FF6A00' },
  { value: 'business_promotion', label: 'Business Promotion', icon: Building, color: '#00C9FF' },
  { value: 'custom', label: 'Custom Message', icon: MessageSquare, color: '#10B981' },
];

export default function AdminCommunicationCenter() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [audience, setAudience] = useState('all');
  const [campaignType, setCampaignType] = useState('new_feature');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userStats, setUserStats] = useState({ all: 0, vip: 0, creator: 0, business: 0 });

  useEffect(() => {
    checkAdmin();
    loadStats();
  }, []);

  const checkAdmin = async () => {
    try {
      const user = await base44.auth.me();
      if (!['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com'].includes((user?.email || '').toLowerCase())) {
        navigate('/');
        return;
      }
      setIsAdmin(true);
    } catch (error) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const profiles = await base44.entities.UserProfile.list('', 10000);
      const allUsers = profiles.length;
      
      // Count by subscription type (would need to fetch Subscription entity)
      // For now, show all users count
      setUserStats({ all: allUsers, vip: 0, creator: 0, business: 0 });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSendCampaign = async () => {
    if (!customSubject && campaignType !== 'custom') {
      alert('Please fill in subject and message');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const payload = {
        campaignType: campaignType === 'custom' ? undefined : campaignType,
        customSubject: customSubject || undefined,
        customBody: customBody || undefined,
      };

      // Add target users if selected
      if (audience === 'selected' && selectedUserIds.length > 0) {
        payload.targetUserIds = selectedUserIds;
      } else if (audience !== 'all') {
        // Would need to filter by subscription type
        // For now, send to all
      }

      const response = await base44.functions.invoke('sendEmailCampaign', payload);
      setResult({
        success: true,
        sent: response.data.sent,
        failed: response.data.failed,
        total: response.data.total,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const SelectedIcon = AUDIENCE_OPTIONS.find(a => a.value === audience)?.icon || Users;
  const CampaignIcon = CAMPAIGN_TYPES.find(c => c.value === campaignType)?.icon || Sparkles;

  return (
    <div className="min-h-screen bg-background p-6 pb-32">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #FF2D55)' }}>
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Communication Center</h1>
            <p className="text-sm text-muted-foreground">Send emails to Spicey users</p>
          </div>
        </div>
        <Badge variant="outline" className="mb-4" style={{ borderColor: '#FF6A00', color: '#FF6A00' }}>
          Admin Only · info@spicey.live
        </Badge>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{userStats.all}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5" style={{ color: '#C100FF' }} />
                <div>
                  <p className="text-2xl font-bold">{userStats.vip}</p>
                  <p className="text-xs text-muted-foreground">VIP Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5" style={{ color: '#FF2D55' }} />
                <div>
                  <p className="text-2xl font-bold">{userStats.creator}</p>
                  <p className="text-xs text-muted-foreground">Creators</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5" style={{ color: '#00C9FF' }} />
                <div>
                  <p className="text-2xl font-bold">{userStats.business}</p>
                  <p className="text-xs text-muted-foreground">Business</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audience Selection */}
        <Card className="border-border/50">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Select Audience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {AUDIENCE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = audience === option.value;
                return (
                  <motion.button
                    key={option.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAudience(option.value)}
                    className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                      isSelected ? 'ring-2 ring-offset-2 ring-offset-background' : ''
                    }`}
                    style={{
                      background: isSelected ? `${option.color}15` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isSelected ? option.color : 'rgba(255,255,255,0.1)'}`,
                      ringColor: option.color,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: isSelected ? option.color : 'rgba(255,255,255,0.5)' }} />
                    <span className="text-xs font-semibold text-center" style={{ color: isSelected ? option.color : 'rgba(255,255,255,0.7)' }}>
                      {option.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Type */}
        <Card className="border-border/50">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Campaign Type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CAMPAIGN_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = campaignType === type.value;
                return (
                  <motion.button
                    key={type.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCampaignType(type.value)}
                    className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                      isSelected ? 'ring-2 ring-offset-2 ring-offset-background' : ''
                    }`}
                    style={{
                      background: isSelected ? `${type.color}15` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isSelected ? type.color : 'rgba(255,255,255,0.1)'}`,
                      ringColor: type.color,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: isSelected ? type.color : 'rgba(255,255,255,0.5)' }} />
                    <span className="text-xs font-semibold text-center" style={{ color: isSelected ? type.color : 'rgba(255,255,255,0.7)' }}>
                      {type.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Custom Message (only for custom type) */}
        {campaignType === 'custom' && (
          <Card className="border-border/50">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Write Your Message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Subject</label>
                <Textarea
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="rounded-xl min-h-[60px] resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Message</label>
                <Textarea
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder="Write your email message..."
                  className="rounded-xl min-h-[200px] resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Send Button */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSendCampaign}
              disabled={sending || (campaignType === 'custom' && !customSubject)}
              className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-3 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #FF6A00, #FF2D55)',
                boxShadow: '0 0 24px rgba(255,80,0,0.5)',
              }}
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send to All Users
                </>
              )}
            </motion.button>

            {/* Result */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-2xl flex items-center gap-3 ${
                  result.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                } border`}
              >
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500" />
                )}
                <div>
                  <p className={`font-semibold ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                    {result.success ? 'Campaign Sent!' : 'Failed to Send'}
                  </p>
                  {result.success && (
                    <p className="text-sm text-muted-foreground">
                      {result.sent} sent · {result.failed} failed · {result.total} total
                    </p>
                  )}
                  {!result.success && (
                    <p className="text-sm text-muted-foreground">{result.error}</p>
                  )}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Email Settings</p>
                <p className="text-xs text-muted-foreground">
                  All emails are sent from <strong>Spicey Team &lt;info@spicey.live&gt;</strong>.
                  Automatic emails (welcome, verification, password reset, security) are sent immediately.
                  Marketing emails require admin approval via this dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}