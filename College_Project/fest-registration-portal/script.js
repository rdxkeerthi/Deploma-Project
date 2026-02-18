/**
 * College Fest Event Registration Portal
 * Multi-Page Architecture with LocalStorage Persistence
 */

// ===== CONFIGURATION =====
const STORAGE_KEYS = {
    EVENTS: 'festPortal_events',
    REGISTRATIONS: 'festPortal_registrations',
    USER_SESSION: 'festPortal_session'
};

const ADMIN_PASSWORD = 'admin123';

// ===== STORAGE SERVICE =====
class StorageService {
    constructor() {
        this.events = this.load(STORAGE_KEYS.EVENTS, this.getSampleEvents());
        this.registrations = this.load(STORAGE_KEYS.REGISTRATIONS, []);
    }

    load(key, defaultData) {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultData;
    }

    save() {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
        localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(this.registrations));
    }

    // Event Operations
    getAllEvents() {
        return this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    getEventById(id) {
        return this.events.find(e => e.id === id);
    }

    createEvent(event) {
        const newEvent = {
            id: 'evt_' + Date.now(),
            ...event,
            createdAt: new Date().toISOString()
        };
        this.events.push(newEvent);
        this.save();
        return newEvent;
    }

    updateEvent(id, updates) {
        const index = this.events.findIndex(e => e.id === id);
        if (index !== -1) {
            this.events[index] = { ...this.events[index], ...updates };
            this.save();
            return this.events[index];
        }
        return null;
    }

    deleteEvent(id) {
        this.events = this.events.filter(e => e.id !== id);
        this.save();
    }

    // Registration Operations
    registerStudent(registration) {
        const newReg = {
            id: 'reg_' + Date.now(),
            ...registration,
            registeredAt: new Date().toISOString()
        };
        this.registrations.push(newReg);
        this.save();
        return newReg;
    }

    getRegistrations(eventId = null) {
        if (eventId) {
            return this.registrations.filter(r => r.eventId === eventId);
        }
        return this.registrations;
    }

    checkDuplicate(email, eventId) {
        return this.registrations.some(r =>
            r.email.toLowerCase() === email.toLowerCase() && r.eventId === eventId
        );
    }

    getAvailableSeats(eventId) {
        const event = this.getEventById(eventId);
        if (!event) return 0;

        const registered = this.getRegistrations(eventId).length;
        return Math.max(0, event.seatLimit - registered);
    }

    getStudentRegistrations(email) {
        return this.registrations.filter(r =>
            r.email.toLowerCase() === email.toLowerCase()
        );
    }

    // Statistics
    getTotalRegistrations() {
        return this.registrations.length;
    }

    getMostPopularEvent() {
        if (this.events.length === 0) return null;

        const counts = {};
        this.registrations.forEach(r => {
            counts[r.eventId] = (counts[r.eventId] || 0) + 1;
        });

        let maxCount = 0;
        let popularId = null;
        for (const [id, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                popularId = id;
            }
        }

        return popularId ? this.getEventById(popularId) : this.events[0];
    }

    // Sample Data
    getSampleEvents() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        return [
            {
                id: 'evt_1',
                title: 'Tech Quiz Championship',
                description: 'Test your technical knowledge in this exciting quiz competition covering programming, algorithms, and current tech trends.',
                date: tomorrow.toISOString().split('T')[0],
                category: 'Technical',
                seatLimit: 50,
                createdAt: new Date().toISOString()
            },
            {
                id: 'evt_2',
                title: 'Cultural Dance Performance',
                description: 'Showcase your dancing talents in various forms including classical, contemporary, and folk dances.',
                date: nextWeek.toISOString().split('T')[0],
                category: 'Cultural',
                seatLimit: 30,
                createdAt: new Date().toISOString()
            },
            {
                id: 'evt_3',
                title: 'Cricket Tournament',
                description: 'Inter-department cricket tournament. Form your team and compete for the championship trophy!',
                date: nextWeek.toISOString().split('T')[0],
                category: 'Sports',
                seatLimit: 100,
                createdAt: new Date().toISOString()
            }
        ];
    }
}

// ===== AUTH MANAGER =====
class AuthManager {
    constructor() {
        this.sessionKey = STORAGE_KEYS.USER_SESSION;
    }

    loginAdmin(password) {
        if (password === ADMIN_PASSWORD) {
            const session = {
                role: 'admin',
                loginTime: new Date().toISOString()
            };
            sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
            return true;
        }
        return false;
    }

    loginStudent() {
        const session = {
            role: 'student',
            loginTime: new Date().toISOString()
        };
        sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
    }

    logout() {
        sessionStorage.removeItem(this.sessionKey);
        window.location.href = 'index.html';
    }

    getSession() {
        const session = sessionStorage.getItem(this.sessionKey);
        return session ? JSON.parse(session) : null;
    }

    checkAuth(requiredRole) {
        const session = this.getSession();
        if (!session) {
            window.location.href = 'index.html';
            return false;
        }
        if (requiredRole && session.role !== requiredRole) {
            alert('Unauthorized Access');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
}

// ===== UTILITY FUNCTIONS =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ===== PAGE CONTROLLERS =====

// LOGIN CONTROLLER
class LoginController {
    constructor(auth) {
        this.auth = auth;
        this.setupListeners();
    }

    setupListeners() {
        // Role Tab Switching
        const roleTabs = document.querySelectorAll('.role-tab');
        const forms = document.querySelectorAll('.login-form');

        roleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                roleTabs.forEach(t => t.classList.remove('active'));
                forms.forEach(f => f.classList.remove('active'));

                tab.classList.add('active');
                const role = tab.dataset.role;
                document.getElementById(`${role}-form`).classList.add('active');
            });
        });

        // Student Entry
        const studentBtn = document.getElementById('student-enter-btn');
        if (studentBtn) {
            studentBtn.addEventListener('click', () => {
                this.auth.loginStudent();
                window.location.href = 'student-portal.html';
            });
        }

        // Admin Login
        const adminForm = document.getElementById('admin-login-form');
        if (adminForm) {
            adminForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const password = document.getElementById('admin-password').value;
                const errorMsg = document.getElementById('login-error');

                if (this.auth.loginAdmin(password)) {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    errorMsg.textContent = 'Invalid password! Try: admin123';
                }
            });
        }
    }
}

// ADMIN CONTROLLER
class AdminController {
    constructor(storage, auth) {
        this.storage = storage;
        this.auth = auth;

        if (!this.auth.checkAuth('admin')) return;

        this.initUI();
    }

    initUI() {
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.auth.logout();
        });

        // Load Statistics
        this.updateStats();

        // Create Event Form
        document.getElementById('create-event-form').addEventListener('submit', (e) => {
            this.handleCreateEvent(e);
        });

        // Edit Event Form
        document.getElementById('edit-event-form').addEventListener('submit', (e) => {
            this.handleEditEvent(e);
        });

        // Close Modal
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('edit-modal').classList.remove('active');
            });
        });

        // Event Filter
        document.getElementById('event-filter').addEventListener('change', (e) => {
            this.renderRegistrations(e.target.value);
        });

        // Event Delegation for Edit/Delete
        const eventsTable = document.getElementById('events-table-body');
        if (eventsTable) {
            eventsTable.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.btn-edit');
                const deleteBtn = e.target.closest('.btn-delete');

                if (editBtn) {
                    const id = editBtn.dataset.id;
                    this.openEditModal(id);
                } else if (deleteBtn) {
                    const id = deleteBtn.dataset.id;
                    this.deleteEvent(id);
                }
            });
        }

        // Initial Render
        this.renderEvents();
        this.renderRegistrations();
        this.populateEventFilter();
    }

    updateStats() {
        document.getElementById('total-events').textContent = this.storage.getAllEvents().length;
        document.getElementById('total-registrations').textContent = this.storage.getTotalRegistrations();

        const popular = this.storage.getMostPopularEvent();
        document.getElementById('popular-event').textContent = popular ? popular.title : '-';
    }

    handleCreateEvent(e) {
        e.preventDefault();

        const event = {
            title: document.getElementById('event-title').value,
            description: document.getElementById('event-description').value,
            date: document.getElementById('event-date').value,
            category: document.getElementById('event-category').value,
            seatLimit: Number.parseInt(document.getElementById('event-seats').value)
        };

        this.storage.createEvent(event);
        showToast('Event created successfully!');

        e.target.reset();
        this.renderEvents();
        this.updateStats();
        this.populateEventFilter();
    }

    renderEvents() {
        const tbody = document.getElementById('events-table-body');
        if (!tbody) return;

        const events = this.storage.getAllEvents();

        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No events created yet</td></tr>';
            return;
        }

        tbody.innerHTML = events.map(event => {
            const registered = this.storage.getRegistrations(event.id).length;
            const available = event.seatLimit - registered;

            return `
                <tr>
                    <td><strong>${event.title}</strong></td>
                    <td><span class="event-category">${event.category}</span></td>
                    <td>${formatDate(event.date)}</td>
                    <td>${event.seatLimit}</td>
                    <td>
                        <span class="${available > 0 ? 'seats-available' : 'seats-full'}">
                            ${registered} / ${event.seatLimit}
                        </span>
                    </td>
                    <td class="table-actions">
                        <button class="btn-icon btn-edit" data-id="${event.id}">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button class="btn-icon danger btn-delete" data-id="${event.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openEditModal(id) {
        const event = this.storage.getEventById(id);
        if (!event) return;

        document.getElementById('edit-event-id').value = event.id;
        document.getElementById('edit-title').value = event.title;
        document.getElementById('edit-category').value = event.category;
        document.getElementById('edit-date').value = event.date;
        document.getElementById('edit-seats').value = event.seatLimit;
        document.getElementById('edit-description').value = event.description;

        document.getElementById('edit-modal').classList.add('active');
    }

    handleEditEvent(e) {
        e.preventDefault();

        const id = document.getElementById('edit-event-id').value;
        const updates = {
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            date: document.getElementById('edit-date').value,
            category: document.getElementById('edit-category').value,
            seatLimit: Number.parseInt(document.getElementById('edit-seats').value)
        };

        this.storage.updateEvent(id, updates);
        showToast('Event updated successfully!');

        document.getElementById('edit-modal').classList.remove('active');
        this.renderEvents();
        this.updateStats();
        this.populateEventFilter();
    }

    deleteEvent(id) {
        if (confirm('Are you sure you want to delete this event? All registrations will be lost.')) {
            this.storage.deleteEvent(id);
            showToast('Event deleted successfully!');
            this.renderEvents();
            this.updateStats();
            this.populateEventFilter();
            this.renderRegistrations();
        }
    }

    populateEventFilter() {
        const filter = document.getElementById('event-filter');
        if (!filter) return;

        const events = this.storage.getAllEvents();
        filter.innerHTML = '<option value="">All Events</option>' +
            events.map(e => `<option value="${e.id}">${e.title}</option>`).join('');
    }

    renderRegistrations(eventId = '') {
        const tbody = document.getElementById('registrations-table-body');
        if (!tbody) return;

        let registrations = this.storage.getRegistrations();
        if (eventId) {
            registrations = registrations.filter(r => r.eventId === eventId);
        }

        if (registrations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No registrations yet</td></tr>';
            return;
        }

        tbody.innerHTML = registrations.map(reg => {
            const event = this.storage.getEventById(reg.eventId);
            return `
                <tr>
                    <td><strong>${reg.studentName}</strong></td>
                    <td>${reg.email}</td>
                    <td>${reg.department}</td>
                    <td>${event ? event.title : 'Deleted Event'}</td>
                    <td>${formatDate(reg.registeredAt)}</td>
                </tr>
            `;
        }).join('');
    }
}

// STUDENT CONTROLLER
class StudentController {
    constructor(storage, auth) {
        this.storage = storage;
        this.auth = auth;

        if (!this.auth.checkAuth('student')) return;

        this.currentEmail = null;
        this.initUI();
    }

    initUI() {
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.auth.logout();
        });

        // Search and Filter
        document.getElementById('search-events').addEventListener('input', (e) => {
            this.renderEvents(e.target.value, document.getElementById('category-filter').value);
        });

        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.renderEvents(document.getElementById('search-events').value, e.target.value);
        });

        // Registration Form
        document.getElementById('registration-form').addEventListener('submit', (e) => {
            this.handleRegistration(e);
        });

        // My Registrations Button
        document.getElementById('my-registrations-btn').addEventListener('click', () => {
            this.showMyRegistrations();
        });

        // Close Modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
            });
        });

        // Event Delegation for Register Buttons
        const eventsGrid = document.getElementById('events-grid');
        if (eventsGrid) {
            eventsGrid.addEventListener('click', (e) => {
                const registerBtn = e.target.closest('.btn-register');
                if (registerBtn) {
                    const id = registerBtn.dataset.id;
                    this.openRegistrationModal(id);
                }
            });
        }

        // Initial Render
        this.renderEvents();
    }

    renderEvents(searchQuery = '', categoryFilter = '') {
        const grid = document.getElementById('events-grid');
        if (!grid) return;

        let events = this.storage.getAllEvents();

        // Apply Filters
        if (searchQuery) {
            events = events.filter(e =>
                e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (categoryFilter) {
            events = events.filter(e => e.category === categoryFilter);
        }

        if (events.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-card glass-card">
                    <i class="fa-solid fa-calendar-xmark"></i>
                    <h3>No Events Found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = events.map(event => {
            const available = this.storage.getAvailableSeats(event.id);
            const isFull = available === 0;

            return `
                <div class="event-card glass-card">
                    <div class="event-card-header">
                        <span class="event-category">${event.category}</span>
                        <h3>${event.title}</h3>
                        <div class="event-date">
                            <i class="fa-solid fa-calendar"></i>
                            ${formatDate(event.date)}
                        </div>
                    </div>
                    <div class="event-card-body">
                        <p class="event-description">${event.description}</p>
                        <div class="event-meta">
                            <div class="seats-info">
                                <i class="fa-solid fa-users"></i>
                                <span class="${isFull ? 'seats-full' : 'seats-available'}">
                                    ${available} / ${event.seatLimit} seats available
                                </span>
                            </div>
                        </div>
                        <button class="btn btn-primary full-width btn-register" data-id="${event.id}" ${isFull ? 'disabled' : ''}>
                            <i class="fa-solid fa-ticket"></i>
                            ${isFull ? 'Event Full' : 'Register Now'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    openRegistrationModal(id) {
        const event = this.storage.getEventById(id);
        if (!event) return;

        const available = this.storage.getAvailableSeats(id);
        if (available === 0) {
            showToast('Sorry, this event is full!', 'error');
            return;
        }

        document.getElementById('reg-event-id').value = id;
        document.getElementById('modal-event-info').innerHTML = `
            <h4>${event.title}</h4>
            <p><i class="fa-solid fa-calendar"></i> ${formatDate(event.date)} | <i class="fa-solid fa-users"></i> ${available} seats left</p>
        `;

        document.getElementById('registration-error').textContent = '';
        document.getElementById('registration-form').reset();
        document.getElementById('reg-event-id').value = id;

        document.getElementById('registration-modal').classList.add('active');
    }

    handleRegistration(e) {
        e.preventDefault();

        const eventId = document.getElementById('reg-event-id').value;
        const name = document.getElementById('student-name').value;
        const email = document.getElementById('student-email').value;
        const department = document.getElementById('student-department').value;

        // Check for duplicates
        if (this.storage.checkDuplicate(email, eventId)) {
            document.getElementById('registration-error').textContent =
                'You have already registered for this event!';
            return;
        }

        // Check availability
        if (this.storage.getAvailableSeats(eventId) === 0) {
            document.getElementById('registration-error').textContent =
                'Sorry, this event is now full!';
            return;
        }

        // Register
        const registration = {
            eventId,
            studentName: name,
            email,
            department
        };

        this.storage.registerStudent(registration);
        this.currentEmail = email;

        // Close registration modal and show ticket
        document.getElementById('registration-modal').classList.remove('active');
        this.showTicket(eventId, registration);
        this.renderEvents();
    }

    showTicket(eventId, registration) {
        const event = this.storage.getEventById(eventId);
        if (!event) return;

        document.getElementById('ticket-details').innerHTML = `
            <div class="ticket-detail">
                <strong>Event:</strong>
                <span>${event.title}</span>
            </div>
            <div class="ticket-detail">
                <strong>Student:</strong>
                <span>${registration.studentName}</span>
            </div>
            <div class="ticket-detail">
                <strong>Email:</strong>
                <span>${registration.email}</span>
            </div>
            <div class="ticket-detail">
                <strong>Department:</strong>
                <span>${registration.department}</span>
            </div>
            <div class="ticket-detail">
                <strong>Date:</strong>
                <span>${formatDate(event.date)}</span>
            </div>
            <div class="ticket-detail">
                <strong>Category:</strong>
                <span>${event.category}</span>
            </div>
        `;

        document.getElementById('ticket-modal').classList.add('active');
        showToast('Registration successful!');
    }

    showMyRegistrations() {
        if (!this.currentEmail) {
            const email = prompt('Enter your email to view your registrations:');
            if (!email) return;
            this.currentEmail = email;
        }

        const registrations = this.storage.getStudentRegistrations(this.currentEmail);
        const listDiv = document.getElementById('my-registrations-list');

        if (registrations.length === 0) {
            listDiv.innerHTML = `
                <div class="empty-state-card glass-card">
                    <i class="fa-solid fa-inbox"></i>
                    <h3>No Registrations Found</h3>
                    <p>You haven't registered for any events yet</p>
                </div>
            `;
        } else {
            listDiv.innerHTML = registrations.map(reg => {
                const event = this.storage.getEventById(reg.eventId);
                return `
                    <div class="registration-item">
                        <h4>${event ? event.title : 'Deleted Event'}</h4>
                        <p><i class="fa-solid fa-calendar"></i> ${event ? formatDate(event.date) : 'N/A'}</p>
                        <p><i class="fa-solid fa-tag"></i> ${event ? event.category : 'N/A'}</p>
                        <p><i class="fa-solid fa-clock"></i> Registered on ${formatDate(reg.registeredAt)}</p>
                    </div>
                `;
            }).join('');
        }

        document.getElementById('my-registrations-modal').classList.add('active');
    }
}

// ===== INITIALIZATION =====
const storage = new StorageService();
const auth = new AuthManager();

// Detect current page and initialize appropriate controller
const path = window.location.pathname;

if (path.includes('admin-dashboard.html')) {
    new AdminController(storage, auth);
} else if (path.includes('student-portal.html')) {
    new StudentController(storage, auth);
} else {
    // Login page (index.html)
    new LoginController(auth);
}
