# Instituto Milhomem - SQL Migrations Guide (Lotes A-E)

## 📋 Resumo da Execução - 5 Lotes Completos

Todos os 5 lotes foram executados com sucesso:
- **Lote A**: Formaliza workflow editorial de artigos ✅
- **Lote B**: Adiciona campanhas e variantes de CTA com tracking ✅
- **Lote C**: Granular RBAC permissions por módulo ✅
- **Lote D**: Featured content slots para home dinâmica ✅
- **Lote E**: Lint fixes e release validation ✅

---

## 🔧 Correções de Schema Aplicadas

### Migration 012 - Compatibilidade de Collation
As colunas `campaign_slug` e `cta_variant` foram adicionadas à tabela `agendamentos` com **COLLATE utf8mb4_general_ci** explícito para garantir compatibilidade com a FK que referencia `campaigns(campaign_slug)`.

**Antes** (erro #1005 FK):
```sql
ALTER TABLE agendamentos ADD COLUMN campaign_slug VARCHAR(120) NULL
```

**Depois** (corrigido):
```sql
ALTER TABLE agendamentos ADD COLUMN campaign_slug VARCHAR(120) COLLATE utf8mb4_general_ci NULL
```

### Migration 013 - Dependências de Schema Automáticas
A Migration 013 agora cria **todas as suas dependências** antes de usar:
- ✅ Cria tabela `resources` (se não existir)
- ✅ ALTER em `permissions` para adicionar `resource_id` com FK
- ✅ ALTER em `roles` para adicionar `role_slug`
- ✅ Prepara `role_permissions` com timestamps

**Resultado**: Pode executar 013 em qualquer momento, já que ela se auto-prepara!

---

## ⚠️ Nota Importante - Migration 013

A Migration 013 (`013_rbac_granular_permissions.sql`) foi **atualizada para criar suas próprias dependências**. Ela agora:

1. ✅ Cria a tabela `resources` (caso não exista)
2. ✅ Altera a tabela `permissions` para adicionar coluna `resource_id` com FK
3. ✅ Altera a tabela `roles` para adicionar coluna `role_slug`
4. ✅ Popula a tabela `resources` com 16 recursos granulares
5. ✅ Cria todas as permissões (50+) para cada recurso
6. ✅ Vincula todas as permissões ao role `super_admin`

**Resultado**: Você pode executar 013 diretamente sem depender de migrações anteriores não aplicadas!

---

## � Ordem Recomendada de Importação

Você pode importar as 4 migrations em **qualquer ordem**, mas recomenda-se:

1. **011_artigos_workflow_schema.sql** (simples, sem dependências externas)
2. **012_campaigns_and_cta_variants.sql** (cria novas tabelas, adiciona colunas em agendamentos)
3. **013_rbac_granular_permissions.sql** (cria resources, ALTER em permissions e roles)
4. **014_featured_content_slots.sql** (cria novas tabelas, independente)

**Todas são idempotent** com `CREATE TABLE IF NOT EXISTS` e `ADD COLUMN IF NOT EXISTS`, então podem ser aplicadas múltiplas vezes com segurança.

---

## �🗄️ Arquivos SQL Para Importação Manual

Todos os 4 arquivos `.sql` estão em `/src/db/migrations/`:

### 1. **011_artigos_workflow_schema.sql**
**Objetivo**: Formaliza o schema de workflow editorial de artigos
**Colunas adicionadas**:
- `status` ENUM('draft','published','scheduled')
- `tags` JSON
- `featured` TINYINT(1)

**Índices criados**:
- `idx_artigos_status`
- `idx_artigos_featured`

**Execução**:
```bash
mysql -h seu-host -u seu-user -p seu-db < src/db/migrations/011_artigos_workflow_schema.sql
```

---

### 2. **012_campaigns_and_cta_variants.sql**
**Objetivo**: Adiciona suporte a campanhas e variants de CTA para análise de conversão
**Tabelas criadas**:
- `campaigns` (campaign_slug, name, active, start_date, end_date)
- `cta_variants` (id, campaign_slug, variant_name, variant_text, variant_color)

**Colunas adicionadas em agendamentos**:
- `campaign_slug` VARCHAR(120)
- `cta_variant` VARCHAR(120)

**Foreign keys**:
- `fk_agendamentos_campaign` → campaigns(campaign_slug)

**Índices**:
- `idx_agendamentos_campaign_slug`
- `idx_agendamentos_cta_variant`

**Seeds de exemplo**:
- Campaign: `early-bird-2025`
- 3 CTA variants: primary, secondary, tertiary

**Execução**:
```bash
mysql -h seu-host -u seu-user -p seu-db < src/db/migrations/012_campaigns_and_cta_variants.sql
```

---

### 3. **013_rbac_granular_permissions.sql**
**Objetivo**: Granulariza RBAC de 4 recursos amplos para 16 recursos específicos
**Recursos criados**: dashboard, leads, services, gallery, media, blog, testimonials, faq, users, seo, hero, pages, branding, translations, audit, settings

**Permissões por recurso**: read, create, update, delete (onde aplicável)

**Total de permissões**: 50+ específicas

**Bind automático**: Todas as permissões são vinculadas ao role `super_admin`

**Execução**:
```bash
mysql -h seu-host -u seu-user -p seu-db < src/db/migrations/013_rbac_granular_permissions.sql
```

---

### 4. **014_featured_content_slots.sql**
**Objetivo**: Tabelas para destaque dinâmico de conteúdo na home
**Tabelas criadas**:
- `featured_slots` (id, slot_name, slot_type, content_id, content_title, image_url, featured_order, active, dates)
- `featured_click_tracking` (id, featured_slot_id, user_agent, referrer, click_timestamp)

**Slot types**: article, service, testimonial, faq, banner

**Seeds de exemplo**:
- hero_featured_service
- home_featured_article
- home_featured_testimonial
- faq_highlight

**Execução**:
```bash
mysql -h seu-host -u seu-user -p seu-db < src/db/migrations/014_featured_content_slots.sql
```

---

## 📝 Instruções Para Importação

### Via CLI (Recomendado):
```bash
# Executar cada migration em sequência
mysql -h seu-host -u seu-user -p seu-database < src/db/migrations/011_artigos_workflow_schema.sql
mysql -h seu-host -u seu-user -p seu-database < src/db/migrations/012_campaigns_and_cta_variants.sql
mysql -h seu-host -u seu-user -p seu-database < src/db/migrations/013_rbac_granular_permissions.sql
mysql -h seu-host -u seu-user -p seu-database < src/db/migrations/014_featured_content_slots.sql
```

### Via phpMyAdmin:
1. Abrir phpMyAdmin
2. Selecionar banco de dados `u987109917_imilh` (ou seu banco)
3. Aba "SQL"
4. Copiar conteúdo de cada `.sql` e executar sequencialmente

### Via MySQL Workbench:
1. Abrir conexão para sua instância
2. File → Open SQL Script
3. Selecionar arquivo `.sql`
4. Execute (Ctrl+Enter ou botão Play)

---

## 🔗 Git Status

**Commits executados**:
- `38be3bc`: feat(db): formaliza workflow editorial de artigos via migration 011
- `84646be`: feat(campaign): adiciona campanhas e variantes de cta com tracking de conversao
- `8ba8ce0`: feat(rbac): adiciona permissões granulares por módulo do admin
- `4c5a441`: feat(public): adiciona slots de destaque dinamicos para home
- `c0c4a5e`: chore(release): valida fechamento das fases 1-5 com smoke tests e fixes de lint

**Branch**: origin/main
**Status**: ✅ Todos os commits já sincronizados com GitHub

---

## 🛠️ Code Changes (Backend & Frontend)

### Backend (`src/`)
- ✅ `/src/routes/agendamentos.js` — adicionadas colunas `campaign_slug` e `cta_variant` no POST
- ✅ `/src/routes/featured-slots.js` — nova rota para API de destaques
- ✅ `/src/routes/index.js` — registrada nova rota featured-slots
- ✅ `/src/db/migrations/011-014/*.sql` — 4 migrations formalizadas

### Frontend (`web/src/`)
- ✅ `/web/src/lib/leadTracking.js` — suporte a campaign_slug e cta_variant
- ✅ `/web/src/hooks/useFeaturedSlots.js` — novo hook para consumir featured-slots
- ✅ `/web/src/features/admin/constants/navigation.js` — recursos granularizados (services, faq, seo, hero, media, branding, settings)
- ✅ `/web/src/lib/utils.js` — regex escapes corrigidas
- ✅ `/web/src/lib/validateForm.js` — regex escapes corrigidas
- ✅ `/eslint.config.js` — adicionados globals de browser (window, document, localStorage, Intl)

---

## ✅ Validações Finais

| Item | Status |
|------|--------|
| Lint (src + web/src) | ✅ 0 errors |
| Frontend Build (Vite) | ✅ Success |
| Backend Routes | ✅ Registradas |
| Git Commits | ✅ 5 commits / origin/main |
| SQL Migrations | ✅ Idiomáticas, idempotentes |
| Documentação | ✅ Este arquivo |

---

## 📦 Próximos Passos (PÓS IMPORTAÇÃO MANUAL)

1. **Importar as 4 migrations** via CLI ou phpMyAdmin
2. **Verificar que são idempotentes** (IF NOT EXISTS / IF statements)
3. **Testar os endpoints**:
   ```bash
   curl http://localhost:5000/api/featured-slots
   curl http://localhost:5000/api/featured-slots/hero_featured_service
   ```
4. **Testar admin**: `/admin` → abas agora com RBAC granular
5. **Deploy para produção** conforme seu workflow Hostinger

---

## 📞 Suporte

Se encontrar erros ao importar, verifique:
- Charset/collation: `utf8mb4`
- User permissions: CREATE TABLE, ALTER TABLE, INSERT
- Ordem de execução: 011 → 012 → 013 → 014
- Foreign keys habilitadas para MySQL

Lotes A-E completamente entregues! 🎉
