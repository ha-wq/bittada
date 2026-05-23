"use client";

import { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
type ButtonSize = "md" | "sm" | "lg";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const base = "inline-flex items-center justify-center font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
  const sizes: Record<ButtonSize, string> = {
    sm: "h-9 px-4 text-[14px]",
    md: "h-12 px-6 text-[15px]",
    lg: "h-14 px-7 text-[16px]",
  };
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white hover:bg-primary-active disabled:bg-primary-disabled disabled:text-white",
    secondary: "bg-canvas text-ink border border-ink hover:bg-surface-soft",
    tertiary: "bg-transparent text-ink hover:bg-surface-soft underline-offset-2",
    danger: "bg-canvas text-error border border-error hover:bg-surface-soft",
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string; error?: string }>(
  function Input({ label, hint, error, className = "", id, ...props }, ref) {
    const inputId = id || props.name;
    return (
      <label htmlFor={inputId} className="block">
        {label && (
          <span className="block text-[14px] font-medium text-ink mb-1.5">{label}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full h-14 px-4 bg-canvas border rounded-md text-[15px] text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:border-2 transition-colors ${
            error ? "border-error" : "border-hairline"
          } ${className}`}
          {...props}
        />
        {error && <span className="block text-[13px] text-error mt-1.5">{error}</span>}
        {hint && !error && <span className="block text-[13px] text-muted mt-1.5">{hint}</span>}
      </label>
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label?: string }>(
  function Select({ label, className = "", id, children, ...props }, ref) {
    const selectId = id || props.name;
    return (
      <label htmlFor={selectId} className="block">
        {label && (
          <span className="block text-[14px] font-medium text-ink mb-1.5">{label}</span>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full h-14 px-4 bg-canvas border border-hairline rounded-md text-[15px] text-ink focus:outline-none focus:border-ink focus:border-2 transition-colors ${className}`}
          {...props}
        >
          {children}
        </select>
      </label>
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  function Textarea({ label, className = "", id, ...props }, ref) {
    const tid = id || props.name;
    return (
      <label htmlFor={tid} className="block">
        {label && (
          <span className="block text-[14px] font-medium text-ink mb-1.5">{label}</span>
        )}
        <textarea
          ref={ref}
          id={tid}
          className={`w-full min-h-24 px-4 py-3 bg-canvas border border-hairline rounded-md text-[15px] text-ink focus:outline-none focus:border-ink focus:border-2 transition-colors ${className}`}
          {...props}
        />
      </label>
    );
  },
);

export function Badge({ children, variant = "neutral" }: { children: React.ReactNode; variant?: "neutral" | "warning" | "success" | "error" | "info" }) {
  const variants = {
    neutral: "bg-surface-strong text-ink",
    warning: "bg-[#fff4e6] text-warning",
    success: "bg-[#e6f7e6] text-success",
    error: "bg-[#fde8e8] text-error",
    info: "bg-[#e6f0ff] text-[#0a58ca]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-canvas border border-hairline rounded-md ${className}`}>
      {children}
    </div>
  );
}
