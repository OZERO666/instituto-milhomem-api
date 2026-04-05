-- ============================================================
-- Migration 012 — Campaigning e CTA variants para conversões
-- Adds campaigns table and variant tracking in agendamentos.
-- ============================================================

START TRANSACTION;

-- Create campaigns table (if not exists)
CREATE TABLE IF NOT EXISTS campaigns (
  campaign_slug VARCHAR(120) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_campaigns_active (active),
  INDEX idx_campaigns_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create cta_variants table (if not exists)
CREATE TABLE IF NOT EXISTS cta_variants (
  id VARCHAR(36) PRIMARY KEY,
  campaign_slug VARCHAR(120) NOT NULL,
  variant_name VARCHAR(120) NOT NULL,
  variant_text VARCHAR(255) NOT NULL,
  variant_color VARCHAR(7) NULL DEFAULT '#B8860B',
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_slug) REFERENCES campaigns(campaign_slug) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uk_cta_variants_campaign_name (campaign_slug, variant_name),
  INDEX idx_cta_variants_campaign (campaign_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add campaign_slug column to agendamentos (if not exists)
SET @col_campaign_slug_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'agendamentos'
    AND COLUMN_NAME = 'campaign_slug'
);

SET @sql_add_campaign_slug = IF(
  @col_campaign_slug_exists = 0,
  'ALTER TABLE agendamentos ADD COLUMN campaign_slug VARCHAR(120) COLLATE utf8mb4_general_ci NULL AFTER utm_term',
  'ALTER TABLE agendamentos MODIFY COLUMN campaign_slug VARCHAR(120) COLLATE utf8mb4_general_ci NULL'
);
PREPARE stmt_add_campaign_slug FROM @sql_add_campaign_slug;
EXECUTE stmt_add_campaign_slug;
DEALLOCATE PREPARE stmt_add_campaign_slug;

-- Add cta_variant column to agendamentos (if not exists)
SET @col_cta_variant_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'agendamentos'
    AND COLUMN_NAME = 'cta_variant'
);

SET @sql_add_cta_variant = IF(
  @col_cta_variant_exists = 0,
  'ALTER TABLE agendamentos ADD COLUMN cta_variant VARCHAR(120) COLLATE utf8mb4_general_ci NULL AFTER campaign_slug',
  'ALTER TABLE agendamentos MODIFY COLUMN cta_variant VARCHAR(120) COLLATE utf8mb4_general_ci NULL'
);
PREPARE stmt_add_cta_variant FROM @sql_add_cta_variant;
EXECUTE stmt_add_cta_variant;
DEALLOCATE PREPARE stmt_add_cta_variant;

-- Add foreign key for campaign_slug (if not exists)
SET @fk_campaign_exists = (
  SELECT COUNT(*)
  FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'agendamentos'
    AND CONSTRAINT_NAME = 'fk_agendamentos_campaign'
);

SET @sql_add_fk_campaign = IF(
  @fk_campaign_exists = 0,
  'ALTER TABLE agendamentos ADD CONSTRAINT fk_agendamentos_campaign FOREIGN KEY (campaign_slug) REFERENCES campaigns(campaign_slug) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt_add_fk_campaign FROM @sql_add_fk_campaign;
EXECUTE stmt_add_fk_campaign;
DEALLOCATE PREPARE stmt_add_fk_campaign;

-- Add indexes to agendamentos for new columns
SET @idx_campaign_slug_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'agendamentos'
    AND INDEX_NAME = 'idx_agendamentos_campaign_slug'
);

SET @sql_add_idx_campaign_slug = IF(
  @idx_campaign_slug_exists = 0,
  'ALTER TABLE agendamentos ADD INDEX idx_agendamentos_campaign_slug (campaign_slug)',
  'SELECT 1'
);
PREPARE stmt_add_idx_campaign_slug FROM @sql_add_idx_campaign_slug;
EXECUTE stmt_add_idx_campaign_slug;
DEALLOCATE PREPARE stmt_add_idx_campaign_slug;

SET @idx_cta_variant_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'agendamentos'
    AND INDEX_NAME = 'idx_agendamentos_cta_variant'
);

SET @sql_add_idx_cta_variant = IF(
  @idx_cta_variant_exists = 0,
  'ALTER TABLE agendamentos ADD INDEX idx_agendamentos_cta_variant (cta_variant)',
  'SELECT 1'
);
PREPARE stmt_add_idx_cta_variant FROM @sql_add_idx_cta_variant;
EXECUTE stmt_add_idx_cta_variant;
DEALLOCATE PREPARE stmt_add_idx_cta_variant;

-- Insert example campaign for testing
INSERT IGNORE INTO campaigns (campaign_slug, name, active, start_date, end_date)
VALUES ('early-bird-2025', 'Early Bird 2025', 1, '2025-01-01', '2025-12-31');

-- Insert example CTA variants for early-bird campaign
INSERT IGNORE INTO cta_variants (id, campaign_slug, variant_name, variant_text, variant_color)
VALUES 
  (UUID(), 'early-bird-2025', 'primary', 'Agendar Consulta', '#B8860B'),
  (UUID(), 'early-bird-2025', 'secondary', 'Solicitar Orçamento', '#d4a017'),
  (UUID(), 'early-bird-2025', 'tertiary', 'Falar com Especialista', '#8B6914');

COMMIT;
