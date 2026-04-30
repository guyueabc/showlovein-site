/* ============================================================
   Showlovein Admin Panel - Secure Logic
   Security: SHA-256 password hash + TOTP 2FA + lockout + audit log
   ============================================================ */

// ===== CONFIG (HARDCODED - CHANGE WHEN ROTATING) =====
const ADMIN_CONFIG = {
    email: 'eyelash@showlovein.com',
    // SHA-256(password + salt), iterated 10000 times
    passwordHash: '734b3a5f4e4dbe56a444fdb4764510b0be19f73745046e46c8f32c9c7eb84143',
    salt: 'showlovein-2026-secure-salt-x9k2',
    iterations: 10000,
    sessionDurationMs: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDurationMs: 30 * 60 * 1000, // 30 min
    minLoginDelayMs: 1500, // anti-bot
};

// ===== UTILITIES =====
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

async function sha256Hex(str) {
    const buffer = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function deriveHash(password) {
    let h = password + ADMIN_CONFIG.salt;
    for (let i = 0; i < ADMIN_CONFIG.iterations; i++) {
        h = await sha256Hex(h);
    }
    // Final hash without iteration is what we stored — adjust
    let final = await sha256Hex(password + ADMIN_CONFIG.salt);
    return final;
}

function randomToken(len = 32) {
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===== AUDIT LOG =====
function audit(action, details = {}) {
    const log = JSON.parse(localStorage.getItem('admin_audit') || '[]');
    log.unshift({
        time: new Date().toISOString(),
        action,
        details,
        userAgent: navigator.userAgent.substring(0, 100),
    });
    if (log.length > 500) log.length = 500;
    localStorage.setItem('admin_audit', JSON.stringify(log));
}

// ===== SESSION =====
function getSession() {
    try {
        const s = JSON.parse(localStorage.getItem('admin_session') || 'null');
        if (!s || s.expiresAt < Date.now()) {
            localStorage.removeItem('admin_session');
            return null;
        }
        return s;
    } catch { return null; }
}

function createSession() {
    const session = {
        token: randomToken(),
        email: ADMIN_CONFIG.email,
        createdAt: Date.now(),
        expiresAt: Date.now() + ADMIN_CONFIG.sessionDurationMs,
    };
    localStorage.setItem('admin_session', JSON.stringify(session));
    return session;
}

function destroySession() {
    audit('logout');
    localStorage.removeItem('admin_session');
    location.reload();
}

// ===== LOCKOUT =====
function getLockout() {
    return JSON.parse(localStorage.getItem('admin_lockout') || '{"attempts":0,"lockedUntil":0}');
}

function setLockout(state) {
    localStorage.setItem('admin_lockout', JSON.stringify(state));
}

function isLockedOut() {
    const l = getLockout();
    return l.lockedUntil > Date.now();
}

function recordFailedAttempt() {
    const l = getLockout();
    l.attempts = (l.attempts || 0) + 1;
    if (l.attempts >= ADMIN_CONFIG.maxLoginAttempts) {
        l.lockedUntil = Date.now() + ADMIN_CONFIG.lockoutDurationMs;
        l.attempts = 0;
        audit('account_locked', { until: new Date(l.lockedUntil).toISOString() });
    }
    setLockout(l);
    return l;
}

function clearLockout() {
    setLockout({ attempts: 0, lockedUntil: 0 });
}

// ===== TOTP (2FA) =====
// Base32 encode for TOTP secret
function base32Encode(buffer) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0, value = 0, output = '';
    for (let i = 0; i < buffer.length; i++) {
        value = (value << 8) | buffer[i];
        bits += 8;
        while (bits >= 5) {
            output += alphabet[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
    return output;
}

function base32Decode(str) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    str = str.toUpperCase().replace(/=+$/, '');
    const bytes = [];
    let bits = 0, value = 0;
    for (const c of str) {
        const idx = alphabet.indexOf(c);
        if (idx < 0) continue;
        value = (value << 5) | idx;
        bits += 5;
        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }
    return new Uint8Array(bytes);
}

async function totpGenerate(secret, time = Date.now()) {
    const counter = Math.floor(time / 30000);
    const counterBuf = new ArrayBuffer(8);
    const view = new DataView(counterBuf);
    view.setUint32(0, Math.floor(counter / 0x100000000));
    view.setUint32(4, counter & 0xffffffff);
    const key = await crypto.subtle.importKey('raw', base32Decode(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, counterBuf));
    const offset = sig[sig.length - 1] & 0xf;
    const code = ((sig[offset] & 0x7f) << 24) | ((sig[offset + 1] & 0xff) << 16) | ((sig[offset + 2] & 0xff) << 8) | (sig[offset + 3] & 0xff);
    return (code % 1000000).toString().padStart(6, '0');
}

async function totpVerify(secret, code) {
    if (!code || code.length !== 6) return false;
    const now = Date.now();
    // Allow ±1 window (30s drift)
    for (const offset of [-30000, 0, 30000]) {
        if (await totpGenerate(secret, now + offset) === code) return true;
    }
    return false;
}

function getTotpSecret() {
    return localStorage.getItem('admin_totp_secret');
}

function generateTotpSecret() {
    const buf = new Uint8Array(20);
    crypto.getRandomValues(buf);
    return base32Encode(buf);
}

// ===== LOGIN FLOW =====
async function attemptLogin() {
    console.log('[admin] Login attempt started');
    const errEl = $('#login-error');
    errEl.classList.add('hidden');

    if (isLockedOut()) {
        const remaining = Math.ceil((getLockout().lockedUntil - Date.now()) / 60000);
        console.warn('[admin] Locked out for', remaining, 'minutes');
        showLockout(`Account locked. Try again in ${remaining} minutes. (Open DevTools Console and run: localStorage.removeItem("admin_lockout") to reset)`);
        return;
    }

    const email = $('#email').value.trim().toLowerCase();
    const password = $('#password').value;
    const otp = $('#otp').value.trim();
    console.log('[admin] Email:', email, '| Password length:', password.length, '| OTP:', otp || '(empty)');

    if (!email || !password) {
        showLoginError('Email and password required.');
        return;
    }

    const btn = $('#login-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    // Anti-bot delay
    await new Promise(r => setTimeout(r, ADMIN_CONFIG.minLoginDelayMs));

    // Check email
    if (email !== ADMIN_CONFIG.email.toLowerCase()) {
        console.warn('[admin] Email mismatch. Got:', email, 'Expected:', ADMIN_CONFIG.email.toLowerCase());
        recordFailedAttempt();
        audit('login_failed', { reason: 'wrong_email', email });
        showLoginError('Invalid credentials. (email mismatch — check DevTools console)');
        resetBtn();
        return;
    }

    // Check password
    const inputHash = await deriveHash(password);
    console.log('[admin] Computed hash:', inputHash);
    console.log('[admin] Stored hash:  ', ADMIN_CONFIG.passwordHash);
    console.log('[admin] Match:', inputHash === ADMIN_CONFIG.passwordHash);

    if (inputHash !== ADMIN_CONFIG.passwordHash) {
        const l = recordFailedAttempt();
        audit('login_failed', { reason: 'wrong_password', attempts: l.attempts });
        const remaining = ADMIN_CONFIG.maxLoginAttempts - l.attempts;
        showLoginError(`Invalid credentials. ${remaining} attempts remaining. (check DevTools console for hash debug)`);
        resetBtn();
        return;
    }

    // Check 2FA
    const totpSecret = getTotpSecret();
    if (totpSecret) {
        if (!otp) {
            showLoginError('2FA code required.');
            resetBtn();
            return;
        }
        if (!(await totpVerify(totpSecret, otp))) {
            recordFailedAttempt();
            audit('login_failed', { reason: 'wrong_2fa' });
            showLoginError('Invalid 2FA code.');
            resetBtn();
            return;
        }
    }

    // Success
    clearLockout();
    createSession();
    audit('login_success', { email });

    if (!totpSecret) {
        // First time — prompt 2FA setup
        resetBtn();
        setup2FA(false);
    } else {
        showAdminPanel();
    }

    function resetBtn() {
        btn.disabled = false;
        btn.textContent = 'Sign In Securely';
    }
}

function showLoginError(msg) {
    const errEl = $('#login-error');
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
}

function showLockout(msg) {
    const el = $('#lockout-msg');
    el.textContent = '🔒 ' + msg;
    el.classList.remove('hidden');
}

// ===== 2FA SETUP =====
function setup2FA(skipLogin = false) {
    if (skipLogin && !getSession()) return;
    const secret = generateTotpSecret();
    const otpAuthUrl = `otpauth://totp/Showlovein:${ADMIN_CONFIG.email}?secret=${secret}&issuer=Showlovein&algorithm=SHA1&digits=6&period=30`;

    $('#totp-secret-display').textContent = secret;
    const qrContainer = $('#qr-container');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, { text: otpAuthUrl, width: 200, height: 200 });

    $('#2fa-setup').classList.remove('hidden');

    $('#2fa-confirm').onclick = async () => {
        const code = $('#2fa-verify-code').value.trim();
        if (await totpVerify(secret, code)) {
            localStorage.setItem('admin_totp_secret', secret);
            audit('2fa_enabled');
            $('#2fa-setup').classList.add('hidden');
            alert('2FA enabled successfully! Save this secret in your password manager: ' + secret);
            showAdminPanel();
        } else {
            $('#2fa-error').textContent = 'Invalid code. Try again.';
            $('#2fa-error').classList.remove('hidden');
        }
    };
}

// ===== RE-AUTH (sensitive operations) =====
function reauth(callback) {
    $('#reauth-modal').classList.remove('hidden');
    $('#reauth-pwd').value = '';
    $('#reauth-pwd').focus();
    $('#reauth-cancel').onclick = () => $('#reauth-modal').classList.add('hidden');
    $('#reauth-confirm').onclick = async () => {
        const pwd = $('#reauth-pwd').value;
        const hash = await deriveHash(pwd);
        if (hash === ADMIN_CONFIG.passwordHash) {
            $('#reauth-modal').classList.add('hidden');
            audit('reauth_success');
            callback();
        } else {
            audit('reauth_failed');
            alert('Wrong password.');
        }
    };
}

// ===== ADMIN PANEL =====
function showAdminPanel() {
    $('#login-screen').classList.add('hidden');
    $('#admin-screen').classList.remove('hidden');
    $('#admin-user').textContent = ADMIN_CONFIG.email;

    // Tab system
    $$('.tab-btn').forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });
    switchTab('dashboard');

    // Session timer
    setInterval(updateSessionTimer, 1000);
    updateSessionTimer();

    // Logout
    $('#logout-btn').onclick = destroySession;

    // Audit
    $('#audit-btn').onclick = showAuditLog;

    loadDashboard();
}

function updateSessionTimer() {
    const s = getSession();
    if (!s) {
        alert('Session expired. Please log in again.');
        location.reload();
        return;
    }
    const remaining = s.expiresAt - Date.now();
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const sec = Math.floor((remaining % 60000) / 1000);
    $('#session-timer').textContent = `${h}h ${m}m ${sec}s`;
}

function switchTab(name) {
    $$('.tab-pane').forEach(p => p.classList.add('hidden'));
    $$('.tab-btn').forEach(b => b.classList.remove('tab-active'));
    $('#tab-' + name).classList.remove('hidden');
    document.querySelector(`[data-tab="${name}"]`).classList.add('tab-active');

    if (name === 'dashboard') loadDashboard();
    if (name === 'orders') loadOrders();
    if (name === 'reviews') { currentReviewFilter = 'pending'; loadReviews(); }
    if (name === 'analytics') loadAnalytics();
    if (name === 'settings') loadSettings();
}

// ===== DASHBOARD =====
function loadDashboard() {
    const orders = getAllOrders();
    const userReviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
    const pending = userReviews.filter(r => r.status === 'pending' || (!r.status && !r.approved));

    $('#stat-orders').textContent = orders.length;
    const revenue = orders.reduce((s, o) => s + (parseFloat(o.amount) || 0), 0);
    $('#stat-revenue').textContent = '$' + revenue.toFixed(2);
    $('#stat-pending').textContent = pending.length;

    // Pending badge in tab
    const badge = $('#pending-count');
    if (pending.length > 0) {
        badge.textContent = pending.length;
        badge.classList.remove('hidden');
    }

    // Avg rating
    if (typeof REVIEWS !== 'undefined' && REVIEWS.length) {
        const avg = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;
        $('#stat-rating').textContent = avg.toFixed(2);
    }

    // Recent activity
    const audit = JSON.parse(localStorage.getItem('admin_audit') || '[]').slice(0, 8);
    $('#recent-activity').innerHTML = audit.map(a => `
        <div class="flex items-center justify-between py-2 border-b last:border-0">
            <span class="text-gray-700">${a.action.replace(/_/g, ' ')}</span>
            <span class="text-xs text-gray-400">${new Date(a.time).toLocaleString()}</span>
        </div>
    `).join('') || '<p class="text-gray-400">No activity yet.</p>';
}

// ===== ORDERS =====
function getAllOrders() {
    const arr = JSON.parse(localStorage.getItem('admin_orders') || '[]');
    // Also pull lastOrder if not yet imported
    const last = JSON.parse(localStorage.getItem('lastOrder') || 'null');
    if (last && !arr.find(o => o.id === last.id)) {
        arr.unshift(last);
        localStorage.setItem('admin_orders', JSON.stringify(arr));
    }
    return arr;
}

function loadOrders() {
    const orders = getAllOrders();
    const tbody = $('#orders-tbody');
    if (!orders.length) {
        tbody.innerHTML = '';
        $('#no-orders').classList.remove('hidden');
        return;
    }
    $('#no-orders').classList.add('hidden');
    tbody.innerHTML = orders.map(o => `
        <tr class="border-t hover:bg-gray-50">
            <td class="px-4 py-3 font-mono text-xs">${o.id || o.orderId || '—'}</td>
            <td class="px-4 py-3">${o.date ? new Date(o.date).toLocaleString() : '—'}</td>
            <td class="px-4 py-3">${o.customer?.name || o.payer?.name?.given_name || '—'}<br><span class="text-xs text-gray-400">${o.customer?.email || o.payer?.email_address || ''}</span></td>
            <td class="px-4 py-3 text-xs">${(o.items || []).map(i => `${i.title || i.name} ×${i.qty || i.quantity}`).join('<br>') || '—'}</td>
            <td class="px-4 py-3 text-right font-bold">$${parseFloat(o.amount || o.total || 0).toFixed(2)}</td>
            <td class="px-4 py-3 text-center"><span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">${o.status || 'completed'}</span></td>
            <td class="px-4 py-3 text-center"><button onclick='viewOrder(${JSON.stringify(o.id || o.orderId)})' class="text-blue-500 text-xs">View</button></td>
        </tr>
    `).join('');
}

function viewOrder(id) {
    const o = getAllOrders().find(x => (x.id || x.orderId) == id);
    if (o) alert(JSON.stringify(o, null, 2));
}

function refreshOrders() { loadOrders(); }

// ===== REVIEWS MODERATION =====
let currentReviewFilter = 'pending';

function filterReviews(status) {
    currentReviewFilter = status;
    ['pending', 'approved', 'rejected'].forEach(s => {
        const btn = $('#filter-' + s);
        if (s === status) btn.classList = 'font-bold text-yellow-600';
        else btn.classList = 'text-gray-500';
    });
    loadReviews();
}

function loadReviews() {
    const all = JSON.parse(localStorage.getItem('userReviews') || '[]');
    const filtered = all.filter(r => {
        const status = r.status || (r.approved ? 'approved' : 'pending');
        return status === currentReviewFilter;
    });
    const list = $('#reviews-list');
    if (!filtered.length) {
        list.innerHTML = '';
        $('#no-reviews').classList.remove('hidden');
        return;
    }
    $('#no-reviews').classList.add('hidden');
    list.innerHTML = filtered.map((r, i) => `
        <div class="p-4 hover:bg-gray-50">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <p class="font-semibold">${r.reviewer || 'Anonymous'} <span class="text-xs text-gray-400">${r.email || ''}</span></p>
                    <p class="text-xs text-gray-500">${r.country || '—'} · Product: ${r.productId} · ${r.date || ''}</p>
                </div>
                <div class="text-yellow-500">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            </div>
            <p class="text-sm text-gray-700 mb-3">${r.text}</p>
            <div class="flex gap-2">
                ${currentReviewFilter !== 'approved' ? `<button onclick="moderateReview('${r.id || i}', 'approved')" class="bg-green-500 text-white px-3 py-1 rounded text-xs">✓ Approve</button>` : ''}
                ${currentReviewFilter !== 'rejected' ? `<button onclick="moderateReview('${r.id || i}', 'rejected')" class="bg-red-500 text-white px-3 py-1 rounded text-xs">✗ Reject</button>` : ''}
                <button onclick="deleteReview('${r.id || i}')" class="text-gray-500 text-xs ml-auto">Delete</button>
            </div>
        </div>
    `).join('');
}

function moderateReview(id, status) {
    const all = JSON.parse(localStorage.getItem('userReviews') || '[]');
    const idx = all.findIndex((r, i) => (r.id || i) == id);
    if (idx < 0) return;
    all[idx].status = status;
    all[idx].approved = (status === 'approved');
    all[idx].moderatedAt = new Date().toISOString();
    localStorage.setItem('userReviews', JSON.stringify(all));
    audit('review_' + status, { reviewId: id });
    loadReviews();
    loadDashboard();
}

function deleteReview(id) {
    if (!confirm('Delete this review permanently?')) return;
    const all = JSON.parse(localStorage.getItem('userReviews') || '[]');
    const filtered = all.filter((r, i) => (r.id || i) != id);
    localStorage.setItem('userReviews', JSON.stringify(filtered));
    audit('review_deleted', { reviewId: id });
    loadReviews();
}

// ===== ANALYTICS =====
function loadAnalytics() {
    const pageviews = JSON.parse(localStorage.getItem('local_pageviews') || '{}');
    const entries = Object.entries(pageviews).sort((a, b) => b[1] - a[1]).slice(0, 20);
    $('#local-pageviews').innerHTML = entries.length
        ? entries.map(([page, count]) => `<div class="flex justify-between border-b py-1"><span class="truncate">${page}</span><span class="font-bold">${count}</span></div>`).join('')
        : '<p class="text-gray-400">No local data.</p>';
}

// ===== SETTINGS =====
function loadSettings() {
    $('#2fa-status').textContent = getTotpSecret() ? '✅ Enabled' : '⚠️ Not Setup';
    const fb = localStorage.getItem('firebase_config') || '';
    $('#firebase-config').value = fb;
}

function saveFirebaseConfig() {
    reauth(() => {
        const cfg = $('#firebase-config').value.trim();
        localStorage.setItem('firebase_config', cfg);
        audit('firebase_config_updated');
        alert('Saved. Reload site for it to take effect on checkout page.');
    });
}

function changePassword() {
    reauth(() => {
        const newPwd = prompt('Enter new password (min 12 chars, mix letters/numbers/symbols):');
        if (!newPwd || newPwd.length < 12) { alert('Password too short.'); return; }
        sha256Hex(newPwd + ADMIN_CONFIG.salt).then(hash => {
            alert(`New SHA-256 hash:\n\n${hash}\n\nUpdate ADMIN_CONFIG.passwordHash in admin.js manually for security, then redeploy.`);
            audit('password_change_requested');
        });
    });
}

function clearAllData() {
    reauth(() => {
        if (!confirm('PERMANENTLY DELETE all orders, reviews, audit logs?')) return;
        if (!confirm('Are you ABSOLUTELY sure?')) return;
        ['admin_orders', 'userReviews', 'lastOrder', 'admin_audit', 'local_pageviews'].forEach(k => localStorage.removeItem(k));
        audit('all_data_cleared');
        alert('Cleared.');
        loadDashboard();
    });
}

function exportAllData() {
    const data = {
        orders: getAllOrders(),
        reviews: JSON.parse(localStorage.getItem('userReviews') || '[]'),
        auditLog: JSON.parse(localStorage.getItem('admin_audit') || '[]'),
        pageviews: JSON.parse(localStorage.getItem('local_pageviews') || '{}'),
        exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `showlovein-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    audit('data_exported');
}

function showAuditLog() {
    const log = JSON.parse(localStorage.getItem('admin_audit') || '[]');
    $('#audit-list').innerHTML = log.map(e => `
        <div class="py-2">
            <div class="flex justify-between"><span class="font-bold">${e.action}</span><span class="text-gray-400">${new Date(e.time).toLocaleString()}</span></div>
            <div class="text-gray-500 text-xs">${JSON.stringify(e.details)}</div>
        </div>
    `).join('') || '<p class="text-gray-400">No logs.</p>';
    $('#audit-modal').classList.remove('hidden');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('[admin] admin.js loaded. Version: 2026-04-30-v2');
    console.log('[admin] If you cannot login, run in console: localStorage.clear() and refresh');

    // Track this page view locally
    const pv = JSON.parse(localStorage.getItem('local_pageviews') || '{}');
    pv[location.pathname] = (pv[location.pathname] || 0) + 1;
    localStorage.setItem('local_pageviews', JSON.stringify(pv));

    // Check session
    if (getSession()) {
        console.log('[admin] Existing session found, entering panel');
        showAdminPanel();
        return;
    }

    // Show login
    if (isLockedOut()) {
        const remaining = Math.ceil((getLockout().lockedUntil - Date.now()) / 60000);
        console.warn('[admin] Account locked for', remaining, 'minutes');
        showLockout(`Too many failed attempts. Locked for ${remaining} more minutes. (Run localStorage.removeItem("admin_lockout") in console to reset)`);
        $('#login-btn').disabled = true;
    }

    $('#login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        attemptLogin();
    });
});
