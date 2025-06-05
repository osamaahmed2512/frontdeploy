import React from 'react';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';

const AnimatedLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="footer-link group flex items-center gap-2 transition-all duration-200 ease-in-out hover:text-purple-400 hover:scale-105 hover:shadow-purple-400/40"
  >
    {icon && (
      <span
        role="img"
        aria-label={label}
        className="inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-125"
      >
        {icon}
      </span>
    )}
    {label}
  </Link>
);

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <>
      <style>{`
        .footer-title {
          display: inline-block;
          position: relative;
          padding-left: 0.5rem;
          color: #fff !important;
          transition: color 0.3s;
        }
        .footer-title::after {
          content: '';
          display: block;
          position: absolute;
          left: 0;
          bottom: -8px;
          width: 0;
          height: 10px;
          border-radius: 4px;
          background: linear-gradient(90deg, #fff 0%, #e5e7eb 100%);
          transition: width 0.3s;
          z-index: 1;
        }
        .footer-title:hover::after {
          width: 100%;
        }
      `}</style>
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-left w-full shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start px-4 sm:px-6 lg:px-8 justify-center gap-10 md:gap-20 py-10 border-b border-white/20">
            {/* Platform Column */}
            <div className="flex flex-col md:items-start items-center w-full">
              <img src={assets.logo_dark} alt="logo" className="w-32 mb-4" />
              <p className="text-center md:text-left text-sm text-white/80 md:pr-8 max-w-md">
                Streamline your educational platform management. Monitor, manage, and maintain your learning ecosystem effectively.
              </p>
            </div>
            {/* Management Column */}
            <div className="flex flex-col md:items-start items-center w-full">
              <h2 className="footer-title text-lg font-bold mb-3">Management</h2>
              <ul className="flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2">
                <li><AnimatedLink to="/admin/manage-users" icon="👥" label="Users" /></li>
                <li><AnimatedLink to="/admin/pending-registrations" icon="⏳" label="Pending Users" /></li>
                <li><AnimatedLink to="/admin/manage-courses" icon="📚" label="Courses" /></li>
                <li><AnimatedLink to="/admin/manage-categories" icon="🏷️" label="Categories" /></li>
              </ul>
            </div>
            {/* Quick Access Column */}
            <div className="flex flex-col md:items-start items-center w-full">
              <h2 className="footer-title text-lg font-bold mb-3">Quick Access</h2>
              <ul className="flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2">
                <li><AnimatedLink to="/admin" icon="📊" label="Dashboard" /></li>
                <li><AnimatedLink to="/admin/manage-support" icon="🛠️" label="Support" /></li>
                <li><AnimatedLink to="/admin/manage-payment" icon="💳" label="Payments" /></li>
                <li><AnimatedLink to="/admin/manage-enrollments" icon="📝" label="Enrollments" /></li>
              </ul>
            </div>
            {/* System Status Column */}
            <div className="flex flex-col md:items-start items-center w-full">
              <h2 className="footer-title text-lg font-bold mb-3">System Status</h2>
              <div className="flex flex-col space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 aspect-square rounded-full bg-green-500 shadow-md animate-pulse inline-block align-middle flex-shrink-0 leading-none"
                    aria-label="System operational"
                  ></span>
                  <span>All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
          {/* Copyright Section */}
          <div className='px-4 sm:px-6 lg:px-8'>
            <p className='py-4 text-center text-xs sm:text-sm text-white/60'>
              Copyright {currentYear} &copy; Admin Dashboard. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default AdminFooter;