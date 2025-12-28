function deleteFlashcard(flashcard_id, set_id) {
    fetch(`/sets/${set_id}/alterFlashcard/${flashcard_id}`, {
        method: "DELETE",
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken')
        },
        credentials: 'same-origin',
    });

    let flashcard = document.querySelector(`#flashcard-${flashcard_id}`);
    flashcard.innerHTML = '';
    flashcard.classList = '';
}

function displayEditFlashcard(flashcard_id, set_id) {
    baseFlashcard = document.querySelector(`#flashcard-base-${flashcard_id}`);
    editFlashcardForm = document.querySelector(`#flashcard-edit-form-${flashcard_id}`);
    baseFlashcard.classList.add("d-none");
    baseFlashcard.classList.remove("d-block");
    editFlashcardForm.classList.add("d-block");
    editFlashcardForm.classList.remove("d-none");
}

function saveFlashcardEdit(flashcard_id, set_id) {
    baseFlashcard = document.querySelector(`#flashcard-base-${flashcard_id}`);
    editFlashcardForm = document.querySelector(`#flashcard-edit-form-${flashcard_id}`);
    editFlashcardForm.classList.add("d-none");
    editFlashcardForm.classList.remove("d-block");
    baseFlashcard.classList.add("d-block");
    baseFlashcard.classList.remove("d-none");

    flashcardFront = document.querySelector(`#flashcard-front-${flashcard_id}`);
    flashcardBack = document.querySelector(`#flashcard-back-${flashcard_id}`);
    flashcardImage = document.querySelector(`#flashcard-image-${flashcard_id}`);
    newFlashcardFront = document.querySelector(`#flashcard-edit-front-${flashcard_id}`);
    newFlashcardBack = document.querySelector(`#flashcard-edit-back-${flashcard_id}`);
    newFlashcardImageURL = document.querySelector(`#flashcard-edit-imageURL-${flashcard_id}`);

    flashcardFront.innerHTML = newFlashcardFront.value;
    flashcardBack.innerHTML = newFlashcardBack.value;
    flashcardImage.src = newFlashcardImageURL.value;

    fetch(`/sets/${set_id}/alterFlashcard/${flashcard_id}`, {
        method: "PUT",
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken')
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            newFront: newFlashcardFront.value,
            newBack: newFlashcardBack.value,
            newImageURL: newFlashcardImageURL.value,
        }),
    });
}

function addEditor(set_id) {
    let username = document.querySelector("#addEditorInput").value;

    fetch(`/sets/${set_id}`, {
        method: "PUT",
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            username: username,
        }),
    })
    .then(response => response.json())
    .then(editor_id => {
        if (!editor_id["editor_id"]) {
            window.location.reload();
            return
        }
        // Render the newly added editor
        editor_id = editor_id["editor_id"];
        let div = document.createElement('div');
        div.id = `editorList-${editor_id}`;
        div.classList.add("flashcard", "container-fluid", "mt-2");
        let div2 = document.createElement('div');
        div2.classList.add("row", "justify-content-between");
        let span = document.createElement('span');
        span.classList.add("w-auto", "mt-2", "fontSize-22px");
        span.innerHTML = username;
        div2.append(span);
        let button = document.createElement('button');
        button.type = "button";
        button.classList.add("w-auto", "py-0", "my-2", "me-2", "btn", "btn-custom-danger", "fontSize-22px");
        button.innerHTML = "Remove";
        button.onclick = function() {deleteEditor(set_id, editor_id)};
        div2.append(button);
        div.append(div2);
        document.querySelector("#editorList").append(div);
    });
}

function deleteEditor(set_id, editor_id) {
    fetch(`/sets/${set_id}`, {
        method: "DELETE",
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken'),
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            editor_id: editor_id,
        }),
    });

    document.querySelector(`#editorList-${editor_id}`).innerHTML = '';
    document.querySelector(`#editorList-${editor_id}`).classList = '';
    document.querySelector(`#editorList-${editor_id}`).remove();
}