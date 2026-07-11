import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function EditPostModal({ open, onClose, post, onSuccess }) {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && post) {
      setCaption(post.caption || '');
      setLocation(post.location || '');
      setHashtags(post.hashtags || []);
    }
  }, [open, post]);

  const handleSave = async () => {
    if (!post) return;
    setLoading(true);
    try {
      await base44.entities.Post.update(post.id, {
        caption,
        location,
        hashtags,
      });
      toast.success('Post updated');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to update post:', error);
      toast.error('Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagChange = (e) => {
    const text = e.target.value;
    const tags = text.split(',').map(t => t.trim().replace('#', '')).filter(t => t);
    setHashtags(tags);
  };

  if (!post) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="bg-card border-border rounded-t-3xl">
        <div className="space-y-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">Edit Post</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5">
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">Caption</label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="min-h-[100px] bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">Hashtags (comma separated)</label>
            <Input
              value={hashtags.join(', ')}
              onChange={handleHashtagChange}
              placeholder="spicey, viral, trending"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90"
            >
              {loading ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}