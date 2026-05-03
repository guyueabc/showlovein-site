// Convert products.js + reviews.js to SQL INSERT statements
// Usage: node generate_seed.js > 02_seed_data.sql

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

// Load products
const productsCode = fs.readFileSync(path.join(projectRoot, 'products.js'), 'utf8');
eval(productsCode.replace('const PRODUCTS', 'global.PRODUCTS').replace('const Cart', 'var Cart').replace('const Auth', 'var Auth'));

// Load reviews
const reviewsCode = fs.readFileSync(path.join(projectRoot, 'reviews.js'), 'utf8');
eval(reviewsCode.replace('const REVIEWS', 'global.REVIEWS').replace('const Reviews', 'var Reviews'));

const sqlEscape = (s) => {
    if (s === null || s === undefined) return 'NULL';
    if (typeof s === 'number') return s;
    if (typeof s === 'boolean') return s ? 'TRUE' : 'FALSE';
    return "'" + String(s).replace(/'/g, "''") + "'";
};

const jsonEscape = (obj) => {
    if (!obj) return "'{}'::jsonb";
    return "'" + JSON.stringify(obj).replace(/'/g, "''") + "'::jsonb";
};

let sql = `-- ============================================================
-- Showlovein Seed Data
-- Run AFTER 01_schema.sql
-- ============================================================

-- Clear existing test data (safe to skip on first run)
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE products CASCADE;

-- ============================================================
-- PRODUCTS (${PRODUCTS.length} items)
-- ============================================================
`;

PRODUCTS.forEach((p, i) => {
    sql += `INSERT INTO products (id, title, short, price, price_max, image, category, description, features, variants, sort_order, is_active) VALUES (
    ${sqlEscape(p.id)},
    ${sqlEscape(p.title)},
    ${sqlEscape(p.short)},
    ${p.price},
    ${p.price_max || 'NULL'},
    ${sqlEscape(p.image)},
    ${sqlEscape(p.category)},
    ${sqlEscape(p.description)},
    ${jsonEscape(p.features || [])},
    ${jsonEscape(p.variants || {})},
    ${i},
    TRUE
);\n`;
});

sql += `\n-- ============================================================
-- REVIEWS (${REVIEWS.length} items)
-- ============================================================
`;

REVIEWS.forEach(r => {
    sql += `INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    ${sqlEscape(r.productId)},
    ${sqlEscape(r.reviewer || 'Anonymous')},
    ${sqlEscape(r.email || null)},
    ${sqlEscape(r.country || null)},
    ${r.rating},
    ${sqlEscape(r.text)},
    'approved',
    ${sqlEscape(r.source || 'imported')},
    TRUE,
    ${r.date ? sqlEscape(r.date) : 'NOW()'}
);\n`;
});

sql += `\nSELECT 'Seeded ' || (SELECT COUNT(*) FROM products) || ' products and ' || (SELECT COUNT(*) FROM reviews) || ' reviews' AS result;
`;

console.log(sql);
