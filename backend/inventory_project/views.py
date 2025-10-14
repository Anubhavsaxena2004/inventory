from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
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

