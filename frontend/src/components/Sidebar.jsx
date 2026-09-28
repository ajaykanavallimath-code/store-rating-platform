import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  PlusCircle, 
  Key, 
  LogOut, 
  ShoppingBag,
  Star
} from 'lucide-react';

export const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];

    if (user.role === 'ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
        { to: '/admin/stores', label: 'Manage Stores', icon: Store },
        { to: '/admin/users', label: 'Manage Users', icon: Users },
        { to: '/admin/stores/new', label: 'Add Store', icon: PlusCircle },
        { to: '/admin/users/new', label: 'Add User', icon: PlusCircle },
        { to: '/change-password', label: 'Change Password', icon: Key },
      ];
    }

    if (user.role === 'OWNER') {
      return [
        { to: '/owner/dashboard', label: 'Store Dashboard', icon: LayoutDashboard },
        { to: '/change-password', label: 'Change Password', icon: Key },
      ];
    }

    // Default USER
    return [
      { to: '/dashboard', label: 'Explore Stores', icon: ShoppingBag },
      { to: '/change-password', label: 'Change Password', icon: Key },
    ];
  };

  const links = getNavLinks();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
          <Store className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white text-base leading-none">StoreRate</span>
          <span className="text-[10px] uppercase font-semibold text-brand-400 tracking-wider mt-1">
            {user?.role} Portal
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin/dashboard' || link.to === '/owner/dashboard' || link.to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout button at bottom */}
      <div className="pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0 w-64 min-h-[calc(100vh-4rem)] border-r border-slate-800">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex animate-fadeIn">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-50 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
