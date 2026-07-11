import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Play, Volume2, VolumeX, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TestReelsPlayback() {
  const [testResults, setTestResults] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const runTests = async () => {
    const results = [];
    
    // Test 1: Fetch reels feed
    try {
      const feedResult = await base44.functions.invoke('getReelsFeed', {});
      const reels = feedResult.data?.reels || feedResult.reels || [];
      results.push({
        test: '1. Fetch Reels Feed',
        status: reels.length > 0 ? 'success' : 'warning',
        message: `${reels.length} videos returned`,
        data: reels.slice(0, 5).map(r => ({
          id: r.id,
          video_url: r.video_url?.substring(0, 100),
          source: r.source,
          is_stock: r.is_stock,
        })),
      });
      
      // Test 2: Check first stock video
      const firstStock = reels.find(r => r.is_stock || r.source === 'pexels' || r.source === 'pixabay');
      if (firstStock) {
        setCurrentVideo(firstStock);
        results.push({
          test: '2. First Stock Video',
          status: 'success',
          message: `Found: ${firstStock.title} (${firstStock.video_url?.substring(0, 80)}...)`,
        });
      } else {
        results.push({
          test: '2. First Stock Video',
          status: 'error',
          message: 'No stock videos found in feed',
        });
      }
      
      // Test 3: Check video URL accessibility
      if (firstStock?.video_url) {
        try {
          const response = await fetch(firstStock.video_url, { method: 'HEAD' });
          results.push({
            test: '3. Video URL Accessible',
            status: response.ok ? 'success' : 'error',
            message: response.ok ? '✓ URL responds' : `✗ Status: ${response.status}`,
          });
        } catch (err) {
          results.push({
            test: '3. Video URL Accessible',
            status: 'error',
            message: `✗ ${err.message}`,
          });
        }
      }
      
      // Test 4: Check database
      try {
        const stockVideos = await base44.entities.StockVideo.filter({ is_active: true }, '-added_at', 10);
        results.push({
          test: '4. Database Check',
          status: stockVideos.length > 0 ? 'success' : 'warning',
          message: `${stockVideos.length} active stock videos in DB`,
        });
      } catch (err) {
        results.push({
          test: '4. Database Check',
          status: 'error',
          message: `✗ ${err.message}`,
        });
      }
      
    } catch (err) {
      results.push({
        test: 'General Error',
        status: 'error',
        message: err.message,
      });
    }
    
    setTestResults(results);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6">🎬 Reels Playback Test</h1>
      
      {/* Test Results */}
      <div className="space-y-4 mb-8">
        {testResults.map((result, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${
            result.status === 'success' ? 'bg-green-500/10 border-green-500/30' :
            result.status === 'error' ? 'bg-red-500/10 border-red-500/30' :
            'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
              <h3 className="font-bold">{result.test}</h3>
            </div>
            <p className="text-white/70 text-sm">{result.message}</p>
            {result.data && (
              <pre className="mt-2 text-xs bg-black/30 p-3 rounded-lg overflow-auto max-h-40">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
      
      {/* Video Player Test */}
      {currentVideo && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">📹 Video Player Test</h2>
          <div className="relative aspect-[9/16] max-h-[500px] rounded-2xl overflow-hidden bg-black border border-white/10">
            <video
              src={currentVideo.video_url}
              className="w-full h-full object-cover"
              loop
              playsInline
              muted={isMuted}
              autoPlay
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={(e) => console.error('Video error:', e)}
              onLoadedData={() => console.log('Video loaded!')}
            />
            
            {/* Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <button
                onClick={() => setIsPlaying(p => !p)}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                {isPlaying ? (
                  <div className="w-4 h-4 bg-white rounded-sm" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-1" />
                )}
              </button>
              
              <button
                onClick={() => setIsMuted(m => !m)}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>
            </div>
            
            {/* Info */}
            <div className="absolute top-4 left-4 right-4">
              <div className="px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm inline-block">
                <p className="text-xs font-bold">{currentVideo.title}</p>
                <p className="text-[10px] text-white/60">
                  {currentVideo.source} • {currentVideo.category}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-sm font-bold mb-2">Video Info:</h4>
            <div className="text-xs space-y-1 text-white/70">
              <p>ID: {currentVideo.id}</p>
              <p>URL: {currentVideo.video_url}</p>
              <p>Thumbnail: {currentVideo.thumbnail_url}</p>
              <p>Duration: {currentVideo.duration_seconds}s</p>
              <p>Author: {currentVideo.author_name}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug Info */}
      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30">
        <h3 className="font-bold mb-2">🔍 How to Debug:</h3>
        <ol className="text-sm text-white/70 space-y-1 list-decimal list-inside">
          <li>Check test results above</li>
          <li>Open browser console (F12)</li>
          <li>Look for [Reels], [ReelCard], [Video] logs</li>
          <li>Check if video plays in test player</li>
          <li>If test works but Reels doesn't → frontend issue</li>
          <li>If test fails → backend/API issue</li>
        </ol>
      </div>
    </div>
  );
}