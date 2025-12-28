function likeSet(set_id) {
    let likeButton = document.querySelector(`#likeSetButton-${set_id}`);
    let likeCount = document.querySelector(`#flashsetLikeCount-${set_id}`);
    let action = "";
    if (likeButton.innerHTML === "Like") {
        action = "like";
        likeCount.innerHTML = parseInt(likeCount.innerHTML) + 1;
        likeButton.innerHTML = "Unlike";
        likeButton.classList.remove("btn-primary");
        likeButton.classList.add("btn-secondary");
    } else {
        action = "unlike";
        likeCount.innerHTML = parseInt(likeCount.innerHTML) - 1;
        likeButton.innerHTML = "Like";
        likeButton.classList.remove("btn-secondary");
        likeButton.classList.add("btn-primary");
    }

    fetch(`/sets/alterSet/${set_id}`, {
        method: "PUT",
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken')
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            action: action,
        }),
    });
}

function saveSet(set_id) {
    let saveButton = document.querySelector(`#saveSetButton-${set_id}`);
    if (saveButton.innerHTML === "Save") {
        action = "save";
        saveButton.innerHTML = "Unsave";
        saveButton.classList.remove("btn-primary");
        saveButton.classList.add("btn-secondary");
    } else {
        action = "unsave";
        saveButton.innerHTML = "Save";
        saveButton.classList.remove("btn-secondary");
        saveButton.classList.add("btn-primary");
    }

    fetch(`/sets/alterSet/${set_id}`, {
        method: "PUT",
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken')
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            action: action,
        }),
    });
}