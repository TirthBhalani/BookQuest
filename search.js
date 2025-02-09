

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search-input");
    const searchIcon = document.querySelector(".search-icon");
    const recommendedBooksContainer = document.getElementById("recommended-books");

    const refreshButton = document.createElement("button");
    refreshButton.className = "refresh-button";
    refreshButton.innerHTML = `<i class="fas fa-sync-alt"></i> Shuffle Recommendations`;
    refreshButton.style.display= "inline"
    const filbutton = document.createElement("button");
    filbutton.className = "filter-button";
    filbutton.classList.add("filter-button")
    filbutton.innerHTML = `<i class="fas fa-sync-alt"></i> filter Recommendations`;
    filbutton.style.display= "inline"
    const ShuffleAndFilter = document.body.querySelector(".shuffleFilter-con");

    
    ShuffleAndFilter.append(refreshButton);
    ShuffleAndFilter.append(filbutton);



    // Filter 
    const filterButton = document.querySelector('.filter-button');
    const filterModal = document.querySelector('.filter-modal');
    const closeFilter = document.querySelector('.close-filter');
    const filterBooksBtn = document.querySelector('.filter-books-btn');

    filterButton.addEventListener('click', () => {
        filterModal.style.display = 'flex';
    });

    closeFilter.addEventListener('click', () => {
        filterModal.style.display = 'none';
    });

    filterModal.addEventListener('click', (e) => {
        if (e.target === filterModal) {
            filterModal.style.display = 'none';
        }
    });

    
async function searchBooksByGenres(selectedGenres) {
    
    const recommendedBooksContainer = document.getElementById("recommended-books");
    recommendedBooksContainer.innerHTML = '<p>Loading books...</p>';

    try {
        const genrePromises = selectedGenres.map(genre => fetchBooksByGenre(genre));
        
        const genreResults = await Promise.all(genrePromises);

        const allBooks = genreResults.map((books, index) => ({
            genre: selectedGenres[index],
            books: books
        }));

        displayFilteredResults(allBooks);
    } catch (error) {
        console.error('Error in genre search:', error);
        recommendedBooksContainer.innerHTML = '<p>Error loading books. Please try again.</p>';
    }
}

function displayFilteredResults(genreResults) {
    const recommendedBooksContainer = document.getElementById("recommended-books");
    recommendedBooksContainer.innerHTML = ''; 

    if (genreResults.length === 0) {
        recommendedBooksContainer.innerHTML = '<p>No books found for selected genres.</p>';
        return;
    }

    genreResults.forEach(({ genre, books }) => {
        if (books.length > 0) {
            const genreSection = document.createElement("div");
            genreSection.className = "genre-section";
            genreSection.innerHTML = `<h3>${genre}</h3>`;

            const bookGrid = document.createElement("div");
            bookGrid.className = "book-grid";

            books.forEach(book => {
                const bookCard = createBookCard(book);
                bookGrid.appendChild(bookCard);
            });

            genreSection.appendChild(bookGrid);
            recommendedBooksContainer.appendChild(genreSection);
        }
    });
}

filterBooksBtn.addEventListener('click', () => {
    const selectedGenres = Array.from(document.querySelectorAll('.genre-checkbox input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    if (selectedGenres.length > 0) {
        searchBooksByGenres(selectedGenres);
        filterModal.style.display = 'none';
    } else {
        alert('Please select at least one genre');
    }
});

    
    
    


    const genres = [
        "Fiction", "Mystery", "Thriller", "Romance", "Science Fiction",
        "Fantasy", "Horror", "Non-Fiction", "Biography", "History",
        "Self-Help", "Business", "Travel", "Cooking", "Art",
        "Science", "Technology", "Philosophy", "Poetry", "Children"
    ];

    async function fetchBooksByGenre(genre) {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${genre}&maxResults=15`);
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error(`Error fetching books for genre ${genre}:`, error);
            return [];
        }
    }

    async function displayRecommendedBooks() {
        recommendedBooksContainer.innerHTML = ""; 
        const randomGenres = getRandomGenres(genres, 10);

        for (const genre of randomGenres) {
            const books = await fetchBooksByGenre(genre);
            if (books.length > 0) {
                const genreSection = document.createElement("div");
                genreSection.className = "genre-section";
                genreSection.innerHTML = `<h3>${genre}</h3>`;
                const bookGrid = document.createElement("div");
                bookGrid.className = "book-grid";

                books.forEach(book => {
                    const bookCard = createBookCard(book);
                    bookGrid.appendChild(bookCard);
                });

                genreSection.appendChild(bookGrid);
                recommendedBooksContainer.appendChild(genreSection);
            }
        }
    }

    function createBookCard(book) {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";

        const thumbnail = book.volumeInfo.imageLinks?.thumbnail;
        const title = book.volumeInfo.title || "Unknown Title";

        if (thumbnail) {
            bookCard.innerHTML = `
                <img src="${thumbnail}" alt="${title}">
                <h4>${title}</h4>
                <p>${book.volumeInfo.authors?.join(", ") || "Unknown Author"}</p>
            `;
        } else {
            bookCard.innerHTML = `
                <div class="book-thumbnail-placeholder">
                    <span>${title}</span>
                </div>
                <h4>${title}</h4>
                <p>${book.volumeInfo.authors?.join(", ") || "Unknown Author"}</p>
            `;
        }

        bookCard.addEventListener("click", () => openBookModal(book));
        return bookCard;
    }

    
function openBookModal(book) {
    const modal = document.createElement("div");
    modal.className = "book-modal";
    document.body.classList.add("modal-open");

    const thumbnail = book.volumeInfo?.imageLinks?.thumbnail;
    const title = book.volumeInfo?.title || "Unknown Title";
    const authors = book.volumeInfo?.authors?.join(", ") || "Unknown Author";
    const publisher = book.volumeInfo?.publisher || "Unknown Publisher";
    const rating = book.volumeInfo?.averageRating || "Not rated";
    const description = book.volumeInfo?.description || "No description available.";

    const maxSynopsisLength = 250;
    const isSynopsisLong = description.length > maxSynopsisLength;
    const truncatedSynopsis = isSynopsisLong ? description.slice(0, maxSynopsisLength) + "..." : description;

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="modal-body">
                ${thumbnail ?
                    `<img src="${thumbnail}" alt="${title}">` :
                    `<div class="book-thumbnail-placeholder"><span>${title}</span></div>`
                }   
                <div class="book-details">
                    <h2>${title}</h2>
                    <p><strong>Author:</strong> ${authors}</p>
                    <p><strong>Publisher:</strong> ${publisher}</p>
                    <p><strong>Rating:</strong> ${rating}</p>
                    <div class="synopsis">
                        <p><strong>Synopsis:</strong> ${truncatedSynopsis}</p>
                        ${isSynopsisLong ? `<button class="read-more">Read More</button>` : ""}
                    </div>
                    <div class="library-selection">
                        <select id="library-section" class="section-dropdown">
                            <option value="" disabled selected>Select a section...</option>
                            <option value="read">Read</option>
                            <option value="currentlyReading">Currently Reading</option>
                            <option value="wantToRead">Want to Read</option>
                        </select>
                        <button class="add-to-library" disabled>Add to Library</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeModal = modal.querySelector(".close-modal");
    closeModal.addEventListener("click", () => closeBookModal(modal));

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeBookModal(modal);
        }
    });

    const readMoreButton = modal.querySelector(".read-more");
    if (readMoreButton) {
        readMoreButton.addEventListener("click", () => {
            const synopsisElement = modal.querySelector(".synopsis");
            synopsisElement.innerHTML = `<p><strong>Synopsis:</strong> ${description}</p>`;
            readMoreButton.style.display = "none";
        });
    }

    const sectionDropdown = modal.querySelector("#library-section");
    const addToLibraryButton = modal.querySelector(".add-to-library");

    sectionDropdown.addEventListener("change", () => {
        addToLibraryButton.disabled = !sectionDropdown.value;
    });

    addToLibraryButton.addEventListener("click", () => {
        const selectedSection = sectionDropdown.value;
        if (selectedSection) {
            addBookToLibrary(book, selectedSection);
            closeBookModal(modal);
        }
    });
}

function addBookToLibrary(book, section) {
    const bookData = {
        title: book.volumeInfo?.title || "Unknown Title",
        author: book.volumeInfo?.authors?.join(", ") || "Unknown Author",
        thumbnail: book.volumeInfo?.imageLinks?.thumbnail || "",
        publisher: book.volumeInfo?.publisher || "Unknown Publisher",
        description: book.volumeInfo?.description || "No description available.",
        rating: book.volumeInfo?.averageRating || "Not Rated",
        pageCount: book.volumeInfo?.pageCount || 0,
        pagesRead: 0
    };

    const books = JSON.parse(localStorage.getItem(section)) || [];
    books.push(bookData);
    localStorage.setItem(section, JSON.stringify(books));

    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.textContent = `Book added to ${section.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
    document.body.appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

    function closeBookModal(modal) {
        modal.remove();
        document.body.classList.remove("modal-open");
    }

    function getRandomGenres(genres, count) {
        const shuffled = genres.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Function to add a book to Local Storage
    // function addBookToLibrary(book, section) {
    //     const bookData = {
    //         title: book.volumeInfo?.title || "Unknown Title",
    //         author: book.volumeInfo?.authors?.join(", ") || "Unknown Author",
    //         thumbnail: book.volumeInfo?.imageLinks?.thumbnail || "",
    //         publisher: book.volumeInfo?.publisher || "Unknown Publisher",
    //         description: book.volumeInfo?.description || "No description available.",
    //         rating: book.volumeInfo?.averageRating || "Not Rated",
    //         pageCount: book.volumeInfo?.pageCount || 0,
    //         pagesRead: 0
    //     };

    //     const key = section.toLowerCase().replace(/\s+/g, ""); // Normalize section names
    //     const books = JSON.parse(localStorage.getItem(key)) || [];
    //     books.push(bookData);
    //     localStorage.setItem(key, JSON.stringify(books));

    //     alert(`Book added to ${section}`);
    // }


    async function searchBooks(query) {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
        const data = await response.json();
        displaySearchResults(data.items || []);
    }

    function displaySearchResults(books) {
        recommendedBooksContainer.innerHTML = ""; 
        if (books.length > 0) {
            const searchResultsSection = document.createElement("div");
            searchResultsSection.className = "search-results-section";
            searchResultsSection.innerHTML = `<h3>Search Results</h3>`;
            const bookGrid = document.createElement("div");
            bookGrid.className = "book-grid";

            books.forEach(book => {
                const bookCard = createBookCard(book);
                bookGrid.appendChild(bookCard);
            });

            searchResultsSection.appendChild(bookGrid);
            recommendedBooksContainer.appendChild(searchResultsSection);
        } else {
            recommendedBooksContainer.innerHTML = `<p>No books found for your search.</p>`;
        }
    }

    
    displayRecommendedBooks();

    
    refreshButton.addEventListener("click", () => {
        displayRecommendedBooks();
    });

    
    searchIcon.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query) {
            searchBooks(query);
        }
    });
});