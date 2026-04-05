import React, { useMemo, useState } from 'react';
import { BarChart3, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge.jsx';

function buildTopEntries(bookings, fieldName) {
  const map = new Map();
  bookings.forEach((booking) => {
    const key = String(booking?.[fieldName] || 'nao-informado').trim().toLowerCase();
    map.set(key, (map.get(key) || 0) + 1);
  });

  return Array.from(map.entries())
    .map(([key, count]) => ({
      key,
      label: key.replace(/-/g, ' '),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export default function AdminConversionInsights({ bookings = [] }) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('30d');

  const periodDays = useMemo(() => {
    if (period === 'all') return null;
    const days = Number(period.replace('d', ''));
    return Number.isFinite(days) ? days : null;
  }, [period]);

  const filteredBookings = useMemo(() => {
    if (!periodDays) return bookings;

    const threshold = Date.now() - periodDays * 24 * 60 * 60 * 1000;
    return bookings.filter((booking) => {
      const rawDate = booking?.created || booking?.created_at;
      if (!rawDate) return false;
      const parsed = new Date(rawDate);
      if (Number.isNaN(parsed.getTime())) return false;
      return parsed.getTime() >= threshold;
    });
  }, [bookings, periodDays]);

  const previousPeriodCount = useMemo(() => {
    if (!periodDays) return null;

    const now = Date.now();
    const currentStart = now - periodDays * 24 * 60 * 60 * 1000;
    const previousStart = currentStart - periodDays * 24 * 60 * 60 * 1000;

    return bookings.reduce((count, booking) => {
      const rawDate = booking?.created || booking?.created_at;
      if (!rawDate) return count;
      const parsed = new Date(rawDate);
      if (Number.isNaN(parsed.getTime())) return count;

      const timestamp = parsed.getTime();
      if (timestamp >= previousStart && timestamp < currentStart) return count + 1;
      return count;
    }, 0);
  }, [bookings, periodDays]);

  const comparisonLabel = useMemo(() => {
    if (previousPeriodCount === null) return null;

    const currentCount = filteredBookings.length;
    const diff = currentCount - previousPeriodCount;
    if (diff === 0) {
      return {
        tone: 'neutral',
        text: t('admin.conversion.compare_same', { count: previousPeriodCount }),
      };
    }

    if (previousPeriodCount === 0) {
      return {
        tone: diff > 0 ? 'up' : 'down',
        text: t('admin.conversion.compare_from_zero'),
      };
    }

    const percentage = Math.round((Math.abs(diff) / previousPeriodCount) * 100);
    return {
      tone: diff > 0 ? 'up' : 'down',
      text: t(diff > 0 ? 'admin.conversion.compare_up' : 'admin.conversion.compare_down', {
        percentage,
        count: Math.abs(diff),
      }),
    };
  }, [filteredBookings.length, previousPeriodCount, t]);

  const sourceStats = useMemo(() => buildTopEntries(filteredBookings, 'origem'), [filteredBookings]);
  const ctaStats = useMemo(() => buildTopEntries(filteredBookings, 'cta_origem'), [filteredBookings]);
  const campaignStats = useMemo(() => buildTopEntries(filteredBookings, 'utm_campaign'), [filteredBookings]);

  const periodOptions = [
    { value: '7d', label: t('admin.conversion.period_7d') },
    { value: '30d', label: t('admin.conversion.period_30d') },
    { value: '90d', label: t('admin.conversion.period_90d') },
    { value: 'all', label: t('admin.conversion.period_all') },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-secondary border-b pb-2">{t('admin.conversion.title')}</h3>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            aria-label={t('admin.conversion.period_label')}
            className="px-2.5 py-1.5 text-xs border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Badge variant="outline" className="gap-1"><BarChart3 className="w-3.5 h-3.5" /> {filteredBookings.length} {t('admin.conversion.leads')}</Badge>
        </div>
      </div>
      {comparisonLabel && (
        <div className="-mt-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
              comparisonLabel.tone === 'up'
                ? 'bg-emerald-50 text-emerald-700'
                : comparisonLabel.tone === 'down'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-slate-100 text-slate-700'
            }`}
          >
            {comparisonLabel.text}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('admin.conversion.top_sources')}</p>
          <div className="space-y-2">
            {sourceStats.map((item) => (
              <div key={item.key} className="flex items-center justify-between text-sm">
                <span className="capitalize text-foreground">{item.label}</span>
                <Badge variant="outline">{item.count}</Badge>
              </div>
            ))}
            {sourceStats.length === 0 && <p className="text-xs text-muted-foreground">{t('admin.conversion.empty_data')}</p>}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('admin.conversion.top_ctas')}</p>
          <div className="space-y-2">
            {ctaStats.map((item) => (
              <div key={item.key} className="flex items-center justify-between text-sm">
                <span className="capitalize text-foreground">{item.label}</span>
                <Badge variant="outline">{item.count}</Badge>
              </div>
            ))}
            {ctaStats.length === 0 && <p className="text-xs text-muted-foreground">{t('admin.conversion.empty_data')}</p>}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('admin.conversion.top_campaigns')}</p>
          <div className="space-y-2">
            {campaignStats.map((item) => (
              <div key={item.key} className="flex items-center justify-between text-sm">
                <span className="capitalize text-foreground line-clamp-1">{item.label}</span>
                <Badge variant="outline" className="gap-1"><Target className="w-3 h-3" /> {item.count}</Badge>
              </div>
            ))}
            {campaignStats.length === 0 && <p className="text-xs text-muted-foreground">{t('admin.conversion.empty_campaigns')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}