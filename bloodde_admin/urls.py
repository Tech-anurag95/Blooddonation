"""
URL configuration for bloodde_admin project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from core import views as core_views

urlpatterns = [
    path('admin/', admin.site.urls),

    # Sync endpoints called by Node.js after every write
    path('sync/user/',     core_views.sync_user),
    path('sync/request/',  core_views.sync_request),
    path('sync/donation/', core_views.sync_donation),

    # Certificate status polled by Node.js
    path('sync/certificate-status/<str:mongo_id>/', core_views.certificate_status),

    # Uploaded certificates (rewards system)
    path('sync/uploaded-certificate/',                          core_views.sync_uploaded_certificate),
    path('sync/uploaded-certificate/<str:mongo_id>/status/',    core_views.uploaded_certificate_status),
    path('sync/donor-certificates/<str:donor_mongo_id>/',       core_views.donor_certificates),
]
