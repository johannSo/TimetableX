'use client';

import { forwardRef } from 'react';

type ButtonVariant =
  | 'primary'
  | 'outline'
  | 'ghost'
  | 'icon'
  | 'iconDanger'
  | 'chip'
  | 'plain';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn btn-primary',
  outline: 'btn btn-outline',
  ghost: 'btn btn-ghost',
  icon: 'icon-btn',
  iconDanger: 'icon-btn icon-btn-danger',
  chip: 'chip active:scale-[0.97]',
  plain: '',
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = 'button', variant = 'plain', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cx(variantClasses[variant], className)}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
