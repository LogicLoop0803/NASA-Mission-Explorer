document.addEventListener('DOMContentLoaded', () => {

    // Helper to extract breed from URL
    const getBreedFromUrl = (url) => {
        // Example URL: https://images.dog.ceo/breeds/terrier-american/n02093428_4209.jpg
        try {
            const parts = url.split('/breeds/')[1].split('/')[0];
            return parts.split('-').reverse().join(' ');
        } catch (e) {
            return "Unknown Breed";
        }
    };

    // Helper: Show Spinner on button
    const setButtonLoading = (btn, isLoading, originalText = '') => {
        if (isLoading) {
            btn.disabled = true;
            btn.innerHTML = `<span class="spinner"></span>`;
        } else {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    };

    // Helper: Show Toast Notification
    const showToast = (message) => {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    // --- 1. Dog Finder ---
    const btnGetDog = document.getElementById('btn-get-dog');
    const btnCopyDog = document.getElementById('btn-copy-dog');
    const dogImage = document.getElementById('dog-image');
    const dogPlaceholder = document.getElementById('dog-placeholder');
    const dogBreed = document.getElementById('dog-breed');
    let currentDogUrl = '';

    btnGetDog.addEventListener('click', async () => {
        setButtonLoading(btnGetDog, true);
        dogPlaceholder.classList.remove('hidden');
        dogPlaceholder.textContent = 'Fetching...';
        dogImage.classList.add('hidden');
        btnCopyDog.disabled = true;

        try {
            const res = await fetch('https://dog.ceo/api/breeds/image/random');
            if(!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            
            currentDogUrl = data.message;
            dogImage.src = currentDogUrl;
            dogBreed.textContent = getBreedFromUrl(currentDogUrl);
            
            dogImage.onload = () => {
                dogImage.classList.remove('hidden');
                dogPlaceholder.classList.add('hidden');
                btnCopyDog.disabled = false;
            };
        } catch (error) {
            dogPlaceholder.textContent = 'Error loading image.';
            dogBreed.textContent = 'Error';
            console.error(error);
        } finally {
            setButtonLoading(btnGetDog, false, 'Get Dog');
        }
    });

    btnCopyDog.addEventListener('click', async () => {
        if (!currentDogUrl) return;
        try {
            await navigator.clipboard.writeText(currentDogUrl);
            showToast('Image URL copied to clipboard!');
        } catch (err) {
            showToast('Failed to copy URL');
        }
    });

    // --- 2. Joke Generator ---
    const btnGetJoke = document.getElementById('btn-get-joke');
    const jokeSetup = document.getElementById('joke-setup');
    const jokePunchline = document.getElementById('joke-punchline');

    btnGetJoke.addEventListener('click', async () => {
        setButtonLoading(btnGetJoke, true);
        jokePunchline.classList.remove('show');
        jokeSetup.textContent = 'Fetching joke...';

        try {
            const res = await fetch('https://official-joke-api.appspot.com/random_joke');
            if(!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();

            jokeSetup.textContent = data.setup;
            jokePunchline.textContent = data.punchline;
            
            // Small delay before showing punchline for effect
            setTimeout(() => {
                jokePunchline.classList.add('show');
            }, 500);

        } catch (error) {
            jokeSetup.textContent = 'Failed to load joke.';
            jokePunchline.textContent = 'Please try again.';
            jokePunchline.classList.add('show');
            console.error(error);
        } finally {
            setButtonLoading(btnGetJoke, false, 'Next Joke');
        }
    });

    // --- 3. Random User Profile ---
    const btnGetUser = document.getElementById('btn-get-user');
    const userImage = document.getElementById('user-image');
    const userDetails = document.getElementById('user-details');

    btnGetUser.addEventListener('click', async () => {
        setButtonLoading(btnGetUser, true);
        userDetails.innerHTML = `<p class="placeholder-text"><span class="spinner"></span></p>`;

        try {
            const res = await fetch('https://randomuser.me/api/');
            if(!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            const user = data.results[0];

            userImage.src = user.picture.large;
            userImage.onload = () => userImage.classList.remove('hidden');

            userDetails.innerHTML = `
                <h3>${user.name.first} ${user.name.last}</h3>
                <div class="detail-item"><i class="fa-solid fa-envelope"></i> <p>${user.email}</p></div>
                <div class="detail-item"><i class="fa-solid fa-globe"></i> <p>${user.location.country}</p></div>
                <div class="detail-item"><i class="fa-solid fa-cake-candles"></i> <p>${user.dob.age} years old</p></div>
            `;
        } catch (error) {
            userDetails.innerHTML = `<p class="placeholder-text" style="color:#ef4444;">Error loading user profile.</p>`;
            console.error(error);
        } finally {
            setButtonLoading(btnGetUser, false, 'Get User');
        }
    });

    // --- 4. JSONPlaceholder Explorer ---
    const jsonButtons = document.querySelectorAll('.fn-btn');
    const jsonOutput = document.getElementById('json-output');

    jsonButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            // Update active state
            jsonButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const type = btn.dataset.type;
            const originalText = btn.textContent;
            setButtonLoading(btn, true);
            jsonOutput.textContent = 'Fetching data...';

            try {
                // Fetching only a limit of 3 items to keep UI clean
                const res = await fetch(`https://jsonplaceholder.typicode.com/${type}?_limit=3`);
                if(!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                
                jsonOutput.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                jsonOutput.textContent = 'Error loading JSON data.';
                console.error(error);
            } finally {
                setButtonLoading(btn, false, originalText);
            }
        });
    });

});
