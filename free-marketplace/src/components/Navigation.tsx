import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Globe, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBell } from './NotificationBell';

export default function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t, i18n } = useTranslation();
  const [showLangMenu, setShowLangMenu] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const { user, loading, signOut } = useAuth();

  const switchLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLangMenu(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const currentLang = i18n.language;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-black">
              FreeMarket
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
            <Link to="/" className="text-gray-900 hover:text-gray-600 font-medium">
              {t('nav.home')}
            </Link>
            <Link to="/games" className="text-gray-900 hover:text-gray-600 font-medium">
              {t('nav.games')}
            </Link>
            <Link to="/programs" className="text-gray-900 hover:text-gray-600 font-medium">
              {t('nav.programs')}
            </Link>
            <Link to="/blog" className="text-gray-900 hover:text-gray-600 font-medium">
              {t('nav.blog')}
            </Link>
            <Link to="/forums" className="text-gray-900 hover:text-gray-600 font-medium">
              {t('nav.forums')}
            </Link>

            {/* Profile Dropdown */}
            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2 text-gray-900 hover:text-gray-600 font-medium px-2 py-1 rounded-md"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <ChevronDown size={16} />
                    </button>
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <Link
                          to={`/profile/${user.id}`}
                          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 text-gray-900"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User size={16} />
                          {t('nav.viewProfile')}
                        </Link>
                        <Link
                          to="/profile/edit"
                          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 text-gray-900"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings size={16} />
                          {t('nav.editProfile')}
                        </Link>
                        <hr className="border-gray-200 my-1" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-100 text-gray-900 text-left"
                        >
                          <LogOut size={16} />
                          {t('nav.signOut')}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/forums/login"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-medium"
                  >
                    {t('nav.signIn')}
                  </Link>
                )}
              </>
            )}

            {/* Notification Bell */}
            <NotificationBell />

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 text-gray-900 hover:text-gray-600 font-medium px-2 py-1 rounded-md"
              >
                <Globe size={20} />
                <span className="uppercase">{currentLang}</span>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <button
                    onClick={() => switchLanguage('en')}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentLang === 'en' ? 'font-bold' : ''}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => switchLanguage('es')}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentLang === 'es' ? 'font-bold' : ''}`}
                  >
                    Español
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <NotificationBell />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-900 p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-3 text-gray-900 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/games"
              className="block px-3 py-3 text-gray-900 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.games')}
            </Link>
            <Link
              to="/programs"
              className="block px-3 py-3 text-gray-900 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.programs')}
            </Link>
            <Link
              to="/blog"
              className="block px-3 py-3 text-gray-900 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.blog')}
            </Link>
            <Link
              to="/forums"
              className="block px-3 py-3 text-gray-900 hover:bg-gray-100 rounded-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.forums')}
            </Link>

            {/* Mobile Profile Section */}
            {!loading && (
              <>
                {user ? (
                  <div className="pt-3 border-t border-gray-200 mt-3">
                    <div className="px-3 py-2 text-gray-600 text-sm font-medium flex items-center gap-2">
                      <User size={16} />
                      {t('nav.profile')}
                    </div>
                    <Link
                      to={`/profile/${user.id}`}
                      className="block px-3 py-3 text-gray-900 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('nav.viewProfile')}
                    </Link>
                    <Link
                      to="/profile/edit"
                      className="block px-3 py-3 text-gray-900 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('nav.editProfile')}
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="w-full text-left block px-3 py-3 text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                      {t('nav.signOut')}
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-gray-200 mt-3">
                    <Link
                      to="/forums/login"
                      className="block px-4 py-3 bg-black text-white rounded-lg mx-3 text-center font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('nav.signIn')}
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Language Switcher */}
            <div className="pt-3 border-t border-gray-200 mt-3">
              <div className="px-3 py-2 text-gray-600 text-sm font-medium flex items-center gap-2">
                <Globe size={16} />
                Language / Idioma
              </div>
              <button
                onClick={() => {
                  switchLanguage('en');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-3 text-gray-900 hover:bg-gray-100 rounded-lg ${currentLang === 'en' ? 'font-bold bg-gray-50' : ''}`}
              >
                English
              </button>
              <button
                onClick={() => {
                  switchLanguage('es');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-3 text-gray-900 hover:bg-gray-100 rounded-lg ${currentLang === 'es' ? 'font-bold bg-gray-50' : ''}`}
              >
                Español
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
