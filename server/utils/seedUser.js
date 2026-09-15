const User     = require('../models/User');
const Donation = require('../models/Donation');
const djangoSync = require('./djangoSync');

async function seedDefaultUsers() {
  try {
    const defaults = [
      {
        name: 'Admin User',
        email: 'admin@bloodde.com',
        password: 'admin123',
        role: 'admin',
        bloodType: 'O+',
        city: 'Chennai',
        verified: true,
        emailVerified: true
      },
      {
        name: 'Test Donor',
        email: 'donor@bloodde.com',
        password: 'donor123',
        role: 'donor',
        bloodType: 'B+',
        city: 'Chennai',
        verified: true,
        availableToDonate: true
      },
      {
        name: 'Test Recipient',
        email: 'recipient@bloodde.com',
        password: 'recipient123',
        role: 'recipient',
        bloodType: 'A+',
        city: 'Chennai'
      }
    ];

    const savedUsers = {};

    for (const userData of defaults) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = new User(userData);
        await user.save();
        console.log(`✓ Seeded user: ${userData.email} (${userData.role})`);
      }
      savedUsers[userData.email] = user;

      // ALWAYS sync user to Django — this updates the mongo_id for the current session
      await djangoSync.user(user);
    }

    // Seed sample donations for the test donor
    const donor = savedUsers['donor@bloodde.com'];
    if (donor) {
      const existingDonations = await Donation.find({ donor: donor._id });
      if (existingDonations.length === 0) {
        const sampleDonations = [
          {
            donor: donor._id,
            recipientName: 'Priya Patel',
            bloodType: 'B+',
            quantity: 450,
            location: 'Apollo Hospital, Chennai',
            status: 'completed',
            completedDate: new Date('2026-04-10')
          },
          {
            donor: donor._id,
            recipientName: 'Arjun Kumar',
            bloodType: 'B+',
            quantity: 350,
            location: 'AIIMS, Chennai',
            status: 'completed',
            completedDate: new Date('2026-02-20')
          },
          {
            donor: donor._id,
            recipientName: 'Meena Raj',
            bloodType: 'B+',
            quantity: 450,
            location: 'Fortis Hospital, Chennai',
            status: 'accepted',
            completedDate: null
          }
        ];

        for (const d of sampleDonations) {
          const donation = new Donation(d);
          await donation.save();
          if (d.status === 'completed') {
            await djangoSync.donation(donation);
          }
        }
        console.log('✓ Seeded 3 sample donations (2 completed synced to Django)');
      } else {
        // Donations already exist — re-sync them with current mongo_ids
        for (const donation of existingDonations) {
          if (donation.status === 'completed') {
            await djangoSync.donation(donation);
          }
        }
        console.log(`✓ Re-synced ${existingDonations.length} existing donations to Django`);
      }
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

module.exports = seedDefaultUsers;
