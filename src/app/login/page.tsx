import AuthFlow from '@/components/AuthFlow';

export default function LoginPage() {
  return (
    <main className="app-shell edge-shell">
      <AuthFlow defaultMode="signin" />
    </main>
  );
}
