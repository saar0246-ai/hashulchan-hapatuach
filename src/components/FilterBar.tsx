import { X } from 'lucide-react'
import type { KashrutLevel, ReligiousLevel } from '../types'
import { KASHRUT_LABELS } from '../types'

export interface FilterState {
  kashrut: KashrutLevel[]
  religious: ReligiousLevel | ''
  city: string
  eventType: string
}

interface FilterBarProps {
  value: FilterState
  onChange: (f: FilterState) => void
}

const EVENT_TYPE_PILLS = [
  { value: 'shabbat_dinner', label: '🕯️ שישי' },
  { value: 'shabbat_lunch',  label: '☀️ שבת' },
  { value: 'holiday',        label: '🎉 חג' },
  { value: 'weekday',        label: '🍽️ חול' },
]

const CITIES = ['ירושלים', 'תל אביב', 'חיפה', 'ראשון לציון', 'פתח תקוה', 'אשדוד', 'נתניה', 'באר שבע', 'בני ברק']

const KASHRUT_PILLS: { value: KashrutLevel; label: string }[] = (Object.keys(KASHRUT_LABELS) as KashrutLevel[]).map(k => ({
  value: k,
  label: KASHRUT_LABELS[k],
}))

export default function FilterBar({ value, onChange }: FilterBarProps) {
  const active = [value.kashrut.length > 0, !!value.religious, !!value.city, !!value.eventType].filter(Boolean).length

  const toggleKashrut = (k: KashrutLevel) => {
    const next = value.kashrut.includes(k)
      ? value.kashrut.filter(v => v !== k)
      : [...value.kashrut, k]
    onChange({ ...value, kashrut: next })
  }

  const pill = (
    label: string,
    isActive: boolean,
    onClick: () => void,
  ) => (
    <button
      key={label}
      onClick={onClick}
      className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
      style={isActive ? {
        background: 'linear-gradient(135deg, hsl(347,72%,26%), hsl(347,72%,18%))',
        color: '#fff',
        boxShadow: '0 2px 8px hsl(347,72%,20%/0.35)',
      } : {
        background: 'hsl(var(--muted))',
        color: 'hsl(var(--muted-foreground))',
      }}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-2.5">
      {/* Event type row */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {EVENT_TYPE_PILLS.map(t =>
          pill(t.label, value.eventType === t.value, () =>
            onChange({ ...value, eventType: value.eventType === t.value ? '' : t.value })
          )
        )}
        {KASHRUT_PILLS.map(k =>
          pill(k.label, value.kashrut.includes(k.value), () => toggleKashrut(k.value))
        )}
        {CITIES.slice(0, 5).map(c =>
          pill(c, value.city === c, () =>
            onChange({ ...value, city: value.city === c ? '' : c })
          )
        )}
        {/* All cities select */}
        <select
          value={value.city}
          onChange={e => onChange({ ...value, city: e.target.value })}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground outline-none cursor-pointer"
          style={{ WebkitAppearance: 'none', appearance: 'none' }}
        >
          <option value="">🏙️ כל הערים</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Active filters summary */}
      {active > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{active} סינונים פעילים</span>
          <button
            onClick={() => onChange({ kashrut: [], religious: '', city: '', eventType: '' })}
            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
          >
            <X className="w-3 h-3" />
            נקה
          </button>
        </div>
      )}
    </div>
  )
}
