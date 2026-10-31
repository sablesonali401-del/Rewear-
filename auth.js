function getCurrentUser() {
  if (!getAccessToken()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.currentUser);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to load current user', error);
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

async function logoutUser() {
  const hadServerSession = Boolean(getAccessToken());
  if (hadServerSession) {
    try { await apiRequest('/auth/logout', { method: 'POST' }); }
    catch (error) { console.warn('Unable to end the server session.', error); }
  }
  localStorage.removeItem('rewear_access_token');
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  window.location.href = 'login.html';
}

function redirectToRoleDashboard(role) {
  if (role === 'customer') {
    window.location.href = 'customer-dashboard.html';
    return;
  }

  if (role === 'owner') {
    window.location.href = 'owner-dashboard.html';
    return;
  }

  if (role === 'admin') {
    window.location.href = 'admin-dashboard.html';
    return;
  }

  window.location.href = 'login.html';
}

function requireAuth(requiredRoles = []) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    showToast('Please login first.', 'error');
    window.location.href = 'login.html';
    return null;
  }

  if (requiredRoles.length && !requiredRoles.includes(currentUser.role)) {
    showToast('You are not authorized to access this page.', 'error');
    redirectToRoleDashboard(currentUser.role);
    return null;
  }

  return currentUser;
}

async function registerUser(formData) {
  const email = (formData.email || '').trim().toLowerCase();
  const fullName = (formData.fullName || '').trim();
  const password = formData.password || '';
  const confirmPassword = formData.confirmPassword || '';
  const phone = (formData.phone || '').trim();
  const address = (formData.address || '').trim();
  const city = (formData.city || '').trim();
  const state = (formData.state || '').trim();
  const pincode = (formData.pincode || '').trim();
  const errors = {};

  if (!fullName) errors.fullName = 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email.';
  if (!/^\d{10}$/.test(phone)) errors.phone = 'Mobile number must contain 10 digits.';
  if (!password) errors.password = 'Please enter a password.';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  if (!address) errors.address = 'Please enter your address.';
  if (!city) errors.city = 'Please enter your city.';
  if (!state) errors.state = 'Please enter your state.';
  if (!/^\d{6}$/.test(pincode)) errors.pincode = 'Pincode must contain 6 digits.';

  if (Object.keys(errors).length) {
    return { success: false, message: 'Please correct the highlighted fields.', errors };
  }

  try {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, phone, address, city, state, pincode })
    });
    return { success: true, message: result.message };
  } catch (error) {
    return { success: false, message: error.message, errors: { email: error.message } };
  }
}

async function loginUser(email, password) {
  const normalizedEmail = String(email).trim().toLowerCase();
  try {
    const result = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email: normalizedEmail, password }) });
    localStorage.setItem('rewear_access_token', result.session.access_token);
    setCurrentUser(result.user);
    return { success: true, message: 'Login successful!', user: result.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function updateCurrentUserProfile(updatedFields) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: 'Please login first.' };
  }

  try {
    const result = await apiRequest('/profile', { method: 'PUT', body: JSON.stringify({ full_name: updatedFields.fullName, phone: updatedFields.phone, address: updatedFields.address, password: updatedFields.password || undefined }) });
    setCurrentUser(result.profile);
    return { success: true, message: 'Profile updated!', user: result.profile };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function bindAuthForms() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const result = await loginUser(email, password);

      if (!result.success) {
        showToast(result.message, 'error');
        return;
      }

      showToast(result.message, 'success');
      redirectToRoleDashboard(result.user.role);
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      registerForm.querySelectorAll('.field-error').forEach(error => {
        error.textContent = '';
      });
      const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        pincode: document.getElementById('pincode').value
      };

      const result = await registerUser(formData);

      if (!result.success) {
        Object.entries(result.errors || {}).forEach(([field, message]) => {
          const error = registerForm.querySelector(`[data-error-for="${field}"]`);
          if (error) error.textContent = message;
        });
        showToast(result.message, 'error');
        return;
      }

      showToast(result.message, 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 900);
    });
  }

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    const currentUser = getCurrentUser();
    if (currentUser) {
      document.getElementById('profileName').value = currentUser.fullName || '';
      document.getElementById('profileEmail').value = currentUser.email || '';
      document.getElementById('profilePhone').value = currentUser.phone || '';
      document.getElementById('profileAddress').value = currentUser.address || '';
    }

    profileForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      const updated = {
        fullName: document.getElementById('profileName').value,
        phone: document.getElementById('profilePhone').value,
        address: document.getElementById('profileAddress').value,
        password: document.getElementById('profilePassword').value
      };

      const result = await updateCurrentUserProfile(updated);
      if (!result.success) {
        showToast(result.message, 'error');
        return;
      }

      showToast(result.message, 'success');
      document.getElementById('profilePassword').value = '';
    });
  }
}
