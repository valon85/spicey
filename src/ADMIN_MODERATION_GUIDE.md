# 🔒 Spicey Admin Moderation Guide

## Access Admin Panel

**URL**: `/admin/moderation`

**Admin Accounts**:
- valondervishi13@gmail.com
- info@spicey.live

---

## 📋 Available Admin Controls

### User Moderation Actions

| Action | Description | Effect |
|--------|-------------|--------|
| ⚠️ **Warn User** | Issue a formal warning | Increments warning count, notifies user |
| 🔒 **Lock Account** | Temporary account lock | User cannot login for specified duration |
| 🚫 **Suspend** | Temporary suspension | Account disabled until admin restores |
| ❌ **Permanent Ban** | Permanent ban | Account + all content deleted |
| 🗑️ **Delete Account** | Remove account | Deletes profile and all user content |
| ✓ **Restore Account** | Reactivate account | Restores suspended/locked accounts |

### Content Restrictions

| Restriction | Description |
|-------------|-------------|
| 📝 **Disable Posting** | User cannot create posts |
| 💬 **Disable Messaging** | User cannot send messages |
| 📄 **Disable Comments** | User cannot comment on posts |
| 🎥 **Disable Live** | User cannot go live |

---

## 🎯 Quick Actions on User Profiles

Every user in the moderation panel has a **Moderate** button that opens:

1. **User Activity Overview**
   - Total posts, comments, followers
   - Reports against the user
   - Account status and join date

2. **Quick Action Buttons**
   - One-click moderation actions
   - Reason input field (required for bans/suspensions)
   - Confirmation before destructive actions

3. **Reports Review**
   - See all reports filed against the user
   - View reporter information
   - Check reported content

---

## 🔍 Search & Filter

### Search Users
- Search by **username**, **full name**, or **email**
- Minimum 2 characters required
- Real-time search results

### Filter by Status
- **All Users** - Show everyone
- **Active** - Normal users
- **Suspended** - Temporarily suspended
- **Banned** - Permanently banned
- **Locked** - Temporarily locked

---

## 📊 Dashboard Stats

The moderation panel shows:
- **Total Users** - All registered users
- **Active** - Currently active accounts
- **Suspended/Banned** - Removed accounts
- **Locked** - Temporarily locked
- **Admins** - Admin account count

---

## 🛡️ Backend Functions

All moderation actions use these secure backend functions:

1. `adminGetAllUsers` - Fetch all users with filters
2. `adminSearchUsers` - Search users by query
3. `adminGetUserActivity` - View user activity & reports
4. `adminModerateUser` - Execute moderation actions
5. `adminGetUserReports` - Get reports against a user

**Security**: All functions require `user.role === 'admin'`

---

## ⚡ Common Use Cases

### Remove Spam Account
1. Search for the spam account
2. Click **Moderate**
3. Select **Delete Account**
4. Enter reason: "Spam/Bot account"
5. Confirm - deletes account + all content

### Suspend Abusive User
1. Find the user
2. Click **Moderate**
3. Select **Suspend**
4. Enter reason: "Community guidelines violation"
5. Confirm - account suspended immediately

### Lock Account Temporarily
1. Find the user
2. Click **Moderate**
3. Select **Lock Account**
4. Set duration (default: 24 hours)
5. Enter reason
6. Confirm - user locked for specified time

### Disable Posting for Spammer
1. Find the user
2. Click **Moderate**
3. Select **Disable Posting**
4. Confirm - user can't post anymore

### Review Reported User
1. Search for the user
2. Click **Moderate**
3. Scroll to **Reports Against This User**
4. Review all reports and details
5. Take appropriate action

---

## 🚨 Emergency Actions

For immediate threats (hackers, scammers, bots):

1. **Ban + Delete**: Use **Permanent Ban** or **Delete Account**
   - Removes user + all posts, comments, stories
   - Fastest way to eliminate threats

2. **Mass Content Removal**: If user has lots of spam:
   - Use **Delete Account** - removes everything automatically
   - No need to delete posts individually

---

## 📝 Best Practices

✅ **Always document reasons** for suspensions/bans
✅ **Review reports** before taking action
✅ **Start with warnings** for minor violations
✅ **Use temporary actions** when unsure (lock/suspend vs ban)
✅ **Check user activity** to identify patterns

❌ **Don't ban without evidence**
❌ **Don't skip the reason field**
❌ **Don't use permanent ban for first-time minor offenses**

---

## 🔐 Security Notes

- Only admin accounts can access `/admin/moderation`
- All moderation actions are logged with admin ID and timestamp
- Deleted content cannot be recovered
- Banned users cannot re-register with same email

---

## 🆘 Support

If you encounter issues with moderation tools:
- Check browser console for errors
- Verify you're logged in as admin
- Ensure the backend functions are deployed
- Contact development support if needed

---

**Last Updated**: June 2, 2026
**Version**: 1.0