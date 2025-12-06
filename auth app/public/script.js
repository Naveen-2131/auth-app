const API_BASE_URL = 'http://localhost:5000';
let authToken = localStorage.getItem('authToken') || '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkServerStatus();
    if (authToken) {
        displayToken(authToken);
    }
});

// Check server status
async function checkServerStatus() {
    const statusBadge = document.getElementById('serverStatus');
    try {
        const response = await fetch(API_BASE_URL);
        if (response.ok) {
            statusBadge.className = 'status-badge online';
            statusBadge.innerHTML = '<span class="status-dot"></span><span>Server Online</span>';
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        statusBadge.className = 'status-badge offline';
        statusBadge.innerHTML = '<span class="status-dot"></span><span>Server Offline</span>';
    }
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Clear response when switching tabs
    clearResponse();
}

// Display token
function displayToken(token) {
    authToken = token;
    localStorage.setItem('authToken', token);
    const tokenDisplay = document.getElementById('tokenDisplay');
    const tokenValue = document.getElementById('tokenValue');
    tokenDisplay.style.display = 'block';
    tokenValue.textContent = token;
}

// Clear token
function clearToken() {
    authToken = '';
    localStorage.removeItem('authToken');
    document.getElementById('tokenDisplay').style.display = 'none';
    showNotification('Token cleared', 'success');
}

// Display response
function displayResponse(status, data, isSuccess) {
    const container = document.getElementById('responseContainer');
    const statusEl = document.getElementById('responseStatus');
    const bodyEl = document.getElementById('responseBody');

    container.style.display = 'block';
    statusEl.className = `response-status ${isSuccess ? 'success' : 'error'}`;
    statusEl.textContent = `Status: ${status}`;
    bodyEl.textContent = JSON.stringify(data, null, 2);

    // Scroll to response
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Clear response
function clearResponse() {
    document.getElementById('responseContainer').style.display = 'none';
}

// Show loading state
function setLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');

    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        button.disabled = true;
    } else {
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Handle Register
async function handleRegister(event) {
    event.preventDefault();
    const button = event.target.querySelector('button[type="submit"]');

    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    setLoading(button, true);

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            displayResponse(response.status, data, true);
            if (data.data && data.data.token) {
                displayToken(data.data.token);
            }
            showNotification('Registration successful!', 'success');
            event.target.reset();
        } else {
            displayResponse(response.status, data, false);
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        displayResponse('Error', { error: error.message }, false);
        showNotification('Network error. Is the server running?', 'error');
    } finally {
        setLoading(button, false);
    }
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    const button = event.target.querySelector('button[type="submit"]');

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    setLoading(button, true);

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            displayResponse(response.status, data, true);
            if (data.data && data.data.token) {
                displayToken(data.data.token);
            }
            showNotification('Login successful!', 'success');
            event.target.reset();
        } else {
            displayResponse(response.status, data, false);
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        displayResponse('Error', { error: error.message }, false);
        showNotification('Network error. Is the server running?', 'error');
    } finally {
        setLoading(button, false);
    }
}

// Handle Get Profile
async function handleGetProfile() {
    const button = event.target;

    if (!authToken) {
        showNotification('Please login first to get a token', 'error');
        return;
    }

    setLoading(button, true);

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            displayResponse(response.status, data, true);
            showNotification('Profile retrieved successfully!', 'success');
        } else {
            displayResponse(response.status, data, false);
            showNotification(data.message || 'Failed to get profile', 'error');
            if (response.status === 401) {
                clearToken();
            }
        }
    } catch (error) {
        displayResponse('Error', { error: error.message }, false);
        showNotification('Network error. Is the server running?', 'error');
    } finally {
        setLoading(button, false);
    }
}

// Handle Update Profile
async function handleUpdateProfile(event) {
    event.preventDefault();
    const button = event.target.querySelector('button[type="submit"]');

    if (!authToken) {
        showNotification('Please login first to get a token', 'error');
        return;
    }

    const username = document.getElementById('update-username').value;
    const email = document.getElementById('update-email').value;

    if (!username && !email) {
        showNotification('Please provide at least one field to update', 'error');
        return;
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    setLoading(button, true);

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(updateData),
        });

        const data = await response.json();

        if (response.ok) {
            displayResponse(response.status, data, true);
            showNotification('Profile updated successfully!', 'success');
            event.target.reset();
        } else {
            displayResponse(response.status, data, false);
            showNotification(data.message || 'Failed to update profile', 'error');
            if (response.status === 401) {
                clearToken();
            }
        }
    } catch (error) {
        displayResponse('Error', { error: error.message }, false);
        showNotification('Network error. Is the server running?', 'error');
    } finally {
        setLoading(button, false);
    }
}

// Show API Docs
function showApiDocs() {
    const docs = `
API Endpoints:

1. POST /api/auth/register
   - Register a new user
   - Body: { username, email, password }

2. POST /api/auth/login
   - Login user
   - Body: { email, password }

3. GET /api/users/profile
   - Get user profile (Protected)
   - Headers: { Authorization: "Bearer <token>" }

4. PUT /api/users/profile
   - Update user profile (Protected)
   - Headers: { Authorization: "Bearer <token>" }
   - Body: { username?, email? }
    `;
    alert(docs);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
