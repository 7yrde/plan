'use client';

import { useSession, signOut, signIn } from 'next-auth/react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  const handleSignIn = () => {
    signIn();
  };

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
              현황판
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                대시보드
              </Link>
              <Link href="/issues" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                이슈
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {status === 'loading' ? (
              <div className="text-sm text-muted-foreground">로딩 중...</div>
            ) : session ? (
              <>
                <span className="text-sm text-muted-foreground">
                  안녕하세요, {session.user?.name}님
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 