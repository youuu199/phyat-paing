import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import useBreakpoint from '../hooks/useBreakpoint';

export default function AppLayout() {
  const bp = useBreakpoint();

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar: hidden on mobile, collapsed on tablet, full on desktop */}
      {bp !== 'mobile' && (
        <Sidebar collapsed={bp === 'tablet'} />
      )}

      <main className={`flex-1 overflow-y-auto ${bp === 'mobile' ? 'pb-16' : ''}`}>
        <Outlet />
      </main>

      {/* Bottom tab bar: mobile only */}
      {bp === 'mobile' && <MobileNav />}
    </div>
  );
}
