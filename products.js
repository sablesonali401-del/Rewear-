function createPlaceholderImage(label, color1, color2) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${color1}"/>
          <stop offset="100%" stop-color="${color2}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="#f6f1ea"/>
      <rect x="60" y="60" width="680" height="880" rx="34" fill="url(#g)" opacity="0.9"/>
      <circle cx="400" cy="380" r="150" fill="rgba(255,255,255,0.18)"/>
      <text x="400" y="560" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="54" font-weight="700">${label}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function seedSampleProducts() {
  const products = getData(STORAGE_KEYS.products, []);
  const currentUser = getCurrentUser();
  const demoProducts = [
    {
      id: 'DEMO_FLORAL_DRESS', customerId: currentUser?.id || 'DEMO_CUSTOMER', ownerId: null,
      name: 'Floral Dress', category: 'Dresses', size: 'S', brand: 'Bloom & Co', condition: 'Very Good',
      description: 'A light floral midi dress for sunny afternoons and easy layering.', sellingPrice: 2200, rentalPrice: 300,
      type: 'Sell', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85',
      rating: 4.8, ratingCount: 126,
      status: 'Approved', availability: 'Available', createdAt: new Date().toISOString(), ownerName: 'ReWear Sample'
    },
    {
      id: 'DEMO_OCCASION_DRESS', customerId: currentUser?.id || 'DEMO_CUSTOMER', ownerId: null,
      name: 'Occasion Dress', category: 'Dresses', size: 'M', brand: 'Studio Edit', condition: 'Excellent',
      description: 'A polished occasion dress available to rent for events and celebrations.', sellingPrice: 3400, rentalPrice: 350,
      type: 'Rent', image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=85',
      rating: 4.6, ratingCount: 84,
      status: 'Approved', availability: 'Available', createdAt: new Date().toISOString(), ownerName: 'ReWear Sample'
    },
    {
      id: 'DEMO_SUMMER_DRESS', customerId: currentUser?.id || 'DEMO_CUSTOMER', ownerId: null,
      name: 'Summer Dress', category: 'Dresses', size: 'M', brand: 'Sea Breeze', condition: 'Good',
      description: 'A breathable wrap dress ready for a new wardrobe or a fresh start through donation.', sellingPrice: 2100, rentalPrice: 280,
      type: 'Donate', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85',
      rating: 4.7, ratingCount: 59,
      status: 'Approved', availability: 'Available', createdAt: new Date().toISOString(), ownerName: 'ReWear Sample'
    },
    {
      id: 'DEMO_LINEN_SHIRT', customerId: currentUser?.id || 'DEMO_CUSTOMER', ownerId: null,
      name: 'Relaxed Linen Shirt', category: 'Shirts', size: 'L', brand: 'Everyday Edit', condition: 'Excellent',
      description: 'A breathable neutral linen shirt in excellent pre-loved condition.', sellingPrice: 1250, rentalPrice: 180,
      type: 'Sell', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85',
      rating: 4.5, ratingCount: 42,
      status: 'Approved', availability: 'Available', createdAt: new Date().toISOString(), ownerName: 'ReWear Sample'
    },
    {
      id: 'DEMO_DENIM_JACKET', customerId: currentUser?.id || 'DEMO_CUSTOMER', ownerId: null,
      name: 'Denim Jacket', category: 'Jackets', size: 'M', brand: 'Urban Revival', condition: 'Very Good',
      description: 'A versatile denim layer with a timeless fit and plenty of wear left.', sellingPrice: 1850, rentalPrice: 250,
      type: 'Sell', image: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=85',
      rating: 4.9, ratingCount: 203,
      status: 'Approved', availability: 'Available', createdAt: new Date().toISOString(), ownerName: 'ReWear Sample'
    },
    {
      id: 'DEMO_COTTON_KURTA', customerId: currentUser?.id || 'DEMO_CUSTOMER', ownerId: null,
      name: 'Traditional Kurta', category: 'Traditional Wear', size: 'L', brand: 'Heritage Loom', condition: 'Good',
      description: 'A soft cotton kurta for everyday wear, refreshed and ready for a new owner.', sellingPrice: 1600, rentalPrice: 220,
      type: 'Sell', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85',
      rating: 4.4, ratingCount: 37,
      status: 'Approved', availability: 'Available', createdAt: new Date().toISOString(), ownerName: 'ReWear Sample'
    },
    {
      id: 'DEMO_CASUAL_TSHIRT', customerId: currentUser?.id || 'DEMO_CUSTOMER', ownerId: null,
      name: 'Casual T-Shirt', category: 'T-Shirts', size: 'L', brand: 'Street Mode', condition: 'Excellent',
      description: 'A soft everyday cotton tee in excellent condition.', sellingPrice: 800, rentalPrice: 120,
      type: 'Sell', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
      rating: 4.6, ratingCount: 92,
      status: 'Approved', availability: 'Available', createdAt: new Date().toISOString(), ownerName: 'ReWear Sample'
    },
    {
      id: 'DEMO_BLACK_JEANS', customerId: currentUser?.id || 'DEMO_CUSTOMER', ownerId: null,
      name: 'Black Jeans', category: 'Jeans', size: 'M', brand: 'Denim Craft', condition: 'Good',
      description: 'Classic black denim with a comfortable fit and plenty of life left.', sellingPrice: 1500, rentalPrice: 220,
      type: 'Sell', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85',
      rating: 4.5, ratingCount: 68,
      status: 'Approved', availability: 'Available', createdAt: new Date().toISOString(), ownerName: 'ReWear Sample'
    },
    {
      id: 'DEMO_SAREE', customerId: currentUser?.id || 'DEMO_CUSTOMER', ownerId: null,
      name: 'Royal Saree', category: 'Traditional Wear', size: 'Free', brand: 'Saree Studio', condition: 'Excellent',
      description: 'A graceful saree with rich color and elegant drape, perfect for festive occasions.', sellingPrice: 2600, rentalPrice: 380,
      type: 'Sell', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85',
      rating: 4.9, ratingCount: 138,
      status: 'Approved', availability: 'Available', createdAt: new Date().toISOString(), ownerName: 'ReWear Sample'
    },
    {
      id: 'DEMO_KID_DRESS', customerId: currentUser?.id || 'DEMO_CUSTOMER', ownerId: null,
      name: 'Kids Party Dress', category: 'Kids', size: '6-7Y', brand: 'Mini Moda', condition: 'Very Good',
      description: 'Cute and cheerful kids party dress with a comfort fit and bright styling.', sellingPrice: 1200, rentalPrice: 180,
      type: 'Sell', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
      rating: 4.7, ratingCount: 71,
      status: 'Approved', availability: 'Available', createdAt: new Date().toISOString(), ownerName: 'ReWear Sample'
    },
    {
      id: 'DEMO_PARTY_GOWN', customerId: currentUser?.id || 'DEMO_CUSTOMER', ownerId: null,
      name: 'Evening Gown', category: 'Dresses', size: 'M', brand: 'Velvet Muse', condition: 'Excellent',
      description: 'A fitted evening gown made for parties, dinners, and celebrations.', sellingPrice: 3000, rentalPrice: 450,
      type: 'Rent', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85',
      rating: 4.8, ratingCount: 89,
      status: 'Approved', availability: 'Available', createdAt: new Date().toISOString(), ownerName: 'ReWear Sample'
    },
    {
      id: 'DEMO_HOODIE', customerId: currentUser?.id || 'DEMO_CUSTOMER', ownerId: null,
      name: 'Hoodie', category: 'Other', size: 'XL', brand: 'North Trail', condition: 'Very Good',
      description: 'A relaxed fleece hoodie, clean and ready for cooler days.', sellingPrice: 1700, rentalPrice: 260,
      type: 'Sell', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
      rating: 4.7, ratingCount: 111,
      status: 'Approved', availability: 'Available', createdAt: new Date().toISOString(), ownerName: 'ReWear Sample'
    },
    {
      id: 'DEMO_FORMAL_SHIRT', customerId: currentUser?.id || 'DEMO_CUSTOMER', ownerId: null,
      name: 'Formal Shirt', category: 'Shirts', size: 'L', brand: 'Classic Tailor', condition: 'Excellent',
      description: 'A crisp tailored shirt suitable for work or special occasions.', sellingPrice: 1900, rentalPrice: 280,
      type: 'Sell', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=85',
      rating: 4.8, ratingCount: 54,
      status: 'Approved', availability: 'Available', createdAt: new Date().toISOString(), ownerName: 'ReWear Sample'
    }
  ];
  const existingIds = new Set(products.map(product => String(product.id)));
  const missingProducts = demoProducts.filter(product => !existingIds.has(product.id));
  const demoById = new Map(demoProducts.map(product => [product.id, product]));
  let updatedExisting = false;
  const updatedProducts = products.map(product => {
    const sample = demoById.get(String(product.id));
    if (!sample) return product;
    const updated = { ...product };
    ['name', 'category', 'size', 'brand', 'image'].forEach(field => {
      if (updated[field] !== sample[field]) updated[field] = sample[field];
    });
    if (updated.rating == null) updated.rating = sample.rating;
    if (updated.ratingCount == null) updated.ratingCount = sample.ratingCount;
    if (updated.name !== product.name || updated.category !== product.category || updated.size !== product.size || updated.brand !== product.brand || updated.image !== product.image || updated.rating !== product.rating || updated.ratingCount !== product.ratingCount) updatedExisting = true;
    return updated;
  });
  if (missingProducts.length || updatedExisting) saveData(STORAGE_KEYS.products, [...updatedProducts, ...missingProducts]);
  return getData(STORAGE_KEYS.products, []);
  /*
    {
      id: 'PROD_DENIM_JACKET',
      customerId: 'CUSTOMER_DEMO',
      ownerId: null,
      name: 'Denim Jacket',
      category: 'Jackets',
      size: 'M',
      brand: 'Urban Revival',
      condition: 'Good',
      description: 'Classic vintage-inspired denim jacket, lightly worn and perfect for layering.',
      sellingPrice: 1800,
      rentalPrice: 250,
      type: 'Sell',
      image: createPlaceholderImage('Denim Jacket', '#3b82f6', '#1e3a8a'),
      status: 'Approved',
      availability: 'Available',
      createdAt: new Date().toISOString(),
      ownerName: 'Demo Owner'
    },
    {
      id: 'PROD_TSHIRT',
      customerId: 'CUSTOMER_DEMO',
      ownerId: null,
      name: 'Casual T-Shirt',
      category: 'T-Shirts',
      size: 'L',
      brand: 'Street Mode',
      condition: 'Excellent',
      description: 'Everyday cotton t-shirt with a comfortable fit and minimal wear.',
      sellingPrice: 800,
      rentalPrice: 120,
      type: 'Sell',
      image: createPlaceholderImage('T-Shirt', '#34d399', '#047857'),
      status: 'Approved',
      availability: 'Available',
      createdAt: new Date().toISOString(),
      ownerName: 'Demo Owner'
    },
    {
      id: 'PROD_FLORAL_DRESS',
      customerId: 'CUSTOMER_DEMO',
      ownerId: null,
      name: 'Floral Dress',
      category: 'Dresses',
      size: 'S',
      brand: 'Bloom & Co',
      condition: 'Very Good',
      description: 'Light, breezy floral dress suitable for casual outings and events.',
      sellingPrice: 2200,
      rentalPrice: 300,
      type: 'Sell',
      image: createPlaceholderImage('Floral Dress', '#f59e0b', '#db2777'),
      status: 'Approved',
      availability: 'Available',
      createdAt: new Date().toISOString(),
      ownerName: 'Demo Owner'
    },
    {
      id: 'PROD_BLACK_JEANS',
      customerId: 'CUSTOMER_DEMO',
      ownerId: null,
      name: 'Black Jeans',
      category: 'Jeans',
      size: 'M',
      brand: 'Denim Craft',
      condition: 'Good',
      description: 'Premium stretch black jeans offering both comfort and a clean silhouette.',
      sellingPrice: 1500,
      rentalPrice: 220,
      type: 'Sell',
      image: createPlaceholderImage('Black Jeans', '#374151', '#111827'),
      status: 'Approved',
      availability: 'Available',
      createdAt: new Date().toISOString(),
      ownerName: 'Demo Owner'
    },
    {
      id: 'PROD_KURTA',
      customerId: 'CUSTOMER_DEMO',
      ownerId: null,
      name: 'Traditional Kurta',
      category: 'Traditional Wear',
      size: 'L',
      brand: 'Heritage Loom',
      condition: 'Excellent',
      description: 'Ethnic kurta featuring soft fabric and a timeless festive look.',
      sellingPrice: 2600,
      rentalPrice: 400,
      type: 'Sell',
      image: createPlaceholderImage('Kurta', '#a16207', '#7c2d12'),
      status: 'Approved',
      availability: 'Available',
      createdAt: new Date().toISOString(),
      ownerName: 'Demo Owner'
    },
    {
      id: 'PROD_HOODIE',
      customerId: 'CUSTOMER_DEMO',
      ownerId: null,
      name: 'Hoodie',
      category: 'Other',
      size: 'XL',
      brand: 'North Trail',
      condition: 'Very Good',
      description: 'Warm fleece hoodie with a modern oversized fit for chilly days.',
      sellingPrice: 1700,
      rentalPrice: 260,
      type: 'Sell',
      image: createPlaceholderImage('Hoodie', '#64748b', '#334155'),
      status: 'Approved',
      availability: 'Available',
      createdAt: new Date().toISOString(),
      ownerName: 'Demo Owner'
    },
    {
      id: 'PROD_SUMMER_DRESS',
      customerId: 'CUSTOMER_DEMO',
      ownerId: null,
      name: 'Summer Dress',
      category: 'Dresses',
      size: 'M',
      brand: 'Sea Breeze',
      condition: 'Good',
      description: 'Fresh summer-ready dress with breathable fabric and relaxed styling.',
      sellingPrice: 2100,
      rentalPrice: 300,
      type: 'Sell',
      image: createPlaceholderImage('Summer Dress', '#f472b6', '#ec4899'),
      status: 'Approved',
      availability: 'Available',
      createdAt: new Date().toISOString(),
      ownerName: 'Demo Owner'
    },
    {
      id: 'PROD_FORMAL_SHIRT',
      customerId: 'CUSTOMER_DEMO',
      ownerId: null,
      name: 'Formal Shirt',
      category: 'Shirts',
      size: 'L',
      brand: 'Classic Tailor',
      condition: 'Excellent',
      description: 'Tailored-fit formal shirt that pairs well with office or event wear.',
      sellingPrice: 1900,
      rentalPrice: 280,
      type: 'Sell',
      image: createPlaceholderImage('Formal Shirt', '#d97706', '#a16207'),
      status: 'Approved',
      availability: 'Available',
      createdAt: new Date().toISOString(),
      ownerName: 'Demo Owner'
    }
  ];

  saveData(STORAGE_KEYS.products, sampleProducts);
  return sampleProducts; */
}

function getProductById(productId) {
  const products = getData(STORAGE_KEYS.products, []);
  return products.find(product => String(product.id) === String(productId)) || null;
}

function hasDisplayableProductImage(product) {
  return Boolean(product && product.image && String(product.image).trim() && !String(product.image).includes('undefined') && !String(product.image).includes('null'));
}

function getVisibleProducts() {
  return getData(STORAGE_KEYS.products, []).filter(product =>
    product.status === 'Approved' &&
    product.type !== 'Donate' &&
    product.availability !== 'Sold' &&
    product.availability !== 'Rented' &&
    product.availability !== 'Unavailable' &&
    hasDisplayableProductImage(product)
  );
}

function renderProductRating(product) {
  const rating = Number(product.rating || 4.5).toFixed(1);
  const ratingCount = Number(product.ratingCount || 24);
  return `<div class="product-rating" aria-label="Rated ${rating} out of 5">★ <strong>${rating}</strong><span>(${ratingCount})</span></div>`;
}

function getUserProducts(userId) {
  return getData(STORAGE_KEYS.products, []).filter(product => String(product.customerId) === String(userId));
}

function getOwnerInventory(ownerId) {
  const inventory = getData(STORAGE_KEYS.inventory, []);
  return inventory.filter(item => String(item.ownerId) === String(ownerId));
}

function addProductToInventory(product, ownerId) {
  const inventory = getData(STORAGE_KEYS.inventory, []);
  const alreadyExists = inventory.some(item => String(item.productId) === String(product.id));

  if (!alreadyExists) {
    inventory.push({
      id: makeId('INV'),
      productId: product.id,
      ownerId,
      addedAt: new Date().toISOString(),
      productName: product.name
    });
    saveData(STORAGE_KEYS.inventory, inventory);
  }
}

function bindProductUploadForm() {
  const form = document.getElementById('uploadForm');
  if (!form) {
    return;
  }

  const currentUser = requireAuth(['customer']);
  if (!currentUser) {
    return;
  }

  const imageInput = document.getElementById('productImage');
  const preview = document.getElementById('uploadPreview');

  imageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) {
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      showToast('Only PNG, JPG, JPEG, and WEBP images are allowed.', 'error');
      this.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB.', 'error');
      this.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      preview.src = event.target.result;
      preview.style.display = 'block';
      imageInput.dataset.base64 = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const imageFile = imageInput.files[0];
    const values = {
      name: (formData.get('name') || '').trim(),
      category: (formData.get('category') || '').trim(),
      size: (formData.get('size') || '').trim(),
      brand: (formData.get('brand') || '').trim(),
      condition: (formData.get('condition') || '').trim(),
      description: (formData.get('description') || '').trim(),
      sellingPrice: Number(formData.get('sellingPrice')),
      rentalPrice: Number(formData.get('rentalPrice')),
      type: (formData.get('type') || '').trim(),
      image: imageFile
    };

    if (!values.name || !values.category || !values.size || !values.brand || !values.condition || !values.description || !values.type) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (!['Men', 'Women', 'Kids', 'Dresses', 'Shirts', 'T-Shirts', 'Jeans', 'Jackets', 'Traditional Wear', 'Other'].includes(values.category)) {
      showToast('Please choose a valid category.', 'error');
      return;
    }

    if (!values.image) {
      showToast('Please upload a valid product image.', 'error');
      return;
    }

    if (Number(values.sellingPrice) <= 0 || Number(values.rentalPrice) <= 0) {
      showToast('Prices must be positive values.', 'error');
      return;
    }

    const payload = new FormData(form);
    payload.set('image', imageFile);
    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
    }
    try {
      const result = await apiRequest('/clothes', { method: 'POST', body: payload });
      remoteState.products.unshift(result.product);
      form.reset();
      preview.style.display = 'none';
      delete imageInput.dataset.base64;
      showToast(`${values.type} listing submitted for owner review.`, 'success');
      renderCustomerProductsTable();
      renderDashboardStats();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit for Review';
      }
    }
  });
}

function renderFeaturedProducts() {
  const featuredGrid = document.getElementById('featuredProducts');
  if (!featuredGrid) {
    return;
  }

  const products = getVisibleProducts().slice(0, 4);
  featuredGrid.innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}" class="product-image" />
      </div>
      <div class="product-info">
        <span class="chip">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="muted">${product.brand} • ${product.size}</p>
        ${renderProductRating(product)}
        <div class="price-row">
          <strong>${formatCurrency(product.sellingPrice)}</strong>
          <span>${formatCurrency(product.rentalPrice)}/day</span>
        </div>
        <div class="card-actions">
          <a class="btn btn-secondary btn-small" href="product.html?id=${product.id}">View Details</a>
          ${product.type === 'Rent'
    ? `<a class="btn btn-primary btn-small" href="product.html?id=${product.id}">Rent Now</a>`
    : `<a class="btn btn-primary btn-small" href="product.html?id=${product.id}&buy=1">Buy Now</a>`}
        </div>
      </div>
    </article>
  `).join('');
}

function getCartItems() {
  try {
    return JSON.parse(localStorage.getItem('rewear_cart') || '[]');
  } catch (error) {
    return [];
  }
}

function saveCartItems(items) {
  localStorage.setItem('rewear_cart', JSON.stringify(items));
}

function getFavoriteItems() {
  try {
    return JSON.parse(localStorage.getItem('rewear_favorites') || '[]');
  } catch (error) {
    return [];
  }
}

function saveFavoriteItems(items) {
  localStorage.setItem('rewear_favorites', JSON.stringify(items));
}

function openMenuPanel(type) {
  const cartPanel = document.getElementById('cartPanel');
  const favoritesPanel = document.getElementById('favoritesPanel');
  const cartToggle = document.getElementById('cartToggle');
  const favoritesToggle = document.getElementById('favoritesToggle');
  const shouldOpenCart = type === 'cart';
  const targetPanel = shouldOpenCart ? cartPanel : favoritesPanel;
  const shouldOpen = !targetPanel?.classList.contains('open');
  cartPanel?.classList.toggle('open', shouldOpenCart && shouldOpen);
  favoritesPanel?.classList.toggle('open', !shouldOpenCart && shouldOpen);
  cartToggle?.setAttribute('aria-expanded', String(shouldOpenCart && shouldOpen));
  favoritesToggle?.setAttribute('aria-expanded', String(!shouldOpenCart && shouldOpen));
}

function renderCartUI() {
  const cartToggle = document.getElementById('cartToggle');
  const favoritesToggle = document.getElementById('favoritesToggle');
  const cartPanel = document.getElementById('cartPanel');
  const favoritesPanel = document.getElementById('favoritesPanel');
  const cartCount = document.getElementById('cartCount');
  const favoritesCount = document.getElementById('favoritesCount');
  const navCartCount = document.getElementById('navCartCount');
  const navFavCount = document.getElementById('navFavCount');
  const cartItems = document.getElementById('cartItems');
  const favoriteItems = document.getElementById('favoriteItems');
  const cartTotal = document.getElementById('cartTotal');

  const cart = getCartItems();
  const favorites = getFavoriteItems();
  const favoriteProducts = getVisibleProducts().filter(product => favorites.includes(String(product.id)));

  if (cartCount) cartCount.textContent = cart.length;
  if (favoritesCount) favoritesCount.textContent = favorites.length;
  if (navCartCount) navCartCount.textContent = cart.length;
  if (navFavCount) navFavCount.textContent = favorites.length;

  if (!cart.length) {
    if (cartItems) cartItems.innerHTML = '<div class="empty-state">Your cart is empty.</div>';
    if (cartTotal) cartTotal.textContent = '₹0';
  } else {
    const total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
    if (cartItems) {
      cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div>
            <strong>${item.name}</strong>
            <small>${formatCurrency(item.price)}${item.type === 'Rent' ? ' / day' : ''}</small>
          </div>
          <button type="button" data-remove-cart="${item.id}">Remove</button>
        </div>
      `).join('');
    }
    if (cartTotal) cartTotal.textContent = formatCurrency(total);
    cartItems?.querySelectorAll('[data-remove-cart]').forEach(button => {
      button.addEventListener('click', () => {
        const current = getCartItems().filter(item => String(item.id) !== String(button.dataset.removeCart));
        saveCartItems(current);
        renderCartUI();
      });
    });
  }

  if (!favoriteProducts.length) {
    if (favoriteItems) favoriteItems.innerHTML = '<div class="empty-state">No favorite products yet.</div>';
  } else {
    if (favoriteItems) {
      favoriteItems.innerHTML = favoriteProducts.map(product => `
        <div class="cart-item">
          <div>
            <strong>${product.name}</strong>
            <small>${formatCurrency(product.sellingPrice)}</small>
          </div>
          <button type="button" data-favorite-product="${product.id}">♥</button>
        </div>
      `).join('');
    }
    favoriteItems?.querySelectorAll('[data-favorite-product]').forEach(button => {
      button.addEventListener('click', () => toggleFavorite(button.dataset.favoriteProduct));
    });
  }

  if (cartToggle && cartToggle.dataset.boundCartToggle !== 'true') {
    cartToggle.addEventListener('click', () => openMenuPanel('cart'));
    cartToggle.dataset.boundCartToggle = 'true';
  }

  if (favoritesToggle && favoritesToggle.dataset.boundFavoritesToggle !== 'true') {
    favoritesToggle.addEventListener('click', () => openMenuPanel('favorites'));
    favoritesToggle.dataset.boundFavoritesToggle = 'true';
  }

  const clearBtn = document.getElementById('clearCartBtn');
  if (clearBtn && clearBtn.dataset.boundClearCart !== 'true') {
    clearBtn.addEventListener('click', () => {
      saveCartItems([]);
      renderCartUI();
    });
    clearBtn.dataset.boundClearCart = 'true';
  }

  const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
  if (clearFavoritesBtn && clearFavoritesBtn.dataset.boundClearFavorites !== 'true') {
    clearFavoritesBtn.addEventListener('click', () => {
      saveFavoriteItems([]);
      renderCartUI();
      renderShopPage();
    });
    clearFavoritesBtn.dataset.boundClearFavorites = 'true';
  }

  const checkoutBtn = document.getElementById('checkoutCartBtn');
  if (checkoutBtn && checkoutBtn.dataset.boundCheckoutCart !== 'true') {
    checkoutBtn.addEventListener('click', () => {
      if (!getCartItems().length) {
        showToast('Cart is empty.', 'error');
        return;
      }
      showToast('Cart is ready for checkout.', 'success');
    });
    checkoutBtn.dataset.boundCheckoutCart = 'true';
  }

  const menuCartLink = document.getElementById('menuCartLink');
  if (menuCartLink && menuCartLink.dataset.boundMenuCart !== 'true') {
    menuCartLink.addEventListener('click', event => {
      event.preventDefault();
      openMenuPanel('cart');
    });
    menuCartLink.dataset.boundMenuCart = 'true';
  }

  const menuFavoriteLink = document.getElementById('menuFavoriteLink');
  if (menuFavoriteLink && menuFavoriteLink.dataset.boundMenuFavorite !== 'true') {
    menuFavoriteLink.addEventListener('click', event => {
      event.preventDefault();
      openMenuPanel('favorites');
    });
    menuFavoriteLink.dataset.boundMenuFavorite = 'true';
  }

  if (cartPanel && favoritesPanel) {
    cartPanel.classList.toggle('open', cartPanel.classList.contains('open'));
    favoritesPanel.classList.toggle('open', favoritesPanel.classList.contains('open'));
  }
}

function addProductToCart(productId) {
  const product = getProductById(productId);
  if (!product) {
    showToast('Product not found.', 'error');
    return;
  }

  if (product.type === 'Donate') {
    showToast('Donated listings cannot be added to the shopping cart.', 'error');
    return;
  }
  if (product.availability !== 'Available') {
    showToast('This product is no longer available.', 'error');
    return;
  }

  const cartItems = getCartItems();
  if (cartItems.some(item => String(item.id) === String(product.id))) {
    showToast(`${product.name} is already in your cart.`, 'error');
    return;
  }
  cartItems.push({
    id: product.id,
    name: product.name,
    type: product.type,
    price: Number((product.type === 'Rent' ? product.rentalPrice : product.sellingPrice) || 0)
  });
  saveCartItems(cartItems);
  renderCartUI();
  renderCustomerFavoritesAndCart();
  showToast(`${product.name} added to cart.`, 'success');
}

function toggleFavorite(productId) {
  const product = getProductById(productId);
  if (!product) {
    showToast('Product not found.', 'error');
    return;
  }
  const current = getFavoriteItems();
  const id = String(productId);
  const updated = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
  saveFavoriteItems(updated);
  renderCartUI();
  renderCustomerFavoritesAndCart();
  renderShopPage();
  showToast(updated.includes(id) ? 'Added to favorites.' : 'Removed from favorites.', 'success');
}

function bindProductCardActions(container) {
  container.querySelectorAll('[data-add-cart]').forEach(button => {
    button.addEventListener('click', () => addProductToCart(button.dataset.addCart));
  });
  container.querySelectorAll('[data-favorite-product]').forEach(button => {
    const isFavorite = getFavoriteItems().includes(String(button.dataset.favoriteProduct));
    button.textContent = isFavorite ? '♥' : '♡';
    button.classList.toggle('is-favorite', isFavorite);
    button.setAttribute('aria-pressed', String(isFavorite));
    button.addEventListener('click', () => toggleFavorite(button.dataset.favoriteProduct));
  });
}

function renderShopPage() {
  const grid = document.getElementById('shopGrid');
  if (!grid) {
    return;
  }

  const search = document.getElementById('shopSearch')?.value?.trim().toLowerCase() || '';
  const category = document.getElementById('categoryFilter')?.value || 'All';
  const size = document.getElementById('sizeFilter')?.value || 'All';
  const condition = document.getElementById('conditionFilter')?.value || 'All';
  const maxPrice = Number(document.getElementById('priceFilter')?.value || 5000);

  const products = getVisibleProducts().filter(product => {
    const matchesSearch = !search || product.name.toLowerCase().includes(search) || product.brand.toLowerCase().includes(search) || product.category.toLowerCase().includes(search);
    const matchesCategory = category === 'All' || product.category === category;
    const matchesSize = size === 'All' || product.size === size;
    const matchesCondition = condition === 'All' || product.condition === condition;
    const matchesPrice = Number(product.sellingPrice) <= maxPrice;
    return matchesSearch && matchesCategory && matchesSize && matchesCondition && matchesPrice;
  });

  grid.innerHTML = products.length ? products.map(product => {
    return `
      <article class="product-card">
        <div class="product-image-wrap">
          <img src="${product.image || ''}" alt="${product.name}" class="product-image" />
        </div>
        <div class="product-info">
          <span class="chip">${product.category}</span>
          <h3>${product.name}</h3>
          <p class="muted">${product.brand} • ${product.size}</p>
          ${renderProductRating(product)}
          <div class="price-row">
            <strong>${product.type === 'Rent' ? `${formatCurrency(product.rentalPrice)}/day` : formatCurrency(product.sellingPrice)}</strong>
            <span>${product.condition} · ${product.type}</span>
          </div>
          <div class="card-actions">
            <a class="btn btn-secondary btn-small" href="product.html?id=${product.id}">View Details</a>
            <button type="button" class="btn btn-light btn-small" data-favorite-product="${product.id}" aria-label="Add ${product.name} to favorites">♡</button>
            <button type="button" class="btn btn-primary btn-small" data-add-cart="${product.id}">Add to cart</button>
          </div>
        </div>
      </article>
    `;
  }).join('') : '<div class="empty-state">No products match your filters.</div>';
  bindProductCardActions(grid);
}

function renderCustomerFavoritesAndCart() {
  const favoriteContainer = document.getElementById('customerFavoritesList');
  const cartContainer = document.getElementById('customerCartList');
  const cartTotal = document.getElementById('customerCartTotal');

  const favorites = getFavoriteItems();
  const cart = getCartItems();

  if (favoriteContainer) {
    const favoriteProducts = getVisibleProducts().filter(product => favorites.includes(String(product.id)));
    favoriteContainer.innerHTML = favoriteProducts.length
      ? favoriteProducts.map(product => `
          <div class="cart-item">
            <div>
              <strong>${product.name}</strong>
              <small>${formatCurrency(product.sellingPrice)}</small>
            </div>
            <button type="button" data-customer-favorite-remove="${product.id}">Remove</button>
          </div>
        `).join('')
      : '<div class="empty-state">No favorite products yet.</div>';

    favoriteContainer.querySelectorAll('[data-customer-favorite-remove]').forEach(button => {
      button.addEventListener('click', () => {
        toggleFavorite(button.dataset.customerFavoriteRemove);
        renderCustomerFavoritesAndCart();
      });
    });
  }

  if (cartContainer) {
    cartContainer.innerHTML = cart.length
      ? cart.map(item => `
          <div class="cart-item">
            <div>
              <strong>${item.name}</strong>
              <small>${formatCurrency(item.price)}${item.type === 'Rent' ? ' / day' : ''}</small>
            </div>
            <button type="button" data-customer-cart-remove="${item.id}">Remove</button>
          </div>
        `).join('')
      : '<div class="empty-state">Your cart is empty.</div>';

    cartContainer.querySelectorAll('[data-customer-cart-remove]').forEach(button => {
      button.addEventListener('click', () => {
        const updated = getCartItems().filter(item => String(item.id) !== String(button.dataset.customerCartRemove));
        saveCartItems(updated);
        renderCustomerFavoritesAndCart();
      });
    });
  }

  if (cartTotal) {
    const total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
    cartTotal.textContent = formatCurrency(total);
  }
}

function renderCustomerProductsTable() {
  const currentUser = getCurrentUser();
  const table = document.getElementById('customerProductsTable');
  if (!table || !currentUser) {
    return;
  }

  const listingType = table.dataset.listingType || 'Sell';
  document.querySelectorAll('[data-customer-listing-tab]').forEach(button => {
    const selected = button.dataset.customerListingTab === listingType;
    button.setAttribute('aria-selected', String(selected));
    button.classList.toggle('btn-primary', selected);
    button.classList.toggle('btn-secondary', !selected);
    if (button.dataset.boundCustomerListingTab === 'true') return;
    button.addEventListener('click', () => {
      table.dataset.listingType = button.dataset.customerListingTab;
      renderCustomerProductsTable();
    });
    button.dataset.boundCustomerListingTab = 'true';
  });

  const products = getUserProducts(currentUser.id)
    .filter(product => product.type === listingType && hasDisplayableProductImage(product));

  if (!products.length) {
    table.innerHTML = `<tr><td colspan="7"><div class="empty-state">No ${listingType.toLowerCase()} listings yet.</div></td></tr>`;
    return;
  }

  const donations = getData(STORAGE_KEYS.donations, []);
  const donationStatuses = new Map(donations.map(item => [String(item.productId), item.status]));
  table.innerHTML = products.map(product => {
    const status = listingType === 'Donate'
      ? donationStatuses.get(String(product.id)) || product.status
      : product.status;
    return `
      <tr>
        <td><img src="${product.image}" alt="${product.name}" class="table-thumb" /></td>
        <td><div class="detail-stack"><strong>${product.name}</strong><small>${product.brand} • ${product.size} • ${product.condition}</small></div></td>
        <td>${product.category}</td>
        <td>
          <div class="detail-stack">
            <strong>${formatCurrency(product.sellingPrice)}</strong>
            <small>${formatCurrency(product.rentalPrice)}/day</small>
          </div>
        </td>
        <td><span class="status-badge status-${String(status).toLowerCase()}">${status}</span></td>
        <td>${product.availability || 'Available'}</td>
        <td>${new Date(product.createdAt).toLocaleDateString()}</td>
      </tr>
    `;
  }).join('');
}

function renderCustomerRentalRequests() {
  const table = document.getElementById('customerRentalRequests');
  const currentUser = getCurrentUser();
  if (!table || !currentUser) return;

  const rentals = getData(STORAGE_KEYS.rentals, [])
    .filter(rental => String(rental.customerId) === String(currentUser.id));
  if (!rentals.length) {
    table.innerHTML = '<tr><td colspan="5"><div class="empty-state">No rental requests yet.</div></td></tr>';
    return;
  }

  table.innerHTML = rentals.map(rental => {
    const product = getProductById(rental.productId);
    return `<tr>
      <td>${rental.id}</td>
      <td>${product?.name || 'Clothing item'}</td>
      <td>${new Date(rental.startDate).toLocaleDateString()} – ${new Date(rental.endDate).toLocaleDateString()}</td>
      <td>${formatCurrency(rental.totalAmount)}</td>
      <td><span class="status-badge status-${String(rental.status).toLowerCase()}">${rental.status}</span></td>
    </tr>`;
  }).join('');
}

function renderProductDetailPage() {
  const productId = new URLSearchParams(window.location.search).get('id');
  const detailSection = document.getElementById('productDetail');
  if (!detailSection || !productId) {
    return;
  }

  const product = getProductById(productId);
  if (!product) {
    detailSection.innerHTML = '<div class="empty-state">Product not found.</div>';
    return;
  }

  const isAvailable = product.availability === 'Available';
  detailSection.innerHTML = `
    <div class="product-detail-card">
      <div class="product-detail-image-wrap">
        <img src="${product.image}" alt="${product.name}" class="product-detail-image" />
      </div>
      <div class="product-detail-content">
        <span class="chip">${product.category}</span>
        <h1>${product.name}</h1>
        <div class="detail-meta">
          <span>Brand: ${product.brand}</span>
          <span>Size: ${product.size}</span>
          <span>Condition: ${product.condition}</span>
        </div>
        <p>${product.description}</p>
        <div class="detail-prices">
          <div>
            <label>Selling Price</label>
            <strong>${formatCurrency(product.sellingPrice)}</strong>
          </div>
          <div>
            <label>Rental Price</label>
            <strong>${formatCurrency(product.rentalPrice)}/day</strong>
          </div>
        </div>
        <div class="detail-meta">
          <span>Owner: ${product.ownerName || 'ReWear Seller'}</span>
          <span>Availability: ${product.availability}</span>
        </div>
        <div class="card-actions">
          ${product.type === 'Rent'
    ? `<button class="btn btn-secondary" data-rent-product="${product.id}" ${!isAvailable ? 'disabled' : ''}>Rent Now</button>`
    : `<button class="btn btn-primary" data-buy-product="${product.id}" ${!isAvailable ? 'disabled' : ''}>Buy Now</button>`}
        </div>
      </div>
    </div>
  `;

  document.querySelector('[data-buy-product]')?.addEventListener('click', () => buyDirectFromShop(product.id));
  document.querySelector('[data-rent-product]')?.addEventListener('click', () => openRentalModal(product.id));
}

function buyDirectFromShop(productId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please login first.', 'error');
    window.location.href = 'login.html';
    return;
  }

  if (currentUser.role !== 'customer') {
    showToast('Only customers can buy products.', 'error');
    return;
  }

  const product = getProductById(productId);
  if (!product) {
    showToast('Product not found.', 'error');
    return;
  }

  if (product.type !== 'Sell') {
    showToast('This listing is not available for purchase.', 'error');
    return;
  }

  if (product.availability !== 'Available') {
    showToast('Product is no longer available.', 'error');
    return;
  }

  const purchaseModal = document.getElementById('purchaseModal');
  if (!purchaseModal) {
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
      <div class="modal-backdrop" id="purchaseModal">
        <div class="modal-panel">
          <div class="modal-header">
            <h3>Confirm Purchase</h3>
            <button class="close-btn" data-close-modal="purchaseModal">×</button>
          </div>
          <div class="modal-body">
            <p><strong>Product:</strong> ${product.name}</p>
            <p><strong>Price:</strong> ${formatCurrency(product.sellingPrice)}</p>
            <p><strong>Customer:</strong> ${currentUser.fullName}</p>
            <label>Address</label>
            <textarea id="orderAddress" required>${currentUser.address || ''}</textarea>
            <label>Phone</label>
            <input id="orderPhone" type="tel" value="${currentUser.phone || ''}" required />
            <label>Payment Method</label>
            <input type="text" value="Cash on Delivery" readonly />
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" data-close-modal="purchaseModal">Cancel</button>
            <button class="btn btn-primary" onclick="confirmPurchase('${product.id}')">Place Order</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalContainer.firstElementChild);
  }

  const modal = document.getElementById('purchaseModal');
  modal.style.display = 'flex';
  const fieldAddress = document.getElementById('orderAddress');
  const fieldPhone = document.getElementById('orderPhone');
  if (fieldAddress) fieldAddress.value = currentUser.address || '';
  if (fieldPhone) fieldPhone.value = currentUser.phone || '';
}

async function confirmPurchase(productId) {
  const currentUser = getCurrentUser();
  const product = getProductById(productId);
  const address = document.getElementById('orderAddress')?.value?.trim();
  const phone = document.getElementById('orderPhone')?.value?.trim();

  if (!product || !currentUser) {
    showToast('Unable to complete purchase.', 'error');
    return;
  }

  if (!address || !phone) {
    showToast('Address and phone are required.', 'error');
    return;
  }

  let order;
  if (String(product.id).startsWith('DEMO_')) {
    order = { id: `DEMO_ORDER_${makeId('LOCAL')}`, customerId: currentUser.id, ownerId: product.ownerId, productId, amount: product.sellingPrice, address, phone, status: 'Pending', createdAt: new Date().toISOString() };
  } else {
    try {
      const result = await apiRequest('/orders', { method: 'POST', body: JSON.stringify({ productId, address, phone }) });
      order = result.order;
    } catch (error) { showToast(error.message, 'error'); return; }
  }
  saveData(STORAGE_KEYS.orders, [order, ...getData(STORAGE_KEYS.orders, [])]);
  product.availability = 'Sold';
  saveData(STORAGE_KEYS.products, getData(STORAGE_KEYS.products, []));

  const modal = document.getElementById('purchaseModal');
  if (modal) {
    modal.style.display = 'none';
  }

  showToast('Order placed successfully!', 'success');
  if (window.location.pathname.includes('product.html')) {
    window.location.reload();
  }
}

function openRentalModal(productId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please login first.', 'error');
    window.location.href = 'login.html';
    return;
  }

  if (currentUser.role !== 'customer') {
    showToast('Only customers can rent products.', 'error');
    return;
  }

  const product = getProductById(productId);
  if (!product) {
    showToast('Product not found.', 'error');
    return;
  }

  if (product.type !== 'Rent') {
    showToast('This listing is not available for rent.', 'error');
    return;
  }

  if (product.availability !== 'Available') {
    showToast('Product is not available for rent.', 'error');
    return;
  }

  const modalHtml = `
    <div class="modal-backdrop" id="rentalModal">
      <div class="modal-panel">
        <div class="modal-header">
          <h3>Rent ${product.name}</h3>
          <button class="close-btn" data-close-modal="rentalModal">×</button>
        </div>
        <div class="modal-body">
          <div class="rental-summary">
            <p><strong>Price:</strong> ${formatCurrency(product.rentalPrice)}/day</p>
            <p><strong>Deposit:</strong> ${formatCurrency(product.rentalPrice * 2)}</p>
          </div>
          <div class="form-grid">
            <div>
              <label>Start Date</label>
              <input id="rentalStartDate" type="date" min="${new Date().toISOString().split('T')[0]}" />
            </div>
            <div>
              <label>End Date</label>
              <input id="rentalEndDate" type="date" min="${new Date().toISOString().split('T')[0]}" />
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" data-close-modal="rentalModal">Cancel</button>
          <button class="btn btn-primary" onclick="submitRental('${product.id}')">Submit Rental</button>
        </div>
      </div>
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = modalHtml;
  document.body.appendChild(wrapper.firstElementChild);
}

async function submitRental(productId) {
  const currentUser = getCurrentUser();
  const product = getProductById(productId);
  const startDate = document.getElementById('rentalStartDate')?.value;
  const endDate = document.getElementById('rentalEndDate')?.value;

  if (!product || !currentUser) {
    showToast('Unable to submit rental.', 'error');
    return;
  }

  if (!startDate || !endDate) {
    showToast('Please select both rental dates.', 'error');
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start < new Date(new Date().toDateString())) {
    showToast('Start date cannot be in the past.', 'error');
    return;
  }

  if (end <= start) {
    showToast('End date must be after the start date.', 'error');
    return;
  }

  const rentalData = calculateRentalDetails(startDate, endDate, product.rentalPrice);
  let rental;
  if (String(product.id).startsWith('DEMO_')) {
    rental = { id: `DEMO_RENTAL_${makeId('LOCAL')}`, customerId: currentUser.id, ownerId: product.ownerId, productId, startDate, endDate, rentalPrice: product.rentalPrice, deposit: rentalData.deposit, totalAmount: rentalData.total, status: 'Pending', createdAt: new Date().toISOString() };
  } else {
    try {
      const result = await apiRequest('/rentals', { method: 'POST', body: JSON.stringify({ productId, startDate, endDate }) });
      rental = result.rental;
    } catch (error) { showToast(error.message, 'error'); return; }
  }
  saveData(STORAGE_KEYS.rentals, [rental, ...getData(STORAGE_KEYS.rentals, [])]);
  product.availability = 'Rented';
  updateData(STORAGE_KEYS.products, product.id, product);

  const modal = document.getElementById('rentalModal');
  if (modal) modal.remove();

  showToast('Rental request submitted!', 'success');
  if (window.location.pathname.includes('product.html')) {
    window.location.reload();
  }
}

function renderAdminProductTable() {
  const table = document.getElementById('adminProductsTable');
  if (!table) {
    return;
  }

  const products = getData(STORAGE_KEYS.products, []);
  table.innerHTML = products.map(product => `
    <tr>
      <td><img src="${product.image}" alt="${product.name}" class="table-thumb" /></td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.status}</td>
      <td>${product.availability}</td>
      <td>${product.brand}</td>
      <td>
        <div class="inline-actions">
          <button class="btn btn-small btn-success" data-approve-product="${product.id}">Approve</button>
          <button class="btn btn-small btn-danger" data-reject-product="${product.id}">Reject</button>
        </div>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('[data-approve-product]').forEach(button => {
    button.addEventListener('click', () => updateProductStatus(button.dataset.approveProduct, 'Approved'));
  });

  document.querySelectorAll('[data-reject-product]').forEach(button => {
    button.addEventListener('click', () => updateProductStatus(button.dataset.rejectProduct, 'Rejected'));
  });
}

async function updateProductStatus(productId, nextStatus) {
  const product = getProductById(productId);
  if (!product) return;

  try {
    const result = await apiRequest(`/clothes/${product.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus })
    });
    updateData(STORAGE_KEYS.products, product.id, result.product);
  } catch (error) {
    showToast(error.message, 'error');
    renderOwnerProductReviews();
    renderAdminClothesTable();
    return;
  }
  showToast(`Product ${nextStatus.toLowerCase()}!`, 'success');
  getData(STORAGE_KEYS.donations, [])
    .filter(donation => String(donation.productId) === String(product.id))
    .forEach(donation => updateData(STORAGE_KEYS.donations, donation.id, { status: nextStatus }));
  renderAdminProductTable();
  renderOwnerProductReviews();
  renderOwnerAvailableClothes();
  renderCustomerProductsTable();
  renderDonationPage();
  renderOwnerDonations();
  renderShopPage();
}

function renderOwnerProductReviews() {
  const table = document.getElementById('ownerProductReviews');
  if (!table) return;

  const listingType = table.dataset.listingType || 'Sell';
  document.querySelectorAll('[data-owner-listing-tab]').forEach(button => {
    const selected = button.dataset.ownerListingTab === listingType;
    button.setAttribute('aria-selected', String(selected));
    button.classList.toggle('btn-primary', selected);
    button.classList.toggle('btn-secondary', !selected);
  });

  const products = getData(STORAGE_KEYS.products, []).filter(product => product.type === listingType);
  document.querySelectorAll('[data-owner-listing-tab]').forEach(button => {
    if (button.dataset.boundListingTab === 'true') return;
    button.addEventListener('click', () => {
      table.dataset.listingType = button.dataset.ownerListingTab;
      renderOwnerProductReviews();
    });
    button.dataset.boundListingTab = 'true';
  });

  if (!products.length) {
    table.innerHTML = `<tr><td colspan="6"><div class="empty-state">No ${listingType.toLowerCase()} listings have been submitted yet.</div></td></tr>`;
    return;
  }

  table.innerHTML = products.map(product => `
    <tr>
      <td><img src="${product.image}" alt="${product.name}" class="table-thumb" /></td>
      <td>
        <div class="detail-stack">
          <strong>${product.name}</strong>
          <small>${product.category} • ${product.brand} • ${product.size}</small>
        </div>
      </td>
      <td>${product.ownerName || 'Customer'}</td>
      <td>
        <select data-owner-product-status="${product.id}" aria-label="Status for ${product.name}">
          <option value="Pending" ${product.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Approved" ${product.status === 'Approved' ? 'selected' : ''}>Approved</option>
          <option value="Rejected" ${product.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
      <td>${product.availability || 'Available'}</td>
      <td>${new Date(product.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('');

  table.querySelectorAll('[data-owner-product-status]').forEach(select => {
    select.addEventListener('change', () => updateProductStatus(select.dataset.ownerProductStatus, select.value));
  });
}

function getProductOwnerName(product) {
  const users = getData(STORAGE_KEYS.users, []);
  const owner = users.find(user => String(user.id) === String(product.ownerId || product.customerId));
  return owner ? owner.fullName : 'ReWear';
}

function renderOwnerAvailableClothes() {
  const container = document.getElementById('ownerAvailableClothes');
  if (!container) {
    return;
  }

  const currentUser = getCurrentUser();
  const products = getData(STORAGE_KEYS.products, []).filter(product =>
    product.status === 'Approved' &&
    product.type !== 'Donate' &&
    !product.ownerId &&
    product.availability === 'Available' &&
    hasDisplayableProductImage(product)
  );

  if (!products.length) {
    container.innerHTML = '<div class="empty-state">No approved clothes with images are available for inventory.</div>';
    return;
  }

  container.innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}" class="product-image" />
      </div>
      <div class="product-info">
        <span class="chip">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="muted">Customer: ${product.ownerName || 'Customer'}</p>
        <div class="detail-meta compact">
          <span>${product.size}</span>
          <span>${product.condition}</span>
        </div>
        <div class="price-row">
          <strong>${formatCurrency(product.sellingPrice)}</strong>
        </div>
        <button class="btn btn-primary btn-small" data-purchase-clothing="${product.id}">Add to Inventory</button>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('[data-purchase-clothing]').forEach(button => {
    button.addEventListener('click', () => purchaseClothing(button.dataset.purchaseClothing));
  });
}

async function purchaseClothing(productId) {
  const currentUser = requireAuth(['owner']);
  if (!currentUser) return;

  const product = getProductById(productId);
  if (!product) {
    showToast('Product not found.', 'error');
    return;
  }

  if (product.ownerId) {
    showToast('This product has already been purchased.', 'error');
    return;
  }

  try { await apiRequest(`/clothes/${product.id}`, { method: 'PUT', body: JSON.stringify({ ownerId: currentUser.id, availability: 'Available', status: 'Approved' }) }); }
  catch (error) { showToast(error.message, 'error'); return; }
  product.ownerId = currentUser.id;
  product.ownerName = currentUser.fullName;

  showToast('Product added to inventory!', 'success');
  renderOwnerAvailableClothes();
  renderOwnerInventory();
}

function renderOwnerInventory() {
  const container = document.getElementById('ownerInventoryList');
  if (!container) {
    return;
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    return;
  }

  const products = getData(STORAGE_KEYS.products, []).filter(product => String(product.ownerId) === String(currentUser.id));

  if (!products.length) {
    container.innerHTML = '<div class="empty-state">Your inventory is empty.</div>';
    return;
  }

  container.innerHTML = products.map(product => `
    <article class="product-card inventory-card">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}" class="product-image" />
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="detail-meta compact">
          <span>${product.category}</span>
          <span>${product.size}</span>
          <span>${product.condition}</span>
        </div>
        <div class="price-controls">
          <label>Sell Price</label>
          <input type="number" min="1" value="${product.sellingPrice || 0}" data-sell-price-input="${product.id}" />
          <label>Rental Price</label>
          <input type="number" min="1" value="${product.rentalPrice || 0}" data-rental-price-input="${product.id}" />
          <label>Availability</label>
          <select data-availability-input="${product.id}">
            <option ${product.availability === 'Available' ? 'selected' : ''}>Available</option>
            <option ${product.availability === 'Sold' ? 'selected' : ''}>Sold</option>
            <option ${product.availability === 'Rented' ? 'selected' : ''}>Rented</option>
            <option ${product.availability === 'Unavailable' ? 'selected' : ''}>Unavailable</option>
          </select>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary btn-small" data-save-inventory="${product.id}">Save</button>
          <button class="btn btn-danger btn-small" data-remove-inventory="${product.id}">Remove</button>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('[data-save-inventory]').forEach(button => {
    button.addEventListener('click', () => saveInventoryItem(button.dataset.saveInventory));
  });

  document.querySelectorAll('[data-remove-inventory]').forEach(button => {
    button.addEventListener('click', () => removeInventoryItem(button.dataset.removeInventory));
  });
}

async function saveInventoryItem(productId) {
  const product = getProductById(productId);
  if (!product) {
    showToast('Inventory item not found.', 'error');
    return;
  }

  const sellField = document.querySelector(`[data-sell-price-input="${productId}"]`);
  const rentalField = document.querySelector(`[data-rental-price-input="${productId}"]`);
  const availabilityField = document.querySelector(`[data-availability-input="${productId}"]`);

  product.sellingPrice = Number(sellField?.value || 0);
  product.rentalPrice = Number(rentalField?.value || 0);
  product.availability = availabilityField?.value || product.availability;
  try { await apiRequest(`/clothes/${product.id}`, { method: 'PUT', body: JSON.stringify({ sellingPrice: product.sellingPrice, rentalPrice: product.rentalPrice, availability: product.availability }) }); }
  catch (error) { showToast(error.message, 'error'); return; }
  showToast('Inventory updated!', 'success');
  renderOwnerInventory();
}

async function removeInventoryItem(productId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const products = getData(STORAGE_KEYS.products, []);
  const productIndex = products.findIndex(product => String(product.id) === String(productId));
  if (productIndex !== -1) {
    const product = products[productIndex];
    if (String(product.ownerId) === String(currentUser.id)) {
      product.ownerId = null;
      product.availability = 'Available';
      try { await apiRequest(`/clothes/${product.id}`, { method: 'PUT', body: JSON.stringify({ ownerId: null, availability: 'Available' }) }); }
      catch (error) { showToast(error.message, 'error'); return; }
    }
  }

  const inventory = getData(STORAGE_KEYS.inventory, []);
  const updatedInventory = inventory.filter(item => String(item.productId) !== String(productId));
  saveData(STORAGE_KEYS.inventory, updatedInventory);
  showToast('Item removed from inventory.', 'success');
  renderOwnerInventory();
}

function renderDashboardStats() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return;
  }

  const userProducts = getUserProducts(currentUser.id);
  const userOrders = getData(STORAGE_KEYS.orders, []).filter(order => String(order.customerId) === String(currentUser.id));
  const userRentals = getData(STORAGE_KEYS.rentals, []).filter(rental => String(rental.customerId) === String(currentUser.id));
  const userDonations = getData(STORAGE_KEYS.donations, []).filter(donation => String(donation.customerId) === String(currentUser.id));

  const uploaded = document.getElementById('dashboardUploaded');
  const orders = document.getElementById('dashboardOrders');
  const rentals = document.getElementById('dashboardRentals');
  const donations = document.getElementById('dashboardDonations');

  if (uploaded) uploaded.textContent = userProducts.length;
  if (orders) orders.textContent = userOrders.length;
  if (rentals) rentals.textContent = userRentals.length;
  if (donations) donations.textContent = userDonations.length;
}
