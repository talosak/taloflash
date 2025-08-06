# Taloflash

#### Video demo: TBA
#### Description: Taloflash is a web application that allows users to create, share and study flashcards.
#### Full commit history can be found [here](https://github.com/talosak/CS50W/commits/main/)

## Built with:
* [Bootstrap](https://getbootstrap.com/)
* [Django](https://www.djangoproject.com/)

# Distinctiveness and Complexity

My web application contains 3 original models (not counting User) on the backend, which all have at least 6 unique fields each. These fields are of many different types, which are discussed more at length in the "Models" section.

JavaScript is used in 3 seperate files: "index.js", "flashset.js", "study.js", they are responsible for asynchronously editing or deleting flashcards, any popups in the flashset page, and handling the functionality of the study page.

My project's distinctiveness and complexity in comparison to the other weeks' projects comes from the fact, that they didn't do anything remotely close to creating, collaborating, and especially studying flashcards. In addition, there also settings, which also have to be kept in check at all times, such as the color theme, the timer, or the display order.

## Getting Started
#### An east step by step guide on how to locally host this web application only for yourself, obviously this isn't the only way to do it.
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
8. Run the web application
    ```bash 
    python manage.py runserver
    ```
