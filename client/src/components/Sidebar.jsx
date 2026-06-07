import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, MessageSquare, BookOpen, 
  ClipboardList, Users, Award, 
  Calendar, Settings, HelpCircle, LogOut, Star
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const commonLinks = [
    { name: 'Dashboard', path: `/${role}`, icon: <LayoutDashboard size={20} /> },
    { name: 'Chat Rooms', path: `/${role}/chat`, icon: <MessageSquare size={20} /> },
    { name: 'Events', path: `/${role}/events`, icon: <Calendar size={20} /> },
    { name: 'Settings', path: `/${role}/settings`, icon: <Settings size={20} /> },
  ];

  const roleLinks = {
    student: [
      { name: 'Homework', path: '/student/homework', icon: <BookOpen size={20} /> },
      { name: 'Attendance', path: '/student/attendance', icon: <Users size={20} /> },
      { name: 'Results', path: '/student/results', icon: <Award size={20} /> },
      { name: 'Rate Teachers', path: '/student/rating', icon: <Star size={20} /> },
    ],
    teacher: [
      { name: 'Mark Attendance', path: '/teacher/attendance', icon: <Users size={20} /> },
      { name: 'Upload Homework', path: '/teacher/homework', icon: <BookOpen size={20} /> },
      { name: 'Manage Results', path: '/teacher/results', icon: <Award size={20} /> },
    ],
    principal: [
      { name: 'School Analytics', path: '/principal/analytics', icon: <LayoutDashboard size={20} /> },
      { name: 'Complaints', path: '/principal/complaints', icon: <HelpCircle size={20} /> },
      { name: 'Teacher Reports', path: '/principal/reports', icon: <ClipboardList size={20} /> },
    ],
    admin: [
      { name: 'Manage Users', path: '/admin', icon: <Users size={20} /> },
      { name: 'Chat Rooms', path: '/admin/chat', icon: <MessageSquare size={20} /> },
      { name: 'Notices', path: '/admin/events', icon: <Calendar size={20} /> },
    ]
  };

  const links = [...commonLinks.slice(0, 1), ...(roleLinks[role] || []), ...commonLinks.slice(1)];

  return (
    <div className="w-64 h-screen glass-effect border-r border-white/5 flex flex-col fixed left-0 top-0 pt-20">
      <div className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === `/${role}`}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
              ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-rose-400 hover:bg-rose-500/10 transition-all">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
