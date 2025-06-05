import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Loading from '../../components/student/Loading';
import { FiChevronLeft, FiChevronRight, FiEdit, FiTrash2, FiImage, FiX, FiPlus } from 'react-icons/fi';
import { Download, Search } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const MyCourses = () => {
  const [courses, setCourses] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const [editCourseData, setEditCourseData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sectionEdit, setSectionEdit] = useState({}); // { [sectionId]: newName }
  const [lessonEdit, setLessonEdit] = useState({}); // { [lessonId]: { name, duration_in_hours } }
  const fileInputRef = useRef();
  const itemsPerPage = 5;
  const API_BASE_URL = 'https://learnify.runasp.net';
  const [categories, setCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [oldCourseData, setOldCourseData] = useState(null);
  const quillEditRef = useRef(null);
  const quillEditInstance = useRef(null);
  const [editChaptersCourse, setEditChaptersCourse] = useState(null);
  const [editLessonsCourse, setEditLessonsCourse] = useState(null);

  const fetchEducatorCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://learnify.runasp.net/api/Course/GetInstructorCourses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to fetch courses', { position: 'bottom-right' });
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchEducatorCourses();
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/Category`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(res.data.categories || []);
      } catch (e) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editCourse && quillEditRef.current && !quillEditInstance.current) {
      quillEditInstance.current = new Quill(quillEditRef.current, { theme: 'snow' });
      quillEditInstance.current.on('text-change', () => {
        setEditCourseData(prev => ({ ...prev, describtion: quillEditInstance.current.root.innerHTML }));
      });
    }
    if (editCourse && quillEditInstance.current && oldCourseData?.describtion) {
      quillEditInstance.current.root.innerHTML = oldCourseData.describtion;
    }
    // Cleanup on modal close
    return () => {
      if (!editCourse && quillEditInstance.current) {
        quillEditInstance.current = null;
      }
    };
  }, [editCourse, oldCourseData]);

  if (!courses) {
    return <Loading />;
  }

  // Filter courses by search query (id or name)
  const filteredCourses = courses.filter(course => {
    const query = searchQuery.toLowerCase();
    return (
      course.id.toString().includes(query) ||
      (course.name && course.name.toLowerCase().includes(query))
    );
  });

  // Pagination calculations
  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCourses.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Date formatting function (+3 hours)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 3); // Add 3 hours
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Course Name', 'Students', 'Published On'];
    const rows = filteredCourses.map(course => [
      course.id,
      course.name,
      course.no_of_students,
      formatDate(course.creation_date)
    ]);
    const csvContent = [headers, ...rows]
      .map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'my_courses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add delete handler
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/Course/DeleteCourseById/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Course deleted successfully', { position: 'bottom-right' });
      fetchEducatorCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course', { position: 'bottom-right' });
    }
  };

  const handleEditCourse = async (course) => {
    setEditCourse(course);
    setEditCourseData(JSON.parse(JSON.stringify(course)));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/Course/GetCourseById/${course.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOldCourseData(response.data);
    } catch (error) {
      setOldCourseData(null);
    }
  };

  const handleCourseFieldChange = (field, value) => {
    setEditCourseData(prev => ({ ...prev, [field]: value }));
  };

  const handleSectionNameChange = (sectionId, value) => {
    setSectionEdit(prev => ({ ...prev, [sectionId]: value }));
  };

  const handleLessonFieldChange = (lessonId, field, value) => {
    setLessonEdit(prev => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        [field]: value
      }
    }));
  };

  const handleSaveCourse = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('Name', editCourseData.name);
      formData.append('Describtion', editCourseData.describtion);
      formData.append('CourseCategory', editCourseData.course_category);
      formData.append('LevelOfCourse', editCourseData.level_of_course);
      formData.append('Price', editCourseData.price);
      formData.append('Discount', editCourseData.discount);
      if (editCourseData.img_url instanceof File) {
        formData.append('Image', editCourseData.img_url);
      }
      (editCourseData.tags || []).forEach(tag => {
        formData.append('Tag', tag.name);
      });
      await axios.put(`${API_BASE_URL}/api/Course/UpdateCourse/${editCourseData.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Course updated successfully', { position: 'bottom-right' });
      setEditCourse(null);
      setEditCourseData(null);
      fetchEducatorCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course', { position: 'bottom-right' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSection = async (sectionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/Section/UpdateSection/${sectionId}`, { name: sectionEdit[sectionId] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Section updated successfully', { position: 'bottom-right' });
      setSectionEdit(prev => ({ ...prev, [sectionId]: undefined }));
      fetchEducatorCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update section', { position: 'bottom-right' });
    }
  };

  const handleSaveLesson = async (lessonId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/Lesson/UpdateLesson/${lessonId}`, lessonEdit[lessonId], {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Lesson updated successfully', { position: 'bottom-right' });
      setLessonEdit(prev => ({ ...prev, [lessonId]: undefined }));
      fetchEducatorCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update lesson', { position: 'bottom-right' });
    }
  };

  // Tag management
  const handleAddTag = () => {
    if (tagInput.trim() && !editCourseData.tags?.some(t => t.name === tagInput.trim())) {
      setEditCourseData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), { name: tagInput.trim() }]
      }));
      setTagInput('');
    }
  };
  const handleRemoveTag = (tagName) => {
    setEditCourseData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t.name !== tagName)
    }));
  };

  // Image management
  const handleRemoveImage = () => {
    setEditCourseData(prev => ({ ...prev, img_url: '' }));
  };
  const handleReplaceImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditCourseData(prev => ({ ...prev, img_url: file }));
    }
  };

  return (
    <>
      <style>{`
        .fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="fade-in-up min-h-screen bg-white p-3 sm:p-4 md:p-6 lg:p-8">
        <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar theme="colored" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-6">My Courses</h1>
        {/* Search and Export Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex-1">
            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
              <Search className="text-gray-500 mx-2 sm:mx-3" size={18} />
              <input
                type="text"
                placeholder="Search by ID or Course Name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="p-2.5 w-full outline-none text-sm sm:text-base placeholder-gray-400 cursor-text"
              />
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1 bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 whitespace-nowrap text-sm transition-colors duration-200 w-full sm:w-auto cursor-pointer"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export Data</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-3 sm:space-y-4 mb-6">
          {currentItems.length > 0 ? currentItems.map(course => (
            <div key={course.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-blue-600">{course.id}</span>
                <span className="font-medium">{course.name}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                {course.img_url ? (
                  <img src={course.img_url.startsWith('/') ? `${API_BASE_URL}${course.img_url}` : course.img_url}
                       alt={course.name}
                       className="w-12 h-12 object-cover rounded border" />
                ) : (
                  <span className="text-xs text-gray-400">No Image</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-1">Students: {course.no_of_students}</div>
              <div className="text-xs text-gray-500 mb-1">Published: {formatDate(course.creation_date)}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs" onClick={() => handleEditCourse(course)}>E</button>
                <button className="bg-orange-500 text-white px-3 py-1 rounded text-xs" onClick={() => setEditChaptersCourse(course)}>C</button>
                <button className="bg-yellow-500 text-white px-3 py-1 rounded text-xs" onClick={() => setEditLessonsCourse(course)}>L</button>
                <button className="bg-green-500 text-white px-3 py-1 rounded text-xs" onClick={() => setSelectedCourse(course)}>Det</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded text-xs" onClick={() => handleDeleteCourse(course.id)}>Del</button>
              </div>
            </div>
          )) : (
            <div className="text-center text-gray-500 py-8">No courses found.</div>
          )}
        </div>
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full w-full table-fixed overflow-hidden mt-6">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">ID</th>
                <th className="px-4 py-3 font-semibold truncate">Course Thumbnail</th>
                <th className="px-4 py-3 font-semibold truncate">Course Name</th>
                <th className="px-4 py-3 font-semibold truncate">Students</th>
                <th className="px-4 py-3 font-semibold truncate">Published On</th>
                <th className="px-4 py-3 font-semibold truncate">Edit</th>
                <th className="px-4 py-3 font-semibold truncate">Chapters</th>
                <th className="px-4 py-3 font-semibold truncate">Lessons</th>
                <th className="px-4 py-3 font-semibold truncate">Details</th>
                <th className="px-4 py-3 font-semibold truncate">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentItems.length > 0 ? (
                currentItems.map((course) => (
                  <tr key={course.id} className="border-b border-gray-500/20 hover:bg-gray-50">
                    <td className="px-4 py-3 text-center align-middle font-semibold text-xs sm:text-sm">{course.id}</td>
                    <td className="px-4 py-3 text-center align-middle">
                      {course.img_url ? (
                        <img
                          src={course.img_url.startsWith('/') ? `${API_BASE_URL}${course.img_url}` : course.img_url}
                          alt={`${course.name} thumbnail`}
                          className="w-10 h-10 object-cover rounded border shadow mx-auto"
                          onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No Image</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-xs sm:text-sm">{course.name}</td>
                    <td className="px-4 py-3 text-center align-middle">{course.no_of_students}</td>
                    <td className="px-4 py-3 text-center align-middle">{formatDate(course.creation_date)}</td>
                    <td className="px-4 py-3 text-center align-middle">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-1.5 rounded cursor-pointer text-xs sm:text-sm transition-colors duration-200" onClick={() => handleEditCourse(course)}>
                        Edit
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-1.5 rounded cursor-pointer text-xs sm:text-sm transition-colors duration-200" onClick={() => setEditChaptersCourse(course)}>
                        Chapters
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-1.5 rounded cursor-pointer text-xs sm:text-sm transition-colors duration-200" onClick={() => setEditLessonsCourse(course)}>
                        Lessons
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded cursor-pointer text-xs sm:text-sm transition-colors duration-200" onClick={() => setSelectedCourse(course)}>
                        Details
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <button
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        title="Delete"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-2 py-4 text-center text-gray-500 text-sm sm:text-base">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 mt-4 md:mt-6">
          <span className="text-gray-700 text-xs sm:text-sm md:text-base">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`p-1.5 sm:p-2 rounded-md flex items-center justify-center ${
                currentPage === 1 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
              }`}
            >
              <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-1.5 sm:p-2 rounded-md flex items-center justify-center ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
              }`}
            >
              <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        {/* Details Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedCourse(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl relative cursor-default overflow-y-auto max-h-[90vh] border border-blue-100" onClick={e => e.stopPropagation()}>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer text-xl p-2 rounded-full bg-gray-100 hover:bg-gray-200" onClick={() => setSelectedCourse(null)}>
                <FiX />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">Course Details</h2>
              <div className="flex flex-col items-center gap-4">
                {/* Image */}
                <div className="w-full max-h-64 h-56 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative mb-2">
                  {selectedCourse.img_url ? (
                    <img
                      src={selectedCourse.img_url.startsWith('/') ? `${API_BASE_URL}${selectedCourse.img_url}` : selectedCourse.img_url}
                      alt={selectedCourse.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400">No Image Available</span>
                  )}
                </div>
                {/* Info */}
                <div className="w-full mt-2 space-y-2">
                  <div><span className="font-semibold">ID:</span> <span className="font-mono select-all">{selectedCourse.id}</span></div>
                  <div><span className="font-semibold">Name:</span> {selectedCourse.name}</div>
                  <div><span className="font-semibold">Description:</span> <span className="block p-2 bg-gray-50 rounded text-xs text-gray-700" dangerouslySetInnerHTML={{ __html: selectedCourse.describtion || '' }} /></div>
                  <div><span className="font-semibold">Category:</span> {selectedCourse.course_category}</div>
                  <div><span className="font-semibold">No. of Hours:</span> {selectedCourse.no_of_hours}</div>
                  <div><span className="font-semibold">Instructor ID:</span> <span className="font-mono select-all">{selectedCourse.instructor_id}</span></div>
                  <div><span className="font-semibold">Instructor Name:</span> {selectedCourse.instructor_name}</div>
                  <div><span className="font-semibold">No. of Students:</span> {selectedCourse.no_of_students ?? 0}</div>
                  <div><span className="font-semibold">Published On:</span> {formatDate(selectedCourse.creation_date)}</div>
                  <div><span className="font-semibold">Level:</span> {selectedCourse.level_of_course}</div>
                  <div><span className="font-semibold">Average Rating:</span> {selectedCourse.average_rating}</div>
                  <div><span className="font-semibold">Price:</span> {selectedCourse.price}</div>
                  <div><span className="font-semibold">Discount:</span> {selectedCourse.discount}</div>
                  <div><span className="font-semibold">Discounted Price:</span> {selectedCourse.discounted_price}</div>
                  {/* Tags */}
                  <div>
                    <span className="font-semibold">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedCourse.tags && selectedCourse.tags.length > 0 ? (
                        selectedCourse.tags.map(tag => (
                          <span key={tag.id} className="bg-blue-100 px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                            <span className="font-mono select-all">{tag.id}</span>: {tag.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No tags</span>
                      )}
                    </div>
                  </div>
                  {/* Sections & Lessons */}
                  <div>
                    <span className="font-semibold">Sections (Chapters):</span>
                    <div className="space-y-2 mt-1">
                      {selectedCourse.sections && selectedCourse.sections.length > 0 ? (
                        selectedCourse.sections.map(section => (
                          <div key={section.id} className="bg-gray-50 rounded p-2">
                            <div className="font-semibold">Section: {section.name} <span className="text-xs text-gray-500">(ID: <span className="font-mono select-all">{section.id}</span>)</span></div>
                            {section.lessons && section.lessons.length > 0 ? (
                              <ul className="ml-4 mt-1 space-y-1">
                                {section.lessons.map(lesson => (
                                  <li key={lesson.id} className="text-xs bg-white rounded p-1 mb-1">
                                    <div><span className="font-semibold">Lesson:</span> {lesson.name} <span className="text-gray-500">(ID: <span className="font-mono select-all">{lesson.id}</span>)</span></div>
                                    <div><span className="font-semibold">Description:</span> {lesson.description || <span className="text-gray-400">None</span>}</div>
                                    <div><span className="font-semibold">File Path:</span> <span className="font-mono select-all">{lesson.file_bath}</span></div>
                                    <div><span className="font-semibold">Duration (hours):</span> {lesson.duration_in_hours}</div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-xs text-gray-400 ml-4">No lessons in this section.</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No sections (chapters) found.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Edit Course Modal */}
        {editCourse && editCourseData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setEditCourse(null)}>
            <div
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl relative cursor-default overflow-y-auto max-h-[90vh] border border-blue-100"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer text-xl p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                onClick={() => setEditCourse(null)}
                disabled={saving}
                style={{ cursor: 'pointer' }}
              >
                <FiX />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">Edit Course</h2>
              {/* Course Thumbnail */}
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4 relative">
                {editCourseData.img_url && typeof editCourseData.img_url === 'string' ? (
                  <img
                    src={editCourseData.img_url.startsWith('/') ? `${API_BASE_URL}${editCourseData.img_url}` : editCourseData.img_url}
                    alt={editCourseData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
                <label className="absolute bottom-2 right-2 bg-blue-500 text-white px-3 py-1 rounded cursor-pointer flex items-center gap-1">
                  <FiImage /> Replace
                  <input type="file" accept="image/*" className="hidden" onChange={handleReplaceImage} />
                </label>
              </div>
              {/* Course Info */}
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-1 text-xs text-gray-500">Current: {oldCourseData?.name}</div>
                  <label className="block text-sm font-medium mb-1">Course Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={editCourseData.name}
                    onChange={e => handleCourseFieldChange('name', e.target.value)}
                    placeholder={oldCourseData?.name || ''}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <div>
                  <div className="mb-1 text-xs text-gray-500">Current:</div>
                  <div className="mb-2 p-2 bg-gray-50 rounded text-xs text-gray-700" dangerouslySetInnerHTML={{ __html: oldCourseData?.describtion || '' }} />
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <div ref={quillEditRef} className="bg-white border rounded" style={{ minHeight: '120px' }} />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <div className="mb-1 text-xs text-gray-500">Current: {oldCourseData?.course_category}</div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      className="w-full border rounded px-3 py-2 pr-10 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-800 appearance-none cursor-pointer"
                      value={editCourseData.course_category || ''}
                      onChange={e => handleCourseFieldChange('course_category', e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      ▼
                    </span>
                  </div>
                  <div className="flex-1 relative">
                    <div className="mb-1 text-xs text-gray-500">Current: {oldCourseData?.level_of_course}</div>
                    <label className="block text-sm font-medium mb-1">Level</label>
                    <select
                      className="w-full border rounded px-3 py-2 pr-10 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-800 appearance-none cursor-pointer flex items-center"
                      value={editCourseData.level_of_course || ''}
                      onChange={e => handleCourseFieldChange('level_of_course', e.target.value)}
                    >
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      ▼
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="mb-1 text-xs text-gray-500">Current: {oldCourseData?.price}</div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={editCourseData.price || ''}
                      onChange={e => handleCourseFieldChange('price', e.target.value)}
                      placeholder={oldCourseData?.price?.toString() || ''}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-xs text-gray-500">Current: {oldCourseData?.discount}</div>
                    <label className="block text-sm font-medium mb-1">Discount (%)</label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={editCourseData.discount || ''}
                      onChange={e => handleCourseFieldChange('discount', e.target.value)}
                      placeholder={oldCourseData?.discount?.toString() || ''}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>
                {/* Tags management */}
                <div>
                  <div className="mb-1 text-xs text-gray-500">Current: {oldCourseData?.tags?.map(t => t.name).join(', ')}</div>
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editCourseData.tags && editCourseData.tags.map((tag, idx) => (
                      <span key={idx} className="bg-blue-100 px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer">
                        {tag.name}
                        <FiX className="text-red-500 font-bold cursor-pointer" onClick={() => handleRemoveTag(tag.name)} />
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      placeholder="Type tag and press Enter"
                      className="outline-none py-2 px-3 rounded border border-gray-500 flex-1"
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                      style={{ cursor: 'pointer' }}
                    />
                    <button className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center gap-1 cursor-pointer" onClick={handleAddTag} type="button">
                      <FiPlus /> Add
                    </button>
                  </div>
                </div>
              </div>
              {/* Sections & Lessons */}
              {editCourseData.sections && editCourseData.sections.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2 text-lg">Sections & Lessons</h3>
                  <div className="space-y-3">
                    {editCourseData.sections.map((section, sidx) => (
                      <div key={section.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="mb-1 text-xs text-gray-500">Current: {oldCourseData?.sections?.[sidx]?.name}</div>
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            className="border rounded px-2 py-1 flex-1"
                            value={sectionEdit[section.id] !== undefined ? sectionEdit[section.id] : section.name}
                            onChange={e => handleSectionNameChange(section.id, e.target.value)}
                          />
                          <button
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                            onClick={() => handleSaveSection(section.id)}
                            disabled={sectionEdit[section.id] === undefined || sectionEdit[section.id] === section.name}
                          >
                            Save
                          </button>
                        </div>
                        {/* Lessons Editing */}
                        {section.lessons && section.lessons.length > 0 && (
                          <ul className="space-y-2">
                            {section.lessons.map((lesson, lidx) => (
                              <li key={lesson.id} className="flex flex-col gap-1 mb-2">
                                <div className="mb-1 text-xs text-gray-500">Current: {oldCourseData?.sections?.[sidx]?.lessons?.[lidx]?.name} (Duration: {oldCourseData?.sections?.[sidx]?.lessons?.[lidx]?.duration_in_hours}h)</div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    className="border rounded px-2 py-1 flex-1"
                                    value={lessonEdit[lesson.id]?.name !== undefined ? lessonEdit[lesson.id].name : lesson.name}
                                    onChange={e => handleLessonFieldChange(lesson.id, 'name', e.target.value)}
                                  />
                                  <input
                                    type="number"
                                    className="border rounded px-2 py-1 w-20"
                                    value={lessonEdit[lesson.id]?.duration_in_hours !== undefined ? lessonEdit[lesson.id].duration_in_hours : lesson.duration_in_hours}
                                    onChange={e => handleLessonFieldChange(lesson.id, 'duration_in_hours', e.target.value)}
                                  />
                                  <button
                                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                    onClick={() => handleSaveLesson(lesson.id)}
                                    disabled={
                                      lessonEdit[lesson.id]?.name === undefined && lessonEdit[lesson.id]?.duration_in_hours === undefined
                                    }
                                  >
                                    Save
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                  onClick={() => setEditCourse(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
                  onClick={handleSaveCourse}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Chapters Modal */}
        {editChaptersCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setEditChaptersCourse(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl relative cursor-default overflow-y-auto max-h-[90vh] border border-green-100" onClick={e => e.stopPropagation()}>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer text-xl p-2 rounded-full bg-gray-100 hover:bg-gray-200" onClick={() => setEditChaptersCourse(null)}>
                <FiX />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">Edit Chapters for {editChaptersCourse.name}</h2>
              {editChaptersCourse.sections && editChaptersCourse.sections.length > 0 ? (
                <div className="space-y-4">
                  {editChaptersCourse.sections.map(section => (
                    <div key={section.id} className="mb-4 p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">Section ID: <span className="font-mono select-all">{section.id}</span></span>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 flex-1"
                          value={sectionEdit[section.id] !== undefined ? sectionEdit[section.id] : section.name}
                          onChange={e => handleSectionNameChange(section.id, e.target.value)}
                        />
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                          onClick={() => handleSaveSection(section.id)}
                          disabled={sectionEdit[section.id] === undefined || sectionEdit[section.id] === section.name}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">No chapters (sections) found for this course.</div>
              )}
            </div>
          </div>
        )}
        {/* Edit Lessons Modal */}
        {editLessonsCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setEditLessonsCourse(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl relative cursor-default overflow-y-auto max-h-[90vh] border border-yellow-100" onClick={e => e.stopPropagation()}>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer text-xl p-2 rounded-full bg-gray-100 hover:bg-gray-200" onClick={() => setEditLessonsCourse(null)}>
                <FiX />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">Edit Lessons for {editLessonsCourse.name}</h2>
              {editLessonsCourse.sections && editLessonsCourse.sections.length > 0 ? (
                <div className="space-y-4">
                  {editLessonsCourse.sections.map(section => (
                    <div key={section.id} className="mb-4 p-3 bg-gray-50 rounded">
                      <div className="font-semibold mb-2">Section: {section.name} <span className="text-xs text-gray-500">(ID: <span className="font-mono select-all">{section.id}</span>)</span></div>
                      {section.lessons && section.lessons.length > 0 ? (
                        section.lessons.map(lesson => (
                          <div key={lesson.id} className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">Lesson ID: <span className="font-mono select-all">{lesson.id}</span></span>
                            <input
                              type="text"
                              className="border rounded px-2 py-1 flex-1"
                              value={lessonEdit[lesson.id]?.name !== undefined ? lessonEdit[lesson.id].name : lesson.name}
                              onChange={e => handleLessonFieldChange(lesson.id, 'name', e.target.value)}
                            />
                            <input
                              type="number"
                              className="border rounded px-2 py-1 w-20"
                              value={lessonEdit[lesson.id]?.duration_in_hours !== undefined ? lessonEdit[lesson.id].duration_in_hours : lesson.duration_in_hours}
                              onChange={e => handleLessonFieldChange(lesson.id, 'duration_in_hours', e.target.value)}
                            />
                            <button
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                              onClick={() => handleSaveLesson(lesson.id)}
                              disabled={
                                lessonEdit[lesson.id]?.name === undefined && lessonEdit[lesson.id]?.duration_in_hours === undefined
                              }
                            >
                              Save
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-400">No lessons found in this section.</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">No sections (chapters) found for this course.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyCourses;