import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clapperboard, Film, Loader2, Music2, Play, Plus, Sparkles, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { spiceyApi } from '@/api/spiceyApi';
import { useQueryClient } from '@tanstack/react-query';

const FILM_LOOKS = [
  { id: 'sunset', label: 'Sunset Film', gradient: 'linear-gradient(135deg, rgba(255,122,24,.92), rgba(255,45,143,.82))', filter: 'contrast(1.08) saturate(1.28) sepia(.12)' },
  { id: 'neon', label: 'Neon Night', gradient: 'linear-gradient(135deg, rgba(143,60,255,.92), rgba(255,45,143,.84))', filter: 'contrast(1.14) saturate(1.42) hue-rotate(-8deg)' },
  { id: 'cinema', label: 'Cinema Gold', gradient: 'linear-gradient(135deg, rgba(255,185,56,.92), rgba(255,85,0,.78))', filter: 'contrast(1.18) saturate(1.12) sepia(.22)' },
  { id: 'dream', label: 'Dream Soft', gradient: 'linear-gradient(135deg, rgba(255,230,246,.82), rgba(186,77,255,.68))', filter: 'contrast(1.02) saturate(1.16) brightness(1.05)' },
];

const MUSIC_MOODS = ['Cinematic Rise', 'Beach Night', 'Urban Pulse', 'Soft Romance', 'No Music'];
const MAX_SHORT_FILM_CLIPS = 5;
const MAX_CLIP_SECONDS = 60;
const MAX_TOTAL_SECONDS = 180;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;

function formatSeconds(value) {
  const seconds = Number(value) || 0;
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
}

function formatMegabytes(value) {
  return `${Math.round((Number(value) || 0) / 1024 / 1024)}MB`;
}

function readVideoDuration(url) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.onloadedmetadata = () => {
      resolve(Number.isFinite(video.duration) ? video.duration : 6);
      video.src = '';
      video.load();
    };
    video.onerror = () => resolve(6);
    video.src = url;
  });
}

export default function ShortFilmStudio() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const [clips, setClips] = useState([]);
  const [title, setTitle] = useState('My Spicey Short Film');
  const [subtitle, setSubtitle] = useState('A cinematic moment by Spicey');
  const [lookId, setLookId] = useState('sunset');
  const [music, setMusic] = useState('Cinematic Rise');
  const [activeClipId, setActiveClipId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeLook = FILM_LOOKS.find((look) => look.id === lookId) || FILM_LOOKS[0];
  const activeClip = clips.find((clip) => clip.id === activeClipId) || clips[0];
  const totalDuration = clips.reduce((sum, clip) => sum + (clip.duration || 6), 0);

  const storyboard = useMemo(() => clips.map((clip, index) => ({
    ...clip,
    sceneTitle: index === 0 ? 'Opening Shot' : index === clips.length - 1 ? 'Final Shot' : `Scene ${index + 1}`,
  })), [clips]);

  const handleFiles = async (files) => {
    const videoFiles = Array.from(files || []).filter((file) => file.type.startsWith('video/'));

    if (!videoFiles.length) {
      toast.error('Choose video clips first');
      return;
    }

    if (clips.length + videoFiles.length > MAX_SHORT_FILM_CLIPS) {
      toast.error(`Short Film limit is ${MAX_SHORT_FILM_CLIPS} clips`);
      return;
    }

    const currentBytes = clips.reduce((sum, clip) => sum + (clip.size || 0), 0);
    const nextBytes = videoFiles.reduce((sum, file) => sum + file.size, 0);
    if (currentBytes + nextBytes > MAX_TOTAL_BYTES) {
      toast.error(`Short Film max upload is ${formatMegabytes(MAX_TOTAL_BYTES)}`);
      return;
    }

    const nextClips = await Promise.all(videoFiles.map(async (file, index) => {
      const id = `${Date.now()}-${index}-${file.name}`;
      const url = URL.createObjectURL(file);
      const duration = Math.round(await readVideoDuration(url));
      return {
        id,
        name: file.name.replace(/\.[^.]+$/, ''),
        file,
        url,
        duration,
        size: file.size,
      };
    }));

    const longClip = nextClips.find((clip) => clip.duration > MAX_CLIP_SECONDS);
    if (longClip) {
      nextClips.forEach((clip) => URL.revokeObjectURL(clip.url));
      toast.error(`${longClip.name} is too long. Max ${MAX_CLIP_SECONDS}s per clip.`);
      return;
    }

    const nextTotalDuration = totalDuration + nextClips.reduce((sum, clip) => sum + clip.duration, 0);
    if (nextTotalDuration > MAX_TOTAL_SECONDS) {
      nextClips.forEach((clip) => URL.revokeObjectURL(clip.url));
      toast.error(`Short Film max length is ${formatSeconds(MAX_TOTAL_SECONDS)}`);
      return;
    }

    setClips((prev) => {
      const merged = [...prev, ...nextClips];
      if (!activeClipId) setActiveClipId(merged[0]?.id || null);
      return merged;
    });
  };

  const removeClip = (clipId) => {
    setClips((prev) => {
      const next = prev.filter((clip) => clip.id !== clipId);
      if (activeClipId === clipId) setActiveClipId(next[0]?.id || null);
      return next;
    });
  };

  const playNextClip = (event) => {
    if (clips.length <= 1) {
      event.currentTarget.currentTime = 0;
      event.currentTarget.play().catch(() => {});
      return;
    }
    const index = clips.findIndex((clip) => clip.id === activeClip?.id);
    const next = clips[(index + 1) % clips.length];
    setActiveClipId(next?.id || clips[0]?.id || null);
  };

  const saveDraft = () => {
    const payload = {
      title,
      subtitle,
      lookId,
      music,
      clips: clips.map(({ id, name, duration }) => ({ id, name, duration })),
      saved_at: new Date().toISOString(),
    };
    localStorage.setItem('spicey_short_film_draft', JSON.stringify(payload));
    toast.success('Short film draft saved');
  };

  const publishShortFilm = async () => {
    if (!clips.length) {
      toast.error('Upload at least one video clip');
      return;
    }

    setIsSaving(true);
    try {
      const uploadedClips = [];

      for (const clip of clips) {
        const uploaded = await spiceyApi.media.upload(clip.file, { folder: 'short-films' });
        uploadedClips.push({
          id: clip.id,
          name: clip.name,
          duration: clip.duration,
          size: clip.size,
          url: uploaded.file_url || uploaded.url,
          path: uploaded.path || uploaded.file_uri,
          bucket: uploaded.bucket || 'spicey-media',
        });
      }

      const render = await spiceyApi.media.renderShortFilm({
        title,
        subtitle,
        look: lookId,
        music,
        clips: uploadedClips,
      });

      await spiceyApi.posts.create({
        caption: `${title}\n${subtitle}`,
        post_type: 'short_film',
        video_url: uploadedClips[0]?.url || null,
        music_title: music === 'No Music' ? null : music,
        tags: [
          'short_film',
          lookId,
          music,
          `clips:${uploadedClips.length}`,
          `render:${render.render?.id || 'draft'}`,
        ].filter(Boolean),
      });

      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Short Film saved to Spicey');
      navigate('/');
    } catch (error) {
      toast.error(error?.message || 'Could not save Short Film');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="spicey-short-film">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        hidden
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <header className="spicey-short-film-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft />
        </button>
        <div>
          <span>SPICEY</span>
          <strong>Short Film Studio</strong>
        </div>
        <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Upload videos">
          <Upload />
        </button>
      </header>

      <section className="spicey-short-film-preview" style={{ '--film-look': activeLook.gradient }}>
        <div className="spicey-short-film-screen">
          {activeClip ? (
            <video key={activeClip.id} src={activeClip.url} autoPlay muted playsInline onEnded={playNextClip} style={{ filter: activeLook.filter }} />
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="spicey-short-film-empty">
              <Film />
              <span>Upload short video clips</span>
              <small>Spicey will turn them into a film-style story.</small>
            </button>
          )}
          <div className="spicey-film-letterbox top" />
          <div className="spicey-film-letterbox bottom" />
          <div className="spicey-film-title-card">
            <small>{music}</small>
            <h1>{title || 'Untitled Short Film'}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="spicey-film-play-pill">
            <Play />
            <span>{clips.length} clips • {formatSeconds(totalDuration)}</span>
          </div>
        </div>
      </section>

      <div className="spicey-short-film-limits">
        <span>{clips.length}/{MAX_SHORT_FILM_CLIPS} clips</span>
        <span>{formatSeconds(totalDuration)}/{formatSeconds(MAX_TOTAL_SECONDS)}</span>
        <span>{formatMegabytes(clips.reduce((sum, clip) => sum + (clip.size || 0), 0))}/{formatMegabytes(MAX_TOTAL_BYTES)}</span>
      </div>

      <section className="spicey-short-film-fields">
        <label>
          <span>Film Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Your film title" />
        </label>
        <label>
          <span>Subtitle</span>
          <input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="Small intro text" />
        </label>
      </section>

      <section className="spicey-short-film-tools">
        <div className="spicey-tool-title">
          <Sparkles />
          <span>Film Color</span>
        </div>
        <div className="spicey-film-look-grid">
          {FILM_LOOKS.map((look) => (
            <button
              key={look.id}
              type="button"
              onClick={() => setLookId(look.id)}
              className={look.id === lookId ? 'active' : ''}
              style={{ '--look': look.gradient }}
            >
              <i />
              <span>{look.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="spicey-short-film-tools">
        <div className="spicey-tool-title">
          <Music2 />
          <span>Music Mood</span>
        </div>
        <div className="spicey-film-music-row">
          {MUSIC_MOODS.map((mood) => (
            <button key={mood} type="button" onClick={() => setMusic(mood)} className={music === mood ? 'active' : ''}>
              {mood}
            </button>
          ))}
        </div>
      </section>

      <section className="spicey-short-film-timeline">
        <div className="spicey-tool-title">
          <Clapperboard />
          <span>Storyboard</span>
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            <Plus />
            Add Clips
          </button>
        </div>
        <div className="spicey-film-clips">
          {storyboard.map((clip, index) => (
            <motion.article
              key={clip.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveClipId(clip.id)}
              className={activeClip?.id === clip.id ? 'active' : ''}
            >
              <video src={clip.url} muted playsInline />
              <div>
                <small>{clip.sceneTitle}</small>
                <strong>{clip.name}</strong>
                <span>{formatSeconds(clip.duration)}</span>
              </div>
              <button type="button" onClick={(event) => { event.stopPropagation(); removeClip(clip.id); }} aria-label="Remove clip">
                <Trash2 />
              </button>
            </motion.article>
          ))}
        </div>
      </section>

      <footer className="spicey-short-film-actions">
        <button type="button" onClick={saveDraft}>Save Draft</button>
        <button type="button" onClick={publishShortFilm} disabled={isSaving || !clips.length}>
          {isSaving ? <Loader2 className="spin" /> : <Clapperboard />}
          Create Short Film
        </button>
      </footer>
    </main>
  );
}
