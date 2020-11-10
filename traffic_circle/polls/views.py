from django.http import HttpResponse
from django.shortcuts import render
from django.urls import reverse

from .models import Question

# Create your views here.

def index(request):
    latest_question_list = Question.objects.order_by('-pub_date')[:5]
    return render(request, "polls/index.html", {
        'latest_question_list': latest_question_list,
    })

def detail(request, question_id):
    return HttpResponse(f"Details of question: {question_id}.")

def results(request, question_id):
    return HttpResponse(f"Results of question: {question_id}.")

def vote(request, question_id):
    return HttpResponse(f"Voting on question: {question_id}.")