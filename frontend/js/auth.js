// Authentication State Management

// Check if user is authenticated
const isAuthenticated = () => {
    return !!API.getToken() && !!API.getUser();
};

// Check user role
const getUserRole = () => {
    const user = API.getUser();
    return user ? user.role : null;
};

// Protect route - redirect if not authenticated
const requireAuth = (allowedRoles = []) => {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }

    if (allowedRoles.length > 0) {
        const role = getUserRole();
        if (!allowedRoles.includes(role)) {
            // Redirect based on role
            if (role === 'MODERATOR') {
                window.location.href = '/moderator-dashboard.html';
            } else {
                window.location.href = '/user-dashboard.html';
            }
            return false;
        }
    }

    return true;
};

// Redirect authenticated users away from auth pages
const redirectIfAuthenticated = () => {
    if (isAuthenticated()) {
        const role = getUserRole();
        if (role === 'MODERATOR') {
            window.location.href = '/moderator-dashboard.html';
        } else {
            window.location.href = '/user-dashboard.html';
        }
        return true;
    }
    return false;
};

// Logout
const logout = () => {
    API.clearAuth();
    window.location.href = '/login.html';
};

// Update navbar based on auth state
const updateNavbar = () => {
    const navLinks = document.getElementById('nav-links');
    const userInfo = document.getElementById('user-info');

    if (!navLinks) return;

    if (isAuthenticated()) {
        const user = API.getUser();

        navLinks.innerHTML = `
      <a href="${user.role === 'MODERATOR' ? '/moderator-dashboard.html' : '/user-dashboard.html'}">Dashboard</a>
    `;

        if (userInfo) {
            userInfo.innerHTML = `
        <div class="user-badge">
          <span>👤 ${user.username}</span>
          <span class="role-badge ${user.role.toLowerCase()}">${user.role}</span>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="logout()">Logout</button>
      `;
        }
    } else {
        navLinks.innerHTML = `
      <a href="/login.html">Login</a>
      <a href="/register.html">Register</a>
    `;

        if (userInfo) {
            userInfo.innerHTML = '';
        }
    }
};

// Export auth functions
window.Auth = {
    isAuthenticated,
    getUserRole,
    requireAuth,
    redirectIfAuthenticated,
    logout,
    updateNavbar
};

// Make logout globally available
window.logout = logout;
