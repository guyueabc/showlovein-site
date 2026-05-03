-- ============================================================
-- Showlovein Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    short TEXT,
    price NUMERIC(10,2) NOT NULL,
    price_max NUMERIC(10,2),
    image TEXT,
    category TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    variants JSONB DEFAULT '{}'::jsonb,
    stock INTEGER DEFAULT 9999,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- ============================================================
-- 2. CUSTOMERS TABLE (linked to Supabase Auth users)
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    country TEXT,
    address JSONB,
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_auth ON customers(auth_user_id);

-- ============================================================
-- 3. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    shipping_address JSONB,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10,2) DEFAULT 0,
    shipping_fee NUMERIC(10,2) DEFAULT 0,
    tax NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT DEFAULT 'paypal',
    payment_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'pending',
    tracking_number TEXT,
    shipping_carrier TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ============================================================
-- 4. REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    reviewer_name TEXT NOT NULL,
    reviewer_email TEXT,
    country TEXT,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    text TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    is_verified_purchase BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    helpful_count INTEGER DEFAULT 0,
    moderated_at TIMESTAMPTZ,
    moderated_by UUID,
    source TEXT DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ============================================================
-- 5. ADMIN USERS TABLE (for role-based access)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'staff')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. AUDIT LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_email TEXT,
    actor_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================
-- 7. CART ITEMS TABLE (optional, for logged-in users)
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    variant JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

-- ============================================================
-- 8. CONTACT MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    replied_at TIMESTAMPTZ,
    replied_by UUID,
    reply_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);

-- ============================================================
-- TRIGGERS: Auto update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE auth_user_id = auth.uid() AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- POLICIES: products
-- ============================================================
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "products_admin_all" ON products;
CREATE POLICY "products_admin_all" ON products
    FOR ALL USING (is_admin());

-- ============================================================
-- POLICIES: customers
-- ============================================================
DROP POLICY IF EXISTS "customers_self_read" ON customers;
CREATE POLICY "customers_self_read" ON customers
    FOR SELECT USING (auth_user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "customers_self_update" ON customers;
CREATE POLICY "customers_self_update" ON customers
    FOR UPDATE USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "customers_insert_anyone" ON customers;
CREATE POLICY "customers_insert_anyone" ON customers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "customers_admin_all" ON customers;
CREATE POLICY "customers_admin_all" ON customers
    FOR ALL USING (is_admin());

-- ============================================================
-- POLICIES: orders
-- ============================================================
DROP POLICY IF EXISTS "orders_self_read" ON orders;
CREATE POLICY "orders_self_read" ON orders
    FOR SELECT USING (
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
        OR is_admin()
    );

DROP POLICY IF EXISTS "orders_insert_anyone" ON orders;
CREATE POLICY "orders_insert_anyone" ON orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_update" ON orders
    FOR UPDATE USING (is_admin());

-- ============================================================
-- POLICIES: reviews
-- ============================================================
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read" ON reviews
    FOR SELECT USING (status = 'approved' OR is_admin());

DROP POLICY IF EXISTS "reviews_insert_anyone" ON reviews;
CREATE POLICY "reviews_insert_anyone" ON reviews
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
CREATE POLICY "reviews_admin_all" ON reviews
    FOR ALL USING (is_admin());

-- ============================================================
-- POLICIES: admin_users (only super_admin can manage)
-- ============================================================
DROP POLICY IF EXISTS "admin_users_self_read" ON admin_users;
CREATE POLICY "admin_users_self_read" ON admin_users
    FOR SELECT USING (auth_user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "admin_users_admin_all" ON admin_users;
CREATE POLICY "admin_users_admin_all" ON admin_users
    FOR ALL USING (is_admin());

-- ============================================================
-- POLICIES: audit_logs (admin read, anyone insert)
-- ============================================================
DROP POLICY IF EXISTS "audit_admin_read" ON audit_logs;
CREATE POLICY "audit_admin_read" ON audit_logs
    FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "audit_insert_anyone" ON audit_logs;
CREATE POLICY "audit_insert_anyone" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- POLICIES: cart_items
-- ============================================================
DROP POLICY IF EXISTS "cart_self_all" ON cart_items;
CREATE POLICY "cart_self_all" ON cart_items
    FOR ALL USING (
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    );

-- ============================================================
-- POLICIES: contact_messages
-- ============================================================
DROP POLICY IF EXISTS "contact_insert_anyone" ON contact_messages;
CREATE POLICY "contact_insert_anyone" ON contact_messages
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "contact_admin_all" ON contact_messages;
CREATE POLICY "contact_admin_all" ON contact_messages
    FOR ALL USING (is_admin());

-- ============================================================
-- DONE. After this, run 02_seed_data.sql to import products + reviews.
-- ============================================================
SELECT 'Schema created successfully!' AS status;
