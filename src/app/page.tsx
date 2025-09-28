import PublicLayout from '@/components/layout/PublicLayout';
import LandingPage from '@/components/landing/LandingPage';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <PublicLayout>
      <LandingPage />
    </PublicLayout>
  );
}