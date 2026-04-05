import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Download, Search, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import TabLoader from '@/features/admin/components/TabLoader.jsx';

const NORMALIZE_EMPTY = 'nao-informado';

const toNormalizedValue = (value) => {
  const text = String(value || '').trim();
  return text || NORMALIZE_EMPTY;
};

const toDisplayValue = (value, t) => {
  if (!value || value === NORMALIZE_EMPTY) return t('admin.common.not_informed');
  return value;
};

const BookingsTab = ({ bookings, isLoading, onMarkAsRead, onDelete }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('30d');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [ctaFilter, setCtaFilter] = useState('all');

  const sourceOptions = useMemo(() => {
    const values = Array.from(new Set(bookings.map((booking) => toNormalizedValue(booking.origem))));
    return values.sort((a, b) => a.localeCompare(b));
  }, [bookings]);

  const ctaOptions = useMemo(() => {
    const values = Array.from(new Set(bookings.map((booking) => toNormalizedValue(booking.cta_origem))));
    return values.sort((a, b) => a.localeCompare(b));
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const periodDays = periodFilter === 'all' ? null : Number(periodFilter.replace('d', ''));
    const threshold = Number.isFinite(periodDays)
      ? Date.now() - periodDays * 24 * 60 * 60 * 1000
      : null;

    return bookings.filter((booking) => {
      if (threshold) {
        const rawDate = booking?.created || booking?.created_at;
        if (!rawDate) return false;
        const parsed = new Date(rawDate);
        if (Number.isNaN(parsed.getTime()) || parsed.getTime() < threshold) return false;
      }

      const matchesSource = sourceFilter === 'all' || toNormalizedValue(booking.origem) === sourceFilter;
      const matchesCta = ctaFilter === 'all' || toNormalizedValue(booking.cta_origem) === ctaFilter;
      if (!matchesSource || !matchesCta) return false;

      if (!normalizedQuery) return true;
      const haystack = [
        booking.nome,
        booking.email,
        booking.telefone,
        booking.tipo_servico,
        booking.mensagem,
        booking.origem,
        booking.cta_origem,
        booking.utm_campaign,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [bookings, ctaFilter, periodFilter, query, sourceFilter]);

  const exportCsv = () => {
    if (filteredBookings.length === 0) return;

    const escapeCsv = (value) => {
      if (value === null || value === undefined) return '';
      const text = String(value).replace(/\r?\n|\r/g, ' ').trim();
      return `"${text.replace(/"/g, '""')}"`;
    };

    const headers = [
      'nome',
      'email',
      'telefone',
      'tipo_servico',
      'mensagem',
      'origem',
      'cta_origem',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'landing_page',
      'referrer_url',
      'status',
      'created',
    ];

    const rows = filteredBookings.map((booking) => {
      const created = booking?.created || booking?.created_at || '';
      return [
        booking.nome,
        booking.email,
        booking.telefone,
        booking.tipo_servico,
        booking.mensagem,
        booking.origem,
        booking.cta_origem,
        booking.utm_source,
        booking.utm_medium,
        booking.utm_campaign,
        booking.utm_content,
        booking.utm_term,
        booking.landing_page,
        booking.referrer_url,
        booking.lido ? 'read' : 'new',
        created,
      ].map(escapeCsv).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = format(new Date(), 'yyyyMMdd-HHmm');
    link.href = url;
    link.setAttribute('download', `${t('admin.bookings.export_filename_prefix')}-${stamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-2xl font-bold mb-6 text-secondary border-b pb-4">{t('admin.bookings.title')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-5">
        <div className="relative lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('admin.bookings.search_placeholder')}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <select
          value={periodFilter}
          onChange={(event) => setPeriodFilter(event.target.value)}
          aria-label={t('admin.bookings.period_label')}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="7d">{t('admin.bookings.period_7d')}</option>
          <option value="30d">{t('admin.bookings.period_30d')}</option>
          <option value="90d">{t('admin.bookings.period_90d')}</option>
          <option value="all">{t('admin.bookings.period_all')}</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(event) => setSourceFilter(event.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="all">{t('admin.bookings.all_sources')}</option>
          {sourceOptions.map((option) => (
            <option key={option} value={option}>{toDisplayValue(option, t)}</option>
          ))}
        </select>

        <select
          value={ctaFilter}
          onChange={(event) => setCtaFilter(event.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="all">{t('admin.bookings.all_ctas')}</option>
          {ctaOptions.map((option) => (
            <option key={option} value={option}>{toDisplayValue(option, t)}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end mb-4">
        <Button
          type="button"
          variant="outline"
          onClick={exportCsv}
          disabled={filteredBookings.length === 0}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {t('admin.bookings.export_csv')}
        </Button>
      </div>

      {isLoading ? (
        <TabLoader rows={4} />
      ) : filteredBookings.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('admin.bookings.empty_filtered')}</p>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className={`p-5 rounded-xl border ${
                b.lido ? 'border-border bg-white' : 'border-primary/50 bg-primary/5'
              } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-bold text-lg text-secondary">{b.nome}</p>
                  <Badge variant={b.lido ? 'outline' : 'default'}>{b.lido ? t('admin.bookings.status_read') : t('admin.bookings.status_new')}</Badge>
                  {b.origem && <Badge variant="outline">{t('admin.bookings.origin_label')}: {b.origem}</Badge>}
                  {b.cta_origem && <Badge variant="outline">{t('admin.bookings.cta_label')}: {b.cta_origem}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{b.email} · {b.telefone}</p>
                <p className="text-sm font-medium text-primary">{b.tipo_servico}</p>
                {b.mensagem && (
                  <p className="text-sm text-muted-foreground italic">"{b.mensagem}"</p>
                )}
                {(b.utm_source || b.utm_medium || b.utm_campaign) && (
                  <p className="text-xs text-muted-foreground">
                    {t('admin.bookings.utm_label')}: {[b.utm_source, b.utm_medium, b.utm_campaign].filter(Boolean).join(' / ')}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {b.created ? format(new Date(b.created), 'dd/MM/yyyy HH:mm') : (b.created_at ? format(new Date(b.created_at), 'dd/MM/yyyy HH:mm') : '')}
                </p>
              </div>
              <div className="flex gap-2">
                {!b.lido && (
                  <Button size="sm" onClick={() => onMarkAsRead(b.id)}
                    className="bg-primary text-primary-foreground hover:bg-secondary hover:text-white">
                    {t('admin.bookings.mark_as_read')}
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => onDelete('agendamentos', b.id, b.nome)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsTab;
