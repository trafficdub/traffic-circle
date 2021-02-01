from django.urls import path

from . import views

app_name = 'fuzzylogic'
urlpatterns = [
    path('', views.index, name='index'),
    path('info/', views.info, name='info'),
]