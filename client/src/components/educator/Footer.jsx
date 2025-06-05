import React from 'react';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';

const AnimatedLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="footer-link group flex items-center gap-2 transition-all duration-200 ease-in-out hover:text-sky-400 hover:scale-105 hover:shadow-sky-400/40"
  >
    <span
      role="img"
      aria-label={label}
      className="inline-block transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-125"
    >
      {icon}
    </span>
    {label}
  </Link>
);

const Footer = () => {
  // to get date of this year
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
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
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 md:px-36 text-left w-full shadow-2xl">
        <div className="flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-20 py-10 border-b border-white/20">
          {/* Platform Column */}
          <div className="flex flex-col md:items-start items-center w-full">
{/*             <h2 className="footer-title text-lg font-bold mb-3">Platform</h2> */}
            <img src={assets.logo_dark} alt="logo" className="w-32 mb-4" />
            <p className="text-center md:text-left text-sm text-white/80">Empower your teaching journey with our educator platform. Create engaging courses, track student progress, and make a lasting impact on learners worldwide.</p>
          </div>

          {/* Dashboard Column */}
          <div className="flex flex-col md:items-start items-center w-full">
            <h2 className="footer-title text-lg font-bold mb-3">Dashboard</h2>
            <ul className="flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2">
              <li><AnimatedLink to="/educator" icon="📊" label="My Dashboard" /></li>
              <li><AnimatedLink to="/educator/add-course" icon="➕" label="Add Course" /></li>
              <li><AnimatedLink to="/educator/my-courses" icon="📚" label="My Courses" /></li>
              <li><AnimatedLink to="/educator/student-enrolled" icon="👥" label="My Students" /></li>
            </ul>
          </div>
          {/* Company Column */}
          <div className="flex flex-col md:items-start items-center w-full">
            <h2 className="footer-title text-lg font-bold mb-3">Company</h2>
            <ul className="flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2">
{/*               <li><AnimatedLink to="/" icon="🏠" label="Home" /></li> */}
              <li><AnimatedLink to="/about-us" icon="ℹ️" label="About Us" /></li>
              <li><AnimatedLink to="/contact-us" icon="✉️" label="Contact Us" /></li>
              <li><AnimatedLink to="/privacy-policy" icon="🔒" label="Privacy Policy" /></li>
            </ul>
          </div>
          {/* Profile Column - hidden on mobile, visible on md+ */}
          {/* <div className="hidden md:flex flex-col md:items-start items-center w-full">
            <h2 className="footer-title text-lg font-bold mb-3">Profile</h2>
            <ul className="flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2">
              <li><AnimatedLink to="/profile/settings" icon="👤" label="My Info" /></li>
              <li><AnimatedLink to="/profile/security" icon="🔐" label="Security" /></li>
              <li><AnimatedLink to="/profile/todos" icon="✅" label="Todos" /></li>
            </ul>
          </div> */}

          <div className="hidden md:flex flex-col md:items-start items-center w-full">
            <h2 className="footer-title text-lg font-bold mb-3">Tools</h2>
            <ul className="flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2">
              <li><AnimatedLink to="/profile/todos" icon="✅" label="Todos" /></li>
            </ul>
          </div>
          
        </div>
        <p className="py-4 text-center text-xs md:text-sm md:tracking-tight text-white/60">Copyright {currentYear} &copy; Developers. All Right Reserved.</p>
      </footer>
    </>
  );
};

export default Footer;