import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from '../i18n/translations.jsx';
import { LayoutDashboard, Compass, Camera, Zap, Target, Star, Filter, Settings, Languages } from 'lucide-react';
import Filters from './Filters';

const Layout = () => {
  const { t, lang, setLang } = useTranslation();

  const navItems = [
    { to: '/', label: t('nav_dashboard'), icon: <LayoutDashboard size={20} /> },
    { to: '/explore', label: t('nav_explore'), icon: <Compass size={20} /> },
    { to: '/exif', label: t('nav_exif'), icon: <Camera size={20} /> },
    { to: '/correlations', label: t('nav_correlations'), icon: <Zap size={20} /> },
    { to: '/hitrates', label: t('nav_hitrates'), icon: <Target size={20} /> },
    { to: '/quality', label: t('nav_quality'), icon: <Star size={20} /> },
    { to: '/lensprofile', label: t('nav_lensprofiles'), icon: <Filter size={20} /> },
    { to: '/lensconfig', label: t('nav_lensconfig'), icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col text-slate-200">
      {/* Top Header */}
      <header className="sticky-top glass m-4 p-4 flex items-center justify-between gap-8">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">L</div>
          <h1 className="font-bold text-xl title-gradient">Lightroom JS</h1>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => setLang(lang === 'en' ? 'nl' : 'en')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white glass px-3 py-1.5"
          >
            <Languages size={16} />
            {lang.toUpperCase()}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 pt-4">
        <Filters />
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
