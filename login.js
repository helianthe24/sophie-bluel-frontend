// login.js

const API_BASE = 'http://localhost:5678';

document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('login-form');
            const errorMsg = document.getElementById('error-message');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                errorMsg.textContent = '';

                const email = form.email.value.trim();
                const password = form.password.value;

                try {
                    // 2. On utilise maintenant API_BASE pour construire l’URL
                    const response = await fetch(`${API_BASE}/api/users/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email,
                            password
                        })
                    });

                    // pour debug, affiche le status dans la console :
                    console.log('HTTP status:', response.status);

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || 'Identifiants invalides');
                    }

                    localStorage.setItem('authToken', data.token);
                    window.location.href = 'index.html';
                } catch (err) {
                    console.error('Login error:', err);
                    errorMsg.textContent = err.message || 'Erreur réseau';
                }
            });
});