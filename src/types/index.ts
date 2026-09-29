export type KashrutLevel = 'mehadrin' | 'kosher' | 'traditional' | 'none'
export type ReligiousLevel = 'haredi' | 'hardali' | 'dati' | 'dati_leumi' | 'dati_light' | 'masorti' | 'hiloni'
export type Gender = 'male' | 'female' | 'other'
export type EventType = 'shabbat_dinner' | 'shabbat_lunch' | 'holiday' | 'weekday'
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type EventStatus = 'active' | 'full' | 'cancelled' | 'completed'
export type NotificationType =
  | 'new_guest_request'
  | 'request_approved'
  | 'request_rejected'
  | 'new_rating'
  | 'event_reminder'
  | 'system'

export type UserRole = 'user' | 'admin' | 'moderator'
export type ReportReason = 'spam' | 'inappropriate' | 'abuse' | 'fake' | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  age: number | null
  birthday: string | null
  gender: Gender | null
  role: UserRole
  is_banned: boolean
  city: string | null
  neighborhood: string | null
  kashrut_level: KashrutLevel | null
  religious_level: ReligiousLevel | null
  guest_kashrut_prefs: KashrutLevel[] | null
  phone: string | null
  bio: string | null
  verified: boolean
  onboarding_completed: boolean
  rating_as_host: number
  rating_count_host: number
  rating_as_guest: number
  rating_count_guest: number
  total_hosted: number
  total_guested: number
  created_at: string
}

export interface Event {
  id: string
  host_id: string
  title: string
  event_type: EventType
  holiday_name: string | null
  event_date: string
  event_time: string
  city: string
  neighborhood: string
  address: string
  address_notes: string | null
  max_guests: number
  current_guests: number
  kashrut_level: KashrutLevel
  description: string | null
  preferred_religious_levels: ReligiousLevel[]
  min_age: number | null
  max_age: number | null
  status: EventStatus
  created_at: string
  host?: Profile
}

export interface EventRegistration {
  id: string
  event_id: string
  guest_id: string
  status: RegistrationStatus
  message_to_host: string | null
  created_at: string
  responded_at: string | null
  guest?: Profile
  event?: Event
}

export interface Rating {
  id: string
  event_id: string
  rater_id: string
  rated_id: string
  role: 'as_host' | 'as_guest'
  score: number
  comment: string | null
  created_at: string
  rater?: Profile
}

export interface Report {
  id: string
  reporter_id: string
  reported_id: string
  event_id: string | null
  reason: ReportReason
  details: string | null
  status: ReportStatus
  admin_notes: string | null
  created_at: string
  resolved_at: string | null
  reporter?: Profile
  reported?: Profile
}

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: 'ספאם',
  inappropriate: 'תוכן לא הולם',
  abuse: 'התנהגות פוגענית',
  fake: 'פרופיל מזויף',
  other: 'אחר',
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, string> | null
  read: boolean
  created_at: string
}

export const KASHRUT_LABELS: Record<KashrutLevel, string> = {
  mehadrin: 'מהדרין',
  kosher: 'כשר',
  traditional: 'מסורתי',
  none: 'לא כשר',
}

export const RELIGIOUS_LABELS: Record<ReligiousLevel, string> = {
  haredi:     'חרדי',
  hardali:    'חרדל"ש',
  dati:       'דתי',
  dati_leumi: 'דתל"ש',
  dati_light: 'דתי לייט',
  masorti:    'מסורתי',
  hiloni:     'חילוני',
}

export const GENDER_LABELS: Record<Gender, string> = {
  male:   'זכר',
  female: 'נקבה',
  other:  'אחר',
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  shabbat_dinner: 'ארוחת שישי',
  shabbat_lunch: 'ארוחת שבת',
  holiday: 'חג',
  weekday: 'אמצע שבוע',
}

export const KASHRUT_COLORS: Record<KashrutLevel, string> = {
  mehadrin: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  kosher: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  traditional: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  none: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export const RELIGIOUS_COLORS: Record<ReligiousLevel, string> = {
  haredi:     'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  hardali:    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  dati:       'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  dati_leumi: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  dati_light: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  masorti:    'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  hiloni:     'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}
