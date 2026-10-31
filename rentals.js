function calculateRentalDetails(startDate, endDate, rentalPrice) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const rentalAmount = Number(rentalPrice) * days;
  const deposit = Number(rentalPrice) * 2;
  const total = rentalAmount + deposit;

  return {
    days,
    rentalAmount,
    deposit,
    total
  };
}

function getRentalsForCustomer(customerId) {
  return getData(STORAGE_KEYS.rentals, []).filter(rental => String(rental.customerId) === String(customerId));
}

function getRentalsForOwner(ownerId) {
  return getData(STORAGE_KEYS.rentals, []).filter(rental => String(rental.ownerId) === String(ownerId));
}

function renderRentalsPage() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const rentalList = document.getElementById('rentalList');
  if (!rentalList) return;

  let rentals = [];
  if (currentUser.role === 'customer') {
    rentals = getRentalsForCustomer(currentUser.id);
  } else if (currentUser.role === 'owner') {
    rentals = getRentalsForOwner(currentUser.id);
  } else if (currentUser.role === 'admin') {
    rentals = getData(STORAGE_KEYS.rentals, []);
  }

  if (!rentals.length) {
    rentalList.innerHTML = '<div class="empty-state">No rentals available.</div>';
    return;
  }

  rentalList.innerHTML = rentals.map(rental => {
    const product = getProductById(rental.productId);
    const customer = getUserById(rental.customerId);
    const statusClass = `status-${String(rental.status).toLowerCase()}`;
    const startDate = new Date(rental.startDate);
    const endDate = new Date(rental.endDate);
    const rentalDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    return `
      <tr>
        <td>
          <div class="detail-stack">
            <strong>${rental.id}</strong>
            <small>${rentalDays} day rental</small>
          </div>
        </td>
        <td>
          <div class="detail-stack">
            <strong>${customer ? customer.fullName : 'Customer'}</strong>
            <small>${customer ? customer.email : rental.customerId}</small>
          </div>
        </td>
        <td>
          <div class="detail-stack">
            <strong>${product ? product.name : 'Item'}</strong>
            <small>${product ? `${product.category} • ${product.brand} • ${product.size}` : rental.productId}</small>
          </div>
        </td>
        <td>${startDate.toLocaleDateString()}</td>
        <td>${endDate.toLocaleDateString()}</td>
        <td>
          <div class="detail-stack">
            <strong>${formatCurrency(rental.totalAmount)}</strong>
            <small>${formatCurrency(Number(rental.deposit || 0))} deposit</small>
          </div>
        </td>
        <td><span class="status-badge ${statusClass}">${rental.status}</span></td>
        ${currentUser.role !== 'customer' ? `
          <td>
            <select data-rental-status="${rental.id}">
              <option ${rental.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option ${rental.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option ${rental.status === 'Active' ? 'selected' : ''}>Active</option>
              <option ${rental.status === 'Returned' ? 'selected' : ''}>Returned</option>
              <option ${rental.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        ` : '<td>—</td>'}
      </tr>
    `;
  }).join('');

  document.querySelectorAll('[data-rental-status]').forEach(select => {
    select.addEventListener('change', function() {
      if (currentUser.role === 'owner' || currentUser.role === 'admin') {
        updateRentalStatus(this.dataset.rentalStatus, this.value);
      }
    });
  });
}

async function updateRentalStatus(rentalId, status) {
  const rental = getData(STORAGE_KEYS.rentals, []).find(item => String(item.id) === String(rentalId));
  if (String(rentalId).startsWith('DEMO_')) {
    if (rental) rental.status = status;
    saveData(STORAGE_KEYS.rentals, getData(STORAGE_KEYS.rentals, []));
    showToast('Rental status updated!', 'success');
    renderRentalsPage();
    return;
  }

  try { await apiRequest(`/rentals/${rentalId}`, { method: 'PATCH', body: JSON.stringify({ status }) }); }
  catch (error) { showToast(error.message, 'error'); return; }
  if (rental) rental.status = status;
  saveData(STORAGE_KEYS.rentals, getData(STORAGE_KEYS.rentals, []));
  showToast('Rental status updated!', 'success');
  renderRentalsPage();
}
