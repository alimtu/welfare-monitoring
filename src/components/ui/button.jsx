import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 aria-invalid:ring-2 aria-invalid:ring-danger-200 aria-invalid:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          'bg-primary-500 text-white shadow-xs hover:bg-primary-600 active:scale-[0.98] focus-visible:bg-primary-600',
        destructive:
          'bg-danger-500 text-white shadow-xs hover:bg-danger-600 active:scale-[0.98] focus-visible:ring-danger-300 focus-visible:bg-danger-600',
        outline:
          'border border-grey-200 bg-white shadow-xs hover:bg-grey-50 hover:border-grey-300 active:scale-[0.98] focus-visible:border-primary-400 focus-visible:ring-primary-200 focus-visible:ring-offset-2',
        secondary:
          'bg-grey-100 text-grey-800 shadow-xs hover:bg-grey-150 active:scale-[0.98] focus-visible:ring-grey-300 focus-visible:ring-offset-2',
        ghost:
          'hover:bg-grey-50 active:scale-[0.98] focus-visible:bg-grey-50 focus-visible:ring-grey-200 focus-visible:ring-offset-2',
        link:
          'text-primary-500 underline-offset-4 hover:text-primary-600 hover:underline focus-visible:underline focus-visible:ring-0 focus-visible:ring-offset-0',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
