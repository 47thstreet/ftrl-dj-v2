import { useState } from 'react';

interface ProfileData {
  displayName: string;
  tagline: string;
  bio: string;
  primaryColor: string;
  accentColor: string;
  heroImage: string;
  logoImage: string;
  socialLinks: Record<string, string>;
  genres: string[];
  isPublished: boolean;
  slug: string;
}

const PLATFORMS = [
  'spotify', 'apple_music', 'soundcloud', 'youtube',
  'tiktok', 'instagram', 'beatport', 'bandcamp', 'mixcloud', 'website',
];

export default function ProfileForm({ profile }: { profile: ProfileData }) {
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [genreInput, setGenreInput] = useState('');

  const update = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateLink = (platform: string, url: string) => {
    setForm(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: url },
    }));
    setSaved(false);
  };

  const removeLink = (platform: string) => {
    setForm(prev => {
      const links = { ...prev.socialLinks };
      delete links[platform];
      return { ...prev, socialLinks: links };
    });
  };

  const addGenre = () => {
    const g = genreInput.trim();
    if (g && !form.genres.includes(g)) {
      update('genres', [...form.genres, g]);
      setGenreInput('');
    }
  };

  const removeGenre = (g: string) => {
    update('genres', form.genres.filter(x => x !== g));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/dj/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Save failed');
      }
      setSaved(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Basic Info */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Basic Info</h2>
        <div style={fieldGroup}>
          <label style={labelStyle}>Display Name</label>
          <input
            style={inputStyle}
            value={form.displayName}
            onChange={e => update('displayName', e.target.value)}
          />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Tagline</label>
          <input
            style={inputStyle}
            value={form.tagline}
            onChange={e => update('tagline', e.target.value)}
            placeholder="Your sound in one line"
          />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Bio</label>
          <textarea
            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
            value={form.bio}
            onChange={e => update('bio', e.target.value)}
            placeholder="Tell your story..."
          />
        </div>
      </section>

      {/* Genres */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Genres</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
          {form.genres.map(g => (
            <span
              key={g}
              style={{
                padding: '0.25rem 0.625rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              {g}
              <button
                onClick={() => removeGenre(g)}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                  cursor: 'pointer', fontSize: '0.875rem', padding: 0, lineHeight: 1,
                }}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={genreInput}
            onChange={e => setGenreInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addGenre())}
            placeholder="Add genre..."
          />
          <button onClick={addGenre} style={btnSecondary}>Add</button>
        </div>
      </section>

      {/* Colors */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Brand Colors</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={fieldGroup}>
            <label style={labelStyle}>Primary</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={form.primaryColor}
                onChange={e => update('primaryColor', e.target.value)}
                style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
              />
              <input
                style={{ ...inputStyle, width: '120px' }}
                value={form.primaryColor}
                onChange={e => update('primaryColor', e.target.value)}
              />
            </div>
          </div>
          <div style={fieldGroup}>
            <label style={labelStyle}>Accent</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={form.accentColor}
                onChange={e => update('accentColor', e.target.value)}
                style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
              />
              <input
                style={{ ...inputStyle, width: '120px' }}
                value={form.accentColor}
                onChange={e => update('accentColor', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div style={{
          marginTop: '0.75rem', padding: '1rem', borderRadius: '0.75rem',
          background: `linear-gradient(135deg, ${form.primaryColor}22, ${form.accentColor}22)`,
          border: `1px solid ${form.primaryColor}33`,
          fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
        }}>
          Preview gradient
        </div>
      </section>

      {/* Images */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Images</h2>
        <div style={fieldGroup}>
          <label style={labelStyle}>Hero Image URL</label>
          <input
            style={inputStyle}
            value={form.heroImage}
            onChange={e => update('heroImage', e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Logo Image URL</label>
          <input
            style={inputStyle}
            value={form.logoImage}
            onChange={e => update('logoImage', e.target.value)}
            placeholder="https://..."
          />
        </div>
      </section>

      {/* Social Links */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Social Links</h2>
        {PLATFORMS.map(p => (
          <div key={p} style={{ ...fieldGroup, marginBottom: '0.5rem' }}>
            <label style={labelStyle}>
              {p === 'apple_music' ? 'Apple Music' : p.charAt(0).toUpperCase() + p.slice(1)}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={form.socialLinks[p] || ''}
                onChange={e => updateLink(p, e.target.value)}
                placeholder={`https://${p === 'website' ? 'your-site.com' : p + '.com/...'}`}
              />
              {form.socialLinks[p] && (
                <button onClick={() => removeLink(p)} style={btnDanger}>&times;</button>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Publish */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>Visibility</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => update('isPublished', !form.isPublished)}
            style={{
              ...btnSecondary,
              background: form.isPublished ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
              borderColor: form.isPublished ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)',
              color: form.isPublished ? '#22c55e' : 'rgba(255,255,255,0.5)',
            }}
          >
            {form.isPublished ? 'Published' : 'Draft'}
          </button>
          <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)' }}>
            {form.isPublished ? 'Your page is live at ftrl.ink/' + form.slug : 'Your page is hidden'}
          </span>
        </div>
      </section>

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={save} disabled={saving} style={btnPrimary}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && <span style={{ fontSize: '0.8125rem', color: '#22c55e', fontWeight: 600 }}>Saved!</span>}
        {error && <span style={{ fontSize: '0.8125rem', color: '#ef4444', fontWeight: 600 }}>{error}</span>}
      </div>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '0.75rem',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 800,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.2)',
  marginBottom: '1rem',
};

const fieldGroup: React.CSSProperties = {
  marginBottom: '0.75rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.4)',
  marginBottom: '0.375rem',
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
  padding: '0.75rem 2rem',
  borderRadius: '0.5rem',
  border: 'none',
  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  color: 'white',
  fontSize: '0.875rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const btnSecondary: React.CSSProperties = {
  padding: '0.625rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.6)',
  fontSize: '0.8125rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const btnDanger: React.CSSProperties = {
  padding: '0.625rem 0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid rgba(239,68,68,0.2)',
  background: 'rgba(239,68,68,0.1)',
  color: '#ef4444',
  fontSize: '1rem',
  cursor: 'pointer',
  fontFamily: 'Inter, system-ui, sans-serif',
};
