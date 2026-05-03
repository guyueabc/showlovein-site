/* ============================================================
   Showlovein Admin Panel - Supabase Integration
   ============================================================ */

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// ===== AUTH & SESSION =====
async function checkAuth() {
    const user = await Auth.getUser();
    if (!user) {
        showLogin();
        return;
    }
    const admin = await Auth.isAdmin();
    if (!admin) {
        alert('Access denied. Admin only.');
        await Auth.signOut();
        showLogin();
        return;
    }
    showAdminPanel();
}

function showLogin() {
    $('#login-screen').classList.remove('hidden');
    $('#admin-screen').classList.add('hidden');
}

function showAdminPanel() {
    $('#login-screen').classList.add('hidden');
    $('#admin-screen').classList.remove('hidden');
    
    Auth.getUser().then(user => {
        if (user) $('#admin-user').textContent = user.email;
    });

    // Tab system
    $$('.tab-btn').forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });
    
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') || 'dashboard';
    switchTab(tab);

    // Logout
    $('#logout-btn').onclick = async () => {
        await Auth.signOut();
        location.reload();
    };

    // Audit
    $('#audit-btn').onclick = showAuditLog;
}

async function switchTab(name) {
    $$('.tab-pane').forEach(p => p.classList.add('hidden'));
    $$('.tab-btn').forEach(b => b.classList.remove('tab-active'));
    $('#tab-' + name).classList.remove('hidden');
    document.querySelector(`[data-tab="${name}"]`).classList.add('tab-active');

    // Update URL without reload
    const url = new URL(location);
    url.searchParams.set('tab', name);
    window.history.pushState({}, '', url);

    if (name === 'dashboard') loadDashboard();
    if (name === 'orders') loadOrders();
    if (name === 'reviews') { currentReviewFilter = 'pending'; loadReviews(); }
}

// ===== LOGIN =====
$('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#email').value;
    const password = $('#password').value;
    const btn = $('#login-btn');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    try {
        const { data, error } = await Auth.signIn(email, password);
        if (error) throw error;
        
        const admin = await Auth.isAdmin();
        if (!admin) {
            alert('Access denied. You are not an admin.');
            await Auth.signOut();
            btn.disabled = false;
            btn.textContent = 'Sign In Securely';
            return;
        }
        
        await Audit.log('login_success');
        location.reload();
    } catch (err) {
        $('#login-error').textContent = err.message;
        $('#login-error').classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Sign In Securely';
    }
});

// ===== DASHBOARD =====
async function loadDashboard() {
    try {
        // Count orders
        const { count: orderCount, data: orders } = await db.from('orders').select('*', { count: 'exact' });
        const revenue = (orders || []).reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
        
        // Count pending reviews
        const { count: pendingReviews } = await db.from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        $('#stat-orders').textContent = orderCount || 0;
        $('#stat-revenue').textContent = '$' + revenue.toFixed(2);
        $('#stat-pending').textContent = pendingReviews || 0;

        const badge = $('#pending-count');
        if (pendingReviews > 0) {
            badge.textContent = pendingReviews;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }

        // Recent Audit
        const { data: logs } = await db.from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(8);
            
        $('#recent-activity').innerHTML = (logs || []).map(a => `
            <div class="flex items-center justify-between py-2 border-b last:border-0">
                <span class="text-gray-700 font-medium">${a.action.replace(/_/g, ' ')}</span>
                <span class="text-xs text-gray-400">${new Date(a.created_at).toLocaleString()}</span>
            </div>
        `).join('') || '<p class="text-gray-400">No activity yet.</p>';
        
    } catch (e) { console.error('Dashboard load failed', e); }
}

// ===== ORDERS =====
async function loadOrders() {
    const tbody = $('#orders-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-10"><span class="spinner"></span> Loading orders...</td></tr>';
    
    const { data: orders, error } = await db.from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !orders || !orders.length) {
        tbody.innerHTML = '';
        $('#no-orders').classList.remove('hidden');
        return;
    }
    $('#no-orders').classList.add('hidden');
    tbody.innerHTML = orders.map(o => {
        const date = new Date(o.created_at).toLocaleString();
        const itemsText = (o.items || []).map(i => `${i.product_title || i.name} ×${i.qty}`).join('<br>');
        return `
            <tr class="border-t hover:bg-gray-50">
                <td class="px-4 py-3 font-mono text-xs">${o.order_number}</td>
                <td class="px-4 py-3 text-xs">${date}</td>
                <td class="px-4 py-3 text-xs">
                    <p class="font-bold">${o.customer_name || '—'}</p>
                    <p class="text-gray-500">${o.customer_email || ''}</p>
                </td>
                <td class="px-4 py-3 text-xs">${itemsText}</td>
                <td class="px-4 py-3 text-right font-bold">$${parseFloat(o.total).toFixed(2)}</td>
                <td class="px-4 py-3 text-center">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${o.order_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                        ${o.order_status}
                    </span>
                </td>
                <td class="px-4 py-3 text-center">
                    <button onclick="viewOrderDetails('${o.id}')" class="text-blue-500 hover:underline text-xs">Details</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function viewOrderDetails(id) {
    const { data: order } = await db.from('orders').select('*').eq('id', id).single();
    if (order) {
        console.log('Order Details:', order);
        alert('Order Number: ' + order.order_number + '\nCustomer: ' + order.customer_name + '\nAddress: ' + JSON.stringify(order.shipping_address, null, 2));
    }
}

function refreshOrders() { loadOrders(); }

// ===== REVIEWS =====
let currentReviewFilter = 'pending';

async function filterReviews(status) {
    currentReviewFilter = status;
    ['pending', 'approved', 'rejected'].forEach(s => {
        const btn = $('#filter-' + s);
        if (s === status) { btn.classList.add('font-bold', 'text-yellow-600'); btn.classList.remove('text-gray-500'); }
        else { btn.classList.remove('font-bold', 'text-yellow-600'); btn.classList.add('text-gray-500'); }
    });
    loadReviews();
}

async function loadReviews() {
    const list = $('#reviews-list');
    list.innerHTML = '<div class="p-10 text-center"><span class="spinner"></span></div>';
    
    const { data: reviews, error } = await db.from('reviews')
        .select('*')
        .eq('status', currentReviewFilter)
        .order('created_at', { ascending: false });

    if (error || !reviews || !reviews.length) {
        list.innerHTML = '';
        $('#no-reviews').classList.remove('hidden');
        return;
    }
    $('#no-reviews').classList.add('hidden');
    list.innerHTML = reviews.map(r => `
        <div class="p-4 hover:bg-gray-50">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <p class="font-semibold">${r.reviewer_name || 'Anonymous'}</p>
                    <p class="text-xs text-gray-500">${r.country || '—'} · Product: ${r.product_id} · ${new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div class="text-yellow-500">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            </div>
            <p class="text-sm text-gray-700 mb-3">${r.text}</p>
            <div class="flex gap-2">
                ${r.status !== 'approved' ? `<button onclick="moderateReview('${r.id}', 'approved')" class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition">Approve</button>` : ''}
                ${r.status !== 'rejected' ? `<button onclick="moderateReview('${r.id}', 'rejected')" class="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition">Reject</button>` : ''}
                <button onclick="deleteReview('${r.id}')" class="text-gray-400 hover:text-red-600 text-xs px-2">Delete</button>
            </div>
        </div>
    `).join('');
}

async function moderateReview(id, status) {
    const { error } = await db.from('reviews').update({ status }).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else {
        await Audit.log('moderate_review', { review_id: id, new_status: status });
        loadReviews();
        loadDashboard();
    }
}

async function deleteReview(id) {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    const { error } = await db.from('reviews').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else {
        await Audit.log('delete_review', { review_id: id });
        loadReviews();
    }
}

// ===== AUDIT LOG =====
async function showAuditLog() {
    const modal = $('#audit-modal');
    modal.classList.remove('hidden');
    const list = $('#audit-list');
    list.innerHTML = '<div class="p-4 text-center"><span class="spinner"></span></div>';
    
    const { data: logs } = await db.from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
    list.innerHTML = (logs || []).map(l => `
        <div class="py-2 border-b">
            <div class="flex justify-between mb-1">
                <span class="font-bold text-gray-900">${l.action}</span>
                <span class="text-gray-400">${new Date(l.created_at).toLocaleString()}</span>
            </div>
            <div class="text-gray-500 overflow-x-auto">
                <p>Actor: ${l.actor_email || 'anonymous'}</p>
                <p>Details: ${JSON.stringify(l.details)}</p>
            </div>
        </div>
    `).join('') || '<p class="p-4 text-gray-400">No logs found.</p>';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
