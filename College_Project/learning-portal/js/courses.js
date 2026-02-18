/**
 * Course Management Module
 * CRUD operations for courses
 */

const Courses = {
    /**
     * Get all courses
     * @returns {Array} Array of course objects
     */
    getAll() {
        return Storage.get(Storage.KEYS.COURSES, []);
    },

    /**
     * Get course by ID
     * @param {string} courseId - Course ID
     * @returns {Object|null} Course object or null
     */
    getById(courseId) {
        const courses = this.getAll();
        return courses.find(c => c.id === courseId) || null;
    },

    /**
     * Create new course
     * @param {Object} courseData - Course data
     * @returns {Object} Created course
     */
    create(courseData) {
        const courses = this.getAll();
        const newCourse = {
            id: `course_${Date.now()}`,
            title: courseData.title,
            description: courseData.description,
            instructor: courseData.instructor,
            duration: courseData.duration,
            thumbnail: courseData.thumbnail || null,
            lessons: courseData.lessons || [],
            createdAt: new Date().toISOString()
        };

        courses.push(newCourse);
        Storage.set(Storage.KEYS.COURSES, courses);
        return newCourse;
    },

    /**
     * Update course
     * @param {string} courseId - Course ID
     * @param {Object} updates - Updated fields
     * @returns {boolean} Success status
     */
    update(courseId, updates) {
        const courses = this.getAll();
        const index = courses.findIndex(c => c.id === courseId);

        if (index === -1) return false;

        courses[index] = { ...courses[index], ...updates };
        Storage.set(Storage.KEYS.COURSES, courses);
        return true;
    },

    /**
     * Delete course
     * @param {string} courseId - Course ID
     * @returns {boolean} Success status
     */
    delete(courseId) {
        const courses = this.getAll();
        const filtered = courses.filter(c => c.id !== courseId);

        if (filtered.length === courses.length) return false;

        Storage.set(Storage.KEYS.COURSES, filtered);

        // Also delete related enrollments
        const enrollments = Storage.get(Storage.KEYS.ENROLLMENTS, []);
        const filteredEnrollments = enrollments.filter(e => e.courseId !== courseId);
        Storage.set(Storage.KEYS.ENROLLMENTS, filteredEnrollments);

        return true;
    },

    /**
     * Get course statistics
     * @param {string} courseId - Course ID
     * @returns {Object} Stats object
     */
    getStats(courseId) {
        const enrollments = Storage.get(Storage.KEYS.ENROLLMENTS, []);
        const courseEnrollments = enrollments.filter(e => e.courseId === courseId);

        return {
            totalEnrolled: courseEnrollments.length,
            completed: courseEnrollments.filter(e => e.completed).length,
            inProgress: courseEnrollments.filter(e => !e.completed).length,
            averageProgress: courseEnrollments.length > 0
                ? Math.round(courseEnrollments.reduce((sum, e) => sum + e.progress, 0) / courseEnrollments.length)
                : 0
        };
    },

    /**
     * Search courses
     * @param {string} query - Search query
     * @returns {Array} Filtered courses
     */
    search(query) {
        const courses = this.getAll();
        const lowerQuery = query.toLowerCase();

        return courses.filter(course =>
            course.title.toLowerCase().includes(lowerQuery) ||
            course.description.toLowerCase().includes(lowerQuery) ||
            course.instructor.toLowerCase().includes(lowerQuery)
        );
    }
};
