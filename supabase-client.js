/* ============================================================
   Showlovein Supabase Client
   Loaded on every page. Provides global `db`, `Auth`, `Cart`, `Reviews`.
   ============================================================ */

// CONFIG: replace with your Supabase project values
// Get these from: Supabase Dashboard > Project Settings > API
window.SUPABASE_CONFIG = window.SUPABASE_CONFIG || {
    url: 'https://YOUR_PROJECT_REF.supabase.co',
    anonKey: 'YOUR_ANON_KEY_HERE'
};

// Wait for supabase global from CDN
const { createClient } = window.supabase;
const db = createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    }
});
window.db = db;

// ===== AUTH =====
window.Auth = {
    async getUser() {
        const { data: { user } } = await db.auth.getUser();
        return user;
    },
    async getSession() {
        const { data: { session } } = await db.auth.getSession();
        return session;
    },
    async signUp(email, password, name) {
        const { data, error } = await db.auth.signUp({
            email, password,
            options: { data: { name } }
        });
        if (!error && data.user) {
            await db.from('customers').upsert({
                auth_user_id: data.user.id,
                email: data.user.email,
                name: name || data.user.email.split('@')[0]
            }, { onConflict: 'email' });
        }
        return { data, error };
    },
    async signIn(email, password) {
        return await db.auth.signInWithPassword({ email, password });
    },
    async signInWithMagicLink(email) {
        return await db.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin + '/index.html' }
        });
    },
    async signInWithGoogle() {
        return await db.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/index.html' }
        });
    },
    async signOut() {
        await db.auth.signOut();
        location.href = 'index.html';
    },
    async isAdmin() {
        const user = await this.getUser();
        if (!user) return false;
        const { data } = await db.from('admin_users')
            .select('role, is_active')
            .eq('auth_user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();
        return !!data;
    },
    async updateUI() {
        const user = await this.getUser();
        const loginLink = document.getElementById('login-link');
        const userMenu = document.getElementById('user-menu');
        if (user && userMenu) {
            if (loginLink) loginLink.style.display = 'none';
            userMenu.style.display = 'flex';
            const nameEl = document.getElementById('user-name');
            if (nameEl) nameEl.textContent = user.user_metadata?.name || user.email;
        } else {
            if (loginLink) loginLink.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }
};

// ===== PRODUCTS =====
window.Products = {
    _cache: null,
    async list() {
        if (this._cache) return this._cache;
        const { data, error } = await db.from('products')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');
        if (error) { console.error('[Products.list]', error); return []; }
        this._cache = data;
        return data;
    },
    async get(id) {
        const { data, error } = await db.from('products')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) console.error('[Products.get]', error);
        return data;
    },
    invalidate() { this._cache = null; }
};

// ===== CART (still localStorage, but synced for logged-in users via cart_items table optionally) =====
window.Cart = {
    get() {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    },
    add(productId, variant, qty = 1) {
        const cart = this.get();
        const existing = cart.find(i => i.productId === productId && JSON.stringify(i.variant) === JSON.stringify(variant));
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ productId, variant, qty });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateBadge();
    },
    remove(index) {
        const cart = this.get();
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateBadge();
    },
    updateQty(index, qty) {
        const cart = this.get();
        if (qty <= 0) cart.splice(index, 1);
        else cart[index].qty = qty;
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateBadge();
    },
    clear() {
        localStorage.removeItem('cart');
        this.updateBadge();
    },
    async getTotal() {
        const products = await Products.list();
        return this.get().reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            return sum + (product ? parseFloat(product.price) * item.qty : 0);
        }, 0);
    },
    getCount() {
        return this.get().reduce((sum, item) => sum + item.qty, 0);
    },
    updateBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const count = this.getCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }
};

// ===== REVIEWS =====
window.Reviews = {
    _cache: null,
    async all() {
        if (this._cache) return this._cache;
        const { data, error } = await db.from('reviews')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        if (error) { console.error('[Reviews.all]', error); return []; }
        this._cache = data;
        return data;
    },
    async forProduct(productId) {
        const all = await this.all();
        return all.filter(r => r.product_id === productId);
    },
    async avg(productId) {
        const reviews = await this.forProduct(productId);
        if (!reviews.length) return 5;
        return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    },
    async count(productId) {
        return (await this.forProduct(productId)).length;
    },
    async total() {
        return (await this.all()).length;
    },
    async submit(productId, payload) {
        // payload: { reviewer_name, reviewer_email, country, rating, text }
        const { data, error } = await db.from('reviews').insert({
            product_id: productId,
            reviewer_name: payload.reviewer_name,
            reviewer_email: payload.reviewer_email,
            country: payload.country,
            rating: payload.rating,
            text: payload.text,
            status: 'pending',
            source: 'website'
        }).select();
        return { data, error };
    },
    starsHtml(rating) {
        const r = Math.round(rating);
        let html = '';
        for (let i = 0; i < 5; i++) {
            html += `<span class="${i < r ? 'text-yellow-500' : 'text-gray-300'}">★</span>`;
        }
        return html;
    },
    countryFlag(country) {
        const flags = { 'United States':'🇺🇸','USA':'🇺🇸','UK':'🇬🇧','United Kingdom':'🇬🇧','Canada':'🇨🇦','Australia':'🇦🇺','Germany':'🇩🇪','France':'🇫🇷','Italy':'🇮🇹','Spain':'🇪🇸','Brazil':'🇧🇷','Mexico':'🇲🇽','Russia':'🇷🇺','Japan':'🇯🇵','Korea':'🇰🇷','China':'🇨🇳','India':'🇮🇳','UAE':'🇦🇪','Saudi Arabia':'🇸🇦','Poland':'🇵🇱','Netherlands':'🇳🇱','Sweden':'🇸🇪','Norway':'🇳🇴','Denmark':'🇩🇰','Finland':'🇫🇮' };
        return flags[country] || '🌍';
    },
    invalidate() { this._cache = null; }
};

// ===== ORDERS =====
window.Orders = {
    async create(orderData) {
        // orderData: { customer_email, customer_name, customer_phone, shipping_address, items, total, payment_id }
        const orderNumber = 'SL' + Date.now() + Math.floor(Math.random() * 1000);
        const user = await Auth.getUser();
        let customerId = null;
        if (user) {
            const { data: customer } = await db.from('customers')
                .select('id')
                .eq('auth_user_id', user.id)
                .maybeSingle();
            customerId = customer?.id;
        }
        // Try to find/create customer by email
        if (!customerId && orderData.customer_email) {
            const { data: existing } = await db.from('customers')
                .select('id')
                .eq('email', orderData.customer_email)
                .maybeSingle();
            if (existing) customerId = existing.id;
            else {
                const { data: newCustomer } = await db.from('customers')
                    .insert({
                        email: orderData.customer_email,
                        name: orderData.customer_name,
                        phone: orderData.customer_phone
                    })
                    .select('id')
                    .single();
                customerId = newCustomer?.id;
            }
        }
        const { data, error } = await db.from('orders').insert({
            order_number: orderNumber,
            customer_id: customerId,
            customer_email: orderData.customer_email,
            customer_name: orderData.customer_name,
            customer_phone: orderData.customer_phone,
            shipping_address: orderData.shipping_address,
            items: orderData.items,
            total: orderData.total,
            subtotal: orderData.subtotal || orderData.total,
            payment_method: orderData.payment_method || 'paypal',
            payment_id: orderData.payment_id,
            payment_status: 'paid',
            order_status: 'paid'
        }).select().single();
        return { data, error, orderNumber };
    },
    async listByEmail(email) {
        const { data, error } = await db.from('orders')
            .select('*')
            .eq('customer_email', email)
            .order('created_at', { ascending: false });
        return { data, error };
    }
};

// ===== AUDIT =====
window.Audit = {
    async log(action, details = {}, resourceType = null, resourceId = null) {
        try {
            const user = await Auth.getUser();
            await db.from('audit_logs').insert({
                actor_email: user?.email || null,
                actor_id: user?.id || null,
                action,
                resource_type: resourceType,
                resource_id: resourceId ? String(resourceId) : null,
                details,
                user_agent: navigator.userAgent.substring(0, 200)
            });
        } catch (e) { console.warn('[Audit.log] failed', e); }
    }
};

// Global init
document.addEventListener('DOMContentLoaded', () => {
    if (window.Cart) Cart.updateBadge();
    if (window.Auth) Auth.updateUI();
});
