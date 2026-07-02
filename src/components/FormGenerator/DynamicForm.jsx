'use client';

import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';
import { Button } from '../ui/button';
import FieldRenderer from './FieldRenderer';
import buildFormSchema from '../../lib/utils/buildFormSchema';

export default function DynamicForm({ form }) {
  const schema = buildFormSchema(form.steps);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: joiResolver(schema),
    defaultValues: {},
  });

  const onSubmit = (values) => {
    console.log(`Form [${form.formId}] submitted:`, values);
  };

  const defaultOpenSteps = form.steps.map((s) => `step-${s.stepId}`);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Accordion type="multiple" defaultValue={defaultOpenSteps}>
        {form.steps.map((step) => {
          const allSections = [...(step.sections || [])];

          return (
            <AccordionItem key={step.stepId} value={`step-${step.stepId}`}>
              <AccordionTrigger className="bg-gray-100 px-3 rounded-md text-sm font-semibold">
                {step.title}
              </AccordionTrigger>
              <AccordionContent className="px-1 pt-3">
                {step.discription && (
                  <p className="text-xs text-gray-500 mb-3">{step.discription}</p>
                )}
                <div className="space-y-4">
                  {allSections.map((section) => (
                    <FieldRenderer
                      key={section.sectionId}
                      section={section}
                      control={control}
                    />
                  ))}
                  {allSections.length === 0 && (
                    <p className="text-xs text-gray-400">بدون فیلد</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'در حال ارسال...' : 'ثبت فرم'}
      </Button>
    </form>
  );
}
