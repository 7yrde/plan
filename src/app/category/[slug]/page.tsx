import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import CategoryDetail from '../../../components/CategoryDetail';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/signin');
  }

  const { slug } = await params;
  return <CategoryDetail slug={slug} />;
} 