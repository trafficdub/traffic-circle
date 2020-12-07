from django import template
from ..models import Topic, Question

register = template.Library()

@register.filter(name='get_total_vote_by_q_id')
def get_total_vote_by_q_id(choices_set, id):
    return choices_set.filter(question=id)[0]['total_vote']

@register.filter(name='get_recent_questions')
def get_recent_questions(questions, count):
    return questions[:count]

@register.filter(name='get_non_recent_questions')
def get_non_recent_questions(questions, count):
    return questions[count:]

@register.filter(name='get_non_recent_questions_by_topic')
def get_non_recent_questions_by_topic(topic):
    return topic.questions.exclude(pub_date__gt=getattr(Question.objects.order_by('-pub_date')[3], 'pub_date'))