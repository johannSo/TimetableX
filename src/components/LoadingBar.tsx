'use client';

interface LoadingBarProps {
  active: boolean;
}

export default function LoadingBar({ active }: LoadingBarProps) {
  return (
    <div
      className="loading-bar"
      style={{ opacity: active ? 1 : 0 }}
      aria-hidden="true"
    />
  );
}
