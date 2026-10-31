function renderAdminStats() {
  const customers = getData(STORAGE_KEYS.users, []).filter(user => user.role === 'customer');
  const owners = getData(STORAGE_KEYS.users, []).filter(user => user.role === 'owner');
  const products = getData(STORAGE_KEYS.products, []);
  const orders = getData(STORAGE_KEYS.orders, []);
  const rentals = getData(STORAGE_KEYS.rentals, []);
  const donations = getData(STORAGE_KEYS.donations, []);

  const totalCustomers = document.getElementById('totalCustomers');
  const totalOwners = document.getElementById('totalOwners');
  const totalProducts = document.getElementById('totalProducts');
  const totalOrders = document.getElementById('totalOrders');
  const totalRentals = document.getElementById('totalRentals');
  const totalDonations = document.getElementById('totalDonations');

  if (totalCustomers) totalCustomers.textContent = customers.length;
  if (totalOwners) totalOwners.textContent = owners.length;
  if (totalProducts) totalProducts.textContent = products.length;
  if (totalOrders) totalOrders.textContent = orders.length;
  if (totalRentals) totalRentals.textContent = rentals.length;
  if (totalDonations) totalDonations.textContent = donations.length;
}

function renderAdminUsers() {
  const container = document.getElementById('adminUsersTable');
  if (!container) return;

  const users = getData(STORAGE_KEYS.users, []).filter(user => user.role !== 'admin');
  if (!users.length) {
    container.innerHTML = '<div class="empty-state">No users available.</div>';
    return;
  }

  container.innerHTML = users.map(user => `
    <tr>
      <td>${user.fullName}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${user.phone}</td>
      <td>
        <button class="btn btn-danger btn-small" data-delete-user="${user.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('[data-delete-user]').forEach(button => {
    button.addEventListener('click', () => deleteUser(button.dataset.deleteUser));
  });
}

async function deleteUser(userId) {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('Unauthorized action.', 'error');
    return;
  }

  if (String(userId) === String(currentUser.id)) {
    showToast('Admin cannot delete their own account.', 'error');
    return;
  }

  try { await apiRequest(`/admin/users/${userId}`, { method: 'DELETE' }); }
  catch (error) { showToast(error.message, 'error'); return; }
  const updatedUsers = getData(STORAGE_KEYS.users, []).filter(user => String(user.id) !== String(userId));
  saveData(STORAGE_KEYS.users, updatedUsers);
  showToast('User deleted successfully.', 'success');
  renderAdminUsers();
}

function renderAdminDonations() {
  const container = document.getElementById('adminDonationsTable');
  if (!container) return;

  const donations = getData(STORAGE_KEYS.donations, []);
  if (!donations.length) {
    container.innerHTML = '<div class="empty-state">No donations available.</div>';
    return;
  }

  container.innerHTML = donations.map(donation => {
    const product = getProductById(donation.productId);
    const customer = getUserById(donation.customerId);
    const donationDate = new Date(donation.createdAt || Date.now());
    return `
      <tr>
        <td>
          <div class="detail-stack">
            <strong>${donation.id}</strong>
            <small>${donationDate.toLocaleDateString()}</small>
          </div>
        </td>
        <td>
          <div class="detail-stack">
            <strong>${donation.productName || product?.name || 'Donation'}</strong>
            <small>${product ? `${product.category} • ${product.brand} • ${product.size}` : 'Item details'}</small>
          </div>
        </td>
        <td>
          <div class="detail-stack">
            <strong>${customer ? customer.fullName : 'Customer'}</strong>
            <small>${customer ? customer.email : donation.customerId}</small>
          </div>
        </td>
        <td><span class="status-badge status-${donation.status.toLowerCase()}">${donation.status}</span></td>
        <td>
          <select data-donation-status="${donation.id}">
            <option ${donation.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option ${donation.status === 'Approved' ? 'selected' : ''}>Approved</option>
            <option ${donation.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option ${donation.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('[data-donation-status]').forEach(select => {
    select.addEventListener('change', function() {
      updateDonationStatus(this.dataset.donationStatus, this.value);
    });
  });
}

async function updateDonationStatus(donationId, status) {
  const donation = getData(STORAGE_KEYS.donations, []).find(item => String(item.id) === String(donationId));
  if (String(donationId).startsWith('DEMO_')) {
    if (donation) donation.status = status;
    saveData(STORAGE_KEYS.donations, getData(STORAGE_KEYS.donations, []));
    showToast('Donation status updated!', 'success');
    renderAdminDonations();
    return;
  }

  try { await apiRequest(`/donations/${donationId}`, { method: 'PATCH', body: JSON.stringify({ status }) }); }
  catch (error) { showToast(error.message, 'error'); return; }
  if (donation) donation.status = status;
  saveData(STORAGE_KEYS.donations, getData(STORAGE_KEYS.donations, []));
  showToast('Donation status updated!', 'success');
  renderAdminDonations();
}

function renderAdminClothesTable() {
  const container = document.getElementById('adminClothesTable');
  if (!container) return;

  const products = getData(STORAGE_KEYS.products, []);
  container.innerHTML = products.map(product => `
    <tr>
      <td><img src="${product.image}" alt="${product.name}" class="table-thumb" /></td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.status}</td>
      <td>${product.availability}</td>
      <td>
        <div class="inline-actions">
          <button class="btn btn-success btn-small" data-admin-approve="${product.id}">Approve</button>
          <button class="btn btn-warning btn-small" data-admin-reject="${product.id}">Reject</button>
          <button class="btn btn-danger btn-small" data-admin-delete="${product.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('[data-admin-approve]').forEach(button => {
    button.addEventListener('click', () => updateProductStatus(button.dataset.adminApprove, 'Approved'));
  });

  document.querySelectorAll('[data-admin-reject]').forEach(button => {
    button.addEventListener('click', () => updateProductStatus(button.dataset.adminReject, 'Rejected'));
  });

  document.querySelectorAll('[data-admin-delete]').forEach(button => {
    button.addEventListener('click', () => deleteProduct(button.dataset.adminDelete));
  });
}

async function deleteProduct(productId) {
  try { await apiRequest(`/clothes/${productId}`, { method: 'DELETE' }); }
  catch (error) { showToast(error.message, 'error'); return; }
  const updated = getData(STORAGE_KEYS.products, []).filter(product => String(product.id) !== String(productId));
  saveData(STORAGE_KEYS.products, updated);
  showToast('Product deleted successfully.', 'success');
  renderAdminClothesTable();
  renderShopPage();
}

function bindAdminActions() {
  const resetButton = document.getElementById('resetDemoData');
  if (resetButton) {
    resetButton.addEventListener('click', () => showToast('Demo reset is disabled for live database data.', 'error'));
  }
}
