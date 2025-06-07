import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import StudentNavbar from "../../components/student/StudentNavbar";
import axios from "axios";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency } = useContext(AppContext);
  const BASE_URL = 'https://learnify.runasp.net';

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/Course/GetCourseByIdForStudent/${id}`,
        {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        }
      );
      setCourseData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch course details');
      console.error('Error fetching course:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleEnrollment = () => {
    if (!courseData.is_subscribed) {
      const finalPrice = courseData.discounted_price || courseData.price;
      navigate(`/payment/${id}`, {
        state: {
          courseTitle: courseData.name,
          coursePrice: courseData.price,
          discount: courseData.discount,
          finalPrice: finalPrice,
        },
      });
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!courseData) return <div className="text-center py-8">Course not found</div>;

  return (
    <>
      <StudentNavbar />
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-20 pt-20 text-left">
        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-cyan-100/70"></div>

        {/* left column */}
        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800">
            {courseData.name}
          </h1>
          <p className="pt-4 md:text-base text-sm">
            {courseData.describtion}
          </p>

          {/* review and ratings */}
          <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
            <p>{courseData.average_rating || 0}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={i < Math.floor(courseData.average_rating || 0) ? assets.star : assets.star_blank}
                  alt=""
                  className="w-3.5 h-3.5"
                />
              ))}
            </div>
            <p className="text-blue-600">
              ({courseData.no_of_students} students)
            </p>
          </div>

          <p className="text-sm">
            Course by{" "}
            <span className="text-blue-600 underline">{courseData.instructor_name}</span>
          </p>

          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {courseData.sections?.map((section, index) => (
                <div
                  key={section.id}
                  className="border border-gray-300 bg-white mb-2 rounded"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""
                          }`}
                        src={assets.down_arrow_icon}
                        alt="arrow icon"
                      />
                      <p className="font-medium md:text-base text-sm">
                        {section.name}
                      </p>
                    </div>
                    <p className="text-sm md:text-default">
                      {section.lessons?.length} lectures
                    </p>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"
                      }`}
                  >
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {section.lessons?.map((lesson) => (
                        <li key={lesson.id} className="flex items-start gap-2 py-1">
                          <img
                            src={assets.play_icon}
                            alt="play icon"
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lesson.name}</p>
                            <div className="flex gap-2">
                              {lesson.is_preview && (
                                <p className="text-blue-500 cursor-pointer">
                                  Preview
                                </p>
                              )}
                              {!courseData.is_subscribed && !lesson.is_preview && (
                                <p className="text-gray-400">
                                  Locked
                                </p>
                              )}
                              <p>
                                {humanizeDuration(lesson.duration_in_hours * 60 * 60 * 1000, {
                                  units: ["h", "m"],
                                })}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="py-20 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-gray-800">
              Course Description
            </h3>
            <p className="pt-3">
              {courseData.describtion}
            </p>
          </div>
        </div>

        {/* right column */}
        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          <img
            src={`${BASE_URL}${courseData.img_url}`}
            alt={courseData.name}
            className="w-full aspect-video object-cover"
          />
          <div className="p-5">
            <div className="flex items-center gap-2">
              <img
                className="w-3.5"
                src={assets.time_left_clock_icon}
                alt="time left clock icon"
              />
              <p className="text-red-500">
                <span className="font-medium">5 days</span> left at this price!
              </p>
            </div>
            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}
                {courseData.discounted_price || courseData.price}
              </p>
              {courseData.discount > 0 && (
                <>
                  <p className="md:text-lg text-gray-500 line-through">
                    {currency}
                    {courseData.price}
                  </p>
                  <p className="md:text-lg text-gray-500">{courseData.discount}%</p>
                </>
              )}
            </div>

            <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="star icon" />
                <p>{courseData.average_rating || 0}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="clock icon" />
                <p>{courseData.no_of_hours} hours</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="clock icon" />
                <p>{courseData.sections?.reduce((total, section) => total + (section.lessons?.length || 0), 0)} lessons</p>
              </div>
            </div>

            <button
              onClick={handleEnrollment}
              disabled={courseData.is_subscribed}
              className={`md:mt-6 mt-4 w-full py-3 cursor-pointer rounded font-medium
                ${courseData.is_subscribed
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-sky-700"
                }`}
            >
              {courseData.is_subscribed ? "Already Enrolled" : "Enroll Now"}
            </button>

            <div className="pt-6">
              <p className="md:text-xl text-lg font-medium text-gray-800">
                What's in the course?
              </p>
              <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
                <li>Lifetime access with free updates.</li>
                <li>Step-by-step, hands-on project guidance.</li>
                <li>Downloadable resources and source code.</li>
                <li>Quizzes to test your knowledge.</li>
                <li>Certificate of completion.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetails;