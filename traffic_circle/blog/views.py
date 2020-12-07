from django.shortcuts import render
from django.views import generic

from .models import Post, Category

# Create your views here.
class IndexView(generic.ListView):
    template_name = 'blog/index.html'
    context_object_name = 'all_posts'

    def get_queryset(self):
        return Post.objects.order_by('-pub_date')

    def get_context_data(self, **kwargs):
        context = super(IndexView,self).get_context_data(**kwargs)
        context['first_featured_post'] = Post.objects.order_by('-pub_date').first()

        context['categories'] = Category.objects.all()
        return context

class CategoryView(generic.DetailView):
    model = Category
    template_name = 'blog/category.html'

class DetailView(generic.DetailView):
    model = Post
    template_name = 'blog/detail.html'