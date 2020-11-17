import datetime as dt

from django.db import models
from django.utils import timezone

# Create your models here.
class Category(models.Model):
    category_text = models.CharField(max_length=64, blank=True)

    def __str__(self):
        return self.category_text

class Topic(models.Model):
    topic_text = models.CharField(max_length=64, blank=True)

    def __str__(self):
        return self.topic_text

class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')
    category = models.ManyToManyField(Category, related_name='category')
    topic = models.ManyToManyField(Topic, related_name='topic')

    def __str__(self):
        return self.question_text

    def was_published_recently(self):
        now = timezone.now()
        return now - dt.timedelta(days=14) <= self.pub_date <= now
    was_published_recently.admin_order_field = 'pub_date'
    was_published_recently.boolean = True
    was_published_recently.short_description = 'Published recently?'

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)

    def __str__(self):
        return self.choice_text

