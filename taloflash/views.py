from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, redirect
from django.db import IntegrityError
from django.contrib import messages
from django.db.models import Count
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseRedirect
import json

from .models import User, FlashSet, Flashcard, Settings

def index(request):
    # Order the flashsets while checking if user is logged in
    try:
        if request.user.settings.flashSetDisplayOrder == "likes":
            order = "-likeCount"
        elif request.user.settings.flashSetDisplayOrder == "name":
            order = "name"
        elif request.user.settings.flashSetDisplayOrder == "newest":
            order = "-timestamp"
        elif request.user.settings.flashSetDisplayOrder == "creator":
            order = "-creator__username"
    except AttributeError:
        order = "-likeCount"

    flashsets = FlashSet.objects.annotate(likeCount=Count("likers", distinct=True), flashcardCount=Count("flashcards", distinct=True)).order_by(order).all()
    return render(request, "taloflash/index.html", {
        "sets": flashsets,
    })

def alterFlashcard(request, set_id, flashcard_id):
    if request.method == "DELETE":
        # Delete flashcard
        flashcard = Flashcard.objects.get(pk=flashcard_id)
        flashcard.delete()
        return JsonResponse({"message": "Flashcard deleted successfully"}, status=201)
    elif request.method == "PUT":
        # Replace old values with edited ones
        data = json.loads(request.body)
        flashcard = Flashcard.objects.get(pk=flashcard_id)
        newFront = data.get("newFront", "")
        newBack = data.get("newBack", "")
        newImageURL = data.get("newImageURL", "")
        flashcard.front = newFront
        flashcard.back = newBack
        flashcard.imageURL = newImageURL
        flashcard.save()
        return JsonResponse({"message": "Flashcard edited successfully"}, status=201)
    
def alterSet(request, set_id):
    data = json.loads(request.body)
    flashset = FlashSet.objects.get(pk=set_id)
    action = data.get("action", "")
    if action == "like":
        flashset.likers.add(request.user)
        flashset.save()
        return JsonResponse({"message": "FlashSet liked successfully"}, status=201)
    elif action == "unlike":
        flashset.likers.remove(request.user)
        flashset.save()
        return JsonResponse({"message": "FlashSet unliked successfully"}, status=201)
    elif action == "save":
        flashset.savers.add(request.user)
        flashset.save()
        return JsonResponse({"message": "FlashSet saved successfully"}, status=201)
    elif action == "unsave":
        flashset.savers.remove(request.user)  
        flashset.save()
        return JsonResponse({"message": "FlashSet unsaved successfully"}, status=201)  
    else:
        return JsonResponse({"message": "Invalid action for alterSet"}, status=500)


def createFlashcard(request, set_id):
    if request.method == "POST":
        flashset = FlashSet.objects.annotate(likeCount=Count("likers"), flashcardCount=Count("flashcards")).get(pk=set_id)
        creator = request.user
        front = request.POST["front"]
        back = request.POST["back"]
        imageURL = request.POST["imageURL"]

        # Ensure both sides aren't blank
        if front == "" or back == "":
            messages.error(request, "Both sides of the flashcard must be inputted")
            return render(request, "taloflash/createFlashcard.html", {
                "flashset": flashset,
            })
        
        flashcard = Flashcard(creator=creator, front=front, back=back, imageURL=imageURL, flashSet_id=flashset.id)
        flashcard.save()
        messages.success(request, "Flashcard created successfully")
        return redirect("set", set_id=set_id)
    else:
        flashset = FlashSet.objects.annotate(likeCount=Count("likers"), flashcardCount=Count("flashcards")).get(pk=set_id)
        return render(request, "taloflash/createFlashcard.html", {
            "flashset": flashset,
        })

def createSet(request):
    if request.method == "POST":
        creator = request.user
        name = request.POST["name"]
        description = request.POST["description"]

        # Ensure name isn't blank
        if name == "":
            messages.error(request, "FlashSet's name is missing")
            return render(request, "taloflash/createSet.html")

        # Create the flashset
        flashset = FlashSet(creator=creator, name=name, description=description)
        flashset.save()
        flashset.editors.add(creator)
        flashset.save()
        messages.success(request, "Set created successfully")
        return redirect("index")
    else:
        return render(request, "taloflash/createSet.html")

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            messages.success(request, "Logged in successfully")
            return redirect("index")
        else:
            messages.error(request, "Invalid username or password")
            return render(request, "taloflash/login.html")
    
    elif request.user.is_authenticated:
        # User is already logged in
        messages.error(request, "Already logged in")
        return redirect("index")
    else:
        return render(request, "taloflash/login.html")
    
def logout_view(request):
    # Check if user is authenticated
    if not request.user.is_authenticated:
        messages.success(request, "Not logged in")
        return redirect("index")
    
    # Log user out
    logout(request)
    messages.success(request, "Logged out successfully")
    return redirect("index")
    
def register_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]

        # Ensure password matches confirmation
        if password != confirmation:
            messages.error(request, "Password must match confirmation")
            return render(request, "taloflash/register.html")
        
        # Ensure username is unique
        try:
            user = User.objects.create_user(username=username, email="", password=password)
            user.save()
        except IntegrityError:
            messages.error(request, "Username already taken")
            return render(request, "network/register.html")
        
        # Create settings
        settings = Settings(user=user)
        settings.save()

        login(request, user)
        messages.success(request, "Registered successfully")
        return redirect("index")
    
    elif request.user.is_authenticated:
        # User is already logged in
        messages.error(request, "Already logged in")
        return redirect("index")

    else:
        return render(request, "taloflash/register.html")
    
def saved(request):
    # Check if user is authenticated
    if not request.user.is_authenticated:
        messages.success(request, "Not logged in")
        return redirect("index")
    
    # Order the flashsets while checking if user is logged in
    if request.user.settings.flashSetDisplayOrder == "likes":
        order = "-likeCount"
    elif request.user.settings.flashSetDisplayOrder == "name":
        order = "name"
    elif request.user.settings.flashSetDisplayOrder == "newest":
        order = "-timestamp"
    elif request.user.settings.flashSetDisplayOrder == "creator":
        order = "-creator__username"
    else:
        messages.success(request, "Not logged in")
        return redirect("index")
        
    flashsets = FlashSet.objects.filter(savers=request.user).annotate(likeCount=Count("likers", distinct=True), flashcardCount=Count("flashcards", distinct=True)).order_by(order).all()
    return render(request, "taloflash/saved.html", {
        "sets": flashsets,
    })

def search(request):
    if request.method == "POST":
        searchQuery = request.POST.get("searchQuery")
        if searchQuery == "":
            messages.error(request, "Cannot submit empty search query")
            return redirect("search")
        return redirect("searchResults", searchQuery=searchQuery)
    else:
        return render(request, "taloflash/search.html")
    
def searchResults(request, searchQuery):
    order = "name"
    flashsets = FlashSet.objects.filter(name__contains=searchQuery).annotate(likeCount=Count("likers", distinct=True), flashcardCount=Count("flashcards", distinct=True)).order_by(order).all()
    return render(request, "taloflash/searchResults.html", {
        "sets": flashsets,
        "searchQuery": searchQuery,
    })

def set_view(request, set_id):
        if request.method == "POST":
            # Delete Flashset
            flashset = FlashSet.objects.get(pk=set_id)
            flashset.delete()
            messages.success(request, "Set deleted successfully")
            return redirect("index")
        elif request.method == "PUT":
            # Add editor
            data = json.loads(request.body)
            flashset = FlashSet.objects.get(pk=set_id)
            username = data.get("username", "")

            try:
                editor = User.objects.get(username=username)
            except User.DoesNotExist:
                messages.error(request, "User does not exist")
                return JsonResponse({"error": "User does not exist"}, status=404)
            if editor in flashset.editors.all():
                messages.error(request, "User is already an editor")
                return JsonResponse({"error": "User is already an editor"}, status=500)
            
            flashset.editors.add(editor)
            flashset.save()
            return JsonResponse({"editor_id": editor.id}, status=201)
        elif request.method == "DELETE":
            # Remove user from editors
            data = json.loads(request.body)
            flashset = FlashSet.objects.get(pk=set_id)
            editor_id = data.get("editor_id", "")
            editor = User.objects.get(pk=editor_id)
            flashset.editors.remove(editor)
            return JsonResponse({"message": "User removed successfully"}, status=201)
        else:
            try:
                if request.user.settings.flashcardDisplayOrder == "random":
                    order = "?"
                elif request.user.settings.flashcardDisplayOrder == "oldest":
                    order = "timestamp"
                elif request.user.settings.flashcardDisplayOrder == "alphabeticalFront":
                    order = "front"
                elif request.user.settings.flashcardDisplayOrder == "alphabeticalBack":
                    order = "back"
            except AttributeError:
                order = "?"
            flashset = FlashSet.objects.annotate(likeCount=Count("likers"), flashcardCount=Count("flashcards")).get(pk=set_id)
            flashcards = Flashcard.objects.filter(flashSet=flashset).order_by(order).all()
            return render(request, "taloflash/flashset.html", {
                "flashset": flashset,
                "flashcards": flashcards,
            })
        
def settings(request):
    settings = Settings.objects.get(pk=request.user.id)
    if request.method == "POST":
        settings.theme = request.POST.get("theme", "dark")
        settings.flashSetDisplayOrder = request.POST.get("flashSetDisplayOrder", "likes")
        settings.flashcardDisplayOrder = request.POST.get("flashcardDisplayOrder", "oldest")
        settings.flashcardFontSize = request.POST.get("flashcardFontSize", 40)
        settings.showTimer = request.POST.get("showTimer", False)
        settings.timeLimit = request.POST.get("timeLimit", 0)
        settings.timeLimitBehavior = request.POST.get("timeLimitBehavior", "nothing")
        settings.postFlipCooldown = request.POST.get("postFlipCooldown", 0)
        settings.backToForwardMode = request.POST.get("backToForwardMode", False)
        settings.hardcoreMode = request.POST.get("hardcoreMode", False)

        # Checkboxes return "on" or nothing, but django needs it to be True or False
        if settings.showTimer == "on":
            settings.showTimer = True
        if settings.backToForwardMode == "on":
            settings.backToForwardMode = True
        if settings.hardcoreMode == "on":
            settings.hardcoreMode = True

        settings.save()
        messages.success(request, "Settings updated successfully")
        return redirect("index")
    else:
        return render(request, "taloflash/settings.html", {
            "settings": settings,
        })

def study(request, set_id):
    if request.method == "POST":
        flashcards = Flashcard.objects.filter(flashSet__id=set_id).order_by("?")
        return JsonResponse([flashcard.serialize() for flashcard in flashcards], safe=False)
    else:
        return render(request, "taloflash/study.html")