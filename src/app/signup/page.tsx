import AuthFlow from '@/components/AuthFlow';

export default function SignupPage() {
  return (
    <main className="app-shell edge-shell">
      <AuthFlow defaultMode="signup" />
    </main>
  );
}
