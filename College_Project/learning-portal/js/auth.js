/**
 * Authentication Module
 * Handles user login, logout, and session management
 */

const Auth = {
    /**
     * Login user
     * @param {string} email - User email
     * @param {string} role - User role (staff/student)
     * @returns {Object|null} User object or null if failed
     */
    login(email, role) {
        const users = Storage.get(Storage.KEYS.USERS, []);
        const user = users.find(u => u.email === email && u.role === role);

        if (user) {
            const session = {
                userId: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                loginTime: new Date().toISOString()
            };
            Storage.set(Storage.KEYS.SESSION, session);
            return session;
        }

        return null;
    },

    /**
     * Logout current user
     */
    logout() {
        Storage.remove(Storage.KEYS.SESSION);
        window.location.href = 'index.html';
    },

    /**
     * Get current session
     * @returns {Object|null} Session object or null
     */
    getSession() {
        return Storage.get(Storage.KEYS.SESSION);
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.getSession() !== null;
    },

    /**
     * Check if current user is staff
     * @returns {boolean}
     */
    isStaff() {
        const session = this.getSession();
        return session && session.role === 'staff';
    },

    /**
     * Check if current user is student
     * @returns {boolean}
     */
    isStudent() {
        const session = this.getSession();
        return session && session.role === 'student';
    },

    /**
     * Require authentication - redirect to login if not authenticated
     * @param {string} requiredRole - Optional role requirement
     */
    requireAuth(requiredRole = null) {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }

        if (requiredRole) {
            const session = this.getSession();
            if (session.role !== requiredRole) {
                window.location.href = 'index.html';
                return false;
            }
        }

        return true;
    }
};
