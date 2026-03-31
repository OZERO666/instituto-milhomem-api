-- ============================================================
-- Migration 002 — Fix schema mismatches + indexes
-- Run once against the production/staging MySQL database.
-- ============================================================

-- -----------------------------------------------------------
-- 1. depoimentos: align column names with frontend form
--    servico  → cargo    (person's role / city)
--    texto    → mensagem (testimonial body)
--    data     → dropped  (not used by frontend)
-- -----------------------------------------------------------
ALTER TABLE depoimentos
  CHANGE COLUMN servico  cargo     VARCHAR(255)  NULL,
  CHANGE COLUMN texto    mensagem  TEXT          NOT NULL;

-- DROP data column only if it exists (safe guard)
ALTER TABLE depoimentos
  DROP COLUMN IF EXISTS data;

-- -----------------------------------------------------------
-- 2. servicos: add missing icon column
-- -----------------------------------------------------------
ALTER TABLE servicos
  ADD COLUMN IF NOT EXISTS icon VARCHAR(100) NULL AFTER nome;

-- -----------------------------------------------------------
-- 3. Indexes for slug uniqueness checks (Fase 9)
--    These back the application-level uniqueness check and
--    also enforce integrity at the DB level.
-- -----------------------------------------------------------
ALTER TABLE servicos
  ADD UNIQUE INDEX IF NOT EXISTS idx_servicos_slug (slug);

ALTER TABLE artigos
  ADD UNIQUE INDEX IF NOT EXISTS idx_artigos_slug (slug);

-- -----------------------------------------------------------
-- 4. Index on servicos.ordem (ORDER BY ordem ASC on every GET)
-- -----------------------------------------------------------
ALTER TABLE servicos
  ADD INDEX IF NOT EXISTS idx_servicos_ordem (ordem);
