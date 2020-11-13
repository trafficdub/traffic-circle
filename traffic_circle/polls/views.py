from django.http import HttpResponse,HttpResponseBadRequest,HttpResponseRedirect
from django.db.models import F
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.utils import timezone as tz
from django.views import generic

from .models import Question, Choice

# Create your views here.

class IndexView(generic.ListView):
    template_name = 'polls/index.html'
    context_object_name = 'latest_question_list'

    def get_queryset(self):
        return Question.objects.filter(
            pub_date__lte=tz.now()
        ).order_by('-pub_date')[:5]

class DetailView(generic.DetailView):
    model = Question
    template_name = 'polls/detail.html'

    def get_queryset(self):
        return Question.objects.filter(
            pub_date__lte=tz.now()
        )

class ResultsView(generic.DetailView):
    model = Question
    template_name = 'polls/results.html'

    def get_queryset(self):
        return Question.objects.filter(
            pub_date__lte=tz.now()
        )

def add_question(request, question_text):
    if request.method == "POST":
        try:
            new_question = Question(question_text=question_text, pub_date=tz.now())
        except KeyError:
            return HttpResponseBadRequest("Invalid question, try entering again.")
        new_question.save()
        return HttpResponseRedirect(reverse("polls:index", args=[]))

def vote(request, question_id):
    if request.method == "POST":
        question = get_object_or_404(Question, pk=question_id)
        try:
            selected_choice = question.choices.filter(pk=request.POST['choice'])
        except (KeyError, Choice.DoesNotExist):
            return render(request, 'polls/detail.html', {
                'question': question,
                'error_message': "Invalid selection.",
            })
        else:
            selected_choice.update(votes=F('votes') + 1)
            return HttpResponseRedirect(reverse('polls:results', args=[question.id]))