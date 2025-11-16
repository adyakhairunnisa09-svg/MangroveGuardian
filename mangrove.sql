-- ==========================================
-- MANGROVE GUARDIAN - DATABASE SCHEMA
-- MySQL database untuk aplikasi mangrove
-- ==========================================

-- Create database
CREATE DATABASE IF NOT EXISTS mangrove_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mangrove_db;

-- ==========================================
-- TABLE: users
-- Menyimpan data pengguna
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    avatar VARCHAR(10) DEFAULT '🌿',
    level INT DEFAULT 1,
    points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_points (points),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: adopted_mangroves
-- Mangrove yang diadopsi oleh user (Real Impact)
-- ==========================================
CREATE TABLE IF NOT EXISTS adopted_mangroves (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    mangrove_id VARCHAR(50) UNIQUE NOT NULL,
    adopted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'growing', 'mature') DEFAULT 'active',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: mangrove_progress
-- Progress foto mangrove yang diadopsi
-- ==========================================
CREATE TABLE IF NOT EXISTS mangrove_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mangrove_id VARCHAR(50) NOT NULL,
    photo_url VARCHAR(255),
    height_cm DECIMAL(10,2),
    health_status ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good',
    notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (mangrove_id) REFERENCES adopted_mangroves(mangrove_id) ON DELETE CASCADE,
    INDEX idx_mangrove (mangrove_id),
    INDEX idx_date (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: virtual_gardens
-- Garden virtual pengguna
-- ==========================================
CREATE TABLE IF NOT EXISTS virtual_gardens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    garden_data JSON NOT NULL,
    total_mangroves INT DEFAULT 0,
    last_watered TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_total (total_mangroves)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: friendships
-- Relasi pertemanan antar user
-- ==========================================
CREATE TABLE IF NOT EXISTS friendships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    friend_id VARCHAR(50) NOT NULL,
    status ENUM('pending', 'accepted', 'blocked') DEFAULT 'accepted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (user_id, friend_id),
    INDEX idx_user (user_id),
    INDEX idx_friend (friend_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: friend_interactions
-- Interaksi dengan garden teman (siram, dll)
-- ==========================================
CREATE TABLE IF NOT EXISTS friend_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    friend_id VARCHAR(50) NOT NULL,
    action_type ENUM('water', 'visit', 'gift') NOT NULL,
    points_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_friend (friend_id),
    INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: shop_items
-- Item yang tersedia di shop
-- ==========================================
CREATE TABLE IF NOT EXISTS shop_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    category ENUM('hat', 'shirt', 'accessories', 'shoes', 'special') NOT NULL,
    price INT NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: user_inventory
-- Item yang dimiliki user
-- ==========================================
CREATE TABLE IF NOT EXISTS user_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    item_id INT NOT NULL,
    is_equipped BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES shop_items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_item (user_id, item_id),
    INDEX idx_user (user_id),
    INDEX idx_equipped (is_equipped)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: transactions
-- Transaksi pembayaran
-- ==========================================
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    type ENUM('coins', 'shop_item', 'adoption') NOT NULL,
    amount INT NOT NULL,
    payment_method ENUM('dana', 'gopay', 'ovo', 'shopeepay', 'coins') NOT NULL,
    status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
    item_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: scan_history
-- Riwayat scan mangrove
-- ==========================================
CREATE TABLE IF NOT EXISTS scan_history (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    identified_species VARCHAR(100),
    confidence_score INT,
    scan_result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_species (identified_species),
    INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: chat_messages
-- Riwayat chat dengan AI
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    message_type ENUM('user', 'bot') NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: leaderboard_cache
-- Cache leaderboard untuk performa
-- ==========================================
CREATE TABLE IF NOT EXISTS leaderboard_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    ranking INT NOT NULL,
    total_mangroves INT NOT NULL,
    points INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user (user_id),
    INDEX idx_ranking (ranking)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- INSERT SAMPLE DATA
-- ==========================================

-- Insert sample shop items
INSERT INTO shop_items (name, emoji, category, price, description) VALUES
('Topi Safari', '🎩', 'hat', 500, 'Topi penjelajah hutan mangrove'),
('Topi Petani', '👒', 'hat', 400, 'Topi untuk bekerja di kebun'),
('Kaos Konservasi', '👕', 'shirt', 300, 'Kaos hijau eco-friendly'),
('Kacamata Keren', '🕶️', 'accessories', 400, 'Style untuk guardian sejati'),
('Tas Petualang', '🎒', 'accessories', 600, 'Untuk membawa alat konservasi'),
('Sepatu Boots', '👢', 'shoes', 500, 'Untuk medan berat'),
('Mahkota', '👑', 'hat', 1000, 'Untuk raja/ratu mangrove!');

-- Insert demo user
INSERT INTO users (id, name, email, avatar, level, points) VALUES
('demo_user_1', 'Demo Guardian', 'demo@mangrove.id', '🌿', 5, 1500);

-- ==========================================
-- VIEWS for easier queries
-- ==========================================

-- View: Top users leaderboard
CREATE OR REPLACE VIEW v_leaderboard AS
SELECT 
    u.id,
    u.name,
    u.avatar,
    u.level,
    u.points,
    COUNT(DISTINCT vg.id) as total_gardens,
    COUNT(DISTINCT am.id) as total_adopted
FROM users u
LEFT JOIN virtual_gardens vg ON u.id = vg.user_id
LEFT JOIN adopted_mangroves am ON u.id = am.user_id
GROUP BY u.id, u.name, u.avatar, u.level, u.points
ORDER BY u.points DESC, u.level DESC
LIMIT 100;

-- View: User statistics
CREATE OR REPLACE VIEW v_user_stats AS
SELECT 
    u.id,
    u.name,
    u.points,
    u.level,
    COUNT(DISTINCT am.id) as adopted_count,
    COUNT(DISTINCT sh.id) as scan_count,
    COUNT(DISTINCT t.id) as transaction_count
FROM users u
LEFT JOIN adopted_mangroves am ON u.id = am.user_id
LEFT JOIN scan_history sh ON u.id = sh.user_id
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.name, u.points, u.level;

-- ==========================================
-- STORED PROCEDURES
-- ==========================================

DELIMITER //

-- Procedure: Update leaderboard cache
CREATE PROCEDURE update_leaderboard_cache()
BEGIN
    TRUNCATE TABLE leaderboard_cache;
    
    INSERT INTO leaderboard_cache (user_id, ranking, total_mangroves, points)
    SELECT 
        u.id,
        ROW_NUMBER() OVER (ORDER BY u.points DESC, u.level DESC) as ranking,
        COALESCE(vg.total_mangroves, 0) as total_mangroves,
        u.points
    FROM users u
    LEFT JOIN virtual_gardens vg ON u.id = vg.user_id
    ORDER BY u.points DESC, u.level DESC;
END //

-- Procedure: Award points to user
CREATE PROCEDURE award_points(IN p_user_id VARCHAR(50), IN p_points INT)
BEGIN
    UPDATE users 
    SET points = points + p_points 
    WHERE id = p_user_id;
    
    -- Check for level up
    DECLARE current_level INT; // ini masih error
    DECLARE current_points INT;
    DECLARE next_level_points INT;
    
    SELECT level, points INTO current_level, current_points 
    FROM users WHERE id = p_user_id;
    
    SET next_level_points = current_level * 1000;
    
    IF current_points >= next_level_points THEN
        UPDATE users 
        SET level = level + 1, 
            points = points - next_level_points 
        WHERE id = p_user_id;
    END IF;
END //

DELIMITER ;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger: Update leaderboard after points change
DELIMITER //
CREATE TRIGGER after_user_points_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.points != OLD.points THEN
        CALL update_leaderboard_cache();
    END IF;
END //
DELIMITER ;

-- ==========================================
-- INDEXES for optimization
-- ==========================================

-- Already created above with tables

-- ==========================================
-- GRANT PRIVILEGES (untuk user MySQL)
-- ==========================================

-- GRANT ALL PRIVILEGES ON mangrove_db.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;

-- ==========================================
-- END OF SCHEMA
-- ==========================================