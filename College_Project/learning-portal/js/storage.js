/**
 * LocalStorage Helper Module
 * Provides safe read/write operations for LocalStorage
 */

const Storage = {
    // Storage keys
    KEYS: {
        USERS: 'lms_users',
        COURSES: 'lms_courses',
        ENROLLMENTS: 'lms_enrollments',
        SESSION: 'lms_session',
        THEME: 'lms_theme'
    },

    /**
     * Get data from LocalStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Parsed data or default value
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from LocalStorage (${key}):`, error);
            return defaultValue;
        }
    },

    /**
     * Set data in LocalStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to LocalStorage (${key}):`, error);
            return false;
        }
    },

    /**
     * Remove item from LocalStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from LocalStorage (${key}):`, error);
        }
    },

    /**
     * Clear all LMS data
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => this.remove(key));
    },

    /**
     * Initialize with seed data if empty
     */
    initializeSeedData() {
        // Initialize users if empty
        if (!this.get(this.KEYS.USERS)) {
            const users = [
                {
                    id: 'user_staff_001',
                    name: 'Admin User',
                    email: 'admin@lms.com',
                    role: 'staff',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'user_student_001',
                    name: 'John Doe',
                    email: 'john@student.com',
                    role: 'student',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'user_student_002',
                    name: 'Jane Smith',
                    email: 'jane@student.com',
                    role: 'student',
                    createdAt: new Date().toISOString()
                }
            ];
            this.set(this.KEYS.USERS, users);
        }

        // Initialize courses if empty
        if (!this.get(this.KEYS.COURSES)) {
            const courses = [
                {
                    id: 'course_001',
                    title: 'Web Development Fundamentals',
                    description: 'Learn the basics of HTML, CSS, and JavaScript to build modern websites.',
                    instructor: 'Sarah Johnson',
                    duration: '8 weeks',
                    thumbnail: null,
                    lessons: [
                        { id: 'lesson_001', title: 'Introduction to Web Development', duration: '15 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', documentUrl: '' },
                        { id: 'lesson_002', title: 'HTML Basics', duration: '30 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', documentUrl: 'https://example.com/html-basics.pdf' },
                        { id: 'lesson_003', title: 'CSS Fundamentals', duration: '45 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', documentUrl: '' },
                        { id: 'lesson_004', title: 'JavaScript Essentials', duration: '60 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', documentUrl: 'https://example.com/js-guide.pdf' },
                        { id: 'lesson_005', title: 'Building Your First Website', duration: '90 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', documentUrl: '' }
                    ],
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'course_002',
                    title: 'Advanced JavaScript',
                    description: 'Master ES6+, async programming, and modern JavaScript patterns.',
                    instructor: 'Michael Chen',
                    duration: '6 weeks',
                    thumbnail: null,
                    lessons: [
                        { id: 'lesson_006', title: 'ES6 Features', duration: '40 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', documentUrl: 'https://example.com/es6-guide.pdf' },
                        { id: 'lesson_007', title: 'Promises and Async/Await', duration: '50 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', documentUrl: '' },
                        { id: 'lesson_008', title: 'Modules and Imports', duration: '30 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', documentUrl: '' },
                        { id: 'lesson_009', title: 'Advanced Patterns', duration: '60 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', documentUrl: 'https://example.com/patterns.pdf' }
                    ],
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'course_003',
                    title: 'UI/UX Design Principles',
                    description: 'Create beautiful and user-friendly interfaces with modern design principles.',
                    instructor: 'Emily Davis',
                    duration: '4 weeks',
                    thumbnail: null,
                    lessons: [
                        { id: 'lesson_010', title: 'Design Fundamentals', duration: '25 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', documentUrl: '' },
                        { id: 'lesson_011', title: 'Color Theory', duration: '35 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', documentUrl: 'https://example.com/color-theory.pdf' },
                        { id: 'lesson_012', title: 'Typography', duration: '30 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', documentUrl: '' },
                        { id: 'lesson_013', title: 'User Research', duration: '40 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', documentUrl: 'https://example.com/user-research.pdf' }
                    ],
                    createdAt: new Date().toISOString()
                }
            ];
            this.set(this.KEYS.COURSES, courses);
        }

        // Initialize enrollments if empty
        if (!this.get(this.KEYS.ENROLLMENTS)) {
            this.set(this.KEYS.ENROLLMENTS, []);
        }
    }
};

// Initialize seed data on load
Storage.initializeSeedData();
