import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

const sizeVariants = {
  sm: 'h-4 w-7', // sm size variant
  md: 'h-6 w-11', // md size variant (default)
  lg: 'h-8 w-14' // lg size variant
};

const thumbSizeVariants = {
  sm: 'h-3 w-3 data-[state=checked]:translate-x-3', // sm thumb size
  md: 'h-5 w-5 data-[state=checked]:translate-x-5', // md thumb size (default)
  lg: 'h-7 w-7 data-[state=checked]:translate-x-7' // lg thumb size
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'sm', ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=unchecked]:bg-muted',
      sizeVariants[size],
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none rounded-full bg-card shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0',
        thumbSizeVariants[size]
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
