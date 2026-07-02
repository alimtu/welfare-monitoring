'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { setAuthed, MOCK_OTP } from '../../../lib/auth/session';

// --- BACKEND LOGIN DISABLED (temporary) ---
// The real login used web services (op=m_login / op=m_verify). The backend is
// not in use, so those calls are commented out and replaced with a mock OTP
// flow: any phone number is accepted and the OTP is hardcoded to MOCK_OTP (8080).
// import { useMutation } from '@tanstack/react-query';
// import http from '../../../lib/axios';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mob, setMob] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmitMobile = useMemo(() => mob?.trim()?.length >= 10, [mob]);
  const canSubmitVerify = useMemo(() => code?.trim()?.length >= 4, [code]);

  // --- Web-service mutations (disabled) ---
  // const loginMutation = useMutation({
  //   mutationFn: async (mobile) =>
  //     http.get('/', { params: { op: 'm_login', mob: mobile }, _returnFullBody: true }),
  //   onSuccess: (body) => {
  //     if (body?.finger) { setFinger(body.finger); setStep(2); toast.success(body?.message); }
  //     else toast.error(body?.message || 'خطا در دریافت کد تایید');
  //   },
  //   onError: (err) => toast.error(err?.message || 'خطا در برقراری ارتباط'),
  // });
  // const verifyMutation = useMutation({
  //   mutationFn: async (verifyCode) =>
  //     http.get('/', { params: { op: 'm_verify', finger, code: verifyCode }, _returnFullBody: true }),
  //   onSuccess: (body) => {
  //     if (body?.success) { localStorage.setItem('finger', finger); router.push('/'); }
  //     else toast.error(body?.message || 'کد وارد شده صحیح نیست.');
  //   },
  //   onError: (err) => toast.error(err?.message || 'خطا در تایید کد'),
  // });

  // Mock: request an OTP (no web service — just advance to the code step).
  const requestOtp = () => {
    setSubmitting(true);
    setStep(2);
    setSubmitting(false);
    toast.success(`کد تایید ارسال شد (کد آزمایشی: ${MOCK_OTP})`);
  };

  // Mock: verify the OTP against the hardcoded value.
  const verifyOtp = () => {
    setSubmitting(true);
    if (code.trim() === MOCK_OTP) {
      setAuthed(mob.trim());
      toast.success('ورود موفقیت‌آمیز بود.');
      router.replace('/');
    } else {
      toast.error('کد وارد شده صحیح نیست.');
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center p-5">
      <div className="w-full space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-lg font-bold text-grey-800">ورود به سامانه پایش رفاه</h1>
          <p className="text-sm text-grey-500">
            {step === 1 ? 'شماره موبایل خود را وارد کنید' : `کد تایید ارسال‌شده به ${mob}`}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 px-8">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-grey-200'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-grey-200'}`} />
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="mob">شماره موبایل</Label>
              <Input
                id="mob"
                value={mob}
                onChange={(e) => setMob(e.target.value)}
                placeholder="09XX XXX XXXX"
                inputMode="numeric"
                dir="ltr"
                className="text-center tracking-widest"
              />
            </div>
            <Button className="w-full" disabled={!canSubmitMobile || submitting} onClick={requestOtp}>
              دریافت کد تایید
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="code">کد تایید</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="- - - -"
                inputMode="numeric"
                autoFocus
                dir="ltr"
                className="text-center tracking-[0.5em] text-lg"
              />
              <p className="text-center text-[11px] text-grey-400">کد تایید نسخه آزمایشی: {MOCK_OTP}</p>
            </div>
            <Button className="w-full" disabled={!canSubmitVerify || submitting} onClick={verifyOtp}>
              ورود
            </Button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-primary-500"
            >
              تغییر شماره موبایل
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
