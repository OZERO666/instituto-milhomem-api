-- ============================================================
-- 008_faq_table.sql
-- Tabela de perguntas frequentes (FAQ geral do site)
-- ============================================================

CREATE TABLE IF NOT EXISTS faq (
  id       VARCHAR(36)  NOT NULL PRIMARY KEY,
  pergunta TEXT         NOT NULL,
  resposta TEXT         NOT NULL,
  ordem    INT          NOT NULL DEFAULT 0,
  ativo    TINYINT(1)   NOT NULL DEFAULT 1,
  created  DATETIME     NOT NULL,
  updated  DATETIME     NOT NULL
);
