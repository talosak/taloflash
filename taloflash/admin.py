from django.contrib import admin

from .models import User, FlashSet, Flashcard, Settings

# Register your models here.
admin.site.register(User)
admin.site.register(FlashSet)
admin.site.register(Flashcard)
admin.site.register(Settings)