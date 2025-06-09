import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiTarget, FiCoffee, FiCheckCircle, FiAward, FiCheckSquare } from 'react-icons/fi';
import { FaLightbulb } from 'react-icons/fa';
import api from '../../api'; // Import the API utility
import { useSelector } from 'react-redux'; // Import useSelector to get user from Redux
import { AppContext } from '../../context/AppContext';
import { useTimer } from '../../context/TimerContext';

const ProfileOverview = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [focusSessionData, setFocusSessionData] = useState(null); // State for focus session data
  const [loadingFocusSession, setLoadingFocusSession] = useState(true); // State for loading status
  const [flashcardsCount, setFlashcardsCount] = useState(null);
  const [todosCount, setTodosCount] = useState(null);
  const [userName, setUserName] = useState('');

  // Get user from Redux state
  const { user: userData } = useSelector((state) => state.user);

  const context = useContext(AppContext);
  const { focusStats } = useTimer();

  // Format current date and time
  const currentDateTime = "2025-03-05 04:04:53";

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return {
      formattedDate: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      formattedTime: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const { formattedDate, formattedTime } = formatDateTime(currentDateTime);

  const IconWrapper = ({ children, color }) => (
    <motion.div
      whileHover={{
        scale: 1.2,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 10
        }
      }}
      className={`
        flex items-center justify-center rounded-full p-2
        ${color === 'white'
          ? 'bg-white/10 hover:bg-white/20'
          : `bg-${color}-100/50 hover:bg-${color}-200/70`
        }
        shadow-sm hover:shadow-lg
        transform-gpu
        transition-all duration-300 ease-out
        group
      `}
    >
      <motion.div
        className="transform-gpu transition-transform duration-300 ease-out"
      >
        {children}
      </motion.div>
    </motion.div>
  );

  const stats = [
    {
      title: 'Flashcards',
      count: flashcardsCount !== null ? flashcardsCount : 'Loading...',
      color: 'blue',
      icon: <FaLightbulb className="w-6 h-6 group-hover:text-blue-600 transition-colors duration-300" />,
      subtext: 'Total cards created'
    },
    {
      title: 'Todos',
      count: todosCount !== null ? todosCount : 'Loading...',
      color: 'green',
      icon: <FiCheckSquare className="w-6 h-6 group-hover:text-green-600 transition-colors duration-300" />,
      subtext: 'Completed tasks'
    },
    {
      title: 'Focus Sessions',
      count: 12,
      color: 'red',
      icon: <FiClock className="w-6 h-6 group-hover:text-red-600 transition-colors duration-300" />,
      subtext: 'Sessions completed'
    }
  ];

  const pomodoroStats = {
    workTime: '4h 30m',
    breakTime: '1h 15m'
  };

  // Helper function to format minutes into Hh Mm format
  const formatMinutes = (totalMinutes) => {
    if (totalMinutes === null || totalMinutes === undefined) return 'N/A';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  // Fetch focus session data on component mount
  useEffect(() => {
    const fetchFocusSessionData = async () => {
      if (!userData?.id) { // Ensure user is logged in
        setLoadingFocusSession(false);
        return;
      }
      try {
        const response = await api.get('/FocusSession/today');
        setFocusSessionData(response.data);
      } catch (error) {
        console.error('Error fetching focus session data:', error);
        setFocusSessionData({ work_minutes: 0, break_minutes: 0 }); // Set to 0 on error
      } finally {
        setLoadingFocusSession(false);
      }
    };

    fetchFocusSessionData();
  }, [userData]); // Refetch when user changes

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [flashRes, todoRes] = await Promise.all([
          api.get('/Flashcards/count'),
          api.get('/ToDo/count')
        ]);
        setFlashcardsCount(flashRes.data.task_count);
        setTodosCount(todoRes.data.task_count);
      } catch (error) {
        setFlashcardsCount(0);
        setTodosCount(0);
        console.error('Error fetching counts:', error);
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const res = await api.get('/Auth/GetUserdetails');
        setUserName(res.data.name);
      } catch (error) {
        setUserName('User');
        console.error('Error fetching user name:', error);
      }
    };
    fetchUserName();
  }, []);

  const activities = [
    {
      type: 'pomodoro',
      title: 'Completed Work Session',
      subject: '25 minutes focused work',
      time: '1 hour ago',
      icon: <FiClock className="w-4 h-4 group-hover:text-red-600" />
    },
    {
      type: 'todo',
      title: 'Task Completed',
      subject: 'Advanced JavaScript Concepts',
      time: '2 hours ago',
      icon: <FiCheckSquare className="w-4 h-4 group-hover:text-green-600" />
    },
    {
      type: 'flashcard',
      title: 'Flashcard Set Completed',
      subject: 'React Hooks Review',
      time: '3 hours ago',
      icon: <FaLightbulb className="w-4 h-4 group-hover:text-blue-600" />
    },
    {
      type: 'pomodoro',
      title: 'Break Time',
      subject: '5 minutes break',
      time: '3.5 hours ago',
      icon: <FiCoffee className="w-4 h-4 group-hover:text-green-600" />
    },
    ...Array(6).fill().map((_, i) => ({
      type: i % 3 === 0 ? 'pomodoro' : i % 3 === 1 ? 'todo' : 'flashcard',
      title: i % 3 === 0 ? 'Completed Work Session' :
        i % 3 === 1 ? 'Task Completed' : 'Flashcard Set Completed',
      subject: i % 3 === 0 ? '25 minutes focused work' :
        i % 3 === 1 ? `Task #${i + 1}` : `Flashcard Set #${i + 1}`,
      time: `${i + 4} hours ago`,
      icon: i % 3 === 0 ? <FiClock className="w-4 h-4 group-hover:text-red-600" /> :
        i % 3 === 1 ? <FiCheckSquare className="w-4 h-4 group-hover:text-green-600" /> :
          <FaLightbulb className="w-4 h-4 group-hover:text-blue-600" />
    }))
  ];

  const achievements = [
    { title: 'Started Learning Journey', date: '2024-01-01', icon: '🎯' },
    { title: 'First Focus Session', date: '2024-01-15', icon: '⏱️' },
    { title: 'Finished 10 Tasks', date: '2024-02-01', icon: '✓' },
    { title: '50 Hours of Focus Time', date: '2024-02-15', icon: '🎯' },
    { title: 'Created 100 Flashcards', date: '2024-03-01', icon: '🎴' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative p-6 sm:p-8 lg:p-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  Welcome back, {userName}! 👋
                </h1>
              </div>
              <motion.div className="hidden sm:block">
                <IconWrapper color="white">
                  <FiAward className="w-12 h-12 text-white/90 group-hover:text-white transition-colors duration-300" />
                </IconWrapper>
              </motion.div>
            </div>
            <p className="text-white/80 text-sm sm:text-base max-w-2xl">
              Track your focus sessions, tasks completed, and flashcards mastered!
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1) }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{stat.title}</h3>
              <IconWrapper color={stat.color}>
                {stat.icon}
              </IconWrapper>
            </div>
            <p className={`text-3xl sm:text-4xl font-bold text-${stat.color}-600`}>
              {stat.count}
            </p>
            <p className="mt-1 text-sm text-gray-500">{stat.subtext}</p>
          </motion.div>
        ))}
      </div>

      {/* Focus Stats Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Focus</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <FiClock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Focused Work</p>
              <p className="text-lg font-semibold text-gray-800">{focusStats.work_minutes} minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <FiCoffee className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Break Time</p>
              <p className="text-lg font-semibold text-gray-800">{focusStats.break_minutes} minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex space-x-8 px-6 pt-4 min-w-max">
            {['today', 'week', 'month'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <IconWrapper color="green">
              <FiCheckCircle className="w-5 h-5 group-hover:text-green-600" />
            </IconWrapper>
            Completed Activities
          </h4>

          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors
                           border border-gray-100 hover:border-gray-200"
              >
                <IconWrapper color={
                  activity.type === 'pomodoro' ? 'red' :
                    activity.type === 'todo' ? 'green' : 'blue'
                }>
                  {activity.icon}
                </IconWrapper>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                  <p className="text-sm text-gray-500 truncate">{activity.subject}</p>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Achievement Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-6">Achievement Timeline</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (index * 0.1) }}
                className="relative pl-10"
              >
                <div className="flex items-center mb-1">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 10
                    }}
                    className="absolute left-0 w-8 h-8 flex items-center justify-center rounded-full 
                               bg-indigo-100 text-indigo-500 border-2 border-white shadow-sm
                               hover:bg-indigo-200 hover:text-indigo-600 transition-all duration-300"
                  >
                    {achievement.icon}
                  </motion.div>
                  <motion.h4
                    whileHover={{ x: 5 }}
                    className="text-base sm:text-lg font-medium text-gray-900 hover:text-indigo-600 
                               transition-colors truncate"
                  >
                    {achievement.title}
                  </motion.h4>
                </div>
                <time className="text-sm text-gray-500">
                  {new Date(achievement.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileOverview;