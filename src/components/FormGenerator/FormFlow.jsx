'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { ArrowRightIcon, CheckIcon, CircleCheckBigIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import FieldRenderer from './FieldRenderer';
import RepeatableStep from './RepeatableStep';
import buildFormSchema from '../../lib/utils/buildFormSchema';
// --- GET LOCATION FROM USER DISABLED (temporary) ---
// import { getSavedLocation } from '../../lib/hooks/useGeolocation';
import useSubmitForm from '../../lib/hooks/useSubmitForm';
import { useOnlineStatus } from '../../lib/hooks/usePWA';
import { addPending } from '../../lib/offline/idb';

export default function FormFlow({ form, onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const isOnline = useOnlineStatus();
  const steps = form.steps || [];
  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const schema = buildFormSchema(steps);
  const submitForm = useSubmitForm();

  const methods = useForm({
    resolver: joiResolver(schema),
    defaultValues: {},
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    setError,
    clearErrors,
  } = methods;

  const allSections = [...(step?.sections || [])];
  const isRepeatable = step?.numrow > 1;
  const repeatableAttempted = useRef(false);

  const getStepFieldNames = () => {
    if (isRepeatable) return [`rows_${step.stepId}`];
    return allSections.map((s) => `section_${s.sectionId}`);
  };

  const isFieldEmpty = (val, type) => {
    if (val == null || val === '') return true;
    if (typeof val === 'string' && type === 2) {
      return val.replace(/<[^>]*>/g, '').trim().length === 0;
    }
    if (Array.isArray(val)) return val.length === 0;
    return false;
  };

  const validateRepeatableRequired = useCallback(() => {
    if (!isRepeatable) return true;
    const arrayName = `rows_${step.stepId}`;
    const rows = getValues(arrayName) || [];
    const requiredSections = allSections.filter((s) => s.required);
    if (requiredSections.length === 0) return true;

    let allValid = true;
    for (const section of requiredSections) {
      const key = `section_${section.sectionId}`;
      const anyFilled = rows.some((row) => !isFieldEmpty(row?.[key], section.type));

      if (!anyFilled) {
        allValid = false;
        rows.forEach((_, rowIdx) => {
          const fieldPath = `${arrayName}.${rowIdx}.${key}`;
          if (isFieldEmpty(rows[rowIdx]?.[key], section.type)) {
            setError(fieldPath, {
              type: 'manual',
              message: `${section.title} حداقل در یک ردیف الزامی است`,
            });
          }
        });
      } else {
        rows.forEach((_, rowIdx) => {
          clearErrors(`${arrayName}.${rowIdx}.${key}`);
        });
      }
    }
    return allValid;
  }, [isRepeatable, step, allSections, getValues, setError, clearErrors]);

  const watchedRows = useWatch({
    control,
    name: isRepeatable ? `rows_${step.stepId}` : '__unused__',
  });

  useEffect(() => {
    if (repeatableAttempted.current && isRepeatable) {
      validateRepeatableRequired();
    }
  }, [watchedRows, isRepeatable, validateRepeatableRequired]);

  const scrollToFirstError = () => {
    setTimeout(() => {
      const firstError = document.querySelector('[data-field] [aria-invalid="true"], [data-field] .text-danger-500');
      if (firstError) {
        const wrapper = firstError.closest('[data-field]');
        (wrapper || firstError).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const goNext = async () => {
    if (isRepeatable) repeatableAttempted.current = true;
    const valid = await trigger(getStepFieldNames());
    const repeatValid = validateRepeatableRequired();
    if (valid && repeatValid) {
      repeatableAttempted.current = false;
      setCurrentStep((i) => i + 1);
    } else {
      scrollToFirstError();
    }
  };

  const goPrev = () => setCurrentStep((i) => i - 1);

  const doSubmit = async () => {
    if (isRepeatable) repeatableAttempted.current = true;
    const valid = await trigger(getStepFieldNames());
    const repeatValid = validateRepeatableRequired();
    if (!valid || !repeatValid) {
      scrollToFirstError();
      return;
    }

    handleSubmit(
      async (values) => {
        // --- GET LOCATION FROM USER DISABLED (temporary) ---
        // const location = getSavedLocation();
        const location = null;

        if (!isOnline) {
          try {
            await addPending({
              formId: form.formId,
              formTitle: form.title,
              values,
              steps,
              location: location || null,
            });
            toast.success('بدون اینترنت ذخیره شد. هنگام اتصال ارسال می‌شود.');
            setSavedOffline(true);
            setSubmitted(true);
          } catch (err) {
            console.error('[offline submit] failed to enqueue form:', err);
            toast.error(err?.message ? `خطا در ذخیره فرم: ${err.message}` : 'خطا در ذخیره فرم');
          }
          return;
        }

        submitForm.mutate(
          { values, steps, formId: form.formId, location: location || null },
          {
            onSuccess: () => {
              toast.success('فرم با موفقیت ثبت شد.');
              setSavedOffline(false);
              setSubmitted(true);
            },
            onError: (err) => {
              toast.error(err?.message || 'خطا در ارسال فرم');
            },
          },
        );
      },
      () => scrollToFirstError()
    )();
  };

  useEffect(() => {
    if (!submitted) return;
    if (countdown <= 0) { onBack(); return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [submitted, countdown, onBack]);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);


  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-56px)] p-6 text-center">
        <div className={`size-16 rounded-full flex items-center justify-center mb-5 ${savedOffline ? 'bg-warning-50' : 'bg-success-50'}`}>
          <CircleCheckBigIcon className={`size-8 ${savedOffline ? 'text-warning-500' : 'text-success-500'}`} />
        </div>
        <h2 className="text-base font-bold text-grey-800 mb-2">
          {savedOffline ? 'بدون اینترنت ذخیره شد' : 'فرم ثبت شد'}
        </h2>
        <p className="text-sm text-grey-500 leading-relaxed mb-1">
          {savedOffline
            ? `فرم «${form.title}» به صف ارسال اضافه شد و هنگام اتصال به اینترنت ارسال می‌شود.`
            : `فرم «${form.title}» با موفقیت ثبت شد.`}
        </p>
        <p className="text-xs text-grey-400 mb-6">
          بازگشت خودکار تا {countdown} ثانیه...
        </p>
        <Button type="button" variant="outline" onClick={onBack} className="px-8">
          بازگشت به فرم‌ها
        </Button>
      </div>
    );
  }

  if (!step) {
    return <div className="py-12 text-center text-sm text-grey-400">این فرم مرحله‌ای ندارد.</div>;
  }

  return (
    <FormProvider {...methods}>
    <div className="flex flex-col min-h-[calc(100dvh-56px)]">
      <div className="flex-1 pb-24">

        {/* Sticky header */}
        <div className="sticky top-14 z-30 bg-white border-b border-grey-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <button type="button" onClick={onBack} className="p-1 -mr-1 rounded-md text-grey-400 hover:text-grey-700 hover:bg-grey-50 transition-colors">
              <ArrowRightIcon className="size-5" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-grey-800 truncate">{form.title}</p>
              <p className="text-[11px] text-grey-400 mt-0.5">
                مرحله {currentStep + 1} از {steps.length}
              </p>
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="p-4">
          <div className="flex items-start">
            {steps.map((s, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  {/* Dots row */}
                  <div className="flex items-center w-full">
                    {i > 0 && (
                      <div className={`flex-1 h-0.5 transition-colors duration-300 ${done || active ? 'bg-primary-400' : 'bg-grey-100'}`} />
                    )}
                    <button
                      type="button"
                      onClick={() => { if (done) setCurrentStep(i); }}
                      className={`shrink-0 size-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all duration-300 ${done
                        ? 'bg-primary-500 text-white cursor-pointer'
                        : active
                          ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                          : 'bg-grey-100 text-grey-400 cursor-default'
                        }`}
                    >
                      {done ? <CheckIcon className="size-3 stroke-3" /> : i + 1}
                    </button>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 transition-colors duration-300 ${done ? 'bg-primary-400' : 'bg-grey-100'}`} />
                    )}
                  </div>
                  {/* Label */}
                  <span className={`text-[10px] mt-1.5 text-center leading-tight max-w-[64px] truncate ${active ? 'text-primary-600 font-medium' : done ? 'text-grey-500' : 'text-grey-300'
                    }`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step title & description */}
        <div className="p-4 pb-5">
          <div className='flex w-full border border-primary-100 p-2 rounded-md'>
            <h2 className="text-sm font-semibold text-grey-800">{step.title}</h2>
          </div>
          {step.discription && (
            <p className="text-xs text-grey-400 mt-1 leading-relaxed">{step.discription}</p>
          )}
        </div>

        {/* Fields */}
        <div className="space-y-5 p-4">
          {allSections.length === 0 ? (
            <p className="text-sm text-grey-300 text-center py-6">بدون فیلد</p>
          ) : isRepeatable ? (
            <RepeatableStep step={step} control={control} />
          ) : (
            allSections.map((section) => (
              <FieldRenderer key={section.sectionId} section={section} control={control} />
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center safe-bottom">
        <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-sm border-t border-grey-100 p-4 flex gap-3">
          {!isFirst && (
            <Button type="button" variant="outline" onClick={goPrev} className="flex-1 h-11">
              قبلی
            </Button>
          )}
          {!isLast ? (
            <Button type="button" onClick={goNext} className="flex-1 h-11">
              بعدی
            </Button>
          ) : (
            <Button type="button" onClick={doSubmit} className="flex-1 h-11" disabled={submitForm.isPending}>
              {submitForm.isPending
                ? 'در حال ارسال...'
                : isOnline ? 'ثبت' : 'ذخیره برای ارسال بعدی'}
            </Button>
          )}
        </div>
      </div>
    </div>
    </FormProvider>
  );
}
