import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Video,
  Building,
  Crown,
  Zap,
  BarChart3,
  Gift,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminEmailAutomation() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [automationEnabled, setAutomationEnabled] = useState({
    engagement: true,
    vip_promotion: true,
    creator_promotion: true,
    business_promotion: true,
  });
  const [stats, setStats] = useState({
    totalSent: 0,
    lastCampaign: null,
    engagementRate: 0,
  });

  useEffect(() => {
    checkAdmin();
    loadStats();
  }, []);

  const checkAdmin = async () => {
    try {
      const user = await base44.auth.me();
      if (!['info@spicey.live', 'valondervishi13@gmail.com'].includes((user?.email || '').toLowerCase())) {
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
      // Load email stats (would need an EmailLog entity for detailed tracking)
      setStats({
        totalSent: 0,
        lastCampaign: null,
        engagementRate: 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleRunCampaign = async (campaignType) => {
    setRunning(true);
    setResult(null);

    try {
      const response = await base44.functions.invoke('runEmailAutomation', {
        campaignType,
      });
      
      setResult({
        success: true,
        campaign: campaignType,
        sent: response.data.sent,
        skipped: response.data.skipped,
        total: response.data.total,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setRunning(false);
    }
  };

  const handleToggleAutomation = async (type) => {
    const newValue = !automationEnabled[type];
    setAutomationEnabled(prev => ({ ...prev, [type]: newValue }));
    // In production, save to database or settings
    console.log(`[Automation] ${type} ${newValue ? 'enabled' : 'disabled'}`);
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

  const campaigns = [
    {
      type: 'engagement',
      title: 'Engagement Reminders',
      description: 'Re-engage inactive users (3+ days)',
      icon: Clock,
      color: '#FF6A00',
      frequency: 'Daily',
      audience: 'Inactive users',
    },
    {
      type: 'vip_promotion',
      title: 'VIP Promotions',
      description: 'Promote VIP subscriptions',
      icon: Crown,
      color: '#C100FF',
      frequency: '2x per week',
      audience: 'Non-VIP users',
    },
    {
      type: 'creator_promotion',
      title: 'Creator Promotions',
      description: 'Promote Creator subscriptions',
      icon: Video,
      color: '#FF2D55',
      frequency: '1x per week',
      audience: 'Active creators',
    },
    {
      type: 'business_promotion',
      title: 'Business Promotions',
      description: 'Promote Business subscriptions',
      icon: Building,
      color: '#00C9FF',
      frequency: '1x per week',
      audience: 'Business accounts',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6 pb-32">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #FF2D55)' }}>
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Email Automation</h1>
              <p className="text-sm text-muted-foreground">Manage automated email campaigns</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/gift-vip')}
            className="px-4 py-2.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', boxShadow: '0 0 20px rgba(236,72,153,0.4)' }}>
            <Gift className="w-4 h-4" />
            Gift VIP Access
          </button>
        </div>
        <Badge variant="outline" className="mb-4" style={{ borderColor: '#FF6A00', color: '#FF6A00' }}>
          Admin Only · info@spicey.live
        </Badge>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalSent}</p>
                  <p className="text-xs text-muted-foreground">Emails Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.engagementRate}%</p>
                  <p className="text-xs text-muted-foreground">Engagement Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-bold">
                    {stats.lastCampaign ? 'Today' : 'Never'}
                  </p>
                  <p className="text-xs text-muted-foreground">Last Campaign</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Automation Controls */}
        <Card className="border-border/50">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Automated Campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaigns.map((campaign) => {
              const Icon = campaign.icon;
              const enabled = automationEnabled[campaign.type];
              
              return (
                <div key={campaign.type}
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${campaign.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: campaign.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{campaign.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.description} · {campaign.frequency} · {campaign.audience}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={enabled}
                      onCheckedChange={() => handleToggleAutomation(campaign.type)}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleRunCampaign(campaign.type)}
                      disabled={running || !enabled}
                      className="flex items-center gap-2"
                      style={{ background: campaign.color }}
                    >
                      {running ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Run Now
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Result Display */}
        {result && (
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl flex items-center gap-3 ${
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
                    {result.success ? `${result.campaign} Completed!` : 'Failed to Run'}
                  </p>
                  {result.success && (
                    <p className="text-sm text-muted-foreground">
                      {result.sent} sent · {result.skipped} skipped · {result.total} total
                    </p>
                  )}
                  {!result.success && (
                    <p className="text-sm text-muted-foreground">{result.error}</p>
                  )}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        )}

        {/* Email Settings Info */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Email Configuration</p>
                  <p className="text-xs text-muted-foreground">
                    All emails are sent from <strong>Spicey Team &lt;info@spicey.live&gt;</strong>.
                    Marketing emails include an unsubscribe option in the footer.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Automatic Emails (Always On)</p>
                  <p className="text-xs text-muted-foreground">
                    Welcome emails, verification, password reset, and security notifications are sent automatically
                    and cannot be disabled.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Marketing Emails (Controllable)</p>
                  <p className="text-xs text-muted-foreground">
                    VIP promotions, engagement reminders, and other marketing emails can be paused, enabled,
                    or manually triggered from this dashboard.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}