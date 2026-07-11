import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Cpu, 
  Mic, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  Mail,
  Bell,
  Settings,
  Shield,
  Zap,
  MessageSquare,
  Volume2,
  Languages,
  Server,
  FileWarning,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminAIPanel() {
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailType, setEmailType] = useState('announcement');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // AI Health Check
  const { data: aiHealth, isLoading: isLoadingHealth, refetch: refetchHealth } = useQuery({
    queryKey: ['ai-health'],
    queryFn: async () => {
      const res = await base44.functions.invoke('checkAIHealth', {});
      return res.data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  // Maintenance Mode Mutation
  const maintenanceMutation = useMutation({
    mutationFn: async (data) => {
      const res = await base44.functions.invoke('setMaintenanceMode', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Maintenance mode updated');
      setMaintenanceDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update maintenance mode');
    },
  });

  // Send Email Mutation
  const emailMutation = useMutation({
    mutationFn: async (data) => {
      const res = await base44.functions.invoke('adminSendEmail', data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Email sent! ${data.results.successful}/${data.results.total} delivered`);
      setDialogOpen(false);
      setEmailSubject('');
      setEmailBody('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send email');
    },
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getOverallStatus = () => {
    if (!aiHealth) return { color: 'bg-gray-500', text: 'Unknown' };
    if (aiHealth.status === 'healthy') return { color: 'bg-green-500', text: 'Healthy' };
    if (aiHealth.status === 'degraded') return { color: 'bg-yellow-500', text: 'Degraded' };
    return { color: 'bg-red-500', text: 'Error' };
  };

  const handleMaintenanceSubmit = () => {
    maintenanceMutation.mutate({
      enabled: true,
      message: maintenanceMessage || 'We are currently working on improvements. Some features may be temporarily unavailable.',
      affected_features: ['ai_chat', 'ai_voice']
    });
  };

  const handleEmailSubmit = () => {
    emailMutation.mutate({
      subject: emailSubject,
      body: emailBody,
      email_type: emailType
    });
  };

  const emailTemplates = {
    maintenance: {
      subject: 'Temporary Service Interruption',
      body: 'We are currently performing maintenance on Spicey AI services. Some features may be temporarily unavailable. We expect to complete improvements within the next few hours. Thank you for your patience!'
    },
    update: {
      subject: 'Exciting New Features Available!',
      body: 'We have just released new improvements to Spicey! Check out the latest updates in the app. Thank you for being part of our community!'
    },
    security: {
      subject: 'Important Security Update',
      body: 'We have enhanced our security measures to better protect your account. No action is required on your part. If you notice any suspicious activity, please contact support immediately.'
    },
    testing: {
      subject: 'Spicey Testing Phase Update',
      body: 'Thank you for participating in our testing phase! Your feedback helps us improve. Please continue reporting any issues you encounter through the app.'
    }
  };

  const loadTemplate = (type) => {
    const template = emailTemplates[type];
    setEmailSubject(template.subject);
    setEmailBody(template.body);
  };

  return (
    <div className="min-h-screen bg-background p-6" data-prevent-light-mode="true">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Cpu className="w-8 h-8 text-purple-500" />
                AI Control Panel
              </h1>
              <p className="text-white/60">Monitor AI health, API status, and manage user communications</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => refetchHealth()}
                variant="outline"
                className="border-white/10 text-white hover:bg-purple-500/20"
                disabled={isLoadingHealth}
              >
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <Mail className="w-5 h-5 text-purple-500" />
                      Send Email to Users
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="border-white/10 text-white hover:bg-purple-500/20"
                        onClick={() => loadTemplate('maintenance')}
                      >
                        Maintenance
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/10 text-white hover:bg-purple-500/20"
                        onClick={() => loadTemplate('update')}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/10 text-white hover:bg-purple-500/20"
                        onClick={() => loadTemplate('security')}
                      >
                        Security
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/10 text-white hover:bg-purple-500/20"
                        onClick={() => loadTemplate('testing')}
                      >
                        Testing
                      </Button>
                    </div>
                    <Select value={emailType} onValueChange={setEmailType}>
                      <SelectTrigger className="bg-background/50 border-white/10 text-white">
                        <SelectValue placeholder="Email Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10">
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Email Subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="bg-background/50 border-white/10 text-white"
                    />
                    <Textarea
                      placeholder="Email Body"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="bg-background/50 border-white/10 text-white min-h-[200px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        onClick={handleEmailSubmit}
                        disabled={emailMutation.isPending || !emailSubject || !emailBody}
                      >
                        {emailMutation.isPending ? 'Sending...' : <><Send className="w-4 h-4 mr-2" /> Send to All Users</>}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/10 text-white"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Maintenance Mode
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Enable Maintenance Mode
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-white/60">
                      This will display a maintenance message to all users. AI features will be temporarily unavailable.
                    </p>
                    <Textarea
                      placeholder="Maintenance message (optional)"
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      className="bg-background/50 border-white/10 text-white"
                    />
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleMaintenanceSubmit}
                        disabled={maintenanceMutation.isPending}
                      >
                        {maintenanceMutation.isPending ? 'Enabling...' : 'Enable Maintenance'}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/10 text-white"
                        onClick={() => setMaintenanceDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Overall Status */}
        <Card className="bg-card/50 border-white/10 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Overall AI System Status</h2>
                <p className="text-sm text-white/60">Last checked: {aiHealth?.timestamp ? new Date(aiHealth.timestamp).toLocaleString() : 'Never'}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getOverallStatus().color} animate-pulse`} />
                <Badge className={getOverallStatus().text === 'Healthy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {getOverallStatus().text}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="health" className="space-y-6">
          <TabsList className="bg-card/50 border-white/10">
            <TabsTrigger value="health" className="data-[state=active]:bg-purple-500/20">
              <Cpu className="w-4 h-4 mr-2" />
              AI Health
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-purple-500/20">
              <Server className="w-4 h-4 mr-2" />
              API Settings
            </TabsTrigger>
            <TabsTrigger value="issues" className="data-[state=active]:bg-purple-500/20">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Issues & Logs
            </TabsTrigger>
            <TabsTrigger value="communication" className="data-[state=active]:bg-purple-500/20">
              <Mail className="w-4 h-4 mr-2" />
              Communication
            </TabsTrigger>
          </TabsList>

          {/* AI Health Tab */}
          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* API Connection */}
              <Card className="bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    API Connection
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    OpenAI GPT-4o-mini
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingHealth ? (
                    <div className="text-white/60">Loading...</div>
                  ) : aiHealth?.tests?.api_connection ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Status</span>
                        <Badge className={getStatusColor(aiHealth.tests.api_connection.status)}>
                          {aiHealth.tests.api_connection.status === 'ok' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {aiHealth.tests.api_connection.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Latency</span>
                        <span className="text-white font-mono">{aiHealth.tests.api_connection.latency_ms || 'N/A'} ms</span>
                      </div>
                      {aiHealth.tests.api_connection.error && (
                        <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
                          {aiHealth.tests.api_connection.error}
                        </div>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* Voice/TTS */}
              <Card className="bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-blue-500" />
                    Voice/TTS
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Text-to-Speech
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingHealth ? (
                    <div className="text-white/60">Loading...</div>
                  ) : aiHealth?.tests?.voice_tts ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Status</span>
                        <Badge className={getStatusColor(aiHealth.tests.voice_tts.status)}>
                          {aiHealth.tests.voice_tts.status === 'ok' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {aiHealth.tests.voice_tts.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Latency</span>
                        <span className="text-white font-mono">{aiHealth.tests.voice_tts.latency_ms || 'N/A'} ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Voice</span>
                        <span className="text-white text-sm">nova</span>
                      </div>
                      {aiHealth.tests.voice_tts.error && (
                        <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
                          {aiHealth.tests.voice_tts.error}
                        </div>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* Language Detection */}
              <Card className="bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Languages className="w-5 h-5 text-green-500" />
                    Language Detection
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Auto-detection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingHealth ? (
                    <div className="text-white/60">Loading...</div>
                  ) : aiHealth?.tests?.language_detection ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Status</span>
                        <Badge className={getStatusColor(aiHealth.tests.language_detection.status)}>
                          {aiHealth.tests.language_detection.status === 'ok' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {aiHealth.tests.language_detection.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Test Result</span>
                        <span className="text-white font-mono text-sm">{aiHealth.tests.language_detection.detected}</span>
                      </div>
                      {aiHealth.tests.language_detection.error && (
                        <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
                          {aiHealth.tests.language_detection.error}
                        </div>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            {/* Potential Issues */}
            {aiHealth?.potential_issues && (
              <Card className="bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileWarning className="w-5 h-5 text-orange-500" />
                    Potential Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {aiHealth.potential_issues.old_files?.length > 0 ? (
                      <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-orange-400 font-semibold">Old AI Files Detected</p>
                          <p className="text-xs text-white/60 mt-1">
                            {aiHealth.potential_issues.old_files.join(', ')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">No old files interfering</span>
                      </div>
                    )}
                    {aiHealth.potential_issues.rate_limit_risk === 'high_latency_detected' && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-400 font-semibold">High API Latency</p>
                          <p className="text-xs text-white/60 mt-1">
                            Consider checking API quota or region settings
                          </p>
                        </div>
                      </div>
                    )}
                    {aiHealth.potential_issues.voice_delay_risk === 'high_latency_detected' && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-400 font-semibold">Voice Generation Delay</p>
                          <p className="text-xs text-white/60 mt-1">
                            TTS is taking longer than expected
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {aiHealth?.recommendations?.length > 0 && (
              <Card className="bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiHealth.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* API Settings Tab */}
          <TabsContent value="api" className="space-y-4">
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-500" />
                  API Configuration
                </CardTitle>
                <CardDescription className="text-white/60">
                  Current API settings and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-background/30 rounded-lg border border-white/5">
                    <div className="text-xs text-white/60 mb-1">API Key Status</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${aiHealth?.api_key_configured ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-white font-semibold">
                        {aiHealth?.api_key_configured ? 'Configured' : 'Not Configured'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-background/30 rounded-lg border border-white/5">
                    <div className="text-xs text-white/60 mb-1">Primary Model</div>
                    <div className="text-white font-semibold">gpt-4o-mini</div>
                  </div>
                  <div className="p-4 bg-background/30 rounded-lg border border-white/5">
                    <div className="text-xs text-white/60 mb-1">Voice Model</div>
                    <div className="text-white font-semibold">tts-1</div>
                  </div>
                  <div className="p-4 bg-background/30 rounded-lg border border-white/5">
                    <div className="text-xs text-white/60 mb-1">Default Voice</div>
                    <div className="text-white font-semibold">nova</div>
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-400 font-semibold">Security Notice</p>
                      <p className="text-xs text-white/60 mt-1">
                        API keys are stored securely in environment variables and never exposed to the frontend. 
                        Only admins can view system status.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issues & Logs Tab */}
          <TabsContent value="issues" className="space-y-4">
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Common AI Issues
                </CardTitle>
                <CardDescription className="text-white/60">
                  Troubleshooting guide for reported problems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { issue: 'AI voice is delayed', solution: 'Check TTS latency in Health tab. If >3000ms, check OpenAI status or API quota.' },
                  { issue: 'AI does not respond correctly', solution: 'Verify API connection status. Check if gpt-4o-mini model is accessible.' },
                  { issue: 'AI language detection is wrong', solution: 'Test language detection in Health tab. May need to adjust prompt or model.' },
                  { issue: 'AI mixes languages', solution: 'Clear conversation history. Ensure language parameter is set correctly.' },
                  { issue: 'Speaker/voice is not working', solution: 'Check Voice/TTS status. Verify browser audio permissions.' },
                  { issue: 'AI is not listening properly', solution: 'Check microphone permissions. Test SpeechRecognition API support.' },
                  { issue: 'AI audio conversation is broken', solution: 'Check both API and Voice status. May need to restart conversation.' },
                  { issue: 'OpenAI/API connection errors', solution: 'Verify OPENAI_API_KEY is set. Check OpenAI service status.' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-background/30 rounded-lg border border-white/5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-white font-semibold">{item.issue}</p>
                        <p className="text-xs text-white/60 mt-1">{item.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    onClick={() => {
                      loadTemplate('maintenance');
                      setDialogOpen(true);
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Send Maintenance Notice
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    onClick={() => {
                      loadTemplate('update');
                      setDialogOpen(true);
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Update Announcement
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white"
                    onClick={() => {
                      loadTemplate('security');
                      setDialogOpen(true);
                    }}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Send Security Warning
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    onClick={() => {
                      loadTemplate('testing');
                      setDialogOpen(true);
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Testing Notice
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-500" />
                    Email Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-background/30 rounded-lg border border-white/5">
                    <div className="text-xs text-white/60 mb-1">From Address</div>
                    <div className="text-white font-semibold">info@spicey.live</div>
                  </div>
                  <div className="p-3 bg-background/30 rounded-lg border border-white/5">
                    <div className="text-xs text-white/60 mb-1">Email Service</div>
                    <div className="text-white font-semibold">Resend</div>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-400 font-semibold">Ready to Send</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}