import logout from '@/assets/Logout.svg';
import logo from '@/assets/Logo.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function SidebarMenu({ onLogout, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [open, setOpen] = useState(currentPath.startsWith('/member'));

  const menuItem = 'font-bebas text-2xl my-2 px-3 py-2 rounded cursor-pointer';
  const subItem = 'font-bebas text-xl my-2 ml-4 cursor-pointer text-sm rounded px-2 py-1 flex items-center';

  const isActive = (path) => currentPath === path;

  const go = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <div className="flex flex-col h-screen">
      <img src={logo} alt="Pound for Pound Fitness" className="mb-6 h-20" />

      <ul className="flex flex-col flex-1">
        <li className={`${menuItem} ${isActive('/dashboard') ? 'text-black bg-[#FFDE59]' : 'text-white hover:text-black hover:bg-[#FFDE59]'}`} onClick={() => go('/dashboard')}>Dashboard</li>
        <li className={`${menuItem} ${isActive('/expenses') ? 'text-black bg-[#FFDE59]' : 'text-white hover:text-black hover:bg-[#FFDE59]'}`} onClick={() => go('/expenses')}>Expenses</li>
        <li className={`${menuItem} ${isActive('/programs') ? 'text-black bg-[#FFDE59]' : 'text-white hover:text-black hover:bg-[#FFDE59]'}`} onClick={() => go('/programs')}>Programs</li>
        <li className={`${menuItem} ${isActive('/plans') ? 'text-black bg-[#FFDE59]' : 'text-white hover:text-black hover:bg-[#FFDE59]'}`} onClick={() => go('/plans')}>Plans</li>

        <li className={`${menuItem} text-white hover:text-black hover:bg-[#FFDE59]`} onClick={() => setOpen(!open)}>
          Members {open ? '▼' : '▶'}
        </li>

        {open && (
          <ul>
            <li className={`${subItem} ${isActive('/memberprofiles') ? 'text-black bg-[#FFDE59]' : 'text-white hover:text-black hover:bg-[#FFDE59]'}`} onClick={() => go('/memberprofiles')}>Member Profile</li>
            <li className={`${subItem} ${isActive('/memberships') ? 'text-black bg-[#FFDE59]' : 'text-white hover:text-black hover:bg-[#FFDE59]'}`} onClick={() => go('/memberships')}>Membership</li>
            <li className={`${subItem} ${isActive('/walkins') ? 'text-black bg-[#FFDE59]' : 'text-white hover:text-black hover:bg-[#FFDE59]'}`} onClick={() => go('/walkins')}>Walk-Ins</li>
            <li className={`${subItem} ${isActive('/trainingsubs') ? 'text-black bg-[#FFDE59]' : 'text-white hover:text-black hover:bg-[#FFDE59]'}`} onClick={() => go('/trainingsubs')}>Training Subs.</li>
            <li className={`${subItem} ${isActive('/payments') ? 'text-black bg-[#FFDE59]' : 'text-white hover:text-black hover:bg-[#FFDE59]'}`} onClick={() => go('/payments')}>Payments</li>
          </ul>
        )}

        <li className="mt-auto font-bebas text-2xl mb-8 px-3 py-2 rounded cursor-pointer text-red-600 hover:bg-red-100 flex items-center" onClick={onLogout}>
          Logout <img src={logout} alt="Logout Icon" className="ml-2 h-6 w-6" />
        </li>
      </ul>
    </div>
  );
}