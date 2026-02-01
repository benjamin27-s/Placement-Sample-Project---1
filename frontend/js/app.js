// Main Application Logic

// Show alert message
const showAlert = (message, type = 'error', containerId = 'alert-container') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
    <div class="alert alert-${type}">
      ${message}
    </div>
  `;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
};

// Format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Generate star rating HTML
const generateStars = (rating) => {
    if (!rating) return '<span class="text-muted">No rating</span>';

    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '★' : '☆';
    }
    return `<span class="stars">${stars}</span>`;
};

// Generate status badge HTML
const generateStatusBadge = (status) => {
    const statusClass = status.toLowerCase();
    const icons = {
        pending: '⏳',
        approved: '✅',
        rejected: '❌'
    };
    return `<span class="status-badge ${statusClass}">${icons[statusClass] || ''} ${status}</span>`;
};

// ==========================================
// LOGIN PAGE
// ==========================================
const initLoginPage = () => {
    const form = document.getElementById('login-form');
    if (!form) return;

    // Redirect if already logged in
    if (Auth.redirectIfAuthenticated()) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = form.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Logging in...';

            const response = await API.auth.login({ email, password });

            // Save auth data
            API.saveAuth(response.data.token, response.data.user);

            showAlert('Login successful! Redirecting...', 'success');

            // Redirect based on role
            setTimeout(() => {
                if (response.data.user.role === 'MODERATOR') {
                    window.location.href = '/moderator-dashboard.html';
                } else {
                    window.location.href = '/user-dashboard.html';
                }
            }, 1000);

        } catch (error) {
            showAlert(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Login';
        }
    });
};

// ==========================================
// REGISTER PAGE
// ==========================================
const initRegisterPage = () => {
    const form = document.getElementById('register-form');
    if (!form) return;

    // Redirect if already logged in
    if (Auth.redirectIfAuthenticated()) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const role = document.getElementById('role').value;
        const submitBtn = form.querySelector('button[type="submit"]');

        // Validate passwords match
        if (password !== confirmPassword) {
            showAlert('Passwords do not match');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Creating account...';

            const response = await API.auth.register({ username, email, password, role });

            // Save auth data
            API.saveAuth(response.data.token, response.data.user);

            showAlert('Registration successful! Redirecting...', 'success');

            // Redirect based on role
            setTimeout(() => {
                if (response.data.user.role === 'MODERATOR') {
                    window.location.href = '/moderator-dashboard.html';
                } else {
                    window.location.href = '/user-dashboard.html';
                }
            }, 1000);

        } catch (error) {
            showAlert(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Create Account';
        }
    });
};

// ==========================================
// USER DASHBOARD
// ==========================================
const initUserDashboard = () => {
    if (!Auth.requireAuth(['USER'])) return;

    Auth.updateNavbar();

    const form = document.getElementById('review-form');
    const reviewsList = document.getElementById('reviews-list');

    // Load user's reviews
    const loadMyReviews = async () => {
        try {
            reviewsList.innerHTML = '<div class="text-center"><span class="spinner"></span> Loading reviews...</div>';

            const response = await API.reviews.getMyReviews();
            const reviews = response.data.reviews;

            // Update stats
            document.getElementById('total-reviews').textContent = reviews.length;
            document.getElementById('pending-reviews').textContent = reviews.filter(r => r.status === 'PENDING').length;
            document.getElementById('approved-reviews').textContent = reviews.filter(r => r.status === 'APPROVED').length;

            if (reviews.length === 0) {
                reviewsList.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📝</div>
            <p>You haven't submitted any reviews yet.</p>
            <p class="text-muted">Submit your first review using the form above!</p>
          </div>
        `;
                return;
            }

            reviewsList.innerHTML = reviews.map(review => `
        <div class="review-card">
          <div class="review-header">
            <div>
              <div class="review-item-name">${escapeHtml(review.itemName)}</div>
              <div class="review-item-id">ID: ${escapeHtml(review.itemId)}</div>
            </div>
            ${generateStatusBadge(review.status)}
          </div>
          <div class="review-content">${escapeHtml(review.reviewText)}</div>
          <div class="review-meta">
            <div>${generateStars(review.rating)}</div>
            <div>${formatDate(review.createdAt)}</div>
          </div>
        </div>
      `).join('');

        } catch (error) {
            reviewsList.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
        }
    };

    // Handle review submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const itemId = document.getElementById('item-id').value.trim();
            const itemName = document.getElementById('item-name').value.trim();
            const reviewText = document.getElementById('review-text').value.trim();
            const ratingInput = document.querySelector('input[name="rating"]:checked');
            const rating = ratingInput ? parseInt(ratingInput.value) : null;
            const submitBtn = form.querySelector('button[type="submit"]');

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';

                await API.reviews.submit({ itemId, itemName, reviewText, rating });

                showAlert('Review submitted successfully! It will be reviewed by a moderator.', 'success');
                form.reset();
                loadMyReviews();

            } catch (error) {
                showAlert(error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '📤 Submit Review';
            }
        });
    }

    // Initial load
    loadMyReviews();
};

// ==========================================
// MODERATOR DASHBOARD
// ==========================================
const initModeratorDashboard = () => {
    if (!Auth.requireAuth(['MODERATOR'])) return;

    Auth.updateNavbar();

    const reviewsList = document.getElementById('reviews-list');
    const filterTabs = document.querySelectorAll('.filter-tab');
    let currentFilter = '';

    // Load all reviews
    const loadAllReviews = async (status = '') => {
        try {
            reviewsList.innerHTML = '<div class="text-center"><span class="spinner"></span> Loading reviews...</div>';

            const response = await API.reviews.getAllReviews(status);
            const reviews = response.data.reviews;

            // Update stats
            const allReviews = await API.reviews.getAllReviews();
            const all = allReviews.data.reviews;
            document.getElementById('total-reviews').textContent = all.length;
            document.getElementById('pending-count').textContent = all.filter(r => r.status === 'PENDING').length;
            document.getElementById('approved-count').textContent = all.filter(r => r.status === 'APPROVED').length;
            document.getElementById('rejected-count').textContent = all.filter(r => r.status === 'REJECTED').length;

            if (reviews.length === 0) {
                reviewsList.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <p>No reviews found${status ? ` with status "${status}"` : ''}.</p>
          </div>
        `;
                return;
            }

            reviewsList.innerHTML = reviews.map(review => `
        <div class="review-card" id="review-${review._id}">
          <div class="review-header">
            <div>
              <div class="review-item-name">${escapeHtml(review.itemName)}</div>
              <div class="review-item-id">ID: ${escapeHtml(review.itemId)}</div>
            </div>
            ${generateStatusBadge(review.status)}
          </div>
          <div class="review-content">${escapeHtml(review.reviewText)}</div>
          <div class="review-meta">
            <div>
              <strong>By:</strong> ${escapeHtml(review.userId?.username || 'Unknown')} • 
              ${generateStars(review.rating)} • 
              ${formatDate(review.createdAt)}
            </div>
            <div class="review-actions">
              ${review.status !== 'APPROVED' ? `
                <button class="btn btn-success btn-sm" onclick="approveReview('${review._id}')">
                  ✅ Approve
                </button>
              ` : ''}
              ${review.status !== 'REJECTED' ? `
                <button class="btn btn-danger btn-sm" onclick="rejectReview('${review._id}')">
                  ❌ Reject
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `).join('');

        } catch (error) {
            reviewsList.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
        }
    };

    // Approve review
    window.approveReview = async (reviewId) => {
        try {
            await API.reviews.approve(reviewId);
            showAlert('Review approved!', 'success');
            loadAllReviews(currentFilter);
        } catch (error) {
            showAlert(error.message);
        }
    };

    // Reject review
    window.rejectReview = async (reviewId) => {
        try {
            await API.reviews.reject(reviewId);
            showAlert('Review rejected.', 'warning');
            loadAllReviews(currentFilter);
        } catch (error) {
            showAlert(error.message);
        }
    };

    // Filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.status || '';
            loadAllReviews(currentFilter);
        });
    });

    // Initial load
    loadAllReviews();
};

// Escape HTML to prevent XSS
const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('login.html')) {
        initLoginPage();
    } else if (path.includes('register.html')) {
        initRegisterPage();
    } else if (path.includes('user-dashboard.html')) {
        initUserDashboard();
    } else if (path.includes('moderator-dashboard.html')) {
        initModeratorDashboard();
    } else {
        // Home page
        Auth.updateNavbar();
    }
});
