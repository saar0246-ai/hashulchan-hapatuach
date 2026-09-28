import { Link } from 'react-router-dom'
import { MapPin, Users, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import type { Event } from '../types'
import {
  KASHRUT_LABELS, KASHRUT_COLORS,
  RELIGIOUS_LABELS, RELIGIOUS_COLORS,
  EVENT_TYPE_LABELS,
} from '../types'
import ProfileAvatar from './ProfileAvatar'
import StarRating from './StarRating'

interface EventCardProps {
  event: Event
  className?: string
}

const EVENT_TYPE_EMOJI: Record<string, string> = {
  shabbat_dinner: '🕯️',
  shabbat_lunch: '☀️',
  holiday: '🎉',
  weekday: '🍽️',
}

const EVENT_TYPE_GRADIENT: Record<string, string> = {
  shabbat_dinner: 'linear-gradient(135deg, #6B1224 0%, #2C0712 100%)',
  shabbat_lunch:  'linear-gradient(135deg, #C67C00 0%, #8B5000 100%)',
  holiday:        'linear-gradient(135deg, #1a5c3a 0%, #0d3320 100%)',
  weekday:        'linear-gradient(135deg, #1e3a5f 0%, #0e2035 100%)',
}

export default function EventCard({ event, className = '' }: EventCardProps) {
  const spotsLeft = event.max_guests - event.current_guests
  const isFull = spotsLeft <= 0
  const dateObj = new Date(event.event_date + 'T00:00:00')
  const dateStr = format(dateObj, "EEEE, d בMMM", { locale: he })
  const fillPct = Math.min(100, (event.current_guests / event.max_guests) * 100)

  return (
    <Link to={`/events/${event.id}`} className={`block group ${className}`}>
      <div className="shulchan-card">

        {/* Colored header strip */}
        <div
          className="relative px-4 pt-4 pb-3 flex items-start justify-between gap-2"
          style={{ background: EVENT_TYPE_GRADIENT[event.event_type] }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{EVENT_TYPE_EMOJI[event.event_type]}</span>
            <div>
              <p className="text-xs text-white/65 font-medium">
                {EVENT_TYPE_LABELS[event.event_type]}
                {event.holiday_name ? ` • ${event.holiday_name}` : ''}
              </p>
              <h3 className="font-display font-bold text-white text-base leading-tight line-clamp-2">
                {event.title}
              </h3>
            </div>
          </div>
          {isFull ? (
            <span className="flex-shrink-0 badge bg-white/15 text-white/80 border border-white/20 text-[10px]">
              מלא
            </span>
          ) : (
            <span className="flex-shrink-0 badge bg-white/15 text-white text-[10px] border border-white/20">
              {spotsLeft} מקומות
            </span>
          )}
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">

          {/* Date + location */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{dateStr}</span>
              <span className="text-border">·</span>
              <span>{event.event_time.slice(0, 5)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{event.city}{event.neighborhood ? `, ${event.neighborhood}` : ''}</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <span className={`badge text-[11px] ${KASHRUT_COLORS[event.kashrut_level]}`}>
              {KASHRUT_LABELS[event.kashrut_level]}
            </span>
            {event.preferred_religious_levels.length > 0 && (
              <span className={`badge text-[11px] ${RELIGIOUS_COLORS[event.preferred_religious_levels[0]]}`}>
                {RELIGIOUS_LABELS[event.preferred_religious_levels[0]]}
                {event.preferred_religious_levels.length > 1 ? ` +${event.preferred_religious_levels.length - 1}` : ''}
              </span>
            )}
          </div>

          {/* Host row + capacity */}
          {event.host && (
            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <div className="flex items-center gap-2">
                <ProfileAvatar
                  name={event.host.display_name}
                  avatarUrl={event.host.avatar_url}
                  size="sm"
                />
                <div>
                  <p className="text-xs font-semibold text-foreground">{event.host.display_name}</p>
                  {event.host.rating_count_host > 0 && (
                    <StarRating score={Math.round(event.host.rating_as_host)} count={event.host.rating_count_host} />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{event.current_guests}/{event.max_guests}</span>
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${fillPct}%`,
                      background: fillPct >= 80 ? '#e53e3e' : 'hsl(var(--primary))',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
