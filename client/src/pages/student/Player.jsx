import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/student/Footer";
import StudentNavbar from "../../components/student/StudentNavbar";
import axios from "axios";

const Player = () => {
    const { courseId } = useParams();
    const [courseData, setCourseData] = useState(null);
    const [openSections, setOpenSections] = useState({});
    const [playerData, setPlayerData] = useState(null);
    const [completedLectures, setCompletedLectures] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [hoveredStar, setHoveredStar] = useState(0);
    const videoRef = useRef(null);
    const progressUpdateTimeout = useRef(null);
    const BASE_URL = 'https://learnify.runasp.net';

    // Fetch course data
    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${BASE_URL}/api/Course/GetCourseByIdForStudent/${courseId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setCourseData(response.data);
            // Load completed lectures from localStorage
            const savedCompletedLectures = localStorage.getItem(`completedLectures-${courseId}`);
            if (savedCompletedLectures) {
                setCompletedLectures(new Set(JSON.parse(savedCompletedLectures)));
            }
            // Fetch user's rating
            await fetchUserRating();
        } catch (err) {
            setError('Failed to fetch course details');
            console.error('Error fetching course:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's rating for the course
    const fetchUserRating = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${BASE_URL}/api/Ratings/myrating/${courseId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setUserRating(response.data);
        } catch (err) {
            // If 404, user hasn't rated yet
            if (err.response?.status !== 404) {
                console.error('Error fetching rating:', err);
            }
        }
    };

    // Handle rating submission
    const handleRating = async (stars) => {
        try {
            const token = localStorage.getItem('token');
            if (userRating) {
                // Update existing rating
                await axios.put(
                    `${BASE_URL}/api/Ratings/updatestars/${courseId}`,
                    stars,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                // Add new rating
                await axios.post(
                    `${BASE_URL}/api/Ratings`,
                    {
                        course_id: parseInt(courseId),
                        stars: stars
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }
            // Refresh rating
            await fetchUserRating();
        } catch (err) {
            console.error('Error submitting rating:', err);
        }
    };

    // Fetch lesson progress
    const fetchLessonProgress = async (lessonId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${BASE_URL}/api/Lesson/progress/${lessonId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (videoRef.current && response.data.watched_seconds > 0) {
                videoRef.current.currentTime = response.data.watched_seconds;
            }
        } catch (err) {
            console.error('Error fetching lesson progress:', err);
        }
    };

    // Update lesson progress
    const updateLessonProgress = async (lessonId, watchedSeconds) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${BASE_URL}/api/Lesson/update`,
                {
                    lesson_id: lessonId,
                    watched_seconds: Math.floor(watchedSeconds)
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (err) {
            console.error('Error updating lesson progress:', err);
        }
    };

    // Handle video time update
    const handleTimeUpdate = () => {
        if (!videoRef.current || !playerData) return;

        // Clear existing timeout
        if (progressUpdateTimeout.current) {
            clearTimeout(progressUpdateTimeout.current);
        }

        // Set new timeout to update progress
        progressUpdateTimeout.current = setTimeout(() => {
            updateLessonProgress(playerData.id, videoRef.current.currentTime);
        }, 5000); // Update every 5 seconds
    };

    // Handle video ended
    const handleVideoEnded = () => {
        if (!videoRef.current || !playerData) return;
        updateLessonProgress(playerData.id, videoRef.current.duration);
        handleMarkComplete(playerData.sectionId, playerData.lessonId);
    };

    // Toggle section open/close
    const toggleSection = (index) => {
        setOpenSections(prev => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // Handle marking lecture as complete
    const handleMarkComplete = (sectionId, lessonId) => {
        const lectureKey = `${sectionId}-${lessonId}`;
        setCompletedLectures(prev => {
            const newSet = new Set(prev);
            if (newSet.has(lectureKey)) {
                newSet.delete(lectureKey);
            } else {
                newSet.add(lectureKey);
            }
            // Save to localStorage
            localStorage.setItem(`completedLectures-${courseId}`,
                JSON.stringify(Array.from(newSet)));
            return newSet;
        });
    };

    // Handle setting player data
    const handleSetPlayerData = async (lesson) => {
        setPlayerData({
            ...lesson,
            sectionId: lesson.sectionId,
            lessonId: lesson.id,
            lectureKey: `${lesson.sectionId}-${lesson.id}`
        });
        // Fetch progress after setting player data
        await fetchLessonProgress(lesson.id);
    };

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!courseData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Course not found</div>
            </div>
        );
    }

    return (
        <>
            <StudentNavbar />
            <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
                {/* Course Structure (Left Column) */}
                <div className="text-gray-800">
                    <h2 className="text-xl font-semibold mb-4">Course Structure</h2>
                    <div className="pt-5">
                        {courseData.sections?.map((section, sectionIndex) => (
                            <div key={section.id} className="border border-gray-300 bg-white mb-2 rounded shadow-sm">
                                <div
                                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50"
                                    onClick={() => toggleSection(sectionIndex)}
                                >
                                    <div className="flex items-center gap-2">
                                        <img
                                            className={`transform transition-transform ${openSections[sectionIndex] ? "rotate-180" : ""}`}
                                            src={assets.down_arrow_icon}
                                            alt="arrow icon"
                                        />
                                        <p className="font-medium md:text-base text-sm">{section.name}</p>
                                    </div>
                                    <p className="text-sm md:text-default">
                                        {section.lessons?.length} lectures
                                    </p>
                                </div>

                                <div className={`overflow-hidden transition-all duration-300 ${openSections[sectionIndex] ? "max-h-[400px] overflow-y-auto" : "max-h-0"}`}>
                                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                                        {section.lessons?.map((lesson, lessonIndex) => {
                                            const lectureKey = `${section.id}-${lesson.id}`;
                                            const isCompleted = completedLectures.has(lectureKey);
                                            const isAccessible = courseData.is_subscribed || lesson.is_preview;

                                            return (
                                                <li key={lesson.id} className="flex items-start gap-2 py-1">
                                                    <img
                                                        src={isCompleted ? assets.blue_tick_icon : assets.play_icon}
                                                        alt={isCompleted ? "completed" : "play"}
                                                        className="w-4 h-4 mt-1"
                                                    />
                                                    <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                                                        <p className={isCompleted ? "text-gray-500" : ""}>
                                                            {lesson.name}
                                                        </p>
                                                        <div className="flex gap-2">
                                                            {isAccessible && (
                                                                <button
                                                                    onClick={() => handleSetPlayerData({
                                                                        ...lesson,
                                                                        sectionId: section.id
                                                                    })}
                                                                    className="text-blue-500 hover:text-blue-600 cursor-pointer"
                                                                >
                                                                    Watch
                                                                </button>
                                                            )}
                                                            {!isAccessible && !lesson.is_preview && (
                                                                <span className="text-gray-400">Locked</span>
                                                            )}
                                                            {lesson.is_preview && !isAccessible && (
                                                                <span className="text-blue-500">Preview</span>
                                                            )}
                                                            <p>{humanizeDuration(lesson.duration_in_hours * 60 * 60 * 1000, { units: ['h', 'm'] })}</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Rating Section */}
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">Rate this Course</h3>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    className="focus:outline-none"
                                >
                                    <img
                                        src={star <= (hoveredStar || userRating?.stars || 0) ? assets.star : assets.star_blank}
                                        alt={`${star} stars`}
                                        className="w-6 h-6"
                                    />
                                </button>
                            ))}
                            <span className="text-sm text-gray-500 ml-2">
                                {userRating ? 'Your Rating' : 'Click to Rate'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Video Player (Right Column) */}
                <div className="md:mt-10">
                    {playerData ? (
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <video
                                ref={videoRef}
                                src={`${BASE_URL}${playerData.file_bath}`}
                                controls
                                className="w-full aspect-video rounded"
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleVideoEnded}
                            />
                            <div className="flex justify-between items-center mt-4 px-2">
                                <p className="font-medium">
                                    {playerData.name}
                                </p>
                                <button
                                    onClick={() => handleMarkComplete(playerData.sectionId, playerData.lessonId)}
                                    className={`px-4 py-2 rounded-md transition-colors ${completedLectures.has(playerData.lectureKey)
                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                        }`}
                                >
                                    {completedLectures.has(playerData.lectureKey) ? 'Completed' : 'Mark as Complete'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg overflow-hidden shadow-md">
                            <img
                                src={`${BASE_URL}${courseData.img_url}`}
                                alt={courseData.name}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Player;