from django.shortcuts import render
from django.http import JsonResponse

def test_api(request):
    return JsonResponse({"message": "API is working!"})
