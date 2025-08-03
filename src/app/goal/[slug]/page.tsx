import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import GoalDetail from '../../../components/GoalDetail';

interface GoalPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GoalPage({ params }: GoalPageProps) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  const { slug } = await params;
  return <GoalDetail slug={slug} />;
} 