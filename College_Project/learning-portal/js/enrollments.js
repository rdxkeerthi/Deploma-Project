/**
 * Enrollment Management Module
 * Handles student enrollments and progress tracking
 */

const Enrollments = {
    /**
     * Enroll student in course
     * @param {string} studentId - Student ID
     * @param {string} courseId - Course ID
     * @returns {Object} Enrollment object
     */
    enroll(studentId, courseId) {
        const enrollments = Storage.get(Storage.KEYS.ENROLLMENTS, []);

        // Check if already enrolled
        const existing = enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
        if (existing) return existing;

        const enrollment = {
            id: `enroll_${Date.now()}`,
            studentId,
            courseId,
            enrolledAt: new Date().toISOString(),
            progress: 0,
            completedLessons: [],
            completed: false,
            completedAt: null
        };

        enrollments.push(enrollment);
        Storage.set(Storage.KEYS.ENROLLMENTS, enrollments);
        return enrollment;
    },

    /**
     * Get student enrollments
     * @param {string} studentId - Student ID
     * @returns {Array} Array of enrollments with course data
     */
    getByStudent(studentId) {
        const enrollments = Storage.get(Storage.KEYS.ENROLLMENTS, []);
        const studentEnrollments = enrollments.filter(e => e.studentId === studentId);

        // Enrich with course data
        return studentEnrollments.map(enrollment => ({
            ...enrollment,
            course: Courses.getById(enrollment.courseId)
        }));
    },

    /**
     * Get enrollment by ID
     * @param {string} enrollmentId - Enrollment ID
     * @returns {Object|null} Enrollment object
     */
    getById(enrollmentId) {
        const enrollments = Storage.get(Storage.KEYS.ENROLLMENTS, []);
        return enrollments.find(e => e.id === enrollmentId) || null;
    },

    /**
     * Get enrollment by student and course
     * @param {string} studentId - Student ID
     * @param {string} courseId - Course ID
     * @returns {Object|null} Enrollment object
     */
    getByStudentAndCourse(studentId, courseId) {
        const enrollments = Storage.get(Storage.KEYS.ENROLLMENTS, []);
        return enrollments.find(e => e.studentId === studentId && e.courseId === courseId) || null;
    },

    /**
     * Mark lesson as complete
     * @param {string} enrollmentId - Enrollment ID
     * @param {string} lessonId - Lesson ID
     * @returns {Object} Updated enrollment
     */
    markLessonComplete(enrollmentId, lessonId) {
        const enrollments = Storage.get(Storage.KEYS.ENROLLMENTS, []);
        const index = enrollments.findIndex(e => e.id === enrollmentId);

        if (index === -1) return null;

        const enrollment = enrollments[index];

        // Add lesson to completed if not already there
        if (!enrollment.completedLessons.includes(lessonId)) {
            enrollment.completedLessons.push(lessonId);
        }

        // Calculate progress
        const course = Courses.getById(enrollment.courseId);
        if (course) {
            enrollment.progress = Math.round((enrollment.completedLessons.length / course.lessons.length) * 100);

            // Check if course is completed
            if (enrollment.completedLessons.length === course.lessons.length) {
                enrollment.completed = true;
                enrollment.completedAt = new Date().toISOString();
            }
        }

        enrollments[index] = enrollment;
        Storage.set(Storage.KEYS.ENROLLMENTS, enrollments);
        return enrollment;
    },

    /**
     * Get next lesson for enrollment
     * @param {string} enrollmentId - Enrollment ID
     * @returns {Object|null} Next lesson object
     */
    getNextLesson(enrollmentId) {
        const enrollment = this.getById(enrollmentId);
        if (!enrollment) return null;

        const course = Courses.getById(enrollment.courseId);
        if (!course) return null;

        // Find first incomplete lesson
        const nextLesson = course.lessons.find(lesson =>
            !enrollment.completedLessons.includes(lesson.id)
        );

        return nextLesson || null;
    },

    /**
     * Check if student is enrolled in course
     * @param {string} studentId - Student ID
     * @param {string} courseId - Course ID
     * @returns {boolean}
     */
    isEnrolled(studentId, courseId) {
        const enrollments = Storage.get(Storage.KEYS.ENROLLMENTS, []);
        return enrollments.some(e => e.studentId === studentId && e.courseId === courseId);
    }
};
