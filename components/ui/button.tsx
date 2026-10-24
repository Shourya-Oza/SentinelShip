import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-[13px] font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border-border-strong bg-surface text-foreground hover:bg-surface-raised',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-surface-raised',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        destructive: 'border-danger/25 bg-danger/10 text-danger hover:bg-danger/15',
        link: 'text-accent-foreground underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 gap-1.5 px-3',
        xs: 'h-6 gap-1 rounded-[5px] px-2 text-xs',
        sm: 'h-7 gap-1.5 px-2.5 text-xs',
        lg: 'h-9 gap-2 px-4',
        icon: 'size-8',
        'icon-xs': 'size-6 rounded-[5px]',
        'icon-sm': 'size-7',
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
