/**
 * Syncs MongoDB documents to Django SQLite via REST API.
 * Called after every user registration, blood request, and donation.
 */
const axios = require('axios');

const DJANGO_URL = process.env.DJANGO_URL || 'http://127.0.0.1:8000';
const SYNC_SECRET = 'bloodde-sync-secret-2026';

const headers = { 'X-Sync-Secret': SYNC_SECRET, 'Content-Type': 'application/json' };

const djangoSync = {
  user: async (userDoc) => {
    try {
      const payload = {
        mongo_id:          userDoc._id?.toString(),
        name:              userDoc.name,
        email:             userDoc.email,
        phone:             userDoc.phone || '',
        role:              userDoc.role,
        bloodType:         userDoc.bloodType,
        city:              userDoc.city,
        state:             userDoc.state,
        age:               userDoc.age,
        weight:            userDoc.weight,
        verified:          userDoc.verified,
        availableToDonate: userDoc.availableToDonate,
      };
      console.log('Syncing user to Django:', payload.email);
      const response = await axios.post(`${DJANGO_URL}/sync/user/`, payload, { headers, timeout: 5000 });
      console.log('✓ Django user sync successful:', response.data);
    } catch (e) {
      console.warn('Django user sync failed (non-critical):', e.response?.data || e.message);
    }
  },

  request: async (reqDoc) => {
    try {
      const payload = {
        mongo_id:  reqDoc._id?.toString(),
        requester: reqDoc.requester?.toString(),
        bloodType: reqDoc.bloodType,
        quantity:  reqDoc.quantity,
        urgency:   reqDoc.urgency,
        reason:    reqDoc.reason,
        hospital:  reqDoc.hospital,
        city:      reqDoc.city,
        phone:     reqDoc.phone,
        status:    reqDoc.status,
      };
      console.log('Syncing request to Django:', payload.mongo_id);
      const response = await axios.post(`${DJANGO_URL}/sync/request/`, payload, { headers, timeout: 5000 });
      console.log('✓ Django request sync successful:', response.data);
    } catch (e) {
      console.warn('Django request sync failed (non-critical):', e.response?.data || e.message);
    }
  },

  donation: async (donationDoc) => {
    try {
      const payload = {
        mongo_id:      donationDoc._id?.toString(),
        donor:         donationDoc.donor?.toString(),
        recipientName: donationDoc.recipientName,
        bloodType:     donationDoc.bloodType,
        quantity:      donationDoc.quantity,
        location:      donationDoc.location,
        status:        donationDoc.status,
        notes:         donationDoc.notes,
      };
      console.log('Syncing donation to Django:', payload.mongo_id);
      const res = await axios.post(`${DJANGO_URL}/sync/donation/`, payload, { headers, timeout: 5000 });
      console.log('✓ Django donation sync successful:', res.data);
      return res.data; // includes certificate_status
    } catch (e) {
      console.warn('Django donation sync failed (non-critical):', e.response?.data || e.message);
      return null;
    }
  },

  getCertificateStatus: async (mongoId) => {
    try {
      const res = await axios.get(
        `${DJANGO_URL}/sync/certificate-status/${mongoId}/`,
        { headers, timeout: 5000 }
      );
      return res.data;
    } catch (e) {
      console.warn('Django cert status check failed:', e.message);
      return { certificate_status: 'pending_review', rejection_reason: '' };
    }
  },

  uploadedCertificate: async (certData) => {
    try {
      const res = await axios.post(`${DJANGO_URL}/sync/uploaded-certificate/`, certData, { headers, timeout: 5000 });
      console.log('✓ Django uploaded-certificate sync:', res.data);
      return res.data;
    } catch (e) {
      console.warn('Django uploaded-certificate sync failed:', e.response?.data || e.message);
      return null;
    }
  }
};

module.exports = djangoSync;
