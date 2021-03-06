from django.contrib import admin

from .models import Question, Choice, Topic
# Register your models here.

class ChoiceInLine(admin.TabularInline):
    model = Choice
    extra = 3

class TopicAdmin(admin.ModelAdmin):
    fields = ('topic_text',)

class TopicInLine(admin.TabularInline):
    model = Question.topic.through

class QuestionAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {'fields': ['question_text']}),
        ('Date information', {'fields': ['pub_date']}),
        ]
    inlines = [ChoiceInLine, TopicInLine]
    list_display = ('question_text', 'pub_date', 'was_published_recently')
    list_filter = ['pub_date']
    search_fields = ['question_text']

admin.site.register(Question, QuestionAdmin)
admin.site.register(Topic, TopicAdmin)