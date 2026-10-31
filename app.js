document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadRemoteData();
  } catch (error) {
    showToast(error.message, 'error');
  }
  bindAuthForms();
  bindProductUploadForm();
  bindAdminActions();
  setupNavbar();
  setupGlobalEvents();
  renderFeaturedProducts();
  renderShopPage();
  renderCartUI();
  renderProductDetailPage();
  renderCustomerProductsTable();
  renderCustomerRentalRequests();
  renderDashboardStats();
  renderCustomerFavoritesAndCart();
  renderOwnerAvailableClothes();
  renderOwnerProductReviews();
  renderOwnerInventory();
  renderOrdersPage();
  renderRentalsPage();
  renderAdminStats();
  renderAdminUsers();
  renderAdminDonations();
  renderAdminClothesTable();
  renderProfilePage();
  renderDonationPage();
  renderOwnerDonations();
  renderDashboardCards();
  setDashboardUserName();
  updateRoleBasedUI();
  setupStatusFilters();
  setupSearchAndFilters();
  setupRemoteDashboardRefresh();
});

function setupRemoteDashboardRefresh() {
  if (!document.body.hasAttribute('data-refresh-remote')) return;

  let refreshing = false;
  let refreshErrorShown = false;
  const refresh = async () => {
    if (refreshing || document.hidden || !getAccessToken()) return;
    refreshing = true;
    try {
      await loadRemoteData();
      refreshErrorShown = false;
      renderCustomerProductsTable();
      renderCustomerRentalRequests();
      renderRentalsPage();
      renderDonationPage();
      renderDashboardStats();
    } catch (error) {
      console.error('Unable to refresh customer dashboard data.', error);
      if (!refreshErrorShown) showToast('Could not refresh the latest statuses. Check your connection.', 'error');
      refreshErrorShown = true;
    } finally {
      refreshing = false;
    }
  };

  window.setInterval(refresh, 15000);
  window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh();
  });
}

function setupNavbar() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
  }

  const currentUser = getCurrentUser();
  const navLinks = document.querySelectorAll('[data-auth-link]');
  navLinks.forEach(link => {
    const role = link.dataset.authLink;
    if (currentUser && role === currentUser.role) {
      link.style.display = 'inline-flex';
    } else if (currentUser && role === 'logout') {
      link.style.display = 'inline-flex';
    } else if (!currentUser && role === 'login') {
      link.style.display = 'inline-flex';
    } else {
      link.style.display = 'none';
    }
  });
}

function setupGlobalEvents() {
  document.body.addEventListener('click', function(event) {
    const closeTarget = event.target.closest('[data-close-modal]');
    if (closeTarget) {
      const modalId = closeTarget.dataset.closeModal;
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.remove();
      }
    }

    const logoutBtn = event.target.closest('[data-logout]');
    if (logoutBtn) {
      event.preventDefault();
      logoutUser();
    }
  });
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

function updateRoleBasedUI() {
  const currentUser = getCurrentUser();
  const roleOnlyElements = document.querySelectorAll('[data-role-only]');
  roleOnlyElements.forEach(element => {
    const allowed = (element.dataset.roleOnly || '').split(',');
    element.style.display = currentUser && allowed.includes(currentUser.role) ? 'block' : 'none';
  });

  const pageRole = document.body.dataset.pageRole;
  if (!pageRole) return;

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  if (pageRole === 'customer' && currentUser.role !== 'customer') {
    redirectToRoleDashboard(currentUser.role);
  }

  if (pageRole === 'owner' && currentUser.role !== 'owner') {
    redirectToRoleDashboard(currentUser.role);
  }

  if (pageRole === 'admin' && currentUser.role !== 'admin') {
    redirectToRoleDashboard(currentUser.role);
  }
}

function setDashboardUserName() {
  const userName = document.getElementById('dashboardUserName');
  const currentUser = getCurrentUser();
  if (userName && currentUser) {
    userName.textContent = `Welcome, ${currentUser.fullName}`;
  }
}

function setupSearchAndFilters() {
  const shopSearch = document.getElementById('shopSearch');
  if (shopSearch) {
    shopSearch.addEventListener('input', renderShopPage);
  }

  const categoryFilter = document.getElementById('categoryFilter');
  const sizeFilter = document.getElementById('sizeFilter');
  const conditionFilter = document.getElementById('conditionFilter');
  const priceFilter = document.getElementById('priceFilter');

  [categoryFilter, sizeFilter, conditionFilter, priceFilter].forEach(element => {
    if (element) {
      element.addEventListener('change', renderShopPage);
    }
  });
}

function setupStatusFilters() {
  const statusSelect = document.getElementById('statusFilter');
  if (statusSelect) {
    statusSelect.addEventListener('change', renderAdminClothesTable);
  }
}

function renderProfilePage() {
  const profileForm = document.getElementById('profileForm');
  if (!profileForm) return;

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profilePhone = document.getElementById('profilePhone');
  const profileAddress = document.getElementById('profileAddress');

  if (profileName) profileName.value = currentUser.fullName || '';
  if (profileEmail) profileEmail.value = currentUser.email || '';
  if (profilePhone) profilePhone.value = currentUser.phone || '';
  if (profileAddress) profileAddress.value = currentUser.address || '';
}

function renderDonationPage() {
  const donationTable = document.getElementById('donationTable');
  if (!donationTable) return;

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const donations = getData(STORAGE_KEYS.donations, []).filter(item => String(item.customerId) === String(currentUser.id));

  if (!donations.length) {
    donationTable.innerHTML = '<div class="empty-state">No donations yet.</div>';
    return;
  }

  donationTable.innerHTML = donations.map(item => {
    const product = getProductById(item.productId);
    return `
      <tr>
        <td>
          <div class="detail-stack">
            <strong>${item.id}</strong>
            <small>${new Date(item.createdAt).toLocaleDateString()}</small>
          </div>
        </td>
        <td>
          <div class="detail-stack">
            <strong>${item.productName || product?.name || 'Donation'}</strong>
            <small>${product ? `${product.category} • ${product.brand} • ${product.size}` : 'Item details'}</small>
          </div>
        </td>
        <td>${new Date(item.createdAt).toLocaleDateString()}</td>
        <td><span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span></td>
      </tr>
    `;
  }).join('');
}

function renderOwnerDonations() {
  const donationTable = document.getElementById('ownerDonationList');
  const currentUser = getCurrentUser();
  if (!donationTable || currentUser?.role !== 'owner') return;

  const donations = getData(STORAGE_KEYS.donations, []).filter(item => String(item.ownerId) === String(currentUser.id));
  if (!donations.length) {
    donationTable.innerHTML = '<tr><td colspan="5"><div class="empty-state">No donations available.</div></td></tr>';
    return;
  }

  donationTable.innerHTML = donations.map(item => {
    const product = getProductById(item.productId);
    return `
      <tr>
        <td>
          <div class="detail-stack">
            <strong>${item.id}</strong>
            <small>${new Date(item.createdAt).toLocaleDateString()}</small>
          </div>
        </td>
        <td>
          <div class="detail-stack">
            <strong>${item.productName || product?.name || 'Donation'}</strong>
            <small>${product ? `${product.category} • ${product.brand} • ${product.size}` : 'Item details'}</small>
          </div>
        </td>
        <td>${new Date(item.createdAt).toLocaleDateString()}</td>
        <td><span class="status-badge status-${String(item.status).toLowerCase()}">${item.status}</span></td>
        <td>—</td>
      </tr>
    `;
  }).join('');
}

function renderDashboardCards() {
  const customerDashboard = document.getElementById('customerStats');
  if (customerDashboard) {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const uploaded = getUserProducts(currentUser.id).length;
      const orders = getOrdersForCustomer(currentUser.id).length;
      const rentals = getRentalsForCustomer(currentUser.id).length;
      const donations = getData(STORAGE_KEYS.donations, []).filter(item => String(item.customerId) === String(currentUser.id)).length;
      customerDashboard.innerHTML = `
        <div class="stat-card"><span>Uploaded Clothes</span><strong>${uploaded}</strong></div>
        <div class="stat-card"><span>Orders</span><strong>${orders}</strong></div>
        <div class="stat-card"><span>Rentals</span><strong>${rentals}</strong></div>
        <div class="stat-card"><span>Donations</span><strong>${donations}</strong></div>
      `;
    }
  }

  const ownerDashboard = document.getElementById('ownerStats');
  if (ownerDashboard) {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const inventory = getData(STORAGE_KEYS.products, []).filter(item => String(item.ownerId) === String(currentUser.id)).length;
      const available = getData(STORAGE_KEYS.products, []).filter(item => String(item.ownerId) === String(currentUser.id) && item.availability === 'Available').length;
      const sales = getData(STORAGE_KEYS.orders, []).filter(item => String(item.ownerId) === String(currentUser.id)).length;
      const rentals = getData(STORAGE_KEYS.rentals, []).filter(item => String(item.ownerId) === String(currentUser.id)).length;
      ownerDashboard.innerHTML = `
        <div class="stat-card"><span>Inventory</span><strong>${inventory}</strong></div>
        <div class="stat-card"><span>Available Products</span><strong>${available}</strong></div>
        <div class="stat-card"><span>Sales</span><strong>${sales}</strong></div>
        <div class="stat-card"><span>Orders</span><strong>${sales}</strong></div>
        <div class="stat-card"><span>Rentals</span><strong>${rentals}</strong></div>
      `;
    }
  }
}

function updateProfile() {
  const form = document.getElementById('profileForm');
  if (!form) return;

  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please login first.', 'error');
    return;
  }

  const name = document.getElementById('profileName').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();
  const address = document.getElementById('profileAddress').value.trim();
  const password = document.getElementById('profilePassword').value.trim();

  const result = updateCurrentUserProfile({ fullName: name, phone, address, password });
  if (!result.success) {
    showToast(result.message, 'error');
    return;
  }

  showToast(result.message, 'success');
  document.getElementById('profilePassword').value = '';
}
