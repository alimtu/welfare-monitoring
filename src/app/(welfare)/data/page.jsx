'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  CopyIcon,
  EyeIcon,
  XIcon,
  ChevronDownIcon,
  DatabaseIcon,
  AlertCircleIcon,
  InboxIcon,
  DownloadIcon,
  RotateCcwIcon,
  FileDownIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BackHeader } from '@/components/welfare/BackHeader';
import { KEYS } from '@/lib/welfare/storage';
import { AUTH_KEY } from '@/lib/auth/session';
import { toPersianDigits } from '@/lib/welfare/format';
import { cn } from '@/lib/utils';

/** Keys that make up the "welfare only" bundle (the app's own data + auth flag). */
const WELFARE_KEYS = [KEYS.periods, KEYS.submissions, KEYS.seeded, AUTH_KEY];

/** Where a one-time snapshot of the admin's own storage is kept before a load. */
const BACKUP_KEY = 'welfare_data_backup';

/** Normalize a bundle value to its parsed form (handles both bundle shapes). */
function ensureParsed(value) {
  return typeof value === 'string' ? tryParse(value) : value;
}

/**
 * Reconstruct the raw localStorage string for a key, matching how the app
 * itself stores it: `auth_token` is a plain string, everything else is JSON.
 */
function rawForWrite(key, value) {
  const parsed = ensureParsed(value);
  if (key === AUTH_KEY) return String(parsed);
  return JSON.stringify(parsed);
}

/** Validate a pasted bundle: must be a JSON object of key → value. */
function parseBundle(text) {
  const trimmed = text.trim();
  if (!trimmed) return { error: 'ابتدا داده کاربر را وارد کنید.' };
  let data;
  try {
    data = JSON.parse(trimmed);
  } catch {
    return { error: 'JSON نامعتبر است. داده کپی‌شده را کامل و بدون تغییر بچسبانید.' };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { error: 'ساختار داده معتبر نیست؛ باید یک شیء از کلید/مقدار باشد.' };
  }
  return { data };
}

/** Parse a stored string as JSON, falling back to the raw string when it isn't JSON. */
function tryParse(value) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/** Turn a (possibly parsed) value into a readable, pretty-printed string. */
function pretty(value) {
  const parsed = tryParse(value);
  return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
}

/** Copy text to clipboard with a graceful fallback for insecure contexts. */
async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Timestamp for download filenames, e.g. 20260716-1432. Kept ASCII/sortable. */
function fileStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

/** Save text to the device as a .json file (no server involved). */
function downloadJson(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** A monospace, LTR, scrollable box for JSON / raw values. */
function CodeBox({ children }) {
  return (
    <pre
      dir="ltr"
      className="max-h-72 overflow-auto rounded-lg bg-grey-50 p-3 text-left text-[11px] leading-relaxed text-grey-700 font-mono whitespace-pre"
    >
      {children}
    </pre>
  );
}

export default function DataPage() {
  // --- This device's localStorage ---
  const [entries, setEntries] = useState([]); // [{ key, raw }]
  const [expanded, setExpanded] = useState(() => new Set());
  const [hasBackup, setHasBackup] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const list = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key == null || key === BACKUP_KEY) continue;
      list.push({ key, raw: localStorage.getItem(key) ?? '' });
    }
    list.sort((a, b) => a.key.localeCompare(b.key));
    setEntries(list);
    setHasBackup(Boolean(localStorage.getItem(BACKUP_KEY)));
  }, []);

  const summary = useMemo(() => {
    const find = (k) => entries.find((e) => e.key === k)?.raw;
    const periods = tryParse(find(KEYS.periods));
    const submissions = tryParse(find(KEYS.submissions));
    return {
      periods: Array.isArray(periods) ? periods.length : 0,
      submissions: Array.isArray(submissions) ? submissions.length : 0,
      seeded: tryParse(find(KEYS.seeded)) === '1',
      loggedIn: Boolean(find(AUTH_KEY)),
    };
  }, [entries]);

  const buildBundle = (keys) => {
    const bundle = {};
    entries.forEach(({ key, raw }) => {
      if (keys && !keys.includes(key)) return;
      bundle[key] = tryParse(raw);
    });
    return bundle;
  };

  const handleCopy = async (keys, emptyMsg) => {
    const bundle = buildBundle(keys);
    if (Object.keys(bundle).length === 0) {
      toast.error(emptyMsg);
      return;
    }
    const ok = await copyText(JSON.stringify(bundle, null, 2));
    toast[ok ? 'success' : 'error'](ok ? 'کپی شد ✓' : 'کپی ناموفق بود');
  };

  // Save the bundle as a .json file — for data too large to send as a message.
  const handleDownload = (keys, scope, emptyMsg) => {
    const bundle = buildBundle(keys);
    if (Object.keys(bundle).length === 0) {
      toast.error(emptyMsg);
      return;
    }
    try {
      downloadJson(`welfare-${scope}-${fileStamp()}.json`, JSON.stringify(bundle, null, 2));
      toast.success('فایل دانلود شد ✓');
    } catch (err) {
      console.error('[data] download failed', err);
      toast.error('دانلود ناموفق بود');
    }
  };

  const toggle = (key) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // --- Inspect a pasted user bundle (preview only, never written to storage) ---
  const [pasteInput, setPasteInput] = useState('');
  const [pasteError, setPasteError] = useState('');
  const [pasteResult, setPasteResult] = useState(null); // { items, counts }
  const [pendingLoad, setPendingLoad] = useState(null); // parsed bundle awaiting confirm

  const inspect = () => {
    setPasteError('');
    setPasteResult(null);
    const { data, error } = parseBundle(pasteInput);
    if (error) {
      setPasteError(error);
      return;
    }
    const items = Object.entries(data).map(([key, value]) => {
      const parsed = tryParse(value);
      return {
        key,
        parsed,
        text: typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2),
      };
    });
    const parsedOf = (k) => items.find((i) => i.key === k)?.parsed;
    const periods = parsedOf(KEYS.periods);
    const submissions = parsedOf(KEYS.submissions);
    setPasteResult({
      items,
      counts: {
        keys: items.length,
        periods: Array.isArray(periods) ? periods.length : null,
        submissions: Array.isArray(submissions) ? submissions.length : null,
      },
    });
  };

  const clearPaste = () => {
    setPasteInput('');
    setPasteError('');
    setPasteResult(null);
  };

  // Validate the pasted bundle, then open the confirmation dialog.
  const requestLoad = () => {
    setPasteError('');
    const { data, error } = parseBundle(pasteInput);
    if (error) {
      setPasteError(error);
      return;
    }
    setPendingLoad(data);
  };

  // Replace this device's storage with the user's data (backing ours up first).
  const confirmLoad = () => {
    const data = pendingLoad;
    if (!data) return;
    try {
      // 1. Snapshot the admin's own storage once (exact raw strings) for restore.
      if (!localStorage.getItem(BACKUP_KEY)) {
        const backup = {};
        for (let i = 0; i < localStorage.length; i += 1) {
          const key = localStorage.key(i);
          if (key == null || key === BACKUP_KEY) continue;
          backup[key] = localStorage.getItem(key) ?? '';
        }
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
      }
      // 2. Clear the admin's welfare state so none of it lingers under the user's.
      [KEYS.periods, KEYS.submissions, KEYS.seeded].forEach((k) => localStorage.removeItem(k));
      // 3. Write the user's keys. auth_token is only touched if the bundle has it,
      //    so the admin stays logged in and the app shell keeps working.
      Object.entries(data).forEach(([key, value]) => {
        if (key === BACKUP_KEY || key === KEYS.seeded) return;
        localStorage.setItem(key, rawForWrite(key, value));
      });
      // 4. Force the seeded flag so WelfareProvider doesn't re-seed over the load.
      localStorage.setItem(KEYS.seeded, JSON.stringify('1'));
      // 5. Full reload so the provider re-hydrates from the replaced storage.
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('[data] load failed', err);
      toast.error('بارگذاری ناموفق بود');
      setPendingLoad(null);
    }
  };

  // Restore the admin's original storage from the snapshot and reload.
  const restoreBackup = () => {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return;
    let backup;
    try {
      backup = JSON.parse(raw);
    } catch {
      toast.error('نسخه پشتیبان قابل خواندن نیست');
      return;
    }
    localStorage.clear();
    Object.entries(backup).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
    window.location.href = '/dashboard';
  };

  return (
    <div className="space-y-4 p-4">
      <BackHeader title="داده‌های ذخیره‌شده" />

      {/* Shown while viewing a loaded user bundle: offer a one-tap restore. */}
      {hasBackup && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-amber-800">در حال مشاهده داده کاربر</p>
            <p className="mt-0.5 text-[10px] text-amber-600">داده شما پشتیبان‌گیری شده است.</p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0" onClick={restoreBackup}>
            <RotateCcwIcon className="size-4" />
            بازگردانی داده من
          </Button>
        </div>
      )}

      {/* ── Section 1: this device's data ───────────────────────────── */}
      <Card>
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center gap-2 text-sm">
            <DatabaseIcon className="size-4 text-primary-500" />
            داده این دستگاه
          </CardTitle>
          <CardDescription className="text-xs">
            برای بررسی، این داده را کپی کنید و برای ادمین بفرستید.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary chips */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <SummaryChip label="دوره‌ها" value={toPersianDigits(summary.periods)} />
            <SummaryChip label="ثبت‌ها" value={toPersianDigits(summary.submissions)} />
            <SummaryChip label="داده اولیه" value={summary.seeded ? 'بارگذاری شده' : '—'} />
            <SummaryChip label="ورود کاربر" value={summary.loggedIn ? 'فعال' : 'خیر'} />
          </div>

          {/* Copy actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              className="h-10"
              onClick={() => handleCopy(WELFARE_KEYS, 'داده رفاهی برای کپی وجود ندارد')}
            >
              <CopyIcon className="size-4" />
              کپی داده رفاه
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-10"
              onClick={() => handleCopy(null, 'localStorage خالی است')}
            >
              <CopyIcon className="size-4" />
              کپی همه داده‌ها
            </Button>
          </div>

          {/* Download actions — for data too long to send as a text message. */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-10"
              onClick={() => handleDownload(WELFARE_KEYS, 'data', 'داده رفاهی برای دانلود وجود ندارد')}
            >
              <FileDownIcon className="size-4" />
              دانلود داده رفاه
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-10"
              onClick={() => handleDownload(null, 'all', 'localStorage خالی است')}
            >
              <FileDownIcon className="size-4" />
              دانلود همه داده‌ها
            </Button>
          </div>
          <p className="text-[10px] leading-relaxed text-grey-400">
            اگر داده برای ارسال به‌صورت متن طولانی است، فایل JSON را دانلود کنید و همان فایل را بفرستید.
          </p>

          {/* Raw key list */}
          <div className="divide-y divide-grey-100 rounded-lg border border-grey-100">
            {entries.length === 0 ? (
              <p className="p-4 text-center text-xs text-grey-400">
                هیچ داده‌ای در این دستگاه ذخیره نشده است.
              </p>
            ) : (
              entries.map(({ key, raw }) => {
                const open = expanded.has(key);
                return (
                  <div key={key}>
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="flex w-full items-center justify-between gap-2 p-2.5 text-right"
                    >
                      <span className="min-w-0">
                        <span dir="ltr" className="block truncate text-left text-xs font-medium text-grey-700 font-mono">
                          {key}
                        </span>
                        <span className="text-[10px] text-grey-400">
                          {toPersianDigits(raw.length)} نویسه
                        </span>
                      </span>
                      <ChevronDownIcon
                        className={cn(
                          'size-4 shrink-0 text-grey-400 transition-transform',
                          open && 'rotate-180',
                        )}
                      />
                    </button>
                    {open && (
                      <div className="px-2.5 pb-2.5">
                        <CodeBox>{pretty(raw)}</CodeBox>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: inspect a user's pasted data ─────────────────── */}
      <Card>
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center gap-2 text-sm">
            <EyeIcon className="size-4 text-primary-500" />
            بررسی داده کاربر
          </CardTitle>
          <CardDescription className="text-xs">
            داده کپی‌شده کاربر را اینجا بچسبانید و بررسی کنید. داده این دستگاه تغییری نمی‌کند.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            dir="ltr"
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
            placeholder='{ "welfare_periods": [...], "welfare_submissions": [...] }'
            className="h-32 text-left text-[11px] font-mono"
          />

          <div className="flex gap-2">
            <Button size="sm" className="h-10 flex-1" onClick={inspect}>
              <EyeIcon className="size-4" />
              نمایش داده
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-10"
              onClick={clearPaste}
              disabled={!pasteInput && !pasteResult && !pasteError}
            >
              <XIcon className="size-4" />
              پاک کردن
            </Button>
          </div>

          {/* Destructive: load the user's data into this device to reproduce their issue. */}
          <Button
            size="sm"
            variant="destructive"
            className="h-10 w-full"
            onClick={requestLoad}
            disabled={!pasteInput.trim()}
          >
            <DownloadIcon className="size-4" />
            بارگذاری در دستگاه من (جایگزینی)
          </Button>
          <p className="text-[10px] leading-relaxed text-grey-400">
            داده این دستگاه با داده کاربر جایگزین می‌شود تا مشکل او را بازسازی کنید. پیش از جایگزینی از
            داده شما پشتیبان گرفته می‌شود و با دکمه «بازگردانی» قابل برگشت است.
          </p>

          {pasteError && (
            <p className="flex items-center gap-1.5 rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
              <AlertCircleIcon className="size-4 shrink-0" />
              {pasteError}
            </p>
          )}

          {pasteResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <SummaryChip label="کلیدها" value={toPersianDigits(pasteResult.counts.keys)} />
                <SummaryChip
                  label="دوره‌ها"
                  value={pasteResult.counts.periods == null ? '—' : toPersianDigits(pasteResult.counts.periods)}
                />
                <SummaryChip
                  label="ثبت‌ها"
                  value={pasteResult.counts.submissions == null ? '—' : toPersianDigits(pasteResult.counts.submissions)}
                />
              </div>

              {pasteResult.items.length === 0 ? (
                <p className="flex items-center justify-center gap-1.5 py-4 text-center text-xs text-grey-400">
                  <InboxIcon className="size-4" />
                  این داده هیچ کلیدی ندارد.
                </p>
              ) : (
                <div className="space-y-3">
                  {pasteResult.items.map((item) => (
                    <div key={item.key} className="space-y-1">
                      <p dir="ltr" className="text-left text-xs font-medium text-grey-700 font-mono">
                        {item.key}
                      </p>
                      <CodeBox>{item.text}</CodeBox>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm before replacing this device's data. */}
      <Dialog open={pendingLoad != null} onOpenChange={(open) => !open && setPendingLoad(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>جایگزینی داده این دستگاه؟</DialogTitle>
            <DialogDescription>
              داده فعلی این دستگاه با داده کاربر جایگزین می‌شود تا بتوانید مشکل او را بررسی کنید. یک نسخه
              پشتیبان از داده شما گرفته می‌شود و می‌توانید بعداً آن را بازگردانید. پس از جایگزینی به داشبورد
              منتقل می‌شوید.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingLoad(null)}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={confirmLoad}>
              <DownloadIcon className="size-4" />
              جایگزین کن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Small labelled value tile used in the summary rows. */
function SummaryChip({ label, value }) {
  return (
    <div className="rounded-lg bg-grey-50 px-3 py-2">
      <p className="text-[10px] text-grey-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-grey-800">{value}</p>
    </div>
  );
}
