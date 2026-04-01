-- ============================================================
-- Migration 002 — Fix schema mismatches + indexes
-- Run once against the production/staging MySQL database.
-- ============================================================

-- 1) depoimentos: align column names with frontend form (idempotent)
--    servico -> cargo
--    texto   -> mensagem
--    data    -> drop when exists
SET @col_servico_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'depoimentos'
    AND COLUMN_NAME = 'servico'
);

SET @col_cargo_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'depoimentos'
    AND COLUMN_NAME = 'cargo'
);

SET @sql_depo_servico = IF(
  @col_servico_exists = 1 AND @col_cargo_exists = 0,
  'ALTER TABLE depoimentos CHANGE COLUMN servico cargo VARCHAR(255) NULL',
  'SELECT 1'
);
PREPARE stmt_depo_servico FROM @sql_depo_servico;
EXECUTE stmt_depo_servico;
DEALLOCATE PREPARE stmt_depo_servico;

SET @col_texto_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'depoimentos'
    AND COLUMN_NAME = 'texto'
);

SET @col_mensagem_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'depoimentos'
    AND COLUMN_NAME = 'mensagem'
);

SET @sql_depo_texto = IF(
  @col_texto_exists = 1 AND @col_mensagem_exists = 0,
  'ALTER TABLE depoimentos CHANGE COLUMN texto mensagem TEXT NOT NULL',
  'SELECT 1'
);
PREPARE stmt_depo_texto FROM @sql_depo_texto;
EXECUTE stmt_depo_texto;
DEALLOCATE PREPARE stmt_depo_texto;

SET @col_data_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'depoimentos'
    AND COLUMN_NAME = 'data'
);

SET @sql_depo_drop_data = IF(
  @col_data_exists = 1,
  'ALTER TABLE depoimentos DROP COLUMN data',
  'SELECT 1'
);
PREPARE stmt_depo_drop_data FROM @sql_depo_drop_data;
EXECUTE stmt_depo_drop_data;
DEALLOCATE PREPARE stmt_depo_drop_data;

-- Guarantee expected types on current columns
SET @col_cargo_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'depoimentos'
    AND COLUMN_NAME = 'cargo'
);

SET @sql_depo_cargo_type = IF(
  @col_cargo_exists = 1,
  'ALTER TABLE depoimentos MODIFY COLUMN cargo VARCHAR(255) NULL',
  'SELECT 1'
);
PREPARE stmt_depo_cargo_type FROM @sql_depo_cargo_type;
EXECUTE stmt_depo_cargo_type;
DEALLOCATE PREPARE stmt_depo_cargo_type;

SET @col_mensagem_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'depoimentos'
    AND COLUMN_NAME = 'mensagem'
);

SET @sql_depo_mensagem_type = IF(
  @col_mensagem_exists = 1,
  'ALTER TABLE depoimentos MODIFY COLUMN mensagem TEXT NOT NULL',
  'SELECT 1'
);
PREPARE stmt_depo_mensagem_type FROM @sql_depo_mensagem_type;
EXECUTE stmt_depo_mensagem_type;
DEALLOCATE PREPARE stmt_depo_mensagem_type;

-- 2) servicos: add missing icon column (idempotent)
SET @col_servicos_icon_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'servicos'
    AND COLUMN_NAME = 'icon'
);

SET @sql_servicos_icon = IF(
  @col_servicos_icon_exists = 0,
  'ALTER TABLE servicos ADD COLUMN icon VARCHAR(100) NULL AFTER nome',
  'SELECT 1'
);
PREPARE stmt_servicos_icon FROM @sql_servicos_icon;
EXECUTE stmt_servicos_icon;
DEALLOCATE PREPARE stmt_servicos_icon;

-- 3) Unique indexes for slug checks (idempotent)
SET @idx_servicos_slug_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'servicos'
    AND INDEX_NAME = 'idx_servicos_slug'
);

SET @sql_idx_servicos_slug = IF(
  @idx_servicos_slug_exists = 0,
  'ALTER TABLE servicos ADD UNIQUE INDEX idx_servicos_slug (slug)',
  'SELECT 1'
);
PREPARE stmt_idx_servicos_slug FROM @sql_idx_servicos_slug;
EXECUTE stmt_idx_servicos_slug;
DEALLOCATE PREPARE stmt_idx_servicos_slug;

SET @idx_artigos_slug_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'artigos'
    AND INDEX_NAME = 'idx_artigos_slug'
);

SET @sql_idx_artigos_slug = IF(
  @idx_artigos_slug_exists = 0,
  'ALTER TABLE artigos ADD UNIQUE INDEX idx_artigos_slug (slug)',
  'SELECT 1'
);
PREPARE stmt_idx_artigos_slug FROM @sql_idx_artigos_slug;
EXECUTE stmt_idx_artigos_slug;
DEALLOCATE PREPARE stmt_idx_artigos_slug;

-- 4) Index on servicos.ordem (idempotent)
SET @idx_servicos_ordem_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'servicos'
    AND INDEX_NAME = 'idx_servicos_ordem'
);

SET @sql_idx_servicos_ordem = IF(
  @idx_servicos_ordem_exists = 0,
  'ALTER TABLE servicos ADD INDEX idx_servicos_ordem (ordem)',
  'SELECT 1'
);
PREPARE stmt_idx_servicos_ordem FROM @sql_idx_servicos_ordem;
EXECUTE stmt_idx_servicos_ordem;
DEALLOCATE PREPARE stmt_idx_servicos_ordem;
