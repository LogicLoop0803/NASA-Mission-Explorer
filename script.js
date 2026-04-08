const apiKey = "hpaIT9IXaxwQfAKzsvUdkgHOYWB1kZVn9vBYhXcZ";
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
const mediaContainer = document.getElementById('media-container');
const apodTitle = document.getElementById('apod-title');
const apodDateLabel = document.getElementById('apod-date');
const apodCopyrightLabel = document.getElementById('apod-copyright');
const apodExplanation = document.getElementById('apod-explanation');
const datePicker = document.getElementById('date-picker');
const bdayPicker = document.getElementById('bday-picker');
const hdToggle = document.getElementById('hd-toggle');
const loadingUi = document.getElementById('loading-ui');
const errorUi = document.getElementById('error-ui');
const contentContainer = document.getElementById('content-container');
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const closeModal = document.getElementById('close-modal');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const randomBtn = document.getElementById('random-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const favoritesSection = document.getElementById('favorites-section');
const favoritesList = document.getElementById('favorites-list');

let currentData = null;
let isHd = false;
let favorites = JSON.parse(localStorage.getItem('nasaFavorites')) || [];

async function fetchApod(date) {
    showLoading();
    try {
        let url = apiUrl;
        if (date) {
            url += `&date=${date}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network error');
        }
        const data = await response.json();
        currentData = data;
        renderApod();
    } catch (error) {
        showError();
    }
}

function renderApod() {
    hideLoading();
    if (!currentData) return;
    
    apodTitle.textContent = currentData.title;
    apodDateLabel.textContent = currentData.date;
    
    if (currentData.copyright) {
        apodCopyrightLabel.textContent = `© ${currentData.copyright}`;
        apodCopyrightLabel.style.display = 'inline-block';
    } else {
        apodCopyrightLabel.textContent = '';
        apodCopyrightLabel.style.display = 'none';
    }
    
    apodExplanation.textContent = currentData.explanation;
    mediaContainer.innerHTML = '';
    
    if (currentData.media_type === 'video') {
        const iframe = document.createElement('iframe');
        iframe.src = currentData.url;
        iframe.allowFullscreen = true;
        mediaContainer.appendChild(iframe);
        hdToggle.disabled = true;
    } else {
        const img = document.createElement('img');
        img.src = (isHd && currentData.hdurl) ? currentData.hdurl : currentData.url;
        img.alt = currentData.title || "APOD Image";
        img.addEventListener('click', () => openModal(img.src));
        mediaContainer.appendChild(img);
        hdToggle.disabled = false;
    }
    
    contentContainer.classList.remove('hidden');
    updateFavoriteBtnStatus();
}

function updateFavoriteBtnStatus() {
    if (favorites.some(fav => fav.date === currentData.date)) {
        favoriteBtn.textContent = '★';
        favoriteBtn.classList.add('active');
    } else {
        favoriteBtn.textContent = '☆';
        favoriteBtn.classList.remove('active');
    }
}

function renderFavorites() {
    if (favorites.length === 0) {
        favoritesSection.classList.add('hidden');
        return;
    }
    favoritesSection.classList.remove('hidden');
    favoritesList.innerHTML = '';
    
    favorites.forEach(fav => {
        const div = document.createElement('div');
        div.className = 'favorite-item glass-panel';
        div.innerHTML = `
            <span><strong>${fav.date}</strong> ${fav.title}</span>
            <button class="fav-remove-btn" data-date="${fav.date}">&times;</button>
        `;
        div.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                datePicker.value = fav.date;
                fetchApod(fav.date);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        favoritesList.appendChild(div);
    });

    document.querySelectorAll('.fav-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dateToRemove = e.target.getAttribute('data-date');
            favorites = favorites.filter(fav => fav.date !== dateToRemove);
            localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
            renderFavorites();
            if (currentData) updateFavoriteBtnStatus();
        });
    });
}
renderFavorites();

function showLoading() {
    loadingUi.classList.remove('hidden');
    errorUi.classList.add('hidden');
    contentContainer.classList.add('hidden');
}

function hideLoading() {
    loadingUi.classList.add('hidden');
}

function showError() {
    hideLoading();
    errorUi.classList.remove('hidden');
    contentContainer.classList.add('hidden');
}

function openModal(src) {
    if (currentData && currentData.media_type === 'image') {
        modalImage.src = src;
        modal.classList.add('active');
    }
}

function closeImageModal() {
    modal.classList.remove('active');
    setTimeout(() => { modalImage.src = ''; }, 400);
}

datePicker.addEventListener('change', (e) => {
    if (e.target.value) {
        bdayPicker.value = '';
        fetchApod(e.target.value);
    }
});

bdayPicker.addEventListener('change', (e) => {
    if (e.target.value) {
        datePicker.value = '';
        fetchApod(e.target.value);
    }
});

hdToggle.addEventListener('change', (e) => {
    isHd = e.target.checked;
    if (currentData && currentData.media_type === 'image') {
        renderApod();
    }
});

closeModal.addEventListener('click', closeImageModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeImageModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeImageModal();
    }
});

favoriteBtn.addEventListener('click', () => {
    if (!currentData) return;
    const existingIndex = favorites.findIndex(fav => fav.date === currentData.date);
    if (existingIndex > -1) {
        favorites.splice(existingIndex, 1);
    } else {
        favorites.push({ date: currentData.date, title: currentData.title });
        // Optional: sort favorites by date descending
        favorites.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
    renderFavorites();
    updateFavoriteBtnStatus();
});

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

randomBtn.addEventListener('click', () => {
    const startDate = new Date('1995-06-16');
    const endDate = new Date();
    // Offset for local timezone representation if strictly needed,
    // but randomDate gives a uniform timestamp which we convert.
    const rd = randomDate(startDate, endDate);
    const dateStr = rd.toISOString().split('T')[0];
    datePicker.value = dateStr;
    fetchApod(dateStr);
});

prevBtn.addEventListener('click', () => {
    if (!currentData) return;
    const d = new Date(currentData.date);
    d.setUTCDate(d.getUTCDate() - 1);
    const dateStr = d.toISOString().split('T')[0];
    datePicker.value = dateStr;
    fetchApod(dateStr);
});

nextBtn.addEventListener('click', () => {
    if (!currentData) return;
    const d = new Date(currentData.date);
    d.setUTCDate(d.getUTCDate() + 1);
    const dateStr = d.toISOString().split('T')[0];
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr > todayStr) return; // Cannot fetch future APOD
    
    datePicker.value = dateStr;
    fetchApod(dateStr);
});

const today = new Date().toISOString().split('T')[0];
datePicker.max = today;
bdayPicker.max = today;

fetchApod();
