import { Check, X, Clock, User } from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import type { EventRegistration, RegistrationStatus } from '../types'
import { KASHRUT_LABELS, RELIGIOUS_LABELS } from '../types'
import ProfileAvatar from './ProfileAvatar'
import StarRating from './StarRating'
import { Link } from 'react-router-dom'

interface GuestCardProps {
  registration: EventRegistration
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  loading?: boolean
}

const STATUS_STYLES: Record<RegistrationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending: 'ממתין',
  approved: 'מאושר',
  rejected: 'נדחה',
  cancelled: 'בוטל',
}

export default function GuestCard({ registration, onApprove, onReject, loading }: GuestCardProps) {
  const guest = registration.guest
  if (!guest) return null

  return (
    <div className="shulchan-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Link to={`/profile/${guest.id}`} className="flex items-center gap-3 flex-1">
          <ProfileAvatar name={guest.display_name} avatarUrl={guest.avatar_url} size="md" />
          <div>
            <p className="font-semibold text-foreground">{guest.display_name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              {guest.age && <span>{guest.age} שנים</span>}
              {guest.city && <span>• {guest.city}</span>}
            </div>
            {guest.rating_count_guest > 0 && (
              <StarRating score={Math.round(guest.rating_as_guest)} count={guest.rating_count_guest} />
            )}
          </div>
        </Link>

        <span className={`badge ${STATUS_STYLES[registration.status]} flex-shrink-0`}>
          {STATUS_LABELS[registration.status]}
        </span>
      </div>

      {/* Guest details */}
      <div className="flex flex-wrap gap-2 text-xs">
        {guest.kashrut_level && (
          <span className="badge bg-muted text-muted-foreground">
            {KASHRUT_LABELS[guest.kashrut_level]}
          </span>
        )}
        {guest.religious_level && (
          <span className="badge bg-muted text-muted-foreground">
            {RELIGIOUS_LABELS[guest.religious_level]}
          </span>
        )}
        {guest.total_guested > 0 && (
          <span className="badge bg-muted text-muted-foreground">
            <User className="w-3 h-3 ml-1" />
            {guest.total_guested} ביקורים קודמים
          </span>
        )}
      </div>

      {/* Message to host */}
      {registration.message_to_host && (
        <div className="bg-muted/60 rounded-xl p-3 text-sm text-foreground">
          <p className="text-xs text-muted-foreground mb-1">הודעה:</p>
          <p>{registration.message_to_host}</p>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {format(new Date(registration.created_at), "d בMMM, HH:mm", { locale: he })}
      </p>

      {/* Actions for pending */}
      {registration.status === 'pending' && onApprove && onReject && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onApprove(registration.id)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-xl active:scale-95 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            אשר
          </button>
          <button
            onClick={() => onReject(registration.id)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl active:scale-95 transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            דחה
          </button>
        </div>
      )}
    </div>
  )
}
