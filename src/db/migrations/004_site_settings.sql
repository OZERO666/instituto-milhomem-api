-- ============================================================
-- 004_site_settings.sql
-- Executar manualmente no phpMyAdmin (banco u987109917_imilh)
-- ANTES de fazer git pull e restart do Node na Hostinger
-- ============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  setting_key   VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type  ENUM('string','boolean','number','json') DEFAULT 'string',
  description   VARCHAR(255),
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Valores padrão (IGNORE caso já existam)
INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
  ('primary_color',    '#D4AF37', 'string', 'Cor primária (ouro) — botões, destaques, links'),
  ('secondary_color',  '#0A192F', 'string', 'Cor secundária (marinho) — títulos, header escuro'),
  ('accent_color',     '#E5C96A', 'string', 'Cor de destaque — hover de botões e badges'),
  ('background_color', '#FFFFFF', 'string', 'Cor de fundo principal da página'),
  ('foreground_color', '#1A1A1A', 'string', 'Cor do texto principal'),
  ('site_name',        'Instituto Milhomem', 'string', 'Nome do site — exibido em títulos e meta tags');
