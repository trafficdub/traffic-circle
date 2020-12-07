from django.db import models
from django.utils import timezone as tz
from django.contrib.auth.models import User
from polls.models import Topic
from ckeditor.fields import RichTextField

# Create your models here.
class Category(models.Model):
    category_text = models.CharField(max_length=64, blank=True)

    def __str__(self):
        return self.category_text

class Post(models.Model):
    title = models.CharField(max_length=255)
    author = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    blurb = models.TextField(max_length=100, blank=True)
    body = RichTextField(blank=True, null=True)
    header_image = models.ImageField(null=True, blank=True)
    pub_date = models.DateTimeField('date published',default=tz.now)
    category = models.ForeignKey(Category, on_delete=models.DO_NOTHING, null=True, related_name='posts')
    topic = models.ManyToManyField(Topic, related_name='posts')


    def __str__(self):
        return f'{self.title} | {self.author}'
