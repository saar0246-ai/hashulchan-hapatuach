import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import type { KashrutLevel, ReligiousLevel } from '../types'
import { KASHRUT_LABELS, RELIGIOUS_LABELS } from '../types'

export interface FilterState {
  kashrut: KashrutLevel | ''
  religious: ReligiousLevel | ''
  city: string
  eventType: string
}

interface FilterBarProps {
  value: FilterState
  onChange: (f: FilterState) => void
}

const CITIES = ['ירושלים', 'תל אביב', 'חיפה', 'ראשון לציון', 'פתח תקוה', 'אשדוד', 'נתניה', 'באר שבע', 'בני ברק', 'בת ים', 'רחובות', 'רמת גן']
const EVENT_TYPES = [
  { value: 'shabbat_dinner', label: 'ארוחת שישי' },
  { value: 'shabbat_lunch', label: 'ארוחת שבת' },
  { value: 'holiday', label: 'חג' },
  { value: 'weekday', label: 'אמצע שבוע' },
]

export default function FilterBar({ value, onChange }: FilterBarProps) {
  const [open, setOpen] = useState(false)

  const hasFilters = value.kashrut || value.religious || value.city || value.eventType
  const activeCount = [value.kashrut, value.religious, value.city, value.eventType].filter(Boolean).length

  const clear = () => onChange({ kashrut: '', religious: '', city: '', eventType: '' })

  return (
    <div>
      {/* Trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            hasFilters
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          סינון
          {activeCount > 0 && (
            <span className="w-4 h-4 bg-primary-foreground text-primary text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {hasFilters && (
          <button
            onClick={clear}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            נקה
          </button>
        )}
      </div>

      {/* Filter panel */}
      {open && (
        <div className="mt-3 shulchan-card p-4 space-y-4 animate-slide-down">
          {/* Event type */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">סוג אירוע</p>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => onChange({ ...value, eventType: value.eventType === t.value ? '' : t.value })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    value.eventType === t.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kashrut */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">כשרות</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(KASHRUT_LABELS) as KashrutLevel[]).map(k => (
                <button
                  key={k}
                  onClick={() => onChange({ ...value, kashrut: value.kashrut === k ? '' : k })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    value.kashrut === k
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {KASHRUT_LABELS[k]}
                </button>
              ))}
            </div>
          </div>

          {/* Religious level */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">רמה דתית</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(RELIGIOUS_LABELS) as ReligiousLevel[]).map(r => (
                <button
                  key={r}
                  onClick={() => onChange({ ...value, religious: value.religious === r ? '' : r })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    value.religious === r
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {RELIGIOUS_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">עיר</p>
            <select
              value={value.city}
              onChange={e => onChange({ ...value, city: e.target.value })}
              className="shulchan-input text-sm"
            >
              <option value="">כל הערים</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="w-full btn-primary py-2.5 text-sm"
          >
            הצג תוצאות
          </button>
        </div>
      )}
    </div>
  )
}
