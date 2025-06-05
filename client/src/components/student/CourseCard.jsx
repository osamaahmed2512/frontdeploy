import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const { currency, calculateRating } = useContext(AppContext);

  // Function to get difficulty level color
  const getDifficultyColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-600';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-600';
      case 'advanced':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Link 
      to={'/course/' + course._id} 
      onClick={() => scrollTo(0, 0)}
      className="block w-full h-full"
    >
      <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-sky-400 hover:transform hover:-translate-y-1 max-w-[95vw] sm:max-w-xs md:max-w-sm lg:max-w-md w-full mx-auto">
        {/* Image container with fixed aspect ratio */}
        <div className="relative w-full pt-[60%]">
          <img 
            className="absolute inset-0 w-full h-full object-cover"
            src={course.courseThumbnail} 
            alt={course.courseTitle}
            loading="lazy"
          />
          {/* Category Badge */}
          {course.courseCategory && (
            <div className="absolute top-2 left-2 bg-sky-500 text-white px-2 py-1 rounded-md text-xs font-medium">
              {course.courseCategory}
            </div>
          )}
        </div>
        
        {/* Content container with fixed padding and flexible height */}
        <div className="flex flex-col flex-grow p-5">
          {/* Title with fixed height and ellipsis */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] text-center">
            {course.courseTitle}
          </h3>
          
          {/* Difficulty Level Badge - Centered and Creative */}
          {course.difficultyLevel && (
            <div className="flex justify-center mb-3">
              <span
                className={`px-4 py-1 rounded-full text-sm font-bold shadow-md uppercase tracking-wide
                  bg-gradient-to-r
                  ${course.difficultyLevel.toLowerCase() === 'beginner' ? 'from-blue-100 to-blue-300 text-blue-700' : ''}
                  ${course.difficultyLevel.toLowerCase() === 'intermediate' ? 'from-yellow-200 to-yellow-400 text-yellow-800' : ''}
                  ${course.difficultyLevel.toLowerCase() === 'advanced' ? 'from-red-200 to-red-400 text-red-800' : ''}
                  ${!['beginner','intermediate','advanced'].includes(course.difficultyLevel.toLowerCase()) ? 'from-gray-200 to-gray-400 text-gray-800' : ''}
                `}
                style={{ letterSpacing: '0.08em', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
              >
                {course.difficultyLevel}
              </span>
            </div>
          )}
            
          {/* Rating container - Centered */}
          <div className="flex flex-col items-center justify-center space-y-2 mb-4">
            <div className="flex items-center justify-center">
              <span className="text-lg font-medium text-yellow-500 mr-2">
                {calculateRating(course)}
              </span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <img 
                    key={i} 
                    src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank} 
                    alt="" 
                    className="w-4 h-4" 
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-500">
              ({course.courseRatings.length} ratings)
            </span>
          </div>
            
          {/* Price container - pushed to bottom */}
          <div className="mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-sky-500">
                {currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}
              </span>
              {course.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {currency}{course.coursePrice}
                </span>
              )}
              {course.discount > 0 && (
                <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                  {course.discount}% OFF
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;