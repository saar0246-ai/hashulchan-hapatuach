import { Link } from 'react-router-dom'
import { MapPin, Users, Calendar, Clock } from 'lucide-react'
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

export default function EventCard({ event, className = '' }: EventCardProps) {
  const spotsLeft = event.max_guests - event.current_guests
  const isFull = spotsLeft <= 0
  const dateObj = new Date(event.event_date + 'T00:00:00')
  const dateStr = format(dateObj, 'EEEE, d בMMMM', { locale: he })

  return (
    <Link to={`/events/${event.id}`} className={`block ${className}`}>
      <div className="shulchan-card hover:shadow-md active:scale-[0.99] transition-all duration-200">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-l from-primary to-secondary" />

        <div className="p-4 space-y-3">
          {/* Type + status badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{EVENT_TYPE_EMOJI[event.event_type]}</span>
              <span className="text-sm font-medium text-muted-foreground">
                {EVENT_TYPE_LABELS[event.event_type]}
                {event.holiday_name ? ` • ${event.holiday_name}` : ''}
              </span>
            </div>
            {isFull ? (
              <span className="badge bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">מלא</span>
            ) : (
              <span className="badge bg-primary/15 text-primary">
                {spotsLeft} מקומות
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-lg text-foreground leading-tight">
            {event.title}
          </h3>

          {/* Date + time */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {dateStr}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {event.event_time.slice(0, 5)}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{event.city}{event.neighborhood ? `, ${event.neighborhood}` : ''}</span>
          </div>

          {/* Host info */}
          {event.host && (
            <div className="flex items-center justify-between pt-1 border-t border-border/60">
              <div className="flex items-center gap-2">
                <ProfileAvatar
                  name={event.host.display_name}
                  avatarUrl={event.host.avatar_url}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{event.host.display_name}</p>
                  {event.host.rating_count_host > 0 && (
                    <StarRating score={Math.round(event.host.rating_as_host)} count={event.host.rating_count_host} />
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-end">
                <span className={`badge ${KASHRUT_COLORS[event.kashrut_level]}`}>
                  {KASHRUT_LABELS[event.kashrut_level]}
                </span>
                {event.preferred_religious_levels.length > 0 && (
                  <span className={`badge ${RELIGIOUS_COLORS[event.preferred_religious_levels[0]]}`}>
                    {RELIGIOUS_LABELS[event.preferred_religious_levels[0]]}
                    {event.preferred_religious_levels.length > 1 ? ` +${event.preferred_religious_levels.length - 1}` : ''}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Guests count */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{event.current_guests} אורחים רשומים מתוך {event.max_guests}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, (event.current_guests / event.max_guests) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
