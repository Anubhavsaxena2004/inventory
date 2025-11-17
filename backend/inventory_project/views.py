from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import View
from django.shortcuts import render, redirect
import json
import os
from settings_app.models import User
from .auth_utils import generate_jwt, get_auth_payload_from_request
from django.core.cache import cache


# Admin-facing pages: simple server-side login/logout that integrate with
# the existing API-style login logic. The form posts to `admin-login/submit/`.
def admin_login_page(request):
    # If already logged in (session), redirect to frontend root
    if request.session.get('admin_user_id'):
        return redirect('/')
    return render(request, 'admin_login.html')


def admin_login_action(request):
    # Accept POST from the login form
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    email = request.POST.get('email')
    password = request.POST.get('password')
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return render(request, 'admin_login.html', {'error': 'Invalid credentials'})
    if user.password != password:
        return render(request, 'admin_login.html', {'error': 'Invalid credentials'})
    # enforce single active admin session
    key = f"active_admin_{user.pk}"
    active = cache.get(key)
    if active:
        return render(request, 'admin_login.html', {'error': 'Admin already logged in elsewhere'})
    token = generate_jwt({'sub': user.pk, 'email': user.email, 'name': user.name, 'is_admin': True})
    cache.set(key, token, timeout=24 * 3600)
    # store minimal info in session so the admin page can show login state
    request.session['admin_user_id'] = user.pk
    request.session['admin_user_email'] = user.email
    request.session['admin_token'] = token
    # Redirect to frontend root (which will be served by the React app or other admin UI)
    return redirect('/')


def admin_logout_page(request):
    # Clear cache key and session
    user_id = request.session.get('admin_user_id')
    if user_id:
        cache.delete(f"active_admin_{user_id}")
    request.session.pop('admin_user_id', None)
    request.session.pop('admin_user_email', None)
    request.session.pop('admin_token', None)
    return redirect('/admin-login/')

@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        data = json.loads(request.body.decode('utf-8'))
    except Exception:
        data = {}
    email = data.get('email')
    password = data.get('password')
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Invalid credentials'}, status=400)
    # NOTE: Plaintext password check for demo purposes only
    if user.password != password:
        return JsonResponse({'error': 'Invalid credentials'}, status=400)
    # Enforce single active admin session: deny login if another token is active
    # use `pk` to satisfy static analyzers and be robust across custom user models
    key = f"active_admin_{user.pk}"
    active = cache.get(key)
    if active:
        return JsonResponse({'error': 'Admin already logged in elsewhere'}, status=409)

    token = generate_jwt({'sub': user.pk, 'email': user.email, 'name': user.name, 'is_admin': True})
    # Store active token in cache. TTL optional; using JWT exp (24h) by default.
    # Use a cache timeout equal to the token's lifetime (default used in generate_jwt) => 24h
    cache.set(key, token, timeout=24*3600)
    return JsonResponse({'token': token, 'user': {'id': user.pk, 'email': user.email, 'name': user.name, 'is_admin': True}})


@csrf_exempt
def logout_view(request):
    # Allow POST or GET with Authorization header to clear active session
    payload = get_auth_payload_from_request(request)
    if not payload:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    key = f"active_admin_{payload.get('sub')}"
    cache.delete(key)
    return JsonResponse({'ok': True})


def me_view(request):
    payload = get_auth_payload_from_request(request)
    if not payload:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    return JsonResponse({'user': payload})

def health_check(request):
    return JsonResponse({'status': 'ok'})

class FrontendAppView(View):
    def get(self, request):
        # Try multiple locations for index.html so the app works whether built into
        # `backend/static` or `backend/staticfiles`.
        base = os.path.dirname(__file__)
        candidates = [
            os.path.join(base, '..', 'static', 'index.html'),
            os.path.join(base, '..', 'staticfiles', 'index.html'),
            os.path.join(base, '..', 'static', 'index.html'),
        ]
        for p in candidates:
            p = os.path.normpath(p)
            if os.path.exists(p):
                with open(p, 'r', encoding='utf-8') as f:
                    content = f.read()
                return HttpResponse(content, content_type='text/html')
        return HttpResponse("index.html not found; looked in: " + ",".join(candidates), status=404)

