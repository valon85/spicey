import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import BottomNav from '../components/feed/BottomNav';

export default function AutoImportVideos() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const importMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('autoImportStockVideos', {});
      return result.data || result;
    },
    onSuccess: (data) => {
      setResult(data);
      setStatus('complete');
    },
    onError: (error) => {
      console.error('Import failed:', error);
      setResult({ error: error.message });
      setStatus('error');
    },
  });

  const handleImport = () => {
    setStatus('importing');
    importMutation.mutate();
  };

  return (
    <div className="min-h-screen pb-24 flex flex-col items-center justify-center p-6" 
      style={{ background: 'linear-gradient(160deg, #0a0014, #0d0520, #050010)' }}>
      
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">Auto Import Stock Videos</h1>
          <p className="text-white/50 text-sm">
            Automatically import 200-500 vertical videos from Pexels & Pixabay
          </p>
        </div>

        {/* Status Card */}
        <div className="rounded-3xl p-8 border border-white/10 backdrop-blur-xl"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          
          {status === 'idle' && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
                <Download className="w-12 h-12 text-orange-400" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-3">Ready to Import</h2>
              <div className="space-y-2 text-white/60 text-sm mb-8">
                <p>✓ Pexels API connected</p>
                <p>✓ Pixabay API connected</p>
                <p>✓ 10 categories: Entertainment, Comedy, Sports, Cars, Travel, Food, Animals, Technology, Luxury, Motivation</p>
                <p>✓ ~40 videos per category from each source</p>
                <p className="text-orange-400 font-semibold mt-4">
                  Expected: 400-800 total videos
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleImport}
                disabled={importMutation.isPending}
                className="w-full py-5 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                style={{ 
                  background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
                  boxShadow: '0 0 30px rgba(255,80,0,0.5)'
                }}>
                <Download className="w-6 h-6" />
                {importMutation.isPending ? 'Starting Import...' : 'Start Auto Import'}
              </motion.button>

              <p className="text-xs text-white/40 mt-4">
                This will take 2-5 minutes. Videos will appear in Reels feed immediately.
              </p>
            </div>
          )}

          {status === 'importing' && (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 rounded-full mx-auto mb-6"
                style={{ 
                  background: 'conic-gradient(from 0deg, #ff5500, #e91e8c, #ff5500)',
                  filter: 'blur(2px)'
                }}
              >
                <div className="w-16 h-16 rounded-full bg-[#0a0014] flex items-center justify-center mx-auto mt-2">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              </motion.div>
              
              <h2 className="text-xl font-bold text-white mb-2">Importing Videos...</h2>
              <p className="text-white/50 text-sm mb-6">
                Fetching from Pexels & Pixabay APIs
              </p>
              
              <div className="max-w-md mx-auto">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 180, ease: 'linear' }}
                    className="h-full"
                    style={{ background: 'linear-gradient(90deg, #ff5500, #e91e8c)' }}
                  />
                </div>
                <p className="text-xs text-white/40 mt-2">This may take 2-5 minutes</p>
              </div>
            </div>
          )}

          {status === 'complete' && result && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-6">Import Complete!</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-3xl font-bold text-white mb-1">{result.imported || 0}</p>
                  <p className="text-xs text-white/50">Total Videos Imported</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-3xl font-bold text-orange-400 mb-1">{result.summary?.errors || 0}</p>
                  <p className="text-xs text-white/50">Errors</p>
                </div>
              </div>

              {result.summary?.bySource && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
                  <p className="text-sm font-bold text-white/70 mb-3">By Source</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">Pexels</span>
                      <span className="text-sm font-bold text-white">{result.summary.bySource.pexels}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">Pixabay</span>
                      <span className="text-sm font-bold text-white">{result.summary.bySource.pixabay}</span>
                    </div>
                  </div>
                </div>
              )}

              {result.summary?.byCategory && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
                  <p className="text-sm font-bold text-white/70 mb-3">By Category</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(result.summary.byCategory).map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between">
                        <span className="text-xs text-white/50 capitalize">{cat}</span>
                        <span className="text-sm font-bold text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/admin/video-library')}
                  className="flex-1 py-4 rounded-2xl text-white font-bold text-base"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  View in Library
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/reels')}
                  className="flex-1 py-4 rounded-2xl text-white font-bold text-base"
                  style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
                  View Reels Feed
                </motion.button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>

              <h2 className="text-xl font-bold text-white mb-3">Import Failed</h2>
              <p className="text-white/50 text-sm mb-6">{result?.error || 'Unknown error'}</p>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleImport}
                className="w-full py-4 rounded-2xl text-white font-bold text-base"
                style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
                Try Again
              </motion.button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 rounded-2xl border border-white/10" style={{ background: 'rgba(139,92,246,0.1)' }}>
          <p className="text-xs text-white/70 leading-relaxed">
            <strong className="text-purple-400">Note:</strong> Videos are imported from Pexels and Pixabay - both provide royalty-free, CC0 licensed content. 
            All videos are vertical (9:16), HD quality, and ready for Reels. 
            They will appear in the Reels feed immediately after import.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}