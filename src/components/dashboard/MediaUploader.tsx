import { useState } from 'react';

interface MediaItem {
  id: string;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  title: string | null;
  createdAt: string;
}

export default function MediaUploader({ media: initialMedia }: { media: MediaItem[] }) {
  const [media, setMedia] = useState(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('photo');

  const addMedia = async () => {
    if (!url.trim()) return;
    setUploading(true);
    try {
      const res = await fetch('/api/dj/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), title: title.trim() || null, type }),
      });
      if (!res.ok) throw new Error('Failed to add media');
      const item = await res.json();
      setMedia(prev => [item, ...prev]);
      setUrl('');
      setTitle('');
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      const res = await fetch(`/api/dj/media/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setMedia(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      {/* Add media form */}
      <div style={formCard}>
        <h3 style={formTitle}>Add Media</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {['photo', 'mix', 'video'].map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                ...typeBtn,
                background: type === t ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                borderColor: type === t ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)',
                color: type === t ? '#a78bfa' : 'rgba(255,255,255,0.4)',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <input
          style={inputStyle}
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Media URL (image, SoundCloud, YouTube...)"
        />
        <input
          style={{ ...inputStyle, marginTop: '0.5rem' }}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title (optional)"
        />
        <button
          onClick={addMedia}
          disabled={uploading || !url.trim()}
          style={{ ...btnPrimary, marginTop: '0.75rem', width: '100%' }}
        >
          {uploading ? 'Adding...' : 'Add Media'}
        </button>
      </div>

      {/* Media grid */}
      {media.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: '2rem', fontSize: '0.875rem' }}>
          No media yet. Add your first photo, mix, or video above.
        </p>
      ) : (
        <div style={gridStyle}>
          {media.map(item => (
            <div key={item.id} style={mediaCard}>
              {item.type === 'photo' ? (
                <div style={{
                  width: '100%', aspectRatio: '1', borderRadius: '0.5rem',
                  background: `url(${item.url}) center/cover`,
                  marginBottom: '0.5rem',
                }} />
              ) : (
                <div style={{
                  width: '100%', aspectRatio: '1', borderRadius: '0.5rem',
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.5rem', fontSize: '1.5rem',
                }}>
                  {item.type === 'mix' ? '🎵' : '🎬'}
                </div>
              )}
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.125rem' }}>
                {item.title || item.type}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {item.type}
                </span>
                <button
                  onClick={() => deleteMedia(item.id)}
                  style={{
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const formCard: React.CSSProperties = {
  padding: '1.25rem',
  borderRadius: '0.75rem',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  marginBottom: '1.5rem',
};

const formTitle: React.CSSProperties = {
  fontSize: '0.6875rem', fontWeight: 800,
  letterSpacing: '0.12em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.2)', marginBottom: '0.75rem',
};

const typeBtn: React.CSSProperties = {
  padding: '0.375rem 0.75rem',
  borderRadius: '0.375rem',
  border: '1px solid',
  fontSize: '0.75rem', fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  borderRadius: '0.5rem',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.03)',
  color: 'white',
  fontSize: '0.875rem',
  fontFamily: 'Inter, system-ui, sans-serif',
  outline: 'none',
};

const btnPrimary: React.CSSProperties = {
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: 'none',
  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  color: 'white',
  fontSize: '0.875rem', fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '1rem',
};

const mediaCard: React.CSSProperties = {
  padding: '0.75rem',
  borderRadius: '0.75rem',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
};
