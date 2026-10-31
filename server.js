import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
}

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceClient = process.env.SUPABASE_SERVICE_ROLE_KEY ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }) : null;
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function clientFor(token) {
  return createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function ensureProfile(user) {
  const metadata = user.user_metadata || {};
  const profile = {
    id: user.id,
    full_name: metadata.full_name || user.email?.split('@')[0] || 'ReWear User',
    email: user.email,
    phone: metadata.phone || null,
    address: metadata.address || null,
    city: metadata.city || null,
    state: metadata.state || null,
    pincode: metadata.pincode || null,
    role: 'customer'
  };
  if (!serviceClient) return { data: null, error: new Error('Profile is missing and service client is not configured.') };
  return serviceClient.from('profiles').upsert(profile, { onConflict: 'id' }).select().single();
}

async function auth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication required.' });
  const supabase = clientFor(token);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Your session is invalid or expired.' });
  let { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (profileError?.code === 'PGRST116' && serviceClient) ({ data: profile, error: profileError } = await ensureProfile(user));
  if (profileError || !profile) return res.status(403).json({ error: 'User profile is not available.' });
  req.supabase = supabase;
  req.user = user;
  req.profile = profile;
  next();
}

const fail = (res, error, fallback = 'Unable to complete request.') => {
  console.error(error);
  return res.status(400).json({ error: fallback });
};

function mapProfile(row) {
  return {
    id: row.id, fullName: row.full_name, email: row.email, phone: row.phone,
    address: row.address, city: row.city, state: row.state, pincode: row.pincode,
    role: row.role, createdAt: row.created_at
  };
}

function mapProduct(row) {
  return {
    id: row.id, customerId: row.customer_id, ownerId: row.owner_id, ownerName: row.customer?.full_name || null,
    name: row.name, category: row.category, size: row.size, brand: row.brand, condition: row.condition,
    description: row.description, sellingPrice: row.selling_price, rentalPrice: row.rental_price, type: row.type,
    image: row.image_url, status: row.status, availability: row.availability, createdAt: row.created_at
  };
}
function mapOrder(row) {
  return { id: row.id, customerId: row.customer_id, ownerId: row.owner_id, productId: row.product_id, amount: row.amount, address: row.address, phone: row.phone, status: row.status, createdAt: row.created_at };
}
function mapRental(row) {
  return { id: row.id, customerId: row.customer_id, ownerId: row.owner_id, productId: row.product_id, startDate: row.start_date, endDate: row.end_date, rentalPrice: row.rental_price, deposit: row.deposit, totalAmount: row.total_amount, status: row.status, createdAt: row.created_at };
}
function mapDonation(row) {
  return { id: row.id, customerId: row.customer_id, productId: row.product_id, productName: row.product?.name || 'Donation', status: row.status, createdAt: row.created_at };
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/config', (_req, res) => res.json({ supabaseUrl, supabaseAnonKey: anonKey }));
app.get('/api/public/clothes', async (req, res) => {
  const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.from('clothes').select('*, customer:profiles!clothes_customer_id_fkey(full_name)').eq('status', 'Approved').eq('availability', 'Available').in('type', ['Sell', 'Rent']).order('created_at', { ascending: false });
  if (error) return fail(res, error, 'Unable to load products.');
  res.json({ products: data.map(mapProduct) });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName, phone, address, city, state, pincode } = req.body || {};
  if (!email || !password || !fullName) return res.status(400).json({ error: 'Name, email, and password are required.' });
  const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { role: 'customer', full_name: fullName, phone, address, city, state, pincode } } });
  if (error) return res.status(400).json({ error: error.message.includes('already registered') ? 'An account with this email already exists. Please login.' : 'Registration failed. Please check your details.' });
  return res.status(201).json({ user: data.user, session: data.session, message: data.session ? 'Account created successfully!' : 'Account created. Please confirm your email before logging in.' });
});

app.post('/api/auth/login', async (req, res) => {
  const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.signInWithPassword({ email: req.body?.email, password: req.body?.password });
  if (error || !data.session) {
    if (error?.message?.toLowerCase().includes('email not confirmed')) return res.status(403).json({ error: 'Please confirm your email before logging in.' });
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const authed = clientFor(data.session.access_token);
  let { data: profile, error: profileError } = await authed.from('profiles').select('*').eq('id', data.user.id).single();
  if (profileError?.code === 'PGRST116' && serviceClient) ({ data: profile, error: profileError } = await ensureProfile(data.user));
  if (profileError) return fail(res, profileError, 'Unable to load your profile.');
  return res.json({ session: data.session, user: mapProfile(profile) });
});
app.post('/api/auth/logout', auth, async (req, res) => { await req.supabase.auth.signOut(); res.json({ ok: true }); });

app.get('/api/bootstrap', auth, async (req, res) => {
  const { data: profile, error: profileError } = await req.supabase.from('profiles').select('*').eq('id', req.user.id).single();
  if (profileError) return fail(res, profileError);
  let productsQuery = req.supabase.from('clothes').select('*, customer:profiles!clothes_customer_id_fkey(full_name)').order('created_at', { ascending: false });
  if (req.profile.role === 'customer') productsQuery = productsQuery.or(`status.eq.Approved,and(customer_id.eq.${req.user.id},status.neq.Deleted)`);
  const [products, orders, rentals, donations] = await Promise.all([
    productsQuery, req.supabase.from('orders').select('*').order('created_at', { ascending: false }),
    req.supabase.from('rentals').select('*').order('created_at', { ascending: false }),
    req.supabase.from('donations').select('*, product:clothes(name)').order('created_at', { ascending: false })
  ]);
  const users = req.profile.role === 'admin' ? await req.supabase.from('profiles').select('*').order('created_at', { ascending: false }) : { data: [profile], error: null };
  if (products.error || orders.error || rentals.error || donations.error || users.error) return fail(res, products.error || orders.error || rentals.error || donations.error || users.error);
  res.json({ profile: mapProfile(profile), users: users.data.map(mapProfile), products: products.data.map(mapProduct), orders: orders.data.map(mapOrder), rentals: rentals.data.map(mapRental), donations: donations.data.map(mapDonation) });
});

app.get('/api/profile', auth, (req, res) => res.json({ profile: mapProfile(req.profile) }));
app.put('/api/profile', auth, async (req, res) => {
  const allowed = ['full_name', 'phone', 'address', 'city', 'state', 'pincode'];
  const updates = Object.fromEntries(allowed.filter(key => req.body?.[key] !== undefined).map(key => [key, req.body[key]]));
  if (req.body?.password) {
    const { error: passwordError } = await req.supabase.auth.updateUser({ password: req.body.password });
    if (passwordError) return fail(res, passwordError, 'Unable to update your password.');
  }
  const { data, error } = await req.supabase.from('profiles').update(updates).eq('id', req.user.id).select().single();
  if (error) return fail(res, error, 'Unable to update your profile.');
  res.json({ profile: mapProfile(data) });
});
app.delete('/api/admin/users/:id', auth, async (req, res) => {
  if (req.profile.role !== 'admin' || !serviceClient) return res.status(403).json({ error: 'Admin user deletion is not configured.' });
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own admin account.' });
  const { error } = await serviceClient.auth.admin.deleteUser(req.params.id);
  if (error) return fail(res, error, 'Unable to delete user.');
  res.json({ ok: true });
});

app.post('/api/clothes', auth, upload.single('image'), async (req, res) => {
  if (req.profile.role !== 'customer') return res.status(403).json({ error: 'Only customers can upload clothing.' });
  if (!req.file) return res.status(400).json({ error: 'A JPG, PNG, or WEBP image under 5MB is required.' });
  const body = req.body;
  if (!['Sell', 'Rent', 'Donate'].includes(body.type)) return res.status(400).json({ error: 'Choose Sell, Rent, or Donate as the listing type.' });
  const requiredFields = ['name', 'category', 'size', 'brand', 'condition', 'description'];
  if (requiredFields.some(field => !String(body[field] || '').trim())) return res.status(400).json({ error: 'Please complete all clothing details.' });
  if (Number(body.sellingPrice) <= 0 || Number(body.rentalPrice) <= 0) return res.status(400).json({ error: 'Selling and rental prices must be positive.' });
  const ext = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg');
  const filePath = `${req.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error: imageError } = await req.supabase.storage.from('clothes').upload(filePath, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
  if (imageError) return fail(res, imageError, 'Image upload failed.');
  const { data: publicUrl } = req.supabase.storage.from('clothes').getPublicUrl(filePath);
  const { data, error } = await req.supabase.from('clothes').insert({ customer_id: req.user.id, name: body.name, category: body.category, size: body.size, brand: body.brand, condition: body.condition, description: body.description, selling_price: Number(body.sellingPrice), rental_price: Number(body.rentalPrice), type: body.type, image_path: filePath, image_url: publicUrl.publicUrl }).select('*, customer:profiles!clothes_customer_id_fkey(full_name)').single();
  if (error) {
    const { error: cleanupError } = await req.supabase.storage.from('clothes').remove([filePath]);
    if (cleanupError) console.error('Unable to remove uploaded image after listing save failed.', cleanupError);
    return fail(res, error, 'Unable to save clothing details. Check the listing type and database schema.');
  }
  res.status(201).json({ product: mapProduct(data) });
});
app.patch('/api/clothes/:id/status', auth, async (req, res) => {
  if (!['owner', 'admin'].includes(req.profile.role)) return res.status(403).json({ error: 'Only authorized owners can change product status.' });
  const { status } = req.body || {};
  if (!['Pending', 'Approved', 'Rejected'].includes(status)) return res.status(400).json({ error: 'Status must be Pending, Approved, or Rejected.' });
  const { error } = await req.supabase.rpc('set_clothing_status', { p_product_id: req.params.id, p_status: status });
  if (error) return fail(res, error, 'Unable to update product status.');
  const { data, error: productError } = await req.supabase.from('clothes').select('*, customer:profiles!clothes_customer_id_fkey(full_name)').eq('id', req.params.id).single();
  if (productError) return fail(res, productError, 'Unable to load updated clothing.');
  res.json({ product: mapProduct(data) });
});
app.put('/api/clothes/:id', auth, async (req, res) => {
  const customerFields = {
    name: 'name', category: 'category', size: 'size', brand: 'brand', condition: 'condition',
    description: 'description', sellingPrice: 'selling_price', rentalPrice: 'rental_price'
  };
  if (req.profile.role === 'customer') {
    if (['status', 'ownerId', 'availability', 'type'].some(field => req.body?.[field] !== undefined)) {
      return res.status(403).json({ error: 'Customers cannot change listing type, ownership, availability, or approval status.' });
    }
    const updates = Object.fromEntries(Object.entries(customerFields)
      .filter(([field]) => req.body?.[field] !== undefined)
      .map(([field, column]) => [column, req.body[field]]));
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No editable clothing details were provided.' });
    const { data, error } = await req.supabase.from('clothes').update(updates).eq('id', req.params.id).eq('customer_id', req.user.id)
      .select('*, customer:profiles!clothes_customer_id_fkey(full_name)').single();
    if (error) return fail(res, error, 'Unable to update clothing.');
    return res.json({ product: mapProduct(data) });
  }
  if (!['owner', 'admin'].includes(req.profile.role)) return res.status(403).json({ error: 'You are not authorized to update clothing.' });
  const ownerFields = ['sellingPrice', 'rentalPrice', 'availability', 'ownerId'];
  if (Object.keys(req.body || {}).some(field => !ownerFields.includes(field))) return res.status(400).json({ error: 'Owners can only change inventory details here.' });
  const setOwner = Object.prototype.hasOwnProperty.call(req.body || {}, 'ownerId');
  const { error } = await req.supabase.rpc('update_owner_clothing', {
    p_product_id: req.params.id,
    p_selling_price: req.body?.sellingPrice ?? null,
    p_rental_price: req.body?.rentalPrice ?? null,
    p_availability: req.body?.availability ?? null,
    p_owner_id: req.body?.ownerId ?? null,
    p_set_owner: setOwner
  });
  if (error) return fail(res, error, 'Unable to update clothing inventory.');
  const { data, error: productError } = await req.supabase.from('clothes').select('*, customer:profiles!clothes_customer_id_fkey(full_name)').eq('id', req.params.id).single();
  if (productError) return fail(res, productError, 'Unable to load updated clothing.');
  res.json({ product: mapProduct(data) });
});
app.delete('/api/clothes/:id', auth, async (req, res) => { const { error } = await req.supabase.from('clothes').delete().eq('id', req.params.id); if (error) return fail(res, error, 'Unable to delete clothing.'); res.json({ ok: true }); });

app.post('/api/orders', auth, async (req, res) => {
  if (req.profile.role !== 'customer') return res.status(403).json({ error: 'Only customers can place orders.' });
  const { productId, address, phone } = req.body || {};
  if (!productId || !address || !phone) return res.status(400).json({ error: 'Product, address, and phone are required.' });
  const { data, error } = await req.supabase.rpc('create_clothing_order', { p_product_id: productId, p_address: address, p_phone: phone });
  if (error) return fail(res, error, 'Unable to place order.');
  res.status(201).json({ order: mapOrder(data) });
});
app.get('/api/orders', auth, async (req, res) => { const { data, error } = await req.supabase.from('orders').select('*').order('created_at', { ascending: false }); if (error) return fail(res, error); res.json({ orders: data.map(mapOrder) }); });
app.patch('/api/orders/:id', auth, async (req, res) => { if (!['owner', 'admin'].includes(req.profile.role)) return res.status(403).json({ error: 'Only owners and admins can update orders.' }); const { data, error } = await req.supabase.from('orders').update({ status: req.body?.status }).eq('id', req.params.id).select().single(); if (error) return fail(res, error, 'Unable to update order.'); res.json({ order: mapOrder(data) }); });

app.post('/api/rentals', auth, async (req, res) => {
  if (req.profile.role !== 'customer') return res.status(403).json({ error: 'Only customers can submit rentals.' });
  const { productId, startDate, endDate } = req.body || {};
  const { data, error } = await req.supabase.rpc('create_clothing_rental', {
    p_product_id: productId,
    p_start_date: startDate,
    p_end_date: endDate
  });
  if (error) return fail(res, error, 'Unable to submit rental.');
  res.status(201).json({ rental: mapRental(data) });
});
app.get('/api/rentals', auth, async (req, res) => { const { data, error } = await req.supabase.from('rentals').select('*').order('created_at', { ascending: false }); if (error) return fail(res, error); res.json({ rentals: data.map(mapRental) }); });
app.patch('/api/rentals/:id', auth, async (req, res) => { if (!['owner', 'admin'].includes(req.profile.role)) return res.status(403).json({ error: 'Only owners and admins can update rentals.' }); const { data, error } = await req.supabase.from('rentals').update({ status: req.body?.status }).eq('id', req.params.id).select().single(); if (error) return fail(res, error, 'Unable to update rental.'); res.json({ rental: mapRental(data) }); });
app.get('/api/donations', auth, async (req, res) => { const { data, error } = await req.supabase.from('donations').select('*, product:clothes(name)').order('created_at', { ascending: false }); if (error) return fail(res, error); res.json({ donations: data.map(mapDonation) }); });
app.patch('/api/donations/:id', auth, async (req, res) => { if (req.profile.role !== 'admin') return res.status(403).json({ error: 'Only admins can update donations.' }); const { data, error } = await req.supabase.from('donations').update({ status: req.body?.status }).eq('id', req.params.id).select('*, product:clothes(name)').single(); if (error) return fail(res, error, 'Unable to update donation.'); res.json({ donation: mapDonation(data) }); });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname));
app.use((error, _req, res, _next) => { if (error instanceof multer.MulterError || error.message) return res.status(400).json({ error: 'Upload failed. Check the image type and size.' }); res.status(500).json({ error: 'Unexpected server error.' }); });
const port = Number(process.env.PORT) || 3000;
app.listen(port, '0.0.0.0', () => console.log(`ReWear server listening on port ${port}`));
