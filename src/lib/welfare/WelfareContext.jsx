'use client';

/**
 * WelfareProvider — single source of truth for periods and submissions.
 *
 * On first client mount it seeds localStorage with mock data, then keeps an
 * in-memory copy in React state and persists every mutation back to storage.
 * No backend is involved; everything is client-side.
 */
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  loadPeriods,
  savePeriods,
  loadSubmissions,
  saveSubmissions,
  isSeeded,
  markSeeded,
  clearAll,
} from './storage';
import { buildSeed } from './mockData';
import { uid } from './ids';

const WelfareContext = createContext(null);

export function WelfareProvider({ children }) {
  const [periods, setPeriods] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [currentPeriodId, setCurrentPeriodId] = useState(null);
  const [ready, setReady] = useState(false);

  // Seed (once) + hydrate from localStorage on mount.
  useEffect(() => {
    if (!isSeeded()) {
      const seed = buildSeed();
      savePeriods(seed.periods);
      saveSubmissions(seed.submissions);
      markSeeded();
      console.log('[welfare] seeded mock data', seed);
    }
    const loadedPeriods = loadPeriods();
    const loadedSubs = loadSubmissions();
    setPeriods(loadedPeriods);
    setSubmissions(loadedSubs);
    const active = loadedPeriods.find((p) => p.status === 'active');
    setCurrentPeriodId(active ? active.id : loadedPeriods[0]?.id || null);
    setReady(true);
  }, []);

  // Persistence helpers keep state + storage in sync.
  const persistPeriods = useCallback((next) => {
    setPeriods(next);
    savePeriods(next);
  }, []);

  const persistSubmissions = useCallback((next) => {
    setSubmissions(next);
    saveSubmissions(next);
  }, []);

  // --- Period actions ---
  const createPeriod = useCallback(
    ({ title, startDate, endDate }) => {
      const period = {
        id: uid('period'),
        title,
        startDate,
        endDate,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
      persistPeriods([...periods, period]);
      return period;
    },
    [periods, persistPeriods],
  );

  const setActivePeriod = useCallback(
    (id) => {
      const next = periods.map((p) => {
        if (p.id === id) return { ...p, status: 'active' };
        if (p.status === 'active') return { ...p, status: 'draft' };
        return p;
      });
      persistPeriods(next);
      setCurrentPeriodId(id);
    },
    [periods, persistPeriods],
  );

  const completePeriod = useCallback(
    (id) => {
      persistPeriods(periods.map((p) => (p.id === id ? { ...p, status: 'completed' } : p)));
    },
    [periods, persistPeriods],
  );

  const deletePeriod = useCallback(
    (id) => {
      persistPeriods(periods.filter((p) => p.id !== id));
      // Remove the period's submissions too.
      persistSubmissions(submissions.filter((s) => s.periodId !== id));
      if (currentPeriodId === id) {
        const remaining = periods.filter((p) => p.id !== id);
        setCurrentPeriodId(remaining[0]?.id || null);
      }
    },
    [periods, submissions, persistPeriods, persistSubmissions, currentPeriodId],
  );

  // --- Submission actions ---
  const saveSubmission = useCallback(
    (record) => {
      const exists = submissions.some((s) => s.id === record.id);
      const next = exists
        ? submissions.map((s) => (s.id === record.id ? record : s))
        : [...submissions, record];
      persistSubmissions(next);
      return record;
    },
    [submissions, persistSubmissions],
  );

  const deleteSubmission = useCallback(
    (id) => {
      persistSubmissions(submissions.filter((s) => s.id !== id));
    },
    [submissions, persistSubmissions],
  );

  const resetDemoData = useCallback(() => {
    clearAll();
    const seed = buildSeed();
    savePeriods(seed.periods);
    saveSubmissions(seed.submissions);
    markSeeded();
    setPeriods(seed.periods);
    setSubmissions(seed.submissions);
    const active = seed.periods.find((p) => p.status === 'active');
    setCurrentPeriodId(active ? active.id : seed.periods[0]?.id || null);
  }, []);

  // --- Selectors ---
  const getSubmission = useCallback((id) => submissions.find((s) => s.id === id) || null, [submissions]);

  const submissionsForPeriod = useCallback(
    (periodId) => submissions.filter((s) => s.periodId === periodId),
    [submissions],
  );

  const getSubmissionForIndicator = useCallback(
    (periodId, indicatorId) =>
      submissions.find((s) => s.periodId === periodId && s.indicatorId === indicatorId) || null,
    [submissions],
  );

  /** Latest submitted score for an indicator in any *other* period. */
  const getPreviousScore = useCallback(
    (indicatorId, excludePeriodId) => {
      const prev = submissions
        .filter(
          (s) => s.indicatorId === indicatorId && s.periodId !== excludePeriodId && s.status === 'submitted',
        )
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
      return prev ? prev.finalScore : undefined;
    },
    [submissions],
  );

  const currentPeriod = useMemo(
    () => periods.find((p) => p.id === currentPeriodId) || null,
    [periods, currentPeriodId],
  );

  const value = useMemo(
    () => ({
      ready,
      periods,
      submissions,
      currentPeriod,
      currentPeriodId,
      setCurrentPeriodId,
      createPeriod,
      setActivePeriod,
      completePeriod,
      deletePeriod,
      saveSubmission,
      deleteSubmission,
      resetDemoData,
      getSubmission,
      submissionsForPeriod,
      getSubmissionForIndicator,
      getPreviousScore,
    }),
    [
      ready,
      periods,
      submissions,
      currentPeriod,
      currentPeriodId,
      createPeriod,
      setActivePeriod,
      completePeriod,
      deletePeriod,
      saveSubmission,
      deleteSubmission,
      resetDemoData,
      getSubmission,
      submissionsForPeriod,
      getSubmissionForIndicator,
      getPreviousScore,
    ],
  );

  return <WelfareContext.Provider value={value}>{children}</WelfareContext.Provider>;
}

export function useWelfare() {
  const ctx = useContext(WelfareContext);
  if (!ctx) throw new Error('useWelfare must be used within a WelfareProvider');
  return ctx;
}
