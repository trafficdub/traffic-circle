from django import template

register = template.Library()

@register.filter(name='get_total_vote_by_q_id')
def get_total_vote_by_q_id(choices_set, id):
    return choices_set.filter(question=id)[0]['total_vote']