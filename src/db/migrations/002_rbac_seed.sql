-- RBAC seed migration
-- Apply manually after 001_rbac_schema.sql

START TRANSACTION;

-- Roles
SET @super_admin_role_id = UUID();
SET @leads_reader_role_id = UUID();
SET @content_editor_role_id = UUID();

INSERT INTO roles (id, name, description)
VALUES
  (@super_admin_role_id, 'super_admin', 'Acesso total ao sistema'),
  (@leads_reader_role_id, 'leads_reader', 'Somente leitura de leads'),
  (@content_editor_role_id, 'content_editor', 'Gestao de conteudo (galeria, depoimentos, blog)')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Permissions (resources: leads, gallery, testimonials, blog, users, dashboard)
INSERT INTO permissions (id, resource, action, description)
VALUES
  (UUID(), 'leads', 'read', 'Ler leads'),
  (UUID(), 'leads', 'create', 'Criar leads'),
  (UUID(), 'leads', 'update', 'Atualizar leads'),
  (UUID(), 'leads', 'delete', 'Excluir leads'),

  (UUID(), 'gallery', 'read', 'Ler galeria'),
  (UUID(), 'gallery', 'create', 'Criar galeria'),
  (UUID(), 'gallery', 'update', 'Atualizar galeria'),
  (UUID(), 'gallery', 'delete', 'Excluir galeria'),

  (UUID(), 'testimonials', 'read', 'Ler depoimentos'),
  (UUID(), 'testimonials', 'create', 'Criar depoimentos'),
  (UUID(), 'testimonials', 'update', 'Atualizar depoimentos'),
  (UUID(), 'testimonials', 'delete', 'Excluir depoimentos'),

  (UUID(), 'blog', 'read', 'Ler blog'),
  (UUID(), 'blog', 'create', 'Criar blog'),
  (UUID(), 'blog', 'update', 'Atualizar blog'),
  (UUID(), 'blog', 'delete', 'Excluir blog'),

  (UUID(), 'users', 'read', 'Ler usuarios'),
  (UUID(), 'users', 'create', 'Criar usuarios'),
  (UUID(), 'users', 'update', 'Atualizar usuarios'),
  (UUID(), 'users', 'delete', 'Excluir usuarios'),

  (UUID(), 'dashboard', 'read', 'Acessar dashboard'),
  (UUID(), 'dashboard', 'create', 'Criar no dashboard'),
  (UUID(), 'dashboard', 'update', 'Atualizar no dashboard'),
  (UUID(), 'dashboard', 'delete', 'Excluir no dashboard')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Resolve role ids from table (works with existing data)
SET @super_admin_role_id = (SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1);
SET @leads_reader_role_id = (SELECT id FROM roles WHERE name = 'leads_reader' LIMIT 1);
SET @content_editor_role_id = (SELECT id FROM roles WHERE name = 'content_editor' LIMIT 1);

-- super_admin: all permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT @super_admin_role_id, p.id
FROM permissions p;

-- leads_reader: only leads:read
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT @leads_reader_role_id, p.id
FROM permissions p
WHERE p.resource = 'leads' AND p.action = 'read';

-- content_editor: create/update/delete on gallery, testimonials, blog
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT @content_editor_role_id, p.id
FROM permissions p
WHERE p.resource IN ('gallery', 'testimonials', 'blog')
  AND p.action IN ('create', 'update', 'delete');

-- Optional: assign super_admin role to users without role
UPDATE users
SET role_id = @super_admin_role_id
WHERE role_id IS NULL;

COMMIT;
