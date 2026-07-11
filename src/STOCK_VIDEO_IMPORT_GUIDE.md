# 🎬 Spicey Stock Video Library - Auto Import Guide

## ✅ What's Been Fixed

### 1. Reels Videos Now Show
- **Auto Import Function**: `autoImportStockVideos` - imports 400-800 videos from Pexels & Pixabay
- **Backend Function**: `getReelsFeed` - now properly returns stock videos with better logging
- **Performance**: Optimized video loading, preloading, and scroll detection

### 2. Removed Fake Content
- All placeholder animations and demo videos removed
- Only real, high-quality Pexels/Pixabay videos will appear
- Stock videos are marked with `is_stock: true` for easy filtering

### 3. AI Voice Improved
- **Better Voice Selection**: Prioritizes natural, premium voices
- **Continuous Conversation Mode**: Auto-restarts listening after speaking
- **Error Handling**: Auto-retries on common speech recognition errors
- **Voice Quality**: Slower rate (0.95), better pitch (1.05) for clarity

---

## 🚀 How to Import Videos (One-Click)

### Option 1: From Admin Dashboard
1. Go to **Admin Dashboard** (`/admin/dashboard`)
2. Click **"Video Library"** under Quick Actions
3. Click the big orange button: **"Auto Import 400-800 Videos (One-Click)"**
4. Wait 2-5 minutes for import to complete
5. View results in **Reels Feed** or **Video Library**

### Option 2: Direct URL
- Navigate to: `/admin/auto-import`
- Click **"Start Auto Import"**
- Watch the progress bar

---

## 📊 What Gets Imported

```
10 Categories × 40 videos (Pexels) × 40 videos (Pixabay) = ~800 videos

✓ Entertainment (80 videos)
✓ Comedy (80 videos)
✓ Sports (80 videos)
✓ Cars (80 videos)
✓ Travel (80 videos)
✓ Food (80 videos)
✓ Animals (80 videos)
✓ Technology (80 videos)
✓ Luxury (80 videos)
✓ Motivation (80 videos)
```

**All videos are:**
- Vertical (9:16 aspect ratio)
- HD quality
- Royalty-free (CC0 license)
- Ready for Reels feed

---

## 🔍 Where Videos Appear

### Reels Feed Order:
1. **User-uploaded reels** (first priority)
2. **Admin-curated reels** (second)
3. **Stock videos** (shuffled for variety)

### Admin Video Library:
- All imported videos appear here
- Can toggle visibility (`is_active`)
- Can mark as featured (`is_featured`)
- Can search/filter by category

---

## 🎯 AI Voice - How to Use

### Enable Voice Mode:
1. Go to **AI Page** (`/ai`)
2. Toggle **"Voice Mode"** button (top right)
3. Toggle **"Voice On"** for AI speech

### Commands That Work:
- ✍️ "Write a post caption about..."
- 🔥 "Give me trending hashtags"
- 🎬 "Create a reel idea about..."
- 📖 "Write a story caption"
- 📞 "Call [username]"
- 💬 "Message [username]"

### Continuous Mode:
- Turn on **"Voice Mode"** - AI listens continuously
- Speak naturally, AI responds with voice
- Tap microphone to stop listening

---

## 🐛 Troubleshooting

### No Videos in Reels?
1. **Check Import Status**: Go to `/admin/auto-import`
2. **Verify API Keys**: Dashboard → Settings → Environment Variables
   - `PEXELS_API_KEY`
   - `PIXABAY_API_KEY`
3. **Run Import**: Click "Start Auto Import"
4. **Wait 2-5 minutes**: Import takes time
5. **Refresh Reels**: Pull down to refresh or navigate away and back

### Videos Not Playing?
- Check internet connection
- Videos stream from Pexels/Pixabay CDN
- Some videos may take 2-3 seconds to load

### AI Voice Not Working?
1. **Browser Support**: Works best in Chrome, Safari, Edge
2. **Permissions**: Allow microphone access
3. **Voice Mode**: Must be toggled ON
4. **Voice Output**: Toggle "Voice On" for AI speech

---

## 📝 API Usage Notes

**Pexels API:**
- Rate limit: 200 requests/hour
- 40 videos per category = 400 videos total
- Free, royalty-free content

**Pixabay API:**
- Rate limit: 100 requests/hour
- 40 videos per category = 400 videos total
- Free, royalty-free content

**Total Expected:** 400-800 videos (depends on API availability)

---

## 🎨 Admin Controls

### Video Library (`/admin/video-library`):
- **Search** by category or keyword
- **Toggle** video visibility
- **Mark** as featured (appears more often)
- **Delete** unwanted videos
- **Manual upload** via URL

### Auto Import Page (`/admin/auto-import`):
- **One-click** import all categories
- **Progress** tracking
- **Summary** of imported videos
- **Error** reporting

---

## ✨ Performance Optimizations

### Reels Feed:
- ✅ Lazy video loading
- ✅ Preload next video metadata
- ✅ Throttled scroll detection
- ✅ Autoplay with fallback to thumbnail
- ✅ Smooth snap scrolling

### AI Voice:
- ✅ Voice caching
- ✅ Auto-retry on errors
- ✅ Continuous conversation mode
- ✅ Better voice selection algorithm

---

## 📞 Support

If videos still don't appear after running auto-import:
1. Check browser console for errors
2. Verify API keys are correct
3. Try manual import by category
4. Contact support with error logs

**All content is real, high-quality, and professional - no fake animations!** 🎉