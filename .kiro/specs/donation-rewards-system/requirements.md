# Donation Rewards System - Requirements

## Overview
A reward system that tracks blood donations and provides free blood eligibility after 3 certified donations. Each donation is verified with a hospital-certified digital certificate.

## User Stories

### US1: Donation History Tracking
**As a** blood donor  
**I want** my donation history to be automatically recorded  
**So that** I can track my contributions and earn rewards

**Acceptance Criteria:**
- Each completed donation is automatically recorded in user's history
- Donation record includes: date, hospital, blood type, quantity, certificate ID
- Users can view their complete donation history
- System maintains accurate donation count

### US2: Certificate Generation
**As a** donor  
**I want** to receive a digital certificate for each donation  
**So that** I have proof of my donation verified by the hospital

**Acceptance Criteria:**
- Certificate is generated when donation is marked as completed
- Certificate includes: unique ID, donor name, date, hospital name, blood type, quantity
- Certificate can be downloaded as PDF
- Certificate has QR code for verification
- Hospital admin can certify/approve the certificate

### US3: Free Blood Eligibility
**As a** donor who has donated 3 times  
**I want** to be eligible for one free blood request  
**So that** I am rewarded for my contributions

**Acceptance Criteria:**
- After 3 certified donations, user gets 1 free blood credit
- Free credit is automatically applied when user requests blood
- System shows available free credits on user profile
- Credits are consumed when blood request is fulfilled
- Cycle continues: every 3 donations = 1 free credit

### US4: Certificate Verification
**As a** hospital admin  
**I want** to verify and certify donation certificates  
**So that** only legitimate donations are counted

**Acceptance Criteria:**
- Hospital admin can view pending certificates
- Admin can approve or reject certificates
- Only approved certificates count toward free blood eligibility
- Rejection requires a reason
- Users are notified of certificate status

### US5: Rewards Dashboard
**As a** donor  
**I want** to see my rewards status  
**So that** I know how many more donations I need for free blood

**Acceptance Criteria:**
- Dashboard shows: total donations, certified donations, free credits available
- Progress bar showing donations toward next free credit (e.g., 2/3)
- List of all certificates with status (pending/approved/rejected)
- Donation history timeline

## Business Rules

### BR1: Donation Counting
- Only hospital-certified donations count toward rewards
- Pending or rejected certificates don't count
- Minimum 56 days between donations from same donor (standard blood donation interval)

### BR2: Free Blood Credits
- 3 certified donations = 1 free blood credit
- Credits don't expire
- Credits can be used for any blood type request
- Credits are used automatically (oldest first)
- Partial credits not allowed (must complete 3 donations)

### BR3: Certificate Validity
- Certificate must be approved by hospital admin within 30 days
- After 30 days, pending certificates are auto-rejected
- Rejected certificates can be appealed once
- Each certificate has unique ID (format: CERT-YYYY-NNNNNN)

### BR4: Hospital Verification
- Only verified hospitals can issue certificates
- Hospital admin must be authenticated
- Certificate includes hospital's digital signature
- QR code links to verification page

## Data Requirements

### Donation Record
- ID (auto-generated)
- Donor ID (foreign key to User)
- Match ID (foreign key to DonorMatch)
- Donation date
- Hospital name
- Blood type
- Quantity (ml)
- Certificate ID
- Certificate status (pending/approved/rejected)
- Certified by (hospital admin ID)
- Certified date
- Rejection reason (if rejected)
- Created at / Updated at

### Certificate
- Certificate ID (unique)
- Donation ID (foreign key)
- Donor name
- Donor ID
- Hospital name
- Hospital admin name
- Donation date
- Blood type
- Quantity
- QR code data
- PDF file path
- Status (pending/approved/rejected)
- Issued date
- Expiry date (30 days from issue)

### User Rewards
- User ID (foreign key)
- Total donations
- Certified donations
- Free credits available
- Free credits used
- Last donation date
- Next eligible donation date

## Non-Functional Requirements

### NFR1: Performance
- Certificate generation should complete within 5 seconds
- PDF download should start within 2 seconds
- Rewards calculation should be real-time

### NFR2: Security
- Certificates must be tamper-proof
- QR codes must be encrypted
- Only hospital admins can certify donations
- Certificate verification must be publicly accessible

### NFR3: Usability
- Certificate should be mobile-friendly
- PDF should be printable
- Rewards status should be prominently displayed
- Progress toward next reward should be clear

## Success Metrics
- 80% of donations get certified within 7 days
- 90% donor satisfaction with rewards program
- 30% increase in repeat donors
- Zero fraudulent certificates detected

## Out of Scope (Future Enhancements)
- Physical certificate mailing
- Rewards marketplace (redeem credits for other benefits)
- Donation badges/achievements
- Social sharing of certificates
- Multi-hospital certificate aggregation
