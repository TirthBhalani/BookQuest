document.addEventListener("DOMContentLoaded", function () {
    updateBookCounts();
    displayBooks('read');
    displayBooks('currentlyReading');
    displayBooks('wantToRead');
});

function updateBookCounts() {
    const readBooks = JSON.parse(localStorage.getItem('read')) || [];
    const currentBooks = JSON.parse(localStorage.getItem('currentlyReading')) || [];
    const wantBooks = JSON.parse(localStorage.getItem('wantToRead')) || [];

    const readCountElement = document.getElementById('read-count');
    const currentCountElement = document.getElementById('current-count');
    const wantCountElement = document.getElementById('want-count');

    if (readCountElement) readCountElement.textContent = `Books: ${readBooks.length}`;
    if (currentCountElement) currentCountElement.textContent = `Books: ${currentBooks.length}`;
    if (wantCountElement) wantCountElement.textContent = `Books: ${wantBooks.length}`;
}

function displayBooks(section) {
    const container = document.getElementById(`${section}-books`);
    if (!container) return;
    container.innerHTML = "";
    container.classList.add("book-grid");

    const books = JSON.parse(localStorage.getItem(section)) || [];

    if (books.length === 0) {
        container.innerHTML = "<p>No books added</p>";
        return;
    }

    books.forEach((book, index) => {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";
        
        const thumbnail = book.thumbnail || "";
        const title = book.title || "Unknown Title";
        const author = book.author || "Unknown Author";
        
        if (thumbnail) {
            bookCard.innerHTML = `
                <img src="${thumbnail}" alt="${title}" class="book-thumbnail">
                <h4 class="book-title">${title}</h4>
                <p class="book-author">${author}</p>
            `;
        } else {
            bookCard.innerHTML = `
                <div class="book-thumbnail-placeholder">
                    <span>${title}</span>
                </div>
                <h4 class="book-title">${title}</h4>
                <p class="book-author">${author}</p>
            `;
        }
        
        bookCard.addEventListener("click", () => openLibraryModal(book, section, index));
        container.appendChild(bookCard);
    });
}

function openLibraryModal(book, currentSection, bookIndex) {
    const modal = document.createElement("div");
    modal.className = "book-modal";
    document.body.classList.add("modal-open");

    const thumbnail = book.thumbnail || "";
    const title = book.title || "Unknown Title";

    
    const startDate = book.startDate ? new Date(book.startDate).toISOString().split('T')[0] : '';
    const endDate = book.endDate ? new Date(book.endDate).toISOString().split('T')[0] : '';

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <button class="info-button">INFO</button>
            <div class="modal-body">
                ${thumbnail ? 
                    `<img src="${thumbnail}" alt="${title}">` : 
                    `<div class="book-thumbnail-placeholder"><span>${title}</span></div>`
                }
                <div class="book-details">
                    <h2>${title}</h2>
                    
                    <div class="form-group">
                        <label for="move-to">Move to:</label>
                        <select id="move-to" class="modal-input">
                            <option value="read" ${currentSection === 'read' ? 'selected' : ''}>Read</option>
                            <option value="currentlyReading" ${currentSection === 'currentlyReading' ? 'selected' : ''}>Currently Reading</option>
                            <option value="wantToRead" ${currentSection === 'wantToRead' ? 'selected' : ''}>Want to Read</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="pages-read">Pages Read:</label>
                        <input type="number" id="pages-read" class="modal-input" value="${book.pagesRead || 0}">
                    </div>

                    <div class="form-group">
                        <label for="start-date">Start Date:</label>
                        <input type="date" id="start-date" class="modal-input" value="${startDate}">
                    </div>

                    <div class="form-group">
                        <label for="end-date">End Date:</label>
                        <input type="date" id="end-date" class="modal-input" value="${endDate}">
                    </div>

                    <div class="button-group">
                        <button class="save-changes">Save Changes</button>
                        <button class="remove-book">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    
    const closeModal = modal.querySelector(".close-modal");
    closeModal.addEventListener("click", () => {
        modal.remove();
        document.body.classList.remove("modal-open");
    });

    const infoButton = modal.querySelector(".info-button");
    infoButton.addEventListener("click", () => {
        modal.remove();
        openInfoModal(book);
    });

    const saveButton = modal.querySelector(".save-changes");
    saveButton.addEventListener("click", () => {
        saveChanges(book, currentSection, bookIndex, modal);
    });

    const removeButton = modal.querySelector(".remove-book");
    removeButton.addEventListener("click", () => {
        removeBook(currentSection, bookIndex);
        modal.remove();
        document.body.classList.remove("modal-open");
        displayBooks(currentSection);
        updateBookCounts();
    });
}

function saveChanges(book, currentSection, bookIndex, modal) {
    const newSection = document.getElementById("move-to").value;
    const pagesRead = parseInt(document.getElementById("pages-read").value) || 0;
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    // Update book object
    book.pagesRead = pagesRead;
    book.startDate = startDate;
    book.endDate = endDate;

    // Remove from current section
    let books = JSON.parse(localStorage.getItem(currentSection)) || [];
    books.splice(bookIndex, 1);
    localStorage.setItem(currentSection, JSON.stringify(books));

    // Add to new section
    books = JSON.parse(localStorage.getItem(newSection)) || [];
    books.push(book);
    localStorage.setItem(newSection, JSON.stringify(books));

    // Update display
    displayBooks(currentSection);
    if (currentSection !== newSection) {
        displayBooks(newSection);
    }
    updateBookCounts();

    // Close modal
    modal.remove();
    document.body.classList.remove("modal-open");
}

function removeBook(section, index) {
    let books = JSON.parse(localStorage.getItem(section)) || [];
    books.splice(index, 1);
    localStorage.setItem(section, JSON.stringify(books));
}

function openInfoModal(book) {
    const infoModal = document.createElement("div");
    infoModal.className = "info-modal";
    document.body.classList.add("modal-open");

    const description = book.description || "No description available.";
    const publisher = book.publisher || "Unknown Publisher";
    const maxSynopsisLength = 150;
    const isSynopsisLong = description.length > maxSynopsisLength;
    const truncatedSynopsis = isSynopsisLong ? description.slice(0, maxSynopsisLength) + "..." : description;

    infoModal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="modal-body">
                <div class="modal-left">
                    ${book.thumbnail ? 
                        `<img src="${book.thumbnail}" alt="${book.title}" class="modal-thumbnail">` : 
                        `<div class="book-thumbnail-placeholder"><span>${book.title}</span></div>`
                    }
                </div>
                <div class="modal-right">
                    <h2>${book.title}</h2>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>Publisher:</strong> ${publisher}</p>
                    <p><strong>Rating:</strong> ${book.rating || "Not Rated"}</p>
                    <div class="synopsis">
                        <p><strong>Synopsis:</strong> ${truncatedSynopsis}</p>
                        ${isSynopsisLong ? `<button class="read-more">Read More</button>` : ""}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(infoModal);

    // Close modal handler
    const closeButton = infoModal.querySelector(".close-modal");
    closeButton.addEventListener("click", () => {
        infoModal.remove();
        document.body.classList.remove("modal-open");
    });

    //  "Read More" button
    const readMoreButton = infoModal.querySelector(".read-more");
    if (readMoreButton) {
        readMoreButton.addEventListener("click", () => {
            const synopsisDiv = infoModal.querySelector(".synopsis");
            synopsisDiv.innerHTML = `<p><strong>Synopsis:</strong> ${description}</p>`;
            readMoreButton.style.display = "none";
        });
    }
}

// Function to close the modal
function closeBookModal(modal) {
    modal.remove();
    document.body.classList.remove("modal-open");
}