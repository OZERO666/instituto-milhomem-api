// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Tabs, TabsContent } from '@/components/ui/tabs.jsx';
import api from '@/lib/apiServerClient';
import { logAction, deleteRecord } from '@/features/admin/utils/adminApi.js';
import AdminShellHeader from '@/features/admin/components/AdminShellHeader.jsx';
import AdminTabsNav from '@/features/admin/components/AdminTabsNav.jsx';
import ConfirmDeleteDialog from '@/features/admin/components/ConfirmDeleteDialog.jsx';
import UnsavedChangesDialog from '@/features/admin/components/UnsavedChangesDialog.jsx';
import { useUnsavedGuard } from '@/features/admin/hooks/useUnsavedGuard.js';
import usePermission from '@/hooks/usePermission.js';
import { ADMIN_TABS } from '@/features/admin/constants/navigation.js';
import { useHero }         from '@/features/admin/hooks/useHero.js';
import { useSobre }        from '@/features/admin/hooks/useSobre.js';
import { usePages }        from '@/features/admin/hooks/usePages.js';
import { useSeo }          from '@/features/admin/hooks/useSeo.js';
import { useBookings }     from '@/features/admin/hooks/useBookings.js';
import { useServicos }     from '@/features/admin/hooks/useServicos.js';
import { useGaleria }      from '@/features/admin/hooks/useGaleria.js';
import { useBlog }         from '@/features/admin/hooks/useBlog.js';
import { useDepoimentos }  from '@/features/admin/hooks/useDepoimentos.js';
import { useEstatisticas } from '@/features/admin/hooks/useEstatisticas.js';
import { useContato }      from '@/features/admin/hooks/useContato.js';
import { useSettings }     from '@/features/admin/hooks/useSettings.js';
import { useFaq }          from '@/features/admin/hooks/useFaq.js';
import {
  OverviewTab, BookingsTab, ServicosTab, GaleriaTab, BlogTab,
  DepoimentosTab, EstatisticasTab, ContatoTab, BrandingTab,
  SeoTab, PagesTab, SobreTab, HeroTab, UsersRolesTab, SettingsTab, FaqTab,
} from '@/features/admin/tabs';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [auditLogs, setAuditLogs] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null); // { collection, id, title, resolve }
  const { canAccess } = usePermission();

  const availableTabs = useMemo(
    () => ADMIN_TABS.filter((tab) => {
      if (!tab.resource) return true;
      return canAccess(tab.resource, tab.action || 'read');
    }),
    [canAccess]
  );

  useEffect(() => {
    if (availableTabs.length === 0) return;

    const isCurrentAllowed = availableTabs.some((tab) => tab.value === activeTab);
    if (!isCurrentAllowed) {
      setActiveTab(availableTabs[0].value);
    }
  }, [availableTabs, activeTab]);

  // ─── Domain hooks ─────────────────────────────────────────────────────────
  const {
    heroConfig, heroPresets, editingPreset, setEditingPreset, heroSaving,
    heroForm, presetForm, fetchHero,
    handleHeroConfigSubmit, handlePresetSubmit, handleActivatePreset,
  } = useHero(currentUser);

  const { sobreConfig, sobreSaving, sobreSection, setSobreSection, sobreForm, fetchSobre, handleSobreSubmit } = useSobre(currentUser);
  const { pagesConfig, pagesSaving, pagesSection, setPagesSection, pagesForm, fetchPages, handlePagesSubmit } = usePages(currentUser);
  const { seoList, seoEditing, seoForm, isLoading: loadingSeo, fetchSeo, handleEditSeo, handleCancelSeo, onSeoSubmit } = useSeo();
  const { bookings, isLoading: loadingBookings, fetchBookings, handleMarkAsRead } = useBookings();

  const { services, isLoading: loadingServicos, serviceForm, editingItem: svcEditing, setEditingItem: setSvcEditing, fetchServicos, handleServicosSubmit, handleReorder } = useServicos(currentUser);
  const { galleryItems, galleryThemes, isLoading: loadingGaleria, galleryForm, themeForm, editingItem: galEditing, setEditingItem: setGalEditing, editingTheme, setEditingTheme, fetchGaleria, handleGaleriaSubmit, handleThemeSubmit } = useGaleria(currentUser);
  const { articles, blogCategories, isLoading: loadingBlog, categoryForm, isArticleEditorOpen, currentArticle, fetchBlog, handleCategorySubmit, openArticleEditor, closeArticleEditor, handleArticleSuccess } = useBlog(currentUser);
  const { testimonials, isLoading: loadingDepoimentos, testimonialForm, editingItem: depEditing, setEditingItem: setDepEditing, fetchDepoimentos, handleDepoimentosSubmit } = useDepoimentos(currentUser);
  const { isLoading: loadingEstatisticas, statsForm, fetchEstatisticas, handleStatsSubmit } = useEstatisticas(currentUser);
  const { contactConfig, isLoading: loadingContato, contactForm, fetchContato, handleContactSubmit } = useContato(currentUser);
  const { settingsForm, saveStatus: settingsSaveStatus, fetchSettings, handleSettingsSubmit } = useSettings();
  const { faqItems, isLoading: loadingFaq, faqForm, editingItem: faqEditing, setEditingItem: setFaqEditing, fetchFaq, handleFaqSubmit } = useFaq(currentUser);

  // ─── Unsaved guard ─────────────────────────────────────────────────────
  const anyDirty = [
    heroForm, presetForm, sobreForm, pagesForm, seoForm,
    serviceForm, galleryForm, themeForm, categoryForm,
    testimonialForm, statsForm, contactForm, settingsForm, faqForm,
  ].some(f => f.formState.isDirty);
  const { guardTab, showDialog: showUnsavedDialog, confirmLeave, cancelLeave } = useUnsavedGuard(anyDirty);

  // ─── Audit logs (overview only) ───────────────────────────────────────────
  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await api.fetch('/audit-logs').then(r => r.json());
      if (Array.isArray(res)) setAuditLogs(res);
    } catch { /* silent */ }
  }, []);

  // ─── Central fetch dispatcher ─────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      switch (activeTab) {
        case 'seo':          return fetchSeo();
        case 'hero':         return fetchHero();
        case 'sobre':        return fetchSobre();
        case 'pages':        return fetchPages();
        case 'bookings':     return fetchBookings();
        case 'services':     return fetchServicos();
        case 'gallery':      return fetchGaleria();
        case 'blog':         return fetchBlog();
        case 'testimonials': return fetchDepoimentos();
        case 'faq':          return fetchFaq();
        case 'stats':        return fetchEstatisticas();
        case 'contact':
        case 'branding':     return fetchContato();
        case 'settings':     return fetchSettings();
        case 'users':        return;
        case 'overview': {
          // Sequencial e resiliente: um erro não bloqueia os demais
          const safe = (fn) => fn().catch((e) => console.warn('Overview fetch error:', e.message));
          if (canAccess('leads', 'read'))        await safe(fetchBookings);
          if (canAccess('blog', 'read'))         await safe(fetchServicos);
          if (canAccess('blog', 'read'))         await safe(fetchBlog);
          if (canAccess('gallery', 'read'))      await safe(fetchGaleria);
          if (canAccess('testimonials', 'read')) await safe(fetchDepoimentos);
          if (canAccess('dashboard', 'read'))    await safe(fetchEstatisticas);
          if (canAccess('dashboard', 'read'))    await safe(fetchContato);
          if (canAccess('dashboard', 'read'))    await safe(fetchAuditLogs);
          return;
        }
        default: return;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    }
  }, [
    activeTab,
    fetchSeo, fetchHero, fetchSobre, fetchPages,
    fetchBookings, fetchServicos, fetchGaleria, fetchBlog,
    fetchDepoimentos, fetchFaq, fetchEstatisticas, fetchContato, fetchAuditLogs, fetchSettings, canAccess,
  ]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Generic submit dispatcher (tab-compatible signature) ─────────────────
  const handleGenericSubmit = useCallback((collection, data) => {
    switch (collection) {
      case 'servicos':        return handleServicosSubmit(data, fetchData);
      case 'galeria':         return handleGaleriaSubmit(data, fetchData);
      case 'depoimentos':     return handleDepoimentosSubmit(data, fetchData);
      case 'faq':             return handleFaqSubmit(data, fetchData);
      case 'blog-categorias': return handleCategorySubmit(data, fetchData);
      default: console.error('Unknown collection in handleGenericSubmit:', collection);
    }
  }, [handleServicosSubmit, handleGaleriaSubmit, handleDepoimentosSubmit, handleFaqSubmit, handleCategorySubmit, fetchData]);

  // ─── Delete wrapper ────────────────────────────────────────────────────────
  const confirmDelete = useCallback(
    (target) => new Promise((resolve) => setDeleteTarget({ ...target, resolve })),
    [],
  );

  const handleDelete = useCallback(
    (collection, id, title) => deleteRecord(collection, id, title, currentUser, fetchData, confirmDelete),
    [currentUser, fetchData, confirmDelete],
  );

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logAction('LOGOUT', 'users', currentUser?.id, 'User logged out', currentUser);
    logout();
    navigate('/login');
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>Dashboard Admin | Instituto Milhomem</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-secondary flex flex-col">
        <AdminShellHeader currentUserEmail={currentUser?.email} onLogout={handleLogout} />

        <div className="container-custom py-6 flex-grow flex flex-col">
          <Tabs value={activeTab} onValueChange={(tab) => guardTab(tab, setActiveTab)} className="flex-grow flex flex-col">
            <AdminTabsNav unreadBookings={bookings.filter((b) => !b.lido).length} tabs={availableTabs} />

            <TabsContent value="overview" className="space-y-6">
              <OverviewTab
                bookings={bookings} services={services}
                galleryItems={galleryItems} articles={articles} auditLogs={auditLogs}
              />
            </TabsContent>

            <TabsContent value="bookings">
              <BookingsTab
                bookings={bookings} isLoading={loadingBookings}
                onMarkAsRead={(id) => handleMarkAsRead(id, fetchData)}
                onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="services">
              <ServicosTab
                services={services} isLoading={loadingServicos}
                serviceForm={serviceForm}
                editingItem={svcEditing} setEditingItem={setSvcEditing}
                onGenericSubmit={handleGenericSubmit} onDelete={handleDelete}
                onReorder={handleReorder}
              />
            </TabsContent>

            <TabsContent value="gallery">
              <GaleriaTab
                galleryItems={galleryItems} galleryThemes={galleryThemes} isLoading={loadingGaleria}
                galleryForm={galleryForm} themeForm={themeForm}
                editingItem={galEditing} setEditingItem={setGalEditing}
                editingTheme={editingTheme} setEditingTheme={setEditingTheme}
                onGenericSubmit={handleGenericSubmit}
                onThemeSubmit={(data) => handleThemeSubmit(data, fetchData)}
                onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="blog">
              <BlogTab
                articles={articles} blogCategories={blogCategories} isLoading={loadingBlog}
                categoryForm={categoryForm}
                onGenericSubmit={handleGenericSubmit} onDelete={handleDelete}
                openArticleEditor={openArticleEditor} isArticleEditorOpen={isArticleEditorOpen}
                closeArticleEditor={closeArticleEditor} currentArticle={currentArticle}
                onArticleSuccess={() => handleArticleSuccess(fetchData)}
              />
            </TabsContent>

            <TabsContent value="testimonials">
              <DepoimentosTab
                testimonials={testimonials} isLoading={loadingDepoimentos}
                testimonialForm={testimonialForm}
                editingItem={depEditing} setEditingItem={setDepEditing}
                onGenericSubmit={handleGenericSubmit} onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="faq">
              <FaqTab
                faqItems={faqItems} isLoading={loadingFaq}
                faqForm={faqForm}
                editingItem={faqEditing} setEditingItem={setFaqEditing}
                onGenericSubmit={handleGenericSubmit} onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="stats">
              <EstatisticasTab
                statsForm={statsForm} isLoading={loadingEstatisticas}
                onStatsSubmit={(data) => handleStatsSubmit(data, fetchData)}
              />
            </TabsContent>

            <TabsContent value="users">
              <UsersRolesTab />
            </TabsContent>

            <TabsContent value="contact">
              <ContatoTab
                contactForm={contactForm} contactConfig={contactConfig} isLoading={loadingContato}
                onContactSubmit={(data) => handleContactSubmit(data, fetchData)}
              />
            </TabsContent>

            <TabsContent value="branding">
              <BrandingTab
                contactForm={contactForm} contactConfig={contactConfig} isLoading={loadingContato}
                onContactSubmit={(data) => handleContactSubmit(data, fetchData)}
              />
            </TabsContent>

            <TabsContent value="seo">
              <SeoTab
                seoList={seoList} seoEditing={seoEditing} seoForm={seoForm}
                isLoading={loadingSeo} handleEditSeo={handleEditSeo}
                handleCancelSeo={handleCancelSeo} onSeoSubmit={onSeoSubmit}
              />
            </TabsContent>

            <TabsContent value="pages">
              <PagesTab
                pagesForm={pagesForm} pagesSection={pagesSection} setPagesSection={setPagesSection}
                pagesConfig={pagesConfig} pagesSaving={pagesSaving} onPagesSubmit={handlePagesSubmit}
              />
            </TabsContent>

            <TabsContent value="sobre">
              <SobreTab
                sobreForm={sobreForm} sobreSection={sobreSection} setSobreSection={setSobreSection}
                sobreConfig={sobreConfig} sobreSaving={sobreSaving} onSobreSubmit={handleSobreSubmit}
              />
            </TabsContent>

            <TabsContent value="hero">
              <HeroTab
                heroForm={heroForm} heroConfig={heroConfig} heroSaving={heroSaving}
                onHeroConfigSubmit={handleHeroConfigSubmit}
                presetForm={presetForm} heroPresets={heroPresets}
                editingPreset={editingPreset} setEditingPreset={setEditingPreset}
                onPresetSubmit={handlePresetSubmit} onActivatePreset={handleActivatePreset}
                onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab
                settingsForm={settingsForm}
                saveStatus={settingsSaveStatus}
                onSettingsSubmit={handleSettingsSubmit}
              />
            </TabsContent>

          </Tabs>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.title}
        onConfirm={() => { deleteTarget?.resolve(true);  setDeleteTarget(null); }}
        onCancel={() =>  { deleteTarget?.resolve(false); setDeleteTarget(null); }}
      />

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </>
  );
};

export default AdminDashboard;