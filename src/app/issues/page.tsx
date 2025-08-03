import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import IssuesView from '@/components/IssuesView';

export default async function IssuesPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return <IssuesView />;
} 