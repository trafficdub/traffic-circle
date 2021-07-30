from django import forms
from django.urls import reverse
from django.http.response import HttpResponseRedirect
from django.shortcuts import render

posts = ["Post1", "Post2", "Post3"]

class NewPostForm(forms.Form):
    post = forms.CharField(label="New Post", min_length=1, max_length=100)

# Create your views here.
def index(request):
    return render(request, "community/index.html", {
        "posts": posts
    })

def user(request, name):
    form = NewPostForm()
    if request.method == "POST":
        form = NewPostForm(request.POST)
        if form.is_valid():
            post = form.cleaned_data["post"]
            posts.append(post)
            return HttpResponseRedirect(reverse("community:user", args=[name]))
    return render(request, "community/user.html", {
        "name": name.capitalize(),
        "form": form
    })