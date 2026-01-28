# House of Glow - Booking Calendar UI Design

## Overview
A mobile-first booking calendar system designed for managing makeup class sessions. The calendar supports daily, weekly, and monthly views with detailed session information.

## Key Specifications
- **2 Sessions Per Day**: 
  - Session 1: 7:00 PM - 8:00 PM
  - Session 2: 9:00 PM - 10:00 PM
- **Max Capacity**: 15 people per session (configurable in settings)
- **Mobile-First**: Optimized for phone screens (320px - 428px)
- **Touch-Friendly**: Large tap targets, swipe gestures

---

## Calendar Views

### 1. Daily View (Default for Mobile)

**Layout:**
```
┌─────────────────────────────────┐
│  ← Wednesday, Jan 28  →         │ ← Swipe left/right to change day
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🌙 Session 1            │   │
│  │ 7:00 PM - 8:00 PM       │   │
│  ├─────────────────────────┤   │
│  │ 12/15 Booked            │   │ ← Capacity indicator
│  │ ████████████░░░         │   │ ← Visual capacity bar
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🌙 Session 2            │   │
│  │ 9:00 PM - 10:00 PM      │   │
│  ├─────────────────────────┤   │
│  │ 8/15 Booked             │   │
│  │ ████████░░░░░░░         │   │
│  └─────────────────────────┘   │
│                                 │
│  [+ Add Booking]               │ ← Floating action button
└─────────────────────────────────┘
```

**Features:**
- Large session cards (easy to tap)
- Swipe left/right to navigate days
- Visual capacity indicator (progress bar)
- Quick "Add Booking" button
- Empty state shows "No bookings" with grayed-out sessions
- Full sessions marked with red badge "FULL"

**Card States:**
- **Empty** (0 bookings): Gray border, light background
- **Partial** (1-14 bookings): Blue border, white background, capacity bar
- **Full** (15 bookings): Red border, red badge "FULL"
- **Past**: Grayed out, non-interactive

---

### 2. Weekly View

**Layout:**
```
┌─────────────────────────────────┐
│  Week of Jan 28 - Feb 3         │
│  ← January 2026 →               │
├─────────────────────────────────┤
│                                 │
│  Mon 28  Tue 29  Wed 30 ...    │ ← Day headers (scrollable)
│  ┌────┐ ┌────┐ ┌────┐          │
│  │ 🔴 │ │ 🔵 │ │ 🟢 │  7-8PM   │ ← Session 1 dots
│  │ 12 │ │ 8  │ │ 15 │          │ ← Booking count
│  └────┘ └────┘ └────┘          │
│  ┌────┐ ┌────┐ ┌────┐          │
│  │ 🔵 │ │ 🟢 │ │ 🔴 │  9-10PM  │ ← Session 2 dots
│  │ 5  │ │ 2  │ │ 13 │          │
│  └────┘ └────┘ └────┘          │
│                                 │
└─────────────────────────────────┘
```

**Features:**
- Horizontal scroll for 7 days
- Color-coded dots for capacity status:
  - 🟢 Green: 0-5 bookings (Low)
  - 🔵 Blue: 6-10 bookings (Medium)
  - 🔴 Red: 11-15 bookings (High/Full)
- Booking count displayed below dot
- Tap any day to open Daily View
- Today highlighted with border

---

### 3. Monthly View

**Layout:**
```
┌─────────────────────────────────┐
│  ← January 2026 →               │
├─────────────────────────────────┤
│ Sun Mon Tue Wed Thu Fri Sat     │
│ ─── ─── ─── ─── ─── ─── ───     │
│         1   2   3   4   5       │
│              ••  •   ••  •      │ ← Dots = sessions
│                                 │
│  6   7   8   9  10  11  12      │
│  •   ••  •   •   ••  •   ••     │
│                                 │
│ 13  14  15  16  17  18  19      │
│  •   ••  •   ••  •   ••  •      │
│                                 │
│ 20  21  22  23  24  25  26      │
│  ••  •   ••  •   ••  •   ••     │
│                                 │
│ 27  28  29  30  31              │
│  •   ••  •   ••  •              │
└─────────────────────────────────┘
```

**Features:**
- Traditional calendar grid
- Dots below date show session availability:
  - 1 dot: 1 session has bookings
  - 2 dots: Both sessions have bookings
  - No dots: No bookings
- Dot colors indicate capacity (green/blue/red)
- Tap date to open Daily View
- Today highlighted with circle
- Swipe left/right to change month

---

## Session Detail Page

When user taps a session card, open detailed view:

**Layout:**
```
┌─────────────────────────────────┐
│  ← Session Details              │
├─────────────────────────────────┤
│                                 │
│  🌙 Wednesday, January 28       │
│  Session 1: 7:00 PM - 8:00 PM   │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Capacity: 12 / 15         │ │
│  │ ████████████░░░           │ │
│  └───────────────────────────┘ │
│                                 │
│  Bookings (12)                  │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 👤 Sarah Johnson        │   │
│  │    sarah@email.com      │   │
│  │    +91 98765 43210      │   │
│  │    PAX: 2 people        │   │ ← Number of people
│  │    Booked: Jan 20       │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 👤 Michael Chen         │   │
│  │    michael@email.com    │   │
│  │    +91 98765 43211      │   │
│  │    PAX: 1 person        │   │
│  │    Booked: Jan 22       │   │
│  └─────────────────────────┘   │
│                                 │
│  ... (10 more)                  │
│                                 │
│  [+ Add Booking to Session]     │
│  [Export Booking List]          │
│                                 │
└─────────────────────────────────┘
```

**Features:**
- Session info at top (date, time, capacity)
- Visual capacity indicator
- List of all bookings for that session
- Each booking shows:
  - Student name
  - Contact info (email, phone)
  - PAX count (number of people in booking)
  - Booking date
- Actions:
  - Tap booking to edit/cancel
  - Add new booking to this session
  - Export booking list (CSV/PDF)
- Swipe booking left to reveal:
  - ✏️ Edit
  - 🗑️ Delete
  - ✉️ Email

---

## View Switching

**Toggle Bar (Top of Calendar):**
```
┌─────────────────────────────────┐
│  [Day] [Week] [Month]           │ ← Segmented control
│                                 │
│  ... calendar content ...       │
└─────────────────────────────────┘
```

**Features:**
- Segmented control at top
- Smooth transition between views
- Remembers last selected view
- Default: Daily view (most useful on mobile)

---

## Add Booking Flow

**Quick Add (From Calendar):**
```
┌─────────────────────────────────┐
│  New Booking                    │
├─────────────────────────────────┤
│                                 │
│  Select Session *               │
│  [Wed, Jan 28 - 7:00 PM ▼]     │
│                                 │
│  Student Name *                 │
│  [Enter name]                   │
│                                 │
│  Email                          │
│  [student@email.com]            │
│                                 │
│  Phone                          │
│  [+91 98765 43210]              │
│                                 │
│  Number of People (PAX) *       │
│  [ - ]  [  2  ]  [ + ]          │ ← Stepper control
│                                 │
│  Remaining Capacity: 13/15      │
│                                 │
│  Notes                          │
│  [Optional notes...]            │
│                                 │
│  Status                         │
│  ○ Pending  ● Confirmed         │
│                                 │
│  [Cancel]  [Create Booking]     │
│                                 │
└─────────────────────────────────┘
```

**Validation:**
- Cannot book if session full
- PAX count + current bookings cannot exceed max capacity
- Shows live remaining capacity
- Warning if near capacity (yellow)
- Error if exceeds capacity (red)

---

## Color System

### Status Colors
- **Available** (0-33%): Green `#10B981`
- **Filling** (34-66%): Blue `#3B82F6`
- **Almost Full** (67-99%): Orange `#F59E0B`
- **Full** (100%): Red `#EF4444`

### Background States
- **Available**: White with green accent
- **Filling**: White with blue accent
- **Almost Full**: White with orange accent
- **Full**: Light red background with red border
- **Past**: Gray (#F3F4F6)

---

## Interactions & Gestures

### Mobile Gestures
- **Swipe Left/Right**: Navigate days (Daily), weeks (Weekly), months (Monthly)
- **Tap Session**: Open Session Detail Page
- **Long Press Session**: Quick actions menu (Edit, Delete, Copy)
- **Pull to Refresh**: Reload booking data
- **Swipe Left on Booking**: Reveal actions (Edit, Delete, Email)

### Quick Actions (Long Press)
```
┌─────────────────────────────────┐
│  Quick Actions                  │
├─────────────────────────────────┤
│  ✏️ Edit Session               │
│  👁️ View Details               │
│  📧 Email All Attendees         │
│  📋 Copy Booking List           │
│  🗑️ Cancel All Bookings        │
└─────────────────────────────────┘
```

---

## Empty States

### No Bookings (Daily View)
```
┌─────────────────────────────────┐
│  Wednesday, Jan 28              │
├─────────────────────────────────┤
│                                 │
│          📅                     │
│                                 │
│  No bookings for today          │
│                                 │
│  Sessions available:            │
│  • 7:00 PM - 8:00 PM (0/15)    │
│  • 9:00 PM - 10:00 PM (0/15)   │
│                                 │
│  [+ Add First Booking]          │
│                                 │
└─────────────────────────────────┘
```

### Session Full
```
┌─────────────────────────────────┐
│  🔴 Session 1 - FULL            │
│  7:00 PM - 8:00 PM              │
├─────────────────────────────────┤
│  15/15 Booked                   │
│  ████████████████               │
│                                 │
│  This session is fully booked   │
│  [View Bookings]                │
│  [Add to Waitlist]              │
└─────────────────────────────────┘
```

---

## Filters & Search

**Top Bar Options:**
```
┌─────────────────────────────────┐
│  🔍 Search  |  🔽 Filter         │
├─────────────────────────────────┤
```

**Filter Options:**
- **Status**: All, Confirmed, Pending, Cancelled
- **Capacity**: Available, Nearly Full, Full
- **Date Range**: Today, This Week, This Month, Custom
- **Session**: Session 1 only, Session 2 only, Both

**Search:**
- Search by student name
- Search by email
- Search by phone
- Results highlight matching bookings

---

## Notifications & Indicators

### Real-time Updates
- Red badge when new booking added
- Animation when capacity changes
- Toast notification for booking confirmations
- Push notification for upcoming sessions (optional)

### Capacity Warnings
```
⚠️ Session 1 is 80% full (12/15)
⚠️ Only 3 spots remaining

🔴 Session 2 is FULL (15/15)
```

---

## Responsive Breakpoints

### Phone (< 640px)
- **Default View**: Daily
- Single column layout
- Full-width session cards
- Floating action button

### Tablet (640px - 1024px)
- **Default View**: Weekly
- Two-column layout option
- Side-by-side sessions
- Expanded session cards

### Desktop (> 1024px)
- **Default View**: Monthly
- Multi-column layout
- Sidebar with details
- Quick filters always visible

---

## Accessibility

- **High Contrast Mode**: Supported
- **Screen Reader**: Full ARIA labels
- **Keyboard Navigation**: Tab through sessions
- **Focus States**: Clear visual indicators
- **Touch Targets**: Minimum 44x44px
- **Color Blindness**: Icons + text (not just color)

---

## Performance Considerations

- **Lazy Loading**: Load only visible sessions
- **Pagination**: Load bookings in chunks of 20
- **Caching**: Cache calendar data for offline viewing
- **Optimistic Updates**: Instant UI feedback
- **Skeleton Screens**: Show loading placeholders

---

## Future Enhancements (Phase 2)

1. **Waitlist System**: Allow bookings beyond capacity
2. **Recurring Bookings**: Book same slot weekly/monthly
3. **Group Bookings**: Book multiple sessions at once
4. **Payment Integration**: Track payments per booking
5. **Attendance Tracking**: Mark who showed up
6. **Analytics Dashboard**: Booking trends, popular times
7. **Student Profiles**: History of all bookings
8. **Email Reminders**: Auto-send 24h before session
9. **Cancellation Policy**: Configure cancellation rules
10. **Calendar Sync**: Export to Google Calendar, iCal

---

## Technical Notes

### Database Schema Required
```
Booking:
  - id
  - studentName
  - studentEmail
  - studentPhone
  - numberOfPeople (PAX)
  - sessionDate
  - sessionTime (7PM or 9PM)
  - status (PENDING, CONFIRMED, CANCELLED)
  - notes
  - createdBy (userId)
  - createdAt
  - updatedAt
```

### API Endpoints Needed
- `GET /api/bookings?date=YYYY-MM-DD` - Get bookings for date
- `GET /api/bookings?startDate&endDate` - Get bookings for range
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/sessions/:id/capacity` - Get session capacity

### State Management
- Local state for UI interactions
- Server state for booking data
- Optimistic updates for better UX
- Real-time updates via polling (or WebSocket in future)

---

## Design Assets

### Icons Needed
- 📅 Calendar
- 🌙 Evening/Night (for sessions)
- 👤 Person/User
- ✏️ Edit
- 🗑️ Delete
- ✉️ Email
- 📧 Send
- ⚠️ Warning
- 🔴 Full indicator
- 🟢 Available indicator
- 🔵 Filling indicator
- ➕ Add
- ← → Navigation arrows

### Typography
- Font: Inter (consistent with current app)
- Session Time: 18px, semibold
- Booking Count: 16px, medium
- Student Names: 14px, medium
- Details: 12px, regular

### Spacing
- Card Padding: 16px
- Card Gap: 12px
- Section Spacing: 24px
- Button Height: 48px (minimum)
- Touch Target: 44x44px (minimum)

---

## Summary

This calendar system provides:
✅ Mobile-first design for on-the-go management
✅ Three view modes for different planning needs
✅ Clear capacity visualization at a glance
✅ Detailed booking information when needed
✅ Quick actions for common tasks
✅ Intuitive gestures and interactions
✅ Scalable for future enhancements

The design prioritizes speed and clarity, allowing quick assessment of availability and easy booking management from a phone.
