# Taloflash

#### Video demo: TBA
#### Description: Taloflash is a web application that allows users to create, share and study flashcards.
#### Full commit history can be found [here](https://github.com/talosak/CS50W/commits/main/)

## Built with:
* [Bootstrap](https://getbootstrap.com/)
* [Django](https://www.djangoproject.com/)

# Distinctiveness and Complexity

My web application contains 3 original models (not counting User) on the backend, which all have at least 6 unique fields each. These fields are of many different types, which are discussed more at length in the "Models" section.

JavaScript is used in 3 seperate files: "index.js", "flashset.js", "study.js", they are responsible for asynchronously(that means "without needing to reload the page") editing or deleting flashcards, any popups in the flashset page, and handling the functionality of the study page.

Bootstrap's classes are utilized to create responsive pages that adapt to the screen's size, for example the navbar automatically turns into a toggle on smaller screens.

My project's distinctiveness and complexity in comparison to the other weeks' projects comes from the fact, that they didn't do anything remotely close to creating, collaborating, and especially studying flashcards. In addition, there are settings which have to be kept in check at all times, such as the color theme, the timer, or the display order.

Overall, this took me about 2 months of on-and-off work to complete.

## Getting Started
#### An easy step by step guide on how to locally host this web application only for yourself, obviously this isn't the only way to do it.
1. Download [python and pip](https://www.python.org/)
2. Download [VSCode](https://code.visualstudio.com/)
3. Download [Git](https://git-scm.com/)
4. Open VSCode and download the python extension
5. Create a terminal using the Git Bash
6. Install django
    ```bash
    python -m pip install django
    ```
7. Clone the Github repository
    ```bash
    git clone https://github.com/talosak/taloflash.git
    ```
8. Make migrations and migrate
    ```bash 
    python manage.py makemigrations
    python manage.py migrate
    ```
9. Run the web application
    ```bash 
    python manage.py runserver
    ```

# Documentation
### This is the part of the README where i go into detail about all the files and features.

## Models

There are three original models of my creation, and Django's AbstractUser model.

### 1. FlashSet
This model handles the flashsets that users can create:
* creator - ForeignKey to the User that created the flashset
* editors - ManyToManyField of Users that are allowed to edit the flashcards inside the set
* name - CharField that holds the name of the flashset
* description - TextField that holds the description of the flashset
* timestamp - DateTimeField that holds the date and time of the flashset's creation
* likers - ManyToManyField of Users that have liked this set
* savers - ManyToManyField of Users that have saved this set

```Python
class FlashSet(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="createdSets")
    editors = models.ManyToManyField(User, related_name="editableSets")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    likers = models.ManyToManyField(User, related_name="likedSets")
    savers = models.ManyToManyField(User, related_name="savedSets")
```

### 2. Flashcard
This model handles the flashcards that users can create inside of flashsets:
* flashSet - ForeignKey to the FlashSet to which this Flashcard belongs
* front - CharField of text on the front side of this flashcard
* back - CharField of text on the back side of this flashcard
* imageURL - URLField of the flashcard's image's URL
* timestamp - DateTimeField that holds the date and time of the flashcard's creation
* creator - ForeignKey to the User who created this flashcard
* serialize() function - used to serialize the data about the flashcard so it can be used in study.js

```Python
class Flashcard(models.Model):
    flashSet = models.ForeignKey(FlashSet, on_delete=models.CASCADE, related_name="flashcards")
    front = models.CharField(max_length=255)
    back = models.CharField(max_length=255)
    imageURL = models.URLField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="createdFlashcards")

    def serialize(self):
        return {
            "id": self.id,
            "flashset": self.flashSet.id,
            "front": self.front,
            "back": self.back,
            "imageURL": self.imageURL,
            "timestamp": self.timestamp,
            "creator": self.creator.id,
        }
```

### 3. Settings
This model holds all the settings a user can configure:
* user - ForeignKey to the User to who these settings belong
* theme - CharField with the user's selected color theme (dark or light)
* flashSetDisplayOrder - CharField with the order in which flashsets are displayed (most likes, name(alphabetical), newest, creator's name)
* flashcardDisplayOrder - CharField with the order in which flashcards are displayed (random, oldest, alphabetical-front, alphabetical-back)
* flashcardFontSize - IntegerField with the font size (in pixels) to use while studying flashcards
* showTimer - BooleanField of whether or not to show the timer
* timeLimit - IntegerField of the amount of time while studying flashcards that needs to pass before something happens
* timeLimitBehavior - CharField of what should happen after the timeLimit is exceeded (nothing, kick(to set page), restart)
* postFlipCooldown - FloatField of how long the delay between flipping the flashcard and being able to select an answer, so as to prevent accidental clicks
* backToForwardMode - BooleanField that inverts all flashcards, so now the user sees the back and has to remember the front
* hardcoreMode - BooleanField that kicks the user to set page if they get even a single flashcard wrong
* serialize() function - used to serialize the data about the flashcard so it can be used in javascript files

```Python
class Settings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="settings")
    theme = models.CharField(default="dark", choices=[("dark", "Dark"), ("light", "Light")], max_length=63)
    flashSetDisplayOrder = models.CharField(default="likes", choices=[("likes", "Most liked"), ("name", "Name"), ("newest", "Newest"), ("creator", "Creator's name")], max_length=63)
    flashcardDisplayOrder = models.CharField(default="oldest", choices=[("random", "Random"), ("oldest", "Oldest"), ("alphabeticalFront", "Alphabetical - front side)"), ("alphabeticalBack", "Alphabetical - back side")], max_length=63)
    flashcardFontSize = models.IntegerField(default=40)
    showTimer = models.BooleanField(default=False)
    timeLimit = models.IntegerField(default=0)
    timeLimitBehavior = models.CharField(default="nothing", choices=[("nothing", "Nothing"), ("kick", "Kick"), ("restart", "Restart")], max_length=63)
    postFlipCooldown = models.FloatField(default=0)
    backToForwardMode = models.BooleanField(default=False)
    hardcoreMode = models.BooleanField(default=False)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.id,
            "theme": self.theme,
            "flashSetDisplayOrder": self.flashSetDisplayOrder,
            "flashcardDisplayOrder": self.flashcardDisplayOrder,
            "flashcardFontSize": self.flashcardFontSize,
            "showTimer": self.showTimer,
            "timeLimit": self.timeLimit,
            "timeLimitBehavior": self.timeLimitBehavior,
            "postFlipCooldown": self.postFlipCooldown,
            "backToForwardMode": self.backToForwardMode,
            "hardcoreMode": self.hardcoreMode,
        }
```

## Features

There are ten things that i would consider features in taloflash, some more complicated than others. In order of development:
* Account system
* Create flashset
* All sets
* Create flashcard
* Set page
* Like and save sets
* Saved sets page
* Search page
* Settings
* Study

### 1. Account system
This is a pretty standard Django account system that includes register, log in, log out. It only requires a username, and a password.

Relevant urls:
```Python
path("login", views.login_view, name="login"),
path("logout", views.logout_view, name="logout"),
path("register", views.register_view, name="register"),
```

### 2. Create flashset
Here logged in users can create a flashset by inputting the set's name and an optional description. After creation they automatically get assigned as the creator and get added to editors.

Relevant url:
```Python
path("createSet", views.createSet, name="createSet"),
```

### 3. All sets (index)
This is the index page of the web app. It uses Django's templates to display every existing flashset. 

Here i can also talk about layout.html, off of which every other template is based. It has a navbar which dynamically turns into a clickable button on smaller screens thanks to Bootstrap's breakpoints. It is also set up to display Django's message framework, in order to quickly and efficiently convey information to the user.

Relevant url:
```Python
path("", views.index, name="index"),
```

### 4. Create flashcard
After creating a flashset, or being added to one as an editor, users can create a flashcard for that set. To do this they must input text for the front side, back side, and an optional image URL.

Relevant url:
```Python
path("sets/<int:set_id>/createFlashcard", views.createFlashcard, name="createFlashcard"),
```

### 5. Set page
When the user clicks on a set, they are brought to a set page. Here they can see all the flashcards in the given set (rendered with django templates), and go to the study page.

If the user is both logged in and an editor of the set, then they can go to the create flashcard page. They can also edit or delete existing flashcards, which happens asynchronously through flashset.js and the alterFlashcard API path.

Finally, if the user is the creator of the set, they can delete the whole thing, along with all the flashcards inside. The creator can also add or remove other people from editors, which also happens asynchronously.

Relevant urls:
```Python
path("sets/<int:set_id>/alterFlashcard/<int:flashcard_id>", views.alterFlashcard, name="alterFlashcard"),
path("sets/<int:set_id>", views.set_view, name="set"),
```

### 6. Like and save sets

In pages where flashsets are displayed, a logged in user can like and save sets of their choosing. This happens by clicking a button, which updates the database asynchronously through index.js and the alterSet API path.

Relevant url:
```Python
path("sets/alterSet/<int:set_id>", views.alterSet, name="alterSet"),
```

### 7. Saved sets

From the navbar a logged in user can go to a page that displays the sets that they have saved.

Relevant url:
```Python
path("saved", views.saved, name="saved"),
```

### 8. Search page

From the navbar you can click on a page that lets you search for sets by name. After submitting a search query, the user is redirected to a results page, which displays every set whose name contains the query string.

Relevant urls:
```Python
path("search", views.search, name="search"),
path("search/<str:searchQuery>", views.searchResults, name="searchResults"),
```

### 9. Settings
In this page the user can configure many settings that affect the entire website, which are applied only after clicking the save button.<br>
These settings are listed in the Models' Settings section, here are some notable ones:


* Color theme - It uses dynamic CSS classes with variables, and Bootstrap's data-bs-theme to change the look of the entire website depending on the selected theme (dark or light)
* Various timer options - If shown, the timer will track how long it took the user to study the given set. If a time limit was specified, the action chosen in timeLimitBehavior will occur. All of this happens in the study.js file.
* Back to forward mode - Uses Django's {% if %} templates to swap the flashcards, so the back is displayed first when studying, and the user must guess what is on the front.

Relevant url:
```Python
path("settings", views.settings, name="settings"),
```

### 10. Study
From the set page, a user can click the study button, which brings them to the study page. Here the front side (or back side if you have it enabled in settings) of a flashcard from the set is displayed. The user tries to guess what is on the other side, if they are successful, they click the I knew button, if they're wrong, they should click the I didn't know button. This happens for every not yet learned flashcard, until all of them are learned. Progress is **not** saved between sessions.

There are also various settings that affect only this page, those being:
* Flashcard font size
* Show timer
* Time limit
* Timer behavior
* Post flip cooldown
* Back to forward mode
* Hardcore mode

When all of the flashcards are learned, a simple "You did it" screen is generated by javascript, and the user's accuracy is displayed.

Relevant url:
```Python
path("sets/<int:set_id>/study", views.study, name="study"),
```

# Author
### Igor Selma
### Username: talosak

# >^w^<


