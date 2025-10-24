from django.http import JsonResponse, FileResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.views.generic import View
import json
import os
from settings_app.models import User
from .auth_utils import generate_jwt, get_auth_payload_from_request

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
    token = generate_jwt({'sub': user.id, 'email': user.email, 'name': user.name, 'is_admin': True})
    return JsonResponse({'token': token, 'user': {'id': user.id, 'email': user.email, 'name': user.name, 'is_admin': True}})


def me_view(request):
    payload = get_auth_payload_from_request(request)
    if not payload:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    return JsonResponse({'user': payload})

def health_check(request):
    return JsonResponse({'status': 'ok'})

class FrontendAppView(View):
    def get(self, request):
        index_path = os.path.join(os.path.dirname(__file__), 'static', 'index.html')
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return HttpResponse(content, content_type='text/html')
        return HttpResponse("index.html not found", status=404)

