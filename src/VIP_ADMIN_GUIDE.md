# VIP Management Panel - Admin Guide

## Overview
Complete VIP management system for administrators to grant, manage, and track VIP subscriptions.

## Features

### 1. Admin VIP Management Panel
**Location:** `/admin/vip-management` (Admins only)

**Features:**
- View all active VIP subscriptions (VIP, Creator, Business)
- See days remaining for each subscription
- View who granted VIP and when
- Gift VIP to users directly from the panel
- Remove VIP access from users
- Filter by plan type (VIP/Creator/Business)

### 2. Gift VIP from Profile
**Location:** Any user profile page (Admin only)

**Features:**
- "Gift VIP" button appears for admins on all user profiles
- Select plan type: VIP Star, Creator Fire, Business Diamond
- Select duration: 1 Day, 7 Days, 30 Days, 90 Days, 1 Year, Lifetime
- Add optional note/message
- User receives notification and email

### 3. Duration Options
- **1 Day** - Short-term trial
- **7 Days** - Weekly trial
- **30 Days** - Monthly subscription
- **90 Days** - Quarterly subscription
- **365 Days** - Annual subscription
- **Lifetime** - Permanent VIP access

### 4. Automatic Expiration
**Function:** `expireVIPSubscriptions`

Runs automatically to:
- Check for expired subscriptions
- Remove verification badges
- Send expiration notifications
- Update subscription status to "expired"

### 5. User Notifications
Users receive notifications when:
- ✅ VIP is granted (with duration and plan type)
- ✅ VIP is removed by admin
- ✅ VIP is expiring soon
- ✅ VIP has expired

### 6. Admin Controls

#### Grant VIP Access
**Function:** `grantVIPAccess`
- Admin-only function
- Requires: recipientUserId, planType, durationDays, reason
- Updates user profile with verification badge
- Creates notification
- Sends email

#### Remove VIP Access
**Function:** `removeVIPAccess`
- Admin-only function
- Requires: subscriptionId, reason
- Removes verification badge
- Creates notification
- Sets subscription to "cancelled"

#### View All VIP Users
**Function:** `getVIPUsers`
- Admin-only function
- Returns all active VIP subscriptions
- Includes user profile data
- Shows days remaining
- Shows who granted VIP

## Database Schema Updates

### Subscription Entity
New fields added:
- `is_gifted` (boolean) - Whether gifted by admin
- `gifted_by` (string) - Admin user ID
- `gifted_by_email` (string) - Admin email
- `gift_message` (string) - Optional message
- `duration_months` (number) - Duration in months
- `is_lifetime` (boolean) - Lifetime subscription
- `granted_by_admin_id` (string) - Admin who granted
- `granted_by_admin_email` (string) - Admin email
- `grant_reason` (string) - Reason for grant/removal

## Access Control

**Admin Email:** info@spicey.live (or any user with role="admin")

**Admin-Only Functions:**
- `grantVIPAccess`
- `removeVIPAccess`
- `getVIPUsers`
- `expireVIPSubscriptions`

**Admin-Only Pages:**
- `/admin/vip-management`

## Usage Examples

### Grant VIP via API
```javascript
await base44.functions.invoke('grantVIPAccess', {
  recipientUserId: 'user123',
  planType: 'vip', // or 'creator', 'business'
  durationDays: 30, // 1, 7, 30, 90, 365, 9999
  reason: 'Premium user reward',
});
```

### Remove VIP via API
```javascript
await base44.functions.invoke('removeVIPAccess', {
  subscriptionId: 'sub123',
  reason: 'Violation of terms',
});
```

### Get All VIP Users
```javascript
const response = await base44.functions.invoke('getVIPUsers', {});
console.log(response.data.subscriptions); // Array of VIP subscriptions
```

## Automation Setup

### Daily Expiration Check
Create a scheduled automation:
- **Function:** `expireVIPSubscriptions`
- **Schedule:** Daily at 2:00 AM
- **Type:** Scheduled automation
- **Repeat:** Every 1 day

This ensures expired subscriptions are automatically processed.

## UI Components

### GiftVIPModal
**Location:** `/components/panels/GiftVIPModal`

Features:
- Plan selection (3 types)
- Duration selection (6 options)
- Note/reason input
- Summary preview
- Animated UI

### AdminVIPManagement Page
**Location:** `/pages/AdminVIPManagement`

Features:
- Stats bar (VIP/Creator/Business counts)
- User list with avatars
- Days remaining display
- Grant/Remove buttons
- Filter and search (future enhancement)

## Best Practices

1. **Always add a reason** when granting or removing VIP
2. **Check user history** before granting lifetime access
3. **Use shorter durations** for trials and testing
4. **Monitor expiration dates** in the management panel
5. **Communicate with users** before removing VIP access

## Troubleshooting

### VIP not showing on profile
- Check subscription status is "active"
- Verify user profile has verification_badge set
- Refresh page or wait for cache to update

### Email not sent
- Check sendEmail function logs
- Verify user has valid email
- Email failures don't block VIP activation

### Automation not running
- Check automation is active in dashboard
- Verify admin user exists
- Check function logs for errors

## Future Enhancements

- [ ] Bulk VIP grant/remove
- [ ] VIP usage analytics
- [ ] Auto-renewal options
- [ ] Custom expiration warnings
- [ ] Export VIP user list
- [ ] Advanced filtering (by date, plan, admin)
- [ ] VIP gifting history