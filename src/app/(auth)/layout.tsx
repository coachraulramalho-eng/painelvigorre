import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="w-full max-w-md p-8">
        {children}
      </div>
    </div>
  );
}
