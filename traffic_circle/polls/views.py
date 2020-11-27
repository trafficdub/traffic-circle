from django.http import HttpResponse,HttpResponseBadRequest,HttpResponseRedirect, JsonResponse
from django.contrib import messages
from django.db.models import F
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.utils import timezone as tz
from django.views import generic
from django.db.models import Avg, Count, Min, Sum
from django.core import serializers

from .models import Question, Choice, Topic

# Create your views here.

class IndexView(generic.ListView):
    template_name = 'polls/index.html'
    context_object_name = 'all_questions'
    paginate_by = 10

    def get_queryset(self):
        return Question.objects.order_by('-pub_date')
    
    def get_context_data(self, **kwargs):
        context = super(IndexView,self).get_context_data(**kwargs)
        context['votes'] = Choice.objects.values('question').annotate(total_vote=Sum('votes'))
        context['topics'] = Topic.objects.all()
        return context
        

class DetailView(generic.DetailView):
    model = Question
    template_name = 'polls/detail.html'

    def get_queryset(self):
        return Question.objects.filter(
            pub_date__lte=tz.now()
        )

def results(request, pk):
    serialized_choice = serializers.serialize('json', Question.objects.filter(pk=pk)[0].choices.all())
    return JsonResponse({
        'choices': serialized_choice
    })

def question(request, pk):
    return HttpResponse(Question.objects.filter(pk=pk))

def topic(request, topic_id):
    if (request.method == "POST") and (topic_id != 'All'):
        topic = get_object_or_404(Topic, pk=topic_id)
        try:
            selected_questions = topic.questions.filter(pk=request.POST['topic_id'])
        except (KeyError, Topic.DoesNotExist):
            messages.warning(request, 'Invalid topic, please select again.')
            return HttpResponseRedirect(reverse('polls:index') + f"#question-{question_id}")
        else:
            selected_choice.update(votes=F('votes') + 1)
            messages.success(request, 'Voted successfully.')
    return HttpResponseRedirect(reverse('polls:index') + f"#select-by-topic")

def add_question(request):
    form = QuestionForm()
    if request.method == "POST":
        form = QuestionForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('polls:index'))
    return render(request, "polls/add_question.html", {
        'form': form,
    })

def vote(request, question_id):
    if request.method == "POST":
        question = get_object_or_404(Question, pk=question_id)
        try:
            selected_choice = question.choices.filter(pk=request.POST['choice'])
        except (KeyError, Choice.DoesNotExist):
            messages.warning(request, 'Invalid choice, please select again.')
            return HttpResponseRedirect(reverse('polls:index') + f"#question-{question_id}")
        else:
            selected_choice.update(votes=F('votes') + 1)
            messages.success(request, 'Voted successfully.')
    return HttpResponseRedirect(reverse('polls:index') + f"#question-{question_id}")