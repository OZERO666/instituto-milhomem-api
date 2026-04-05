-- ============================================================
-- Migration 014 — Featured content slots para home dinamica
-- Adds featured_slots table to manage dynamic content highlights.
-- ============================================================

START TRANSACTION;

-- Create featured_slots table (if not exists)
CREATE TABLE IF NOT EXISTS featured_slots (
  id VARCHAR(36) PRIMARY KEY,
  slot_name VARCHAR(80) NOT NULL UNIQUE,
  slot_type ENUM('article','service','testimonial','faq','banner') NOT NULL DEFAULT 'article',
  content_id VARCHAR(255) NULL,
  content_title VARCHAR(255) NOT NULL,
  content_description TEXT NULL,
  image_url VARCHAR(512) NULL,
  featured_order INT NOT NULL DEFAULT 1,
  active TINYINT(1) NOT NULL DEFAULT 1,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_featured_slots_active (active),
  INDEX idx_featured_slots_type (slot_type),
  INDEX idx_featured_slots_dates (start_date, end_date),
  INDEX idx_featured_slots_order (featured_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create featured_click_tracking table for analytics (optional)
CREATE TABLE IF NOT EXISTS featured_click_tracking (
  id VARCHAR(36) PRIMARY KEY,
  featured_slot_id VARCHAR(36) NOT NULL,
  user_agent VARCHAR(512) NULL,
  referrer VARCHAR(512) NULL,
  click_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (featured_slot_id) REFERENCES featured_slots(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_tracking_slot (featured_slot_id),
  INDEX idx_tracking_timestamp (click_timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert example featured slots for sections
INSERT IGNORE INTO featured_slots (id, slot_name, slot_type, content_title, content_description, featured_order, active)
VALUES 
  (UUID(), 'hero_featured_service', 'service', 'Serviço em Destaque', 'Conheça nosso serviço premium', 1, 1),
  (UUID(), 'home_featured_article', 'article', 'Artigo em Destaque', 'Leia nosso conteúdo mais recente', 2, 1),
  (UUID(), 'home_featured_testimonial', 'testimonial', 'Depoimento em Destaque', 'Ouça o que nossos clientes dizem', 3, 1),
  (UUID(), 'faq_highlight', 'faq', 'FAQ Popular', 'Perguntas frequentes importantes', 4, 1);

COMMIT;
