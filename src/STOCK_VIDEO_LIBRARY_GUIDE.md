# Stock Video Library Guide

## Overview
Spicey now has a comprehensive stock video library system with 200-500+ high-quality vertical videos from legal, free sources.

## Features

### 1. **StockVideo Entity**
- Stores all approved stock videos
- Categories: comedy, cars, travel, food, sports, animals, technology, motivation, luxury, entertainment, nature, fashion, music, dance, fitness
- Sources: Pexels, Pixabay, Mixkit, Admin Upload
- Metadata: title, video_url, thumbnail_url, author, duration, tags, is_active, is_featured

### 2. **Reels Feed Priority**
1. **User-uploaded reels** (shown first)
2. **Admin-curated reels** (CuratedReel entity)
3. **Stock videos** (StockVideo entity - fills the feed when user content is limited)

### 3. **Admin Video Library** (`/admin/video-library`)
- **View all stock videos** with search and filter
- **Upload manual URLs** - add videos from any source
- **Import from Pexels/Pixabay** - bulk import using APIs
- **Manage videos**: activate/hide, feature/unfeature, delete
- **Statistics**: total videos, active count, by category

### 4. **Backend Functions**
- `getReelsFeed` - Returns mixed feed (user + curated + stock)
- `addStockVideo` - Add single video manually
- `importStockVideos` - Bulk import from Pexels/Pixabay APIs
- `getStockVideosAdmin` - Get all videos for admin panel
- `updateStockVideo` - Update video metadata/status
- `deleteStockVideo` - Remove video from library

## Setup

### API Keys (Already Configured)
- `PEXELS_API_KEY` - Get free at https://www.pexels.com/api/new/
- `PIXABAY_API_KEY` - Get free at https://pixabay.com/api/docs/

### How to Import Videos

#### Option 1: Bulk Import from APIs
1. Go to **Admin Dashboard** → **Video Library**
2. Click **"Import from Pexels/Pixabay"**
3. Select source, category, and number of videos (max 50)
4. Click Import - videos will be fetched and added automatically

#### Option 2: Manual Upload
1. Go to **Video Library**
2. Click **"Add Manual URL"**
3. Fill in:
   - Video URL (direct link to .mp4)
   - Title
   - Category
   - Author name
   - Thumbnail URL (optional)
   - Duration
   - Tags (comma-separated)
   - Featured (optional)
4. Click **Upload Video**

### Best Practices

#### Video Quality
- ✅ Use only **vertical videos** (9:16 aspect ratio)
- ✅ Minimum 720p HD quality
- ✅ Duration: 15-60 seconds ideal for Reels
- ✅ No watermarks or logos

#### Legal Sources
- ✅ **Pexels** - Free, royalty-free, CC0 license
- ✅ **Pixabay** - Free, royalty-free, CC0 license  
- ✅ **Mixkit** - Free stock videos
- ✅ **Admin Upload** - Your own content or licensed content
- ❌ NO copyrighted content without permission
- ❌ NO cartoon/teddy bear/low-quality placeholders

#### Categories
Organize videos into these categories for better discovery:
- Comedy, Cars, Travel, Food, Sports
- Animals, Technology, Motivation, Luxury
- Entertainment, Nature, Fashion, Music, Dance, Fitness

#### Featured Videos
- Mark high-quality videos as **"Featured"**
- Featured videos appear more often in Reels feed
- Use for premium content that showcases platform quality

## Reels Feed Algorithm

The `getReelsFeed` function returns videos in this order:

```javascript
[
  ...userReels (up to 50 most recent),
  ...curatedReels (up to 100 active),
  ...stockVideos (up to 200 active)
]
```

This ensures:
- User content is always prioritized
- Feed never appears empty
- High-quality stock content fills gaps
- Diverse content across all categories

## Management Tips

### Regular Maintenance
- Review and remove low-performing stock videos
- Add fresh content weekly (20-50 new videos)
- Feature top-performing videos
- Monitor categories to ensure balance

### Content Strategy
- Start with 200+ videos across all categories
- Focus on trending categories: comedy, travel, food, motivation
- Add seasonal content (holidays, events)
- Include diverse representation

### Performance
- Videos are cached in Reels feed query (60s stale time)
- Only active videos appear in feed
- Featured videos get priority placement
- Thumbnails improve load performance

## Troubleshooting

### Videos Not Appearing in Reels
1. Check `is_active` status in Video Library
2. Verify video_url is accessible (not broken link)
3. Ensure category is valid
4. Refresh Reels page

### Import Fails
1. Verify API keys are set correctly
2. Check API rate limits (Pexels: 20,000 calls/month, Pixabay: 5,000 calls/day)
3. Ensure category name matches exactly
4. Try smaller batch size (10-20 videos)

### Quality Issues
- Remove videos with watermarks
- Delete low-resolution content (<720p)
- Replace horizontal videos with vertical ones
- Update thumbnails for better preview

## Future Enhancements

Potential improvements:
- Auto-categorization using AI
- Duplicate detection
- Performance analytics per video
- A/B testing thumbnails
- Auto-import scheduled jobs
- Integration with more sources (Unsplash Videos, Coverr)

---

**Support**: For issues or questions, contact admin@spicey.live