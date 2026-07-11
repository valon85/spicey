import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, ChevronLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminPresetAvatars() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ label: '', gender: 'unisex', sort_order: 0 });
  const fileInputRef = useRef(null);

  const load = () => {
    setLoading(true);
    base44.entities.PresetAvatar.list('sort_order', 200)
      .then(setAvatars)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.entities.PresetAvatar.create({
          image_url: file_url,
          label: form.label || file.name.replace(/\.[^.]+$/, ''),
          gender: form.gender,
          sort_order: Number(form.sort_order),
          is_active: true,
        });
      }
      toast.success(`${files.length} avatar(s) imported!`);
      setForm({ label: '', gender: 'unisex', sort_order: 0 });
      load();
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.PresetAvatar.delete(id);
    setAvatars(prev => prev.filter(a => a.id !== id));
    toast.success('Avatar deleted');
  };

  const toggleActive = async (avatar) => {
    await base44.entities.PresetAvatar.update(avatar.id, { is_active: !avatar.is_active });
    setAvatars(prev => prev.map(a => a.id === avatar.id ? { ...a, is_active: !a.is_active } : a));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#060310', padding: '20px 16px', paddingTop: 'max(20px, env(safe-area-inset-top))' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft style={{ width: 20, height: 20, color: '#fff' }} />
        </button>
        <div>
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 20, margin: 0 }}>Preset Avatars</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>Import 3D avatars for users to choose</p>
        </div>
      </div>

      {/* Upload Form */}
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, marginBottom: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Import New Avatars</h2>
        
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <input
            value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            placeholder="Label (optional)"
            style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
          <select
            value={form.gender}
            onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' }}>
            <option value="unisex">Unisex</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
          <input
            type="number"
            value={form.sort_order}
            onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
            placeholder="Order"
            style={{ width: 80, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{ width: '100%', padding: '14px', borderRadius: 14, border: '2px dashed rgba(193,0,255,0.4)', background: 'rgba(193,0,255,0.06)', cursor: 'pointer', color: '#C100FF', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: uploading ? 0.5 : 1 }}>
          {uploading ? (
            <><div style={{ width: 18, height: 18, border: '2px solid rgba(193,0,255,0.3)', borderTopColor: '#C100FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Uploading...</>
          ) : (
            <><Upload style={{ width: 18, height: 18 }} /> Click to upload images (multiple allowed)</>
          )}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
      </div>

      {/* Avatar Grid */}
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 12 }}>
        {avatars.length} avatars total
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(193,0,255,0.2)', borderTopColor: '#C100FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {avatars.map(avatar => (
            <div key={avatar.id} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', opacity: avatar.is_active ? 1 : 0.4 }}>
              <img src={avatar.image_url} alt={avatar.label || ''} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
              
              {/* Gender badge */}
              <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.7)', borderRadius: 8, padding: '2px 6px', fontSize: 10, color: '#fff' }}>
                {avatar.gender === 'female' ? '👩' : avatar.gender === 'male' ? '👨' : '⚧'}
              </div>

              {/* Actions */}
              <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
                <button onClick={() => toggleActive(avatar)}
                  style={{ background: avatar.is_active ? 'rgba(0,200,100,0.8)' : 'rgba(100,100,100,0.8)', border: 'none', borderRadius: 8, padding: '4px 6px', cursor: 'pointer', fontSize: 10, color: '#fff', fontWeight: 600 }}>
                  {avatar.is_active ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => handleDelete(avatar.id)}
                  style={{ background: 'rgba(220,30,30,0.8)', border: 'none', borderRadius: 8, padding: '4px 6px', cursor: 'pointer' }}>
                  <Trash2 style={{ width: 12, height: 12, color: '#fff' }} />
                </button>
              </div>

              {avatar.label && (
                <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.5)' }}>
                  <div style={{ color: '#fff', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{avatar.label}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}