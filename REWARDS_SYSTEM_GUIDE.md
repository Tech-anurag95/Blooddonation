# Donation Rewards System - User Guide

## Overview
The Donation Rewards System tracks your blood donations and rewards you with free blood credits. For every 3 certified donations, you earn 1 free blood credit that can be used to receive blood for free.

## How It Works

### Step 1: Donate Blood
- Donate blood at any hospital or blood bank
- Get a donation certificate from the hospital

### Step 2: Upload Certificate
1. Login to your account
2. Click "Rewards" in the navigation menu
3. Click "Upload Certificate" button
4. Fill in the donation details:
   - Donation date
   - Hospital name
   - Blood type
   - Quantity (ml)
   - Upload certificate image (JPEG, PNG, or GIF, max 5MB)
5. Submit the form

### Step 3: Wait for Approval
- Hospital admin will review your certificate within 30 days
- You'll see the status in your Rewards Dashboard:
  - **Pending**: Under review
  - **Approved**: Certificate verified and counted toward rewards
  - **Rejected**: Certificate rejected (reason provided)

### Step 4: Earn Free Credits
- After 3 approved certificates, you automatically get 1 free blood credit
- Credits are displayed in your Rewards Dashboard
- Credits never expire

### Step 5: Use Your Credits
- When you request blood, free credits are automatically applied
- One credit = one free blood request
- Credits are used oldest first

## Rewards Dashboard

Access your dashboard at: http://localhost:3000/rewards

### Dashboard Features:
- **Total Donations**: All certificates you've uploaded
- **Certified Donations**: Approved certificates that count toward rewards
- **Free Credits Available**: Credits you can use
- **Credits Used**: Total credits you've redeemed
- **Progress Bar**: Shows progress toward next free credit (e.g., 2/3)
- **Certificate List**: All your uploaded certificates with status

## Certificate Requirements

### Valid Certificate Must Include:
- Hospital/clinic name
- Donation date
- Blood type
- Quantity donated
- Hospital stamp or signature

### Image Requirements:
- Clear, readable photo
- JPEG, PNG, or GIF format
- Maximum file size: 5MB
- Shows complete certificate

## Admin Approval Process

### For Hospital Admins:
1. Login to Django Admin: http://127.0.0.1:5000/admin/
2. Navigate to "Donation Certificates"
3. Filter by status: "Pending"
4. Review certificate details and image
5. Actions:
   - **Approve**: Certificate counts toward rewards
   - **Reject**: Provide reason for rejection

### Bulk Actions:
- Select multiple certificates
- Choose "Approve selected certificates" or "Reject selected certificates"
- Apply action

## API Endpoints

### For Developers:

**Certificate Endpoints:**
- `GET /api/certificates/my_certificates/` - Get user's certificates
- `POST /api/certificates/` - Upload new certificate
- `GET /api/certificates/pending/` - Get pending certificates (admin only)
- `POST /api/certificates/{id}/approve/` - Approve certificate (admin only)
- `POST /api/certificates/{id}/reject/` - Reject certificate (admin only)

**Rewards Endpoints:**
- `GET /api/rewards/my_rewards/` - Get user's rewards
- `POST /api/rewards/use_credit/` - Use a free credit

## Business Rules

1. **Donation Interval**: Minimum 56 days between donations (standard blood donation rule)
2. **Certificate Expiry**: Pending certificates auto-reject after 30 days
3. **Reward Ratio**: 3 certified donations = 1 free blood credit
4. **Credit Usage**: Credits are applied automatically when requesting blood
5. **No Partial Credits**: Must complete 3 donations to earn a credit

## Troubleshooting

### Certificate Rejected?
- Check rejection reason in your dashboard
- Ensure certificate is clear and readable
- Verify all required information is visible
- Re-upload with corrections

### Certificate Pending Too Long?
- Certificates are reviewed within 30 days
- After 30 days, pending certificates are auto-rejected
- Contact hospital admin if urgent

### Credits Not Showing?
- Ensure you have 3 approved certificates
- Check your Rewards Dashboard
- Refresh the page
- Contact support if issue persists

## Testing the System

### Test as User:
1. Login: `shivam@gmail.com` / `shivam123`
2. Go to Rewards Dashboard
3. Upload a test certificate
4. Check status

### Test as Admin:
1. Login to Django Admin: http://127.0.0.1:5000/admin/
2. Username: `admin`, Password: `admin123`
3. Go to Donation Certificates
4. Approve/reject test certificates

## Database Models

### DonationCertificate
- certificate_id (unique)
- donor (User)
- donation_date
- hospital_name
- blood_type
- quantity
- certificate_image
- status (pending/approved/rejected)
- verified_by (admin)
- rejection_reason

### UserRewards
- user (User)
- total_donations
- certified_donations
- free_credits_available
- free_credits_used
- last_donation_date
- next_eligible_date

## Future Enhancements

- Email notifications for certificate status
- SMS alerts for approval/rejection
- Certificate QR code verification
- Donation badges and achievements
- Rewards marketplace
- Social sharing features
- Multi-hospital certificate aggregation

## Support

For issues or questions:
- Check this guide first
- Contact hospital admin for certificate issues
- Contact platform support for technical issues
