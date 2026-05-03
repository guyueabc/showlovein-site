-- ============================================================
-- Showlovein Seed Data
-- Run AFTER 01_schema.sql
-- ============================================================

-- Clear existing test data (safe to skip on first run)
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE products CASCADE;

-- ============================================================
-- PRODUCTS (8 items)
-- ============================================================
INSERT INTO products (id, title, short, price, price_max, image, category, description, features, variants, sort_order, is_active) VALUES (
    'p1',
    '0.07mm 3D 4D 5D Clover Lashes Crisscross Custom Logo Auto Fan Brazilian Volume Lash Extensions',
    'Clover Lashes 0.07mm Brazilian Volume',
    2.49,
    3.99,
    'images/p1.jpg',
    'Eyelash Extensions',
    'Korean PBT Fiber Material: Made from high-quality Korean PBT fiber, ensuring durability and a natural look for extended wear. Auto-fanning crisscross design saves application time. Available in multiple curls and lengths. Perfect for professional lash artists creating Brazilian volume sets.',
    '["Korean PBT Fiber","Auto-Fanning Design","Custom Logo Available","8-15mm Length","C/CC/D/DD Curls"]'::jsonb,
    '{"Curl":["C","CC","D","DD"],"Length":["8mm","10mm","12mm","14mm","Mix 8-15mm"]}'::jsonb,
    0,
    TRUE
);
INSERT INTO products (id, title, short, price, price_max, image, category, description, features, variants, sort_order, is_active) VALUES (
    'p2',
    'Cashmere Matte Dark Volume Lashes Extension Tray Soft Fluffy Vegan',
    'Cashmere Matte Volume Lashes',
    1.59,
    2.29,
    'images/p2.jpg',
    'Eyelash Extensions',
    'Cashmere matte dark volume lashes with soft fluffy texture. 100% vegan and cruelty-free. Available in 0.03/0.05/0.07mm thickness with all popular curls (J, B, C, CC, D, DD, L). Ultra-soft and lightweight for comfortable extended wear.',
    '["Vegan & Cruelty-Free","Matte Dark Finish","Ultra Soft","Multiple Thicknesses"]'::jsonb,
    '{"Thickness":["0.03mm","0.05mm","0.07mm"],"Curl":["J","B","C","CC","D","DD","L"]}'::jsonb,
    1,
    TRUE
);
INSERT INTO products (id, title, short, price, price_max, image, category, description, features, variants, sort_order, is_active) VALUES (
    'p3',
    'Most Popular Lash Extensions Cashmere 0.03 0.05mm Individual Volume Korean Silk',
    'Korean Silk Individual Volume Lashes',
    1.59,
    2.29,
    'images/p3.jpg',
    'Eyelash Extensions',
    'Our best-selling Korean Silk individual volume lashes. Premium cashmere material in 0.03 and 0.05mm thickness. Private label service available with custom packaging.',
    '["Korean Silk Material","Private Label Available","Best Seller","0.03/0.05mm"]'::jsonb,
    '{"Thickness":["0.03mm","0.05mm"],"Curl":["C","CC","D","DD"]}'::jsonb,
    2,
    TRUE
);
INSERT INTO products (id, title, short, price, price_max, image, category, description, features, variants, sort_order, is_active) VALUES (
    'p4',
    'Luxury Eyelash Shampoo Kit for Sensitive Eyes Vegan Foam Cleanser',
    'Luxury Eyelash Shampoo Kit',
    2.39,
    3.99,
    'images/p4.jpg',
    'Lash Care',
    'Complete luxury eyelash shampoo kit including foam cleanser, brush, and applicator. Specifically formulated for sensitive eyes. 100% vegan, cruelty-free, oil-free formula that maintains lash extension retention.',
    '["Sensitive Eye Formula","Oil-Free","Includes Brush & Applicator","Vegan"]'::jsonb,
    '{"Volume":["50ml","100ml","250ml"],"Color":["Pink","White","Black","Nude"]}'::jsonb,
    3,
    TRUE
);
INSERT INTO products (id, title, short, price, price_max, image, category, description, features, variants, sort_order, is_active) VALUES (
    'p5',
    'Cashmere Lash Extensions Silk Wholesale Mega Volume 0.03 0.05mm Trays',
    'Wholesale Mega Volume Lash Trays',
    1.59,
    2.29,
    'images/p5.jpg',
    'Eyelash Extensions',
    'Wholesale mega volume lash trays for salons and distributors. Premium cashmere silk material. MOQ-friendly pricing for bulk orders. Multiple curl and length options available.',
    '["Wholesale Pricing","Mega Volume","Salon Grade","Bulk Orders Welcome"]'::jsonb,
    '{"Thickness":["0.03mm","0.05mm"],"Curl":["C","CC","D","DD"]}'::jsonb,
    4,
    TRUE
);
INSERT INTO products (id, title, short, price, price_max, image, category, description, features, variants, sort_order, is_active) VALUES (
    'p6',
    'Stock 0.05mm 6D 7D 8D Pre Made Fans Lashes Extension 10D 12D Premade Volume Fans',
    'Premade Volume Fans 6D-12D',
    1.89,
    2.69,
    'images/p6.jpg',
    'Premade Fans',
    'Pre-made volume fans available in 6D, 7D, 8D, 10D, and 12D options. Short stem and long stem variations. Pointy base for easy and secure application. Stock availability for fast shipping.',
    '["6D-12D Options","Short/Long Stem","Pointy Base","In Stock"]'::jsonb,
    '{"Density":["6D","7D","8D","10D","12D"],"Stem":["Short Stem","Long Stem"]}'::jsonb,
    5,
    TRUE
);
INSERT INTO products (id, title, short, price, price_max, image, category, description, features, variants, sort_order, is_active) VALUES (
    'p7',
    'Professional 5W White Black UV Glue Lamp for Lash Extensions LED Light Beauty Salon',
    'Professional UV Glue LED Lamp 5W',
    35,
    69,
    'images/p7.jpg',
    'Lash Tools',
    'Professional 5W UV/LED glue curing lamp for lash extension salons. Instantly cures lash adhesive in 1-3 seconds. Available in white and black. Perfect for high-volume salons and improving retention rates.',
    '["5W LED/UV","1-3 Sec Cure Time","Salon Grade","White/Black Color"]'::jsonb,
    '{"Color":["White","Black"],"Power":["5W","10W"]}'::jsonb,
    6,
    TRUE
);
INSERT INTO products (id, title, short, price, price_max, image, category, description, features, variants, sort_order, is_active) VALUES (
    'p8',
    'Pink White Diamond Bottle 5g 10g Eyelash Glue Remover Fast Safe Jelly Gel Cream',
    'Diamond Bottle Glue Remover',
    0.89,
    1.49,
    'images/p8.jpg',
    'Lash Care',
    'Premium jelly gel cream eyelash glue remover in elegant diamond-shaped bottle. Available in 5g and 10g sizes. Fast and safe removal without irritation. Pink and white bottle options for retail beauty.',
    '["Diamond Bottle Design","Jelly Gel Formula","5g/10g Sizes","Fast & Safe"]'::jsonb,
    '{"Size":["5g","10g"],"Color":["Pink","White"]}'::jsonb,
    7,
    TRUE
);

-- ============================================================
-- REVIEWS (50 items)
-- ============================================================
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'T T***a',
    NULL,
    'India',
    5,
    'Eyelash Glue is perfect and long lasting . Best in the world product',
    'approved',
    'imported',
    TRUE,
    '2026-03-31'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'T T***a',
    NULL,
    'India',
    5,
    'The best ever false eyelash . it''s out of this world',
    'approved',
    'imported',
    TRUE,
    '2026-03-31'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'B B***a',
    NULL,
    'Albania',
    5,
    'The threads are soft, they come out very beautiful in the work, they produce an excellent result.',
    'approved',
    'imported',
    TRUE,
    '2026-03-30'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'B B***a',
    NULL,
    'Albania',
    5,
    'Every product I have purchased has been crafted with detail and premium quality.',
    'approved',
    'imported',
    TRUE,
    '2026-03-30'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'T T***a',
    NULL,
    'India',
    5,
    'Each item was neatly packed, showing good attention to detail.',
    'approved',
    'imported',
    TRUE,
    '2026-01-28'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'J J***i',
    NULL,
    'United States',
    5,
    'I am beyond impressed with these cashmere lash trays! The quality is top tier — super soft, deep black, and easy to fan. The strips peel off smoothly without leaving residue. The curl holds beautifully and the lashes tray keep their shape throughout the entire appointment. My clients have been loving the retention and lightweight feel. I highly recommend it',
    'approved',
    'imported',
    TRUE,
    '2026-04-22'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'E E***C',
    NULL,
    'United States',
    5,
    'Lashes were super soft and buttery will order again!',
    'approved',
    'imported',
    TRUE,
    '2026-04-17'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'E E***i',
    NULL,
    'Canada',
    5,
    'Delivery : good lashes Service: great service',
    'approved',
    'imported',
    TRUE,
    '2026-03-24'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'V V***o',
    NULL,
    'United States',
    5,
    'Amazing! Daisy is so easy to work with shipping is accurate. Trays are overall good they fan like butter, Daisy is supper communitative and replies all questions and concerns! Definitely will be purchasing again, best on the market!',
    'approved',
    'imported',
    TRUE,
    '2026-03-19'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'A A***k',
    NULL,
    'United Kingdom',
    5,
    'Very high quality, I will only buy from this supplier.',
    'approved',
    'imported',
    TRUE,
    '2026-01-05'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'G G***z',
    NULL,
    'United States',
    5,
    'Labels came out beautifully, cleanses lashes well. Arrived very quickly as well!',
    'approved',
    'imported',
    TRUE,
    '2026-04-23'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'J J***i',
    NULL,
    'United States',
    5,
    'Love these premade lashes fans and the supplier sends them out quick, Amazing responsive and fast shipping exactly what i want every time',
    'approved',
    'imported',
    TRUE,
    '2026-04-22'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'J J***i',
    NULL,
    'United States',
    5,
    'I love eyelash glue remover, I would definitely buy it again, I love the quality and speed of this supplier.',
    'approved',
    'imported',
    TRUE,
    '2026-04-22'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'J J***i',
    NULL,
    'United States',
    5,
    'I am very satisfied with the showlovein eyelash glue and 6-8 week retention is the best. Great quality products and customer service is at it best i won’t go anywhere else for sure.',
    'approved',
    'imported',
    TRUE,
    '2026-04-22'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'S S***h',
    NULL,
    'Australia',
    5,
    'The Korean silk lashes are so soft and natural. My clients prefer these over any other brand. Excellent quality!',
    'approved',
    'imported',
    TRUE,
    '2025-11-12'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'L M***s',
    NULL,
    'Mexico',
    5,
    'Me encantan las pestañas de trébol. Son muy fáciles de aplicar y el resultado es muy voluminoso. Envío rápido a México.',
    'approved',
    'imported',
    TRUE,
    '2026-02-15'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'K K***n',
    NULL,
    'Germany',
    5,
    'Wholesale trays are perfect for my salon. The quality is consistent across all boxes. Mega volume results are amazing.',
    'approved',
    'imported',
    TRUE,
    '2026-04-01'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'P P***r',
    NULL,
    'France',
    5,
    'The UV LED lamp is a game changer. The glue cures instantly and retention is noticeably better. Highly recommend for professional use.',
    'approved',
    'imported',
    TRUE,
    '2026-03-10'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'R R***o',
    NULL,
    'Brazil',
    5,
    'Shampoo kit is very high quality. The foam is gentle but effective. My clients love the smell too!',
    'approved',
    'imported',
    TRUE,
    '2026-04-25'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'M M***l',
    NULL,
    'United States',
    5,
    'Best matte lashes I''ve used. They are dark and soft. No blue tint at all. Very easy to work with.',
    'approved',
    'imported',
    TRUE,
    '2026-04-28'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'H H***n',
    NULL,
    'United Kingdom',
    4,
    'Good quality silk lashes. They are very lightweight. Delivery took a bit longer than expected but the product is worth it.',
    'approved',
    'imported',
    TRUE,
    '2026-01-20'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'A A***a',
    NULL,
    'Canada',
    5,
    'These premade fans save me so much time! They are perfectly symmetrical and the bases are thin.',
    'approved',
    'imported',
    TRUE,
    '2026-04-05'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'C C***o',
    NULL,
    'Italy',
    5,
    'The diamond bottle remover is very chic and works fast. No irritation reported by my clients. 5 stars!',
    'approved',
    'imported',
    TRUE,
    '2026-02-28'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'J D***e',
    NULL,
    'United States',
    5,
    'Clover lashes are my new favorite. They create a beautiful crisscross effect that clients love. Will be ordering more.',
    'approved',
    'imported',
    TRUE,
    '2026-04-15'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'S W***s',
    NULL,
    'Australia',
    5,
    'Fast shipping to Australia. The cashmere lashes are incredibly soft. Best supplier I''ve found on Alibaba.',
    'approved',
    'imported',
    TRUE,
    '2026-03-05'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'F G***a',
    NULL,
    'Spain',
    5,
    'Kit de champú excelente. Muy profesional y bien empaquetado. A mis clientes les encanta.',
    'approved',
    'imported',
    TRUE,
    '2026-04-10'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'N N***i',
    NULL,
    'Japan',
    5,
    'Very high quality mega volume trays. The lashes are uniform and easy to pick up. Thank you!',
    'approved',
    'imported',
    TRUE,
    '2026-01-15'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'O O***v',
    NULL,
    'Poland',
    5,
    'UV lamp works perfectly. It''s compact and powerful. The glue that comes with it is also great.',
    'approved',
    'imported',
    TRUE,
    '2026-03-25'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'D D***n',
    NULL,
    'United States',
    5,
    'These individual silk lashes are high quality and don''t lose their curl. Great value for the price.',
    'approved',
    'imported',
    TRUE,
    '2026-04-20'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'E E***m',
    NULL,
    'Netherlands',
    5,
    'Premade fans are beautiful. They make volume sets so much easier for my staff. Consistent quality.',
    'approved',
    'imported',
    TRUE,
    '2026-02-10'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'G G***i',
    NULL,
    'Romania',
    5,
    'Strong but gentle remover. The gel consistency is perfect and doesn''t run into the eyes.',
    'approved',
    'imported',
    TRUE,
    '2026-04-01'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'K K***s',
    NULL,
    'Greece',
    5,
    'Best clover lashes on the market. The quality is exceptional and the price is very competitive.',
    'approved',
    'imported',
    TRUE,
    '2025-12-20'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'L L***u',
    NULL,
    'Vietnam',
    5,
    'Cashmere lashes are so soft! My clients are very happy. Fast shipping to Vietnam.',
    'approved',
    'imported',
    TRUE,
    '2026-03-15'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'M M***o',
    NULL,
    'Portugal',
    5,
    'O kit de shampoo é fantástico. Qualidade superior e entrega rápida. Recomendo vivamente.',
    'approved',
    'imported',
    TRUE,
    '2026-04-18'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'P P***l',
    NULL,
    'India',
    5,
    'Wholesale order arrived quickly. The trays are well made and the lashes are very dark.',
    'approved',
    'imported',
    TRUE,
    '2026-02-05'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'Q Q***u',
    NULL,
    'South Korea',
    5,
    'The UV glue system is excellent. It saves so much time during appointments. Very professional seller.',
    'approved',
    'imported',
    TRUE,
    '2026-04-12'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'R R***s',
    NULL,
    'Philippines',
    5,
    'Korean silk lashes are perfect for Asian clients. They look very natural and soft.',
    'approved',
    'imported',
    TRUE,
    '2026-03-30'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'T T***n',
    NULL,
    'Thailand',
    5,
    'Premade fans are high quality. They don''t fall apart when picking them up. Fast delivery.',
    'approved',
    'imported',
    TRUE,
    '2026-01-25'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'U U***h',
    NULL,
    'Turkey',
    5,
    'Glue remover is very effective. The diamond bottle looks very luxurious in my salon.',
    'approved',
    'imported',
    TRUE,
    '2026-04-05'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'V V***a',
    NULL,
    'Chile',
    5,
    'Las pestañas trébol son increíbles. Calidad de primera y el vendedor es muy amable.',
    'approved',
    'imported',
    TRUE,
    '2026-02-18'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'W W***g',
    NULL,
    'Singapore',
    5,
    'Cashmere lashes are the best. They are easy to fan and have a great curl retention.',
    'approved',
    'imported',
    TRUE,
    '2026-03-22'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'X X***o',
    NULL,
    'Argentina',
    5,
    'Kit de limpieza muy bueno. El diseño de la marca privada quedó perfecto. Gracias!',
    'approved',
    'imported',
    TRUE,
    '2026-04-15'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'Y Y***i',
    NULL,
    'Israel',
    5,
    'High quality volume trays. Consistent across all my orders. The shipping is fast.',
    'approved',
    'imported',
    TRUE,
    '2026-01-30'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'Z Z***o',
    NULL,
    'Belgium',
    5,
    'UV LED lamp is a must-have. It works perfectly with the UV glue. Excellent service.',
    'approved',
    'imported',
    TRUE,
    '2026-04-20'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'A B***c',
    NULL,
    'Croatia',
    5,
    'Korean silk lashes are very soft. Best quality I''ve seen in a while. Will buy again.',
    'approved',
    'imported',
    TRUE,
    '2026-03-10'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'C D***e',
    NULL,
    'Denmark',
    5,
    'Premade fans are perfect. They are symmetrical and easy to use. Highly recommended.',
    'approved',
    'imported',
    TRUE,
    '2026-02-25'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'E F***g',
    NULL,
    'Sweden',
    5,
    'Effective glue remover. No strong smell and works very quickly. Good supplier.',
    'approved',
    'imported',
    TRUE,
    '2026-04-08'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'G H***i',
    NULL,
    'Finland',
    5,
    'Clover lashes are high quality and easy to work with. Fast delivery to Finland.',
    'approved',
    'imported',
    TRUE,
    '2026-01-12'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'I J***n',
    NULL,
    'Norway',
    5,
    'Cashmere lashes are super soft. My clients love the deep black color. Best supplier.',
    'approved',
    'imported',
    TRUE,
    '2026-03-28'
);
INSERT INTO reviews (product_id, reviewer_name, reviewer_email, country, rating, text, status, source, is_verified_purchase, created_at) VALUES (
    NULL,
    'K L***z',
    NULL,
    'Switzerland',
    5,
    'Lash shampoo kit is perfect. Very professional and the logo printing is high quality.',
    'approved',
    'imported',
    TRUE,
    '2026-04-22'
);

SELECT 'Seeded ' || (SELECT COUNT(*) FROM products) || ' products and ' || (SELECT COUNT(*) FROM reviews) || ' reviews' AS result;

