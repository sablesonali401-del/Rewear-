function getOrdersForCustomer(customerId) {
  return getData(STORAGE_KEYS.orders, []).filter(order => String(order.customerId) === String(customerId));
}

function getOrdersForOwner(ownerId) {
  return getData(STORAGE_KEYS.orders, []).filter(order => String(order.ownerId) === String(ownerId));
}

function renderOrdersPage() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const orderList = document.getElementById('orderList');
  if (!orderList) return;

  let orders = [];
  if (currentUser.role === 'customer') {
    orders = getOrdersForCustomer(currentUser.id);
  } else if (currentUser.role === 'owner') {
    orders = getOrdersForOwner(currentUser.id);
  } else if (currentUser.role === 'admin') {
    orders = getData(STORAGE_KEYS.orders, []);
  }

  if (!orders.length) {
    orderList.innerHTML = '<div class="empty-state">No orders available.</div>';
    return;
  }

  orderList.innerHTML = orders.map(order => {
    const product = getProductById(order.productId);
    const customer = getUserById(order.customerId);
    const statusClass = `status-${String(order.status).toLowerCase()}`;
    const orderDate = new Date(order.createdAt);
    return `
      <tr>
        <td>
          <div class="detail-stack">
            <strong>${order.id}</strong>
            <small>${order.orderNumber || 'Order ref'}</small>
          </div>
        </td>
        <td>
          <div class="detail-stack">
            <strong>${customer ? customer.fullName : 'Customer'}</strong>
            <small>${customer ? customer.email : order.customerId}</small>
          </div>
        </td>
        <td>
          <div class="detail-stack">
            <strong>${product ? product.name : 'Item'}</strong>
            <small>${product ? `${product.category} • ${product.brand} • ${product.size}` : order.productId}</small>
          </div>
        </td>
        <td>
          <div class="detail-stack">
            <strong>${formatCurrency(order.amount)}</strong>
            <small>${order.paymentMethod || 'Cash on delivery'}</small>
          </div>
        </td>
        <td>
          <div class="detail-stack">
            <strong>${orderDate.toLocaleDateString()}</strong>
            <small>${orderDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small>
          </div>
        </td>
        <td><span class="status-badge ${statusClass}">${order.status}</span></td>
        ${currentUser.role !== 'customer' ? `
          <td>
            <select data-order-status="${order.id}">
              <option ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        ` : '<td>—</td>'}
      </tr>
    `;
  }).join('');

  document.querySelectorAll('[data-order-status]').forEach(select => {
    select.addEventListener('change', function() {
      if (currentUser.role === 'owner' || currentUser.role === 'admin') {
        updateOrderStatus(this.dataset.orderStatus, this.value);
      }
    });
  });
}

async function updateOrderStatus(orderId, status) {
  const order = getData(STORAGE_KEYS.orders, []).find(item => String(item.id) === String(orderId));
  if (String(orderId).startsWith('DEMO_')) {
    if (order) order.status = status;
    saveData(STORAGE_KEYS.orders, getData(STORAGE_KEYS.orders, []));
    showToast('Order status updated!', 'success');
    renderOrdersPage();
    return;
  }

  try { await apiRequest(`/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify({ status }) }); }
  catch (error) { showToast(error.message, 'error'); return; }
  if (order) order.status = status;
  saveData(STORAGE_KEYS.orders, getData(STORAGE_KEYS.orders, []));
  showToast('Order status updated!', 'success');
  renderOrdersPage();
}

function getUserById(userId) {
  return getData(STORAGE_KEYS.users, []).find(user => String(user.id) === String(userId)) || null;
}
