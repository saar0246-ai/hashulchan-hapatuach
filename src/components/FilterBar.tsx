import { X, Moon, Sun, Star, Utensils } from 'lucide-react'
import type { ReactNode } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
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

const EVENT_TYPE_PILLS: { value: string; label: string; icon: ReactNode }[] = [
  { value: 'shabbat_dinner', label: 'שישי',  icon: <Moon    className="w-3.5 h-3.5" strokeWidth={1.75} /> },
  { value: 'shabbat_lunch',  label: 'שבת',   icon: <Sun     className="w-3.5 h-3.5" strokeWidth={1.75} /> },
  { value: 'holiday',        label: 'חג',    icon: <Star    className="w-3.5 h-3.5" strokeWidth={1.75} /> },
  { value: 'weekday',        label: 'חול',   icon: <Utensils className="w-3.5 h-3.5" strokeWidth={1.75} /> },
]

const CITIES = ['ירושלים', 'תל אביב', 'חיפה', 'ראשון לציון', 'פתח תקוה', 'אשדוד', 'נתניה', 'באר שבע', 'בני ברק']

const KASHRUT_PILLS: { value: KashrutLevel; label: string }[] = (Object.keys(KASHRUT_LABELS) as KashrutLevel[]).map(k => ({
  value: k,
  label: KASHRUT_LABELS[k],
}))

const springTransition = { type: 'spring' as const, stiffness: 400, damping: 25 }

interface PillProps {
  label: string
  icon?: ReactNode
  isActive: boolean
  layoutId: string
  onClick: () => void
}

function AnimatedPill({ label, icon, isActive, layoutId, onClick }: PillProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
      style={{
        color: isActive ? '#fff' : 'hsl(var(--muted-foreground))',
        position: 'relative',
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={springTransition}
    >
      {isActive && (
        <motion.div
          layoutId={layoutId}
          className="absolute inset-0 rounded-full"
          style={{ background: '#C0522A', zIndex: 0 }}
          transition={springTransition}
        />
      )}
      {!isActive && (
        <span
          className="absolute inset-0 rounded-full"
          style={{ background: 'hsl(var(--muted))', zIndex: 0 }}
        />
      )}
      {icon && <span style={{ position: 'relative', zIndex: 10 }}>{icon}</span>}
      <span style={{ position: 'relative', zIndex: 10 }}>{label}</span>
    </motion.button>
  )
}

export default function FilterBar({ value, onChange }: FilterBarProps) {
  const active = [value.kashrut.length > 0, !!value.religious, !!value.city, !!value.eventType].filter(Boolean).length

  const toggleKashrut = (k: KashrutLevel) => {
    const next = value.kashrut.includes(k)
      ? value.kashrut.filter(v => v !== k)
      : [...value.kashrut, k]
    onChange({ ...value, kashrut: next })
  }

  return (
    <LayoutGroup>
      <div className="space-y-2.5">
        {/* Event type row */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {EVENT_TYPE_PILLS.map(t => (
            <AnimatedPill
              key={t.value}
              label={t.label}
              icon={t.icon}
              isActive={value.eventType === t.value}
              layoutId="activeEventTypePill"
              onClick={() => onChange({ ...value, eventType: value.eventType === t.value ? '' : t.value })}
            />
          ))}
          {KASHRUT_PILLS.map(k => (
            <AnimatedPill
              key={k.value}
              label={k.label}
              isActive={value.kashrut.includes(k.value)}
              layoutId="activeKashrutPill"
              onClick={() => toggleKashrut(k.value)}
            />
          ))}
          {CITIES.slice(0, 5).map(c => (
            <AnimatedPill
              key={c}
              label={c}
              isActive={value.city === c}
              layoutId="activeCityPill"
              onClick={() => onChange({ ...value, city: value.city === c ? '' : c })}
            />
          ))}
          {/* All cities select */}
          <select
            value={value.city}
            onChange={e => onChange({ ...value, city: e.target.value })}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground outline-none cursor-pointer"
            style={{ WebkitAppearance: 'none', appearance: 'none' }}
          >
            <option value="">כל הערים</option>
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
    </LayoutGroup>
  )
}
