import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import DonorUser, BloodRequest, Donation, UploadedCertificate

SYNC_SECRET = 'bloodde-sync-secret-2026'

def check_secret(request):
    return request.headers.get('X-Sync-Secret') == SYNC_SECRET


@csrf_exempt
@require_http_methods(['POST'])
def sync_user(request):
    if not check_secret(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    try:
        data     = json.loads(request.body)
        mongo_id = data.get('mongo_id') or data.get('_id')
        email    = data.get('email', '')
        if not mongo_id:
            return JsonResponse({'error': 'mongo_id required'}, status=400)

        defaults = {
            'name':               data.get('name', ''),
            'email':              email,
            'phone':              (data.get('phone') or '')[:10] if data.get('phone') else '',
            'role':               data.get('role', 'recipient'),
            'blood_type':         data.get('bloodType') or data.get('blood_type') or '',
            'city':               data.get('city') or '',
            'state':              data.get('state') or '',
            'age':                data.get('age') if data.get('age') else None,
            'weight':             data.get('weight') if data.get('weight') else None,
            'verified':           data.get('verified', False),
            'available_to_donate': data.get('availableToDonate', False),
        }

        # Always look up by email (stable across restarts) and update mongo_id
        existing = DonorUser.objects.filter(email=email).first()
        if existing:
            existing.mongo_id = str(mongo_id)
            for k, v in defaults.items():
                if k != 'email':
                    setattr(existing, k, v)
            existing.save()
            return JsonResponse({'status': 'updated', 'id': existing.id})

        obj = DonorUser.objects.create(mongo_id=str(mongo_id), **defaults)
        return JsonResponse({'status': 'created', 'id': obj.id})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['POST'])
def sync_request(request):
    if not check_secret(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    try:
        data     = json.loads(request.body)
        mongo_id = data.get('mongo_id') or data.get('_id')
        if not mongo_id:
            return JsonResponse({'error': 'mongo_id required'}, status=400)

        requester = None
        if data.get('requester'):
            requester = DonorUser.objects.filter(mongo_id=str(data['requester'])).first()

        obj, created = BloodRequest.objects.update_or_create(
            mongo_id=str(mongo_id),
            defaults={
                'blood_type': data.get('bloodType', ''),
                'quantity':   data.get('quantity', 450),
                'urgency':    data.get('urgency', 'normal'),
                'reason':     data.get('reason') or '',
                'hospital':   data.get('hospital', ''),
                'city':       data.get('city') or '',
                'phone':      (data.get('phone') or '')[:10] if data.get('phone') else '',
                'status':     data.get('status', 'pending'),
                'requester':  requester,
            }
        )
        return JsonResponse({'status': 'created' if created else 'updated', 'id': obj.id})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['POST'])
def sync_donation(request):
    if not check_secret(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    try:
        data     = json.loads(request.body)
        mongo_id = data.get('mongo_id') or data.get('_id')
        if not mongo_id:
            return JsonResponse({'error': 'mongo_id required'}, status=400)

        donor = DonorUser.objects.filter(mongo_id=str(data.get('donor', ''))).first()
        if not donor:
            donor = DonorUser.objects.filter(role='donor').order_by('id').first()
        if not donor:
            return JsonResponse({'error': 'Donor not found in SQLite'}, status=404)

        obj, created = Donation.objects.update_or_create(
            mongo_id=str(mongo_id),
            defaults={
                'donor':          donor,
                'recipient_name': data.get('recipientName') or '',
                'blood_type':     data.get('bloodType') or '',
                'quantity':       data.get('quantity', 450),
                'location':       data.get('location') or '',
                'status':         data.get('status', 'completed'),
                'notes':          data.get('notes') or '',
            }
        )

        if created:
            obj.certificate_status = 'pending_review'
            obj.save()

        return JsonResponse({
            'status':             'created' if created else 'updated',
            'id':                 obj.id,
            'certificate_status': obj.certificate_status,
            'rejection_reason':   obj.rejection_reason or ''
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['GET'])
def certificate_status(request, mongo_id):
    try:
        donation = Donation.objects.filter(mongo_id=str(mongo_id)).first()
        if not donation:
            return JsonResponse({'certificate_status': 'not_found'}, status=404)
        return JsonResponse({
            'certificate_status': donation.certificate_status,
            'rejection_reason':   donation.rejection_reason or ''
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ── Upsert UploadedCertificate ────────────────────────────────────────────────
@csrf_exempt
@require_http_methods(['POST'])
def sync_uploaded_certificate(request):
    if not check_secret(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    try:
        data     = json.loads(request.body)
        mongo_id = data.get('mongo_id')
        if not mongo_id:
            return JsonResponse({'error': 'mongo_id required'}, status=400)

        donor = DonorUser.objects.filter(mongo_id=str(data.get('donorMongoId', ''))).first()

        obj, created = UploadedCertificate.objects.update_or_create(
            mongo_id=str(mongo_id),
            defaults={
                'donor':          donor,
                'donor_email':    data.get('donorEmail', ''),
                'donor_name':     data.get('donorName', ''),
                'hospital_name':  data.get('hospitalName', ''),
                'donation_date':  data.get('donationDate'),
                'blood_type':     data.get('bloodType', ''),
                'quantity':       data.get('quantity', 450),
                'file_url':       data.get('fileUrl', ''),
                'file_type':      data.get('fileType', 'image'),
            }
        )
        if created:
            obj.status = 'pending'
            obj.save()

        return JsonResponse({
            'status':            'created' if created else 'updated',
            'id':                obj.id,
            'cert_status':       obj.status,
            'rejection_reason':  obj.rejection_reason or '',
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ── Get uploaded certificate status ──────────────────────────────────────────
@csrf_exempt
@require_http_methods(['GET'])
def uploaded_certificate_status(request, mongo_id):
    try:
        cert = UploadedCertificate.objects.filter(mongo_id=str(mongo_id)).first()
        if not cert:
            return JsonResponse({'cert_status': 'not_found'}, status=404)
        return JsonResponse({
            'cert_status':      cert.status,
            'rejection_reason': cert.rejection_reason or '',
            'reviewed_at':      cert.reviewed_at.isoformat() if cert.reviewed_at else None,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ── List all uploaded certificates for a donor ────────────────────────────────
@csrf_exempt
@require_http_methods(['GET'])
def donor_certificates(request, donor_mongo_id):
    try:
        certs = UploadedCertificate.objects.filter(
            donor__mongo_id=str(donor_mongo_id)
        ).order_by('-created_at')
        data = [{
            'mongo_id':         c.mongo_id,
            'hospital_name':    c.hospital_name,
            'donation_date':    c.donation_date.isoformat() if c.donation_date else None,
            'blood_type':       c.blood_type,
            'quantity':         c.quantity,
            'file_url':         c.file_url,
            'file_type':        c.file_type,
            'cert_status':      c.status,
            'rejection_reason': c.rejection_reason or '',
            'reviewed_at':      c.reviewed_at.isoformat() if c.reviewed_at else None,
            'created_at':       c.created_at.isoformat(),
        } for c in certs]
        approved_count = certs.filter(status='approved').count()
        return JsonResponse({
            'certificates':    data,
            'total':           len(data),
            'approved_count':  approved_count,
            'free_credits':    approved_count // 3,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
