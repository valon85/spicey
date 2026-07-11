import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Download, Video, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminBulkImportVideos() {
  const navigate = useNavigate();
  const [importStarted, setImportStarted] = useState(false);
  const [status, setStatus] = useState({ imported: 0, total: 0, currentCategory: '' });

  const importMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('autoImportStockVideos', {});
      return res.data;
    },
    onSuccess: (data) => {
      setStatus({ 
        imported: data.imported, 
        total: data.imported, 
        currentCategory: 'Complete!' 
      });
    },
  });

  const handleImport = () => {
    setImportStarted(true);
    importMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background p-6" data-prevent-light-mode="true">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin/dashboard')} className="p-2 rounded-full hover:bg-white/10">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Bulk Import Videos</h1>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.2)' }}>
              <Video className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Import Stock Videos from Pexels & Pixabay</h2>
          </div>

          <p className="text-white/70 mb-6">
            This will import ~40 videos per category from Pexels and Pixabay (15 categories = ~600 videos total).
            Videos will be automatically added to your Reels feed.
          </p>

          {/* Categories */}
          <div className="mb-6">
            <p className="text-white/60 text-sm font-semibold mb-3 uppercase tracking-wider">Categories:</p>
            <div className="flex flex-wrap gap-2">
              {['entertainment', 'comedy', 'sports', 'cars', 'travel', 'food', 'animals', 'technology', 'luxury', 'motivation', 'nature', 'fashion', 'music', 'dance', 'fitness'].map(cat => (
                <span 
                  key={cat}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Status */}
          {importStarted && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3 mb-3">
                {importMutation.isPending ? (
                  <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                ) : importMutation.isSuccess ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : importMutation.isError ? (
                  <AlertCircle className="w-6 h-6 text-red-400" />
                ) : null}
                <span className="text-white font-semibold text-base">
                  {importMutation.isPending && `Importing... Please wait`}
                  {importMutation.isSuccess && `✅ Successfully imported ${status.imported} videos!`}
                  {importMutation.isError && '❌ Import failed. Check console for details.'}
                </span>
              </div>
              
              {importMutation.isPending && (
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (status.imported / 600) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={importMutation.isPending}
              className="flex-1 py-4 rounded-xl font-bold text-white disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ 
                background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
                boxShadow: '0 0 30px rgba(255,80,0,0.5)'
              }}
            >
              {importMutation.isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Importing...</>
              ) : (
                <><Download className="w-5 h-5" /> Import All Videos (~600)</>
              )}
            </button>
            
            <button
              onClick={() => navigate('/admin/video-library')}
              className="px-6 py-4 rounded-xl font-bold text-white transition-all active:scale-95"
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              View Library
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(255,85,0,0.1)', border: '1px solid rgba(255,85,0,0.2)' }}>
            <p className="text-sm text-orange-200">
              <strong>⚠️ Note:</strong> Videos are imported from Pexels and Pixabay APIs. 
              Make sure your API keys (PEXELS_API_KEY, PIXABAY_API_KEY) are configured in Dashboard → Settings → Environment Variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}