from django.contrib import admin

from .models import Post, Category

# Register your models here.
class PostAdmin(admin.ModelAdmin):
    pass

class CategoryAdmin(admin.ModelAdmin):
    fields = ('category_text',)

class CategoryInLine(admin.TabularInline):
    model = Category

admin.site.register(Post, PostAdmin)
admin.site.register(Category, CategoryAdmin)
