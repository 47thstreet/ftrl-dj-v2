import { useState } from 'react';

interface AvailabilityEntry {
  id: string;
  date: string;
  status: string;
  note: string | null;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  available: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' },
  booked: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)', text: '#a78bfa' },
  unavailable: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' },
};

export default function AvailabilityCalendar({ entries: initialEntries }: { entries: AvailabilityEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [saving, setSaving] = useState(false);

  const entryMap = new Map(entries.map(e => [e.date, e]));

  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const monthName = new Date(viewMonth.year, viewMonth.month).toLocaleDateString('en', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setViewMonth(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setViewMonth(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const toggleDay = async (day: number) => {
    const dateStr = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existing = entryMap.get(dateStr);
    const statuses = ['available', 'booked', 'unavailable'];
    const nextStatus = existing
      ? statuses[(statuses.indexOf(existing.status) + 1) % statuses.length]
      : 'available';

    // If cycling past unavailable, remove
    if (existing && existing.status === 'unavailable') {
      setSaving(true);
      try {
        await fetch('/api/dj/availability', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateStr }),
        });
        setEntries(prev => prev.filter(e => e.date !== dateStr));
      } catch (e) {
        console.error(e);
      } finally {
        setSaving(false);
      }
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/dj/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, status: nextStatus }),
      });
      const data = await res.json();
      setEntries(prev => {
        const filtered = prev.filter(e => e.date !== dateStr);
        return [...filtered, data];
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} style={emptyCell} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const entry = entryMap.get(dateStr);
    const colors = entry ? STATUS_COLORS[entry.status] : null;
    const isPast = new Date(dateStr) < new Date(new Date().toDateString());

    cells.push(
      <button
        key={d}
        onClick={() => !isPast && toggleDay(d)}
        disabled={isPast || saving}
        style={{
          ...dayCell,
          background: colors?.bg || 'rgba(255,255,255,0.02)',
          borderColor: colors?.border || 'rgba(255,255,255,0.06)',
          color: isPast ? 'rgba(255,255,255,0.15)' : colors?.text || 'rgba(255,255,255,0.6)',
          cursor: isPast ? 'default' : 'pointer',
          opacity: isPast ? 0.4 : 1,
        }}
      >
        {d}
      </button>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLORS).map(([status, colors]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '3px',
              background: colors.bg, border: `1px solid ${colors.border}`,
            }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
              {status}
            </span>
          </div>
        ))}
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
          Click to cycle status
        </span>
      </div>

      {/* Calendar */}
      <div style={calendarCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button onClick={prevMonth} style={navBtn}>&larr;</button>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>{monthName}</span>
          <button onClick={nextMonth} style={navBtn}>&rarr;</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.375rem' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: '0.625rem', fontWeight: 800,
              color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase',
              padding: '0.25rem 0',
            }}>
              {d}
            </div>
          ))}
          {cells}
        </div>
      </div>
    </div>
  );
}

const calendarCard: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '0.75rem',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
};

const dayCell: React.CSSProperties = {
  aspectRatio: '1',
  borderRadius: '0.375rem',
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.8125rem',
  fontWeight: 700,
  fontFamily: 'Inter, system-ui, sans-serif',
  transition: 'all 0.15s',
};

const emptyCell: React.CSSProperties = {
  aspectRatio: '1',
};

const navBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.5)',
  borderRadius: '0.375rem',
  padding: '0.375rem 0.75rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontFamily: 'Inter, system-ui, sans-serif',
};
