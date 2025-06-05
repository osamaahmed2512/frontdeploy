import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import RecommendationSearchBar from '../../components/student/RecommendationSearchBar';
import { useParams, useNavigate } from 'react-router-dom';
import CourseCard from '../../components/student/CourseCard';
import { assets } from '../../assets/assets';
import Footer from '../../components/student/Footer';
import { FaRobot } from "react-icons/fa";
import RagChat from '../../components/chat/RagChat';
import axios from 'axios';

const RecommendedCourseList = () => {
  const { navigate } = useContext(AppContext);
  const { input } = useParams();
  const [showRagModal, setShowRagModal] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://learnify.runasp.net/api/Recommendations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          }
        });

        if (response.data.success) {
          const transformedCourses = response.data.data.map(course => ({
            _id: course["Course ID"],
            courseTitle: course["Course Title"],
            courseThumbnail: course.ImgUrl || 'default-image-url.jpg',
            coursePrice: course.price,
            discount: course.discount,
            courseRatings: Array(Math.floor(course.AverageRating)).fill({ 
              rating: Number(course.AverageRating.toFixed(2)) 
            }),
            courseCategory: course["CourseCategory"],
            difficultyLevel: course["Difficulty Level"],
            discountedPrice: course.discounted_price
          }));
          setRecommendedCourses(transformedCourses);
          setFilteredCourses(transformedCourses);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  useEffect(() => {
    if (recommendedCourses.length > 0) {
      const tempCourses = recommendedCourses.slice();
      if (input) {
        setFilteredCourses(
          tempCourses.filter(
            (item) =>
              item.courseTitle.toLowerCase().includes(input.toLowerCase())
          )
        );
      } else {
        setFilteredCourses(tempCourses);
      }
    }
  }, [input, recommendedCourses]);

  return (
    <>
      <div className="relative px-4 sm:px-6 md:px-8 lg:px-16 xl:px-36 pt-15 text-left min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:space-y-6 md:flex-row md:justify-between md:items-start md:space-y-0">
          {/* Title and Breadcrumb */}
          <div className="w-full md:w-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800 mb-2">
              Recommended Courses
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate('/')}
              >
                Home
              </span>{' '}
              / <span>Recommended Courses</span>
            </p>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full md:w-auto">
            <div className="w-full sm:w-auto">
              <RecommendationSearchBar data={input} />
            </div>
          </div>
        </div>

        {/* Search Tag */}
        {input && (
          <div className="inline-flex items-center gap-3 px-3 py-1.5 border mt-6 mb-6 text-sm text-gray-600 rounded-md">
            <p>{input}</p>
            <img
              src={assets.cross_icon}
              alt=""
              className="cursor-pointer w-4 h-4"
              onClick={() => navigate('/recommended-courses')}
            />
          </div>
        )}

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-8 sm:my-12">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))
          ) : (
            <div className="col-span-full py-12 px-4">
              <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  No Recommended Courses Found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Sorry, we couldn't find any recommended courses matching your criteria.
                </p>
                {input && (
                  <p className="text-xs sm:text-sm text-gray-500">
                    Try adjusting your search terms or browse our recommended courses.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RAG Chat Button */}
      <button
        onClick={() => setShowRagModal(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 cursor-pointer
                  rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 
                  transform hover:scale-110 transition-all duration-300
                  flex items-center justify-center group z-50 animate-pulse"
        aria-label="Open AI Assistant"
      >
        <FaRobot className="text-2xl animate-bounce" />
        <span className="absolute right-full mr-4 bg-gray-900 text-white text-sm py-2 px-4 
                      rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200
                      whitespace-nowrap shadow-lg transform -translate-y-1/2 top-1/2">
          Get Road Map Recommendations
        </span>
      </button>

      {/* RAG Chat Modal */}
      {showRagModal && <RagChat onClose={() => setShowRagModal(false)} />}

      <style>
        {`
          @keyframes pulse {
            0% { 
              box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
            }
            70% { 
              box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
            }
            100% { 
              box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }
        `}
      </style>

      <Footer />
    </>
  );
};

export default RecommendedCourseList;
