import { useState } from 'react';
import SidebarMenu from './SidebarMenu';
import SidebarUser from './SidebarUser';

export default function Sidebar({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <>
      {!mobileOpen && (
        <button
          type="button"
          className="fixed z-50 p-3 text-white bg-[#03023B] rounded-lg shadow-lg lg:hidden top-4 left-4"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          <span className="block w-6 h-0.5 bg-white mb-1" />
          <span className="block w-6 h-0.5 bg-white mb-1" />
          <span className="block w-6 h-0.5 bg-white" />
        </button>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[220px] bg-[#03023B] p-5 transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block`}
      >
        <SidebarMenu onLogout={onLogout} onClose={closeMobileMenu} />
        <SidebarUser user={user} onLogout={onLogout} />
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
}