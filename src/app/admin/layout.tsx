import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

/**
 * Admin layout — wrapper for the admin area. Server component.
 *
 * Route protection is enforced by the middleware admin role guard; the layout
 * trusts that any request reaching it belongs to an admin and simply renders
 * the shared sidebar rail plus the page content. The content column is offset
 * by the sidebar width on desktop (`md:ml-64`) and padded to clear the fixed
 * bars (`pt-20`).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface min-h-screen">
      <AdminSidebar />
      <main className="px-container-padding-mobile md:ml-64 md:px-container-padding-desktop pt-20 pb-16">
        {children}
      </main>
    </div>
  );
}