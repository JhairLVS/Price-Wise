function showRegisterForm() {
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

function showLoginForm() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

async function register() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            alert('User registered successfully');
            showLoginForm();
        } else {
            console.error('Failed to register user');
        }
    } catch (error) {
        console.error('Error registering user:', error);
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/usuarios');
        const users = await response.json();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            alert('Login successful');
            showMainApp();
        } else {
            alert('Invalid email or password');
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
}

async function searchProducts(event) {
    event.preventDefault();
    const query = document.getElementById('query').value;

    try {
        const response = await fetch(`/scrape?q=${encodeURIComponent(query)}`);
        const results = await response.json();

        displayResults(results);
    } catch (error) {
        console.error('Error searching products:', error);
    }
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.classList.add('result-item');
        resultElement.innerHTML = `
            <img src="${result.image}" alt="${result.title}">
            <h3>${result.title}</h3>
            <p>${result.price}</p>
            <a href="${result.link}" target="_blank">Ver en ${result.store}</a>
        `;
        resultsContainer.appendChild(resultElement);
    });
}

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    register();
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    login();
});

document.getElementById('search-form').addEventListener('submit', searchProducts);
