export type Side = 'GROOM' | 'BRIDE'
export type GuestGroup = 'FAMILY' | 'FRIENDS' | 'WORK' | 'ARMY' | 'OTHER'
export type RsvpStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED'

export interface Guest {
  id: string
  name: string
  phone: string
  whatsapp: string
  side: Side
  group: GuestGroup
  rsvpStatus: RsvpStatus
  invitationSent: boolean
  invitationSentAt?: string
  invitationAcknowledged: boolean
  invitationAcknowledgedAt?: string
  attendanceConfirmed: boolean
  attendanceConfirmedAt?: string
  note?: string
  createdAt: string
}

export type VendorStatus = 'SEARCHING' | 'MEETING' | 'PROPOSAL' | 'SIGNED' | 'DEPOSIT' | 'PAID'
export type VendorCategory = 'PHOTOGRAPHER' | 'DJ' | 'CATERING' | 'DESIGN' | 'BEAUTY' | 'RABBI' | 'AFTERPARTY' | 'OTHER'

export interface Vendor {
  id: string
  name: string
  category: VendorCategory
  contactName?: string
  phone?: string
  email?: string
  priceQuote?: number
  rating?: number
  status: VendorStatus
  notes?: string
  photos?: string[]
  createdAt: string
}

export type VenueStatus = 'INTERESTED' | 'VISITED' | 'BOOKED' | 'REJECTED'

export interface Venue {
  id: string
  name: string
  location?: string
  capacity?: number
  indoor?: boolean
  kosher?: boolean
  parking?: boolean
  pricePerPerson?: number
  flatPrice?: number
  contactName?: string
  phone?: string
  rating?: number
  status: VenueStatus
  notes?: string
  photos?: string[]
  createdAt: string
}

export type AttireCategory = 'DRESS' | 'SUIT' | 'VENUE_OUTFIT' | 'PARTY_OUTFIT' | 'JEWELRY' | 'SHOES'
export type AttireStatus = 'BROWSING' | 'TRYING' | 'ORDERED' | 'READY'

export interface AttireItem {
  id: string
  category: AttireCategory
  name: string
  designer?: string
  store?: string
  price?: number
  rating?: number
  status: AttireStatus
  notes?: string
  photos?: string[]
  createdAt: string
}

export type ExpenseCategory = 'VENUE' | 'CATERING' | 'PHOTOGRAPHY' | 'MUSIC' | 'ATTIRE' | 'BEAUTY' | 'OTHER'

export interface Expense {
  id: string
  description: string
  category: ExpenseCategory
  amount: number
  isPaid: boolean
  date: string
  receipt?: string
  notes?: string
  createdAt: string
}

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW'
export type TaskAssignee = 'HAGAY' | 'SALOME' | 'BOTH'

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: TaskPriority
  assignee: TaskAssignee
  dueDate?: string
  category?: string
  completedAt?: string
  createdAt: string
}

export interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  caption?: string
  entityType: 'vendor' | 'venue' | 'attire' | 'inspiration'
  entityId?: string
  entityName?: string
  createdAt: string
}

export interface Settings {
  weddingDate: string
  groomName: string
  brideName: string
  totalBudget: number
  whatsappTemplate: string
  language: 'he' | 'en'
}

export interface ActivityItem {
  id: string
  type: string
  description: string
  createdAt: string
}

export type UserSide = 'GROOM' | 'BRIDE'
export type PermissionLevel = 'edit' | 'view' | 'hidden'

export interface UserPermissions {
  guests: PermissionLevel
  vendors: PermissionLevel
  venues: PermissionLevel
  attire: PermissionLevel
  budget: PermissionLevel
  tasks: PermissionLevel
  gallery: PermissionLevel
}

export interface WeddingUser {
  id: string
  name: string
  role: string
  side: UserSide
  avatar?: string
  permissions: UserPermissions
  createdAt: string
}

export interface Installment {
  id: string
  label: string
  amount: number
  isPaid: boolean
  paidAt?: string
}

export interface Quote {
  id: string
  entityType: 'vendor' | 'venue' | 'attire'
  entityId: string
  entityName?: string
  title: string
  amount: number
  currency: string
  isSelected: boolean
  note?: string
  receivedAt: string
  validUntil?: string
  installments?: Installment[]
  createdAt: string
}
