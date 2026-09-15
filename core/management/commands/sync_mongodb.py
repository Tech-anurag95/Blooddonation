"""
Management command: python manage.py sync_mongodb
Pulls all data from MongoDB and upserts into Django SQLite.
"""
import os
from django.core.management.base import BaseCommand
from pymongo import MongoClient
from bson import ObjectId
from core.models import DonorUser, BloodRequest, Donation


MONGO_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/blooddonation')


def get_db():
    client = MongoClient(MONGO_URI)
    db_name = MONGO_URI.split('/')[-1].split('?')[0] or 'blooddonation'
    return client[db_name]


class Command(BaseCommand):
    help = 'Sync MongoDB collections into Django SQLite'

    def handle(self, *args, **kwargs):
        try:
            db = get_db()
        except Exception as e:
            self.stderr.write(f'MongoDB connection failed: {e}')
            return

        # ── Sync Users ────────────────────────────────────────────────────────
        users_synced = 0
        for doc in db.users.find():
            mongo_id = str(doc['_id'])
            defaults = {
                'name':               doc.get('name', ''),
                'email':              doc.get('email', ''),
                'phone':              doc.get('phone') or '',
                'role':               doc.get('role', 'recipient'),
                'blood_type':         doc.get('bloodType') or '',
                'city':               doc.get('city') or '',
                'state':              doc.get('state') or '',
                'age':                doc.get('age'),
                'weight':             doc.get('weight'),
                'verified':           doc.get('verified', False),
                'available_to_donate': doc.get('availableToDonate', False),
                'mongo_id':           mongo_id,
            }
            try:
                obj, created = DonorUser.objects.update_or_create(
                    mongo_id=mongo_id, defaults=defaults
                )
                users_synced += 1
            except Exception as e:
                self.stderr.write(f'User sync error ({mongo_id}): {e}')

        self.stdout.write(self.style.SUCCESS(f'Synced {users_synced} users'))

        # ── Sync BloodRequests ────────────────────────────────────────────────
        requests_synced = 0
        for doc in db.bloodrequests.find():
            mongo_id = str(doc['_id'])
            requester = None
            if doc.get('requester'):
                requester = DonorUser.objects.filter(
                    mongo_id=str(doc['requester'])
                ).first()

            defaults = {
                'blood_type':  doc.get('bloodType', ''),
                'quantity':    doc.get('quantity', 450),
                'urgency':     doc.get('urgency', 'normal'),
                'reason':      doc.get('reason') or '',
                'hospital':    doc.get('hospital', ''),
                'city':        doc.get('city') or '',
                'phone':       doc.get('phone') or '',
                'status':      doc.get('status', 'pending'),
                'requester':   requester,
                'mongo_id':    mongo_id,
            }
            try:
                BloodRequest.objects.update_or_create(
                    mongo_id=mongo_id, defaults=defaults
                )
                requests_synced += 1
            except Exception as e:
                self.stderr.write(f'Request sync error ({mongo_id}): {e}')

        self.stdout.write(self.style.SUCCESS(f'Synced {requests_synced} blood requests'))

        # ── Sync Donations ────────────────────────────────────────────────────
        donations_synced = 0
        for doc in db.donations.find():
            mongo_id = str(doc['_id'])
            donor = DonorUser.objects.filter(
                mongo_id=str(doc.get('donor', ''))
            ).first()
            if not donor:
                continue

            defaults = {
                'recipient_name':    doc.get('recipientName') or '',
                'blood_type':        doc.get('bloodType') or '',
                'quantity':          doc.get('quantity', 450),
                'location':          doc.get('location') or '',
                'status':            doc.get('status', 'completed'),
                'completed_date':    doc.get('completedDate'),
                'notes':             doc.get('notes') or '',
                'certificate_status': doc.get('certificateStatus', 'pending_review'),
                'donor':             donor,
                'mongo_id':          mongo_id,
            }
            try:
                Donation.objects.update_or_create(
                    mongo_id=mongo_id, defaults=defaults
                )
                donations_synced += 1
            except Exception as e:
                self.stderr.write(f'Donation sync error ({mongo_id}): {e}')

        self.stdout.write(self.style.SUCCESS(f'Synced {donations_synced} donations'))
        self.stdout.write(self.style.SUCCESS('MongoDB sync complete!'))
