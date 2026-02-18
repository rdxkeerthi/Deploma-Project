/**
 * Online Equipment Booking System
 * Multi-Page Architecture
 */

// --- Configuration ---
const STORAGE_KEYS = {
    EQUIPMENT: 'equipBook_equipment_v2',
    BOOKINGS: 'equipBook_bookings_v2',
    USER_SESSION: 'equipBook_user_session'
};

// --- Mock Data (Initial Seeding) ---
const INITIAL_EQUIPMENT = [
    { id: 'eq_1', name: 'Canon EOS 90D', category: 'Camera', image: 'https://placehold.co/400x300/2a2a3e/FFF?text=Canon+90D', totalQty: 3 },
    { id: 'eq_2', name: 'Sony A7III Kit', category: 'Camera', image: 'https://placehold.co/400x300/2a2a3e/FFF?text=Sony+A7III', totalQty: 2 },
    { id: 'eq_3', name: 'MacBook Pro 16"', category: 'Computing', image: 'https://placehold.co/400x300/2a2a3e/FFF?text=MacBook+Pro', totalQty: 5 },
    { id: 'eq_4', name: 'Dell XPS 15', category: 'Computing', image: 'https://placehold.co/400x300/2a2a3e/FFF?text=Dell+XPS', totalQty: 4 },
    { id: 'eq_5', name: 'Epson Projector', category: 'Other', image: 'https://placehold.co/400x300/2a2a3e/FFF?text=Projector', totalQty: 1 },
    { id: 'eq_6', name: 'Godox Light Kit', category: 'Lighting', image: 'https://placehold.co/400x300/2a2a3e/FFF?text=Godox+Lights', totalQty: 2 },
];

/**
 * Data Manager: Handles Storage and Logic
 */
class DataManager {
    constructor() {
        this.equipment = this.load(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
        this.bookings = this.load(STORAGE_KEYS.BOOKINGS, []);
    }

    load(key, defaultData) {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultData;
    }

    save() {
        localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(this.equipment));
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
    }

    // Equipment
    getAllEquipment() { return this.equipment; }
    getEquipmentById(id) { return this.equipment.find(e => e.id === id); }

    addEquipment(item) {
        this.equipment.push(item);
        this.save();
    }

    deleteEquipment(id) {
        this.equipment = this.equipment.filter(e => e.id !== id);
        this.save();
    }

    updateEquipmentQty(id, qty) {
        const item = this.getEquipmentById(id);
        if (item) {
            item.totalQty = Number.parseInt(qty);
            this.save();
        }
    }

    // Bookings
    addBooking(booking) {
        this.bookings.push(booking);
        this.save();
    }

    cancelBooking(id) {
        const idx = this.bookings.findIndex(b => b.id === id);
        if (idx !== -1) {
            // We physically remove it for simplicity, or mark 'cancelled'
            this.bookings.splice(idx, 1);
            this.save();
        }
    }

    getAllBookings() {
        return this.bookings.sort((a, b) => new Date(b.created) - new Date(a.created));
    }

    getStudentBookings(studentId) {
        return this.bookings.filter(b => b.studentId === studentId);
    }

    /**
     * Check how many items are available for a specific date.
     * Logic: TotalQty - (Active Bookings on that Date)
     */
    getAvailability(equipmentId, date) {
        const item = this.getEquipmentById(equipmentId);
        if (!item) return 0;

        // Count bookings for this item on this date
        const bookedCount = this.bookings.filter(b =>
            b.equipmentId === equipmentId &&
            b.date === date
        ).length;

        return Math.max(0, item.totalQty - bookedCount);
    }
}

/**
 * Auth Manager: Handles Login/Session
 */
class AuthManager {
    constructor() {
        this.sessionKey = STORAGE_KEYS.USER_SESSION;
    }

    loginStudent(name, id) {
        const user = { role: 'student', name, id };
        sessionStorage.setItem(this.sessionKey, JSON.stringify(user));
    }

    loginAdmin() {
        const user = { role: 'admin', name: 'Administrator' };
        sessionStorage.setItem(this.sessionKey, JSON.stringify(user));
    }

    logout() {
        sessionStorage.removeItem(this.sessionKey);
        window.location.href = 'index.html';
    }

    getUser() {
        return JSON.parse(sessionStorage.getItem(this.sessionKey));
    }

    checkAuth(requiredRole) {
        const user = this.getUser();
        if (!user) {
            window.location.href = 'index.html';
            return null;
        }
        if (requiredRole && user.role !== requiredRole) {
            alert('Unauthorized Access');
            window.location.href = 'index.html';
            return null;
        }
        return user;
    }
}

/**
 * Global Helper for Toast
 */
function showToast(msg, type = 'success') {
    // Create toast element on the fly if needed or use existing
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${msg}`;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
}


/**
 * PAGE CONTROLLERS
 */

// 1. LOGIN CONTROLLER
class LoginController {
    constructor(auth) {
        this.auth = auth;
        this.setupListeners();
    }

    setupListeners() {
        // Forms
        const studentForm = document.getElementById('student-login-form');
        const adminForm = document.getElementById('admin-login-form');

        if (studentForm) {
            studentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('student-name').value;
                const id = document.getElementById('student-id').value;
                this.auth.loginStudent(name, id);
                window.location.href = 'student_dashboard.html';
            });
        }

        if (adminForm) {
            adminForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const pass = document.getElementById('admin-pass').value;
                if (pass === 'admin123') {
                    this.auth.loginAdmin();
                    window.location.href = 'admin_dashboard.html';
                } else {
                    alert('Invalid Password! (Hint: admin123)');
                }
            });
        }

        // Tab Switcher
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.login-form').forEach(f => f.classList.add('hidden'));

                e.target.classList.add('active');
                const formId = e.target.dataset.target;
                document.getElementById(formId).classList.remove('hidden');
            });
        });
    }
}

// 2. STUDENT CONTROLLER
class StudentController {
    constructor(dm, auth) {
        this.dm = dm;
        this.auth = auth;
        this.user = auth.checkAuth('student');
        if (!this.user) return;

        this.initUI();
    }


    initUI() {
        // Name Display
        const nameDisplay = document.getElementById('user-name-display');
        if (nameDisplay) nameDisplay.innerText = this.user.name;

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.auth.logout());

        this.renderEquipment();
        this.renderHistory();

        // Search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.renderEquipment(e.target.value);
            });
        }

        // Booking Modal
        const modal = document.getElementById('booking-modal');
        const form = document.getElementById('booking-form');
        if (form && modal) {
            form.addEventListener('submit', (e) => this.handleBooking(e));
            document.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('active'));
        }

        // EVENT DELEGATION FOR DYNAMIC BUTTONS
        const grid = document.getElementById('equipment-grid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                if (e.target.closest('.btn-book')) {
                    const id = e.target.closest('.btn-book').dataset.id;
                    this.openBookModal(id);
                }
            });
        }

        const historyList = document.getElementById('history-list');
        if (historyList) {
            historyList.addEventListener('click', (e) => {
                if (e.target.closest('.btn-cancel')) {
                    const id = e.target.closest('.btn-cancel').dataset.id;
                    this.cancel(id);
                }
            });
        }
    }

    renderEquipment(query = '') {
        const grid = document.getElementById('equipment-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const items = this.dm.getAllEquipment().filter(i => i.name.toLowerCase().includes(query.toLowerCase()));

        if (items.length === 0) {
            grid.innerHTML = '<p style="text-align:center; color:var(--text-muted); width:100%;">No equipment found.</p>';
            return;
        }

        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'equipment-card glass-card slide-up';
            el.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${item.image}" onerror="this.src='https://placehold.co/400x300?text=No+Image'">
                </div>
                <div class="card-content">
                    <h3>${item.name}</h3>
                    <span class="category">${item.category}</span>
                    <div class="stock-info">
                        <span class="stock-badge">Total Stock: ${item.totalQty}</span>
                    </div>
                    <button class="btn btn-primary full-width btn-book" data-id="${item.id}">
                        Book Now
                    </button>
                </div>
            `;
            grid.appendChild(el);
        });
    }

    openBookModal(id) {
        const item = this.dm.getEquipmentById(id);
        if (!item) return;

        document.getElementById('booking-item-id').value = id;
        document.getElementById('modal-item-name').innerText = item.name;
        document.getElementById('booking-error').innerText = '';

        // Reset and set Date to today
        document.getElementById('booking-form').reset();
        document.getElementById('booking-date').valueAsDate = new Date();
        document.getElementById('booking-item-id').value = id;

        // Auto-check availability for today when opening
        this.checkModalAvailability();

        // Listen for date change to update availability display
        document.getElementById('booking-date').addEventListener('change', () => this.checkModalAvailability());

        document.getElementById('booking-modal').classList.add('active');
    }

    checkModalAvailability() {
        const id = document.getElementById('booking-item-id').value;
        const date = document.getElementById('booking-date').value;
        if (!date) return;

        const available = this.dm.getAvailability(id, date);
        const availDisplay = document.getElementById('modal-availability');
        availDisplay.innerText = `Available on ${date}: ${available} / ${this.dm.getEquipmentById(id).totalQty}`;

        const btn = document.getElementById('btn-confirm-book');
        if (available > 0) {
            availDisplay.style.color = 'var(--success)';
            btn.disabled = false;
        } else {
            availDisplay.style.color = 'var(--error)';
            btn.disabled = true;
        }
    }

    handleBooking(e) {
        e.preventDefault();
        const id = document.getElementById('booking-item-id').value;
        const date = document.getElementById('booking-date').value;
        const time = document.getElementById('booking-time').value;
        const duration = Number.parseInt(document.getElementById('booking-duration').value);

        // Double check avail
        if (this.dm.getAvailability(id, date) <= 0) {
            document.getElementById('booking-error').innerText = 'Sorry, item out of stock for this date.';
            return;
        }

        const booking = {
            id: 'bk_' + Date.now(),
            equipmentId: id,
            studentId: this.user.id,
            studentName: this.user.name,
            date,
            time,
            duration,
            created: new Date().toISOString()
        };

        this.dm.addBooking(booking);
        showToast('Booking Confirmed!');
        document.getElementById('booking-modal').classList.remove('active');
        this.renderHistory();
    }

    renderHistory() {
        const list = document.getElementById('history-list');
        list.innerHTML = '';

        const myBookings = this.dm.getStudentBookings(this.user.id);

        if (myBookings.length === 0) {
            list.innerHTML = '<p class="text-muted">No bookings yet.</p>';
            return;
        }

        myBookings.forEach(b => {
            const item = this.dm.getEquipmentById(b.equipmentId);
            const el = document.createElement('div');
            el.className = 'glass-card history-item';
            el.innerHTML = `
                <div class="history-info">
                    <h4>${item ? item.name : 'Unknown Item'}</h4>
                    <p><i class="fa-regular fa-calendar"></i> ${b.date} | ${b.time} (${b.duration}h)</p>
                </div>
                <button class="btn btn-danger btn-sm btn-cancel" data-id="${b.id}">Cancel</button>
            `;
            list.appendChild(el);
        });
    }

    cancel(id) {
        if (confirm('Cancel this booking?')) {
            this.dm.cancelBooking(id);
            this.renderHistory();
            showToast('Booking Cancelled');
        }
    }
}

// 3. ADMIN CONTROLLER
class AdminController {
    constructor(dm, auth) {
        this.dm = dm;
        this.auth = auth;
        this.user = auth.checkAuth('admin');
        if (!this.user) return;

        this.initUI();
    }

    initUI() {
        document.getElementById('logout-btn').addEventListener('click', () => this.auth.logout());

        this.renderInventory();
        this.renderAllBookings();

        // Add Item Modal
        const addModal = document.getElementById('add-modal');
        const addBtn = document.getElementById('btn-add-new');
        if (addBtn) addBtn.addEventListener('click', () => addModal.classList.add('active'));

        document.querySelector('.close-add-modal').addEventListener('click', () => addModal.classList.remove('active'));
        document.getElementById('add-form').addEventListener('submit', (e) => this.addItem(e));

        // EVENT DELEGATION
        const invBody = document.getElementById('inventory-body');
        if (invBody) {
            invBody.addEventListener('click', (e) => {
                if (e.target.closest('.btn-delete')) {
                    const id = e.target.closest('.btn-delete').dataset.id;
                    this.deleteItem(id);
                }
            });
        }
    }

    renderInventory() {
        const tbody = document.getElementById('inventory-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        const items = this.dm.getAllEquipment();

        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${item.image}" class="table-img" onerror="this.src='https://placehold.co/50'"> ${item.name}</td>
                <td>${item.category}</td>
                <td>${item.totalQty}</td>
                <td class="actions">
                    <button class="btn btn-danger btn-sm btn-delete" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    renderAllBookings() {
        const tbody = document.getElementById('bookings-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        const bookings = this.dm.getAllBookings();

        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No bookings found.</td></tr>';
            return;
        }

        bookings.forEach(b => {
            const item = this.dm.getEquipmentById(b.equipmentId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${b.date}</td>
                <td><strong>${b.studentName}</strong> <br> <span class="text-sm text-muted">${b.studentId}</span></td>
                <td>${item ? item.name : 'Deleted Item'}</td>
                <td>${b.time} (${b.duration}h)</td>
                <td><span class="status-badge status-available">Active</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    addItem(e) {
        e.preventDefault();
        const item = {
            id: 'eq_' + Date.now(),
            name: document.getElementById('new-name').value,
            category: document.getElementById('new-category').value,
            totalQty: Number.parseInt(document.getElementById('new-qty').value),
            image: document.getElementById('new-image').value || 'https://placehold.co/400x300?text=Equipment',
        };

        this.dm.addEquipment(item);
        showToast('Item Added');
        document.getElementById('add-modal').classList.remove('active');
        document.getElementById('add-form').reset();
        this.renderInventory();
    }

    deleteItem(id) {
        if (confirm('Delete this item? This cannot be undone.')) {
            this.dm.deleteEquipment(id);
            this.renderInventory();
            showToast('Item Deleted');
        }
    }
}

// --- Main Init ---
const dm = new DataManager();
const auth = new AuthManager();

// Global instances for onclick handlers

// Determine which page we are on
// Determine which page we are on
const path = window.location.pathname;
const title = document.title;

if (path.includes('student_dashboard.html') || title.includes('Student Dashboard')) {
    window.studentApp = new StudentController(dm, auth);
    console.log('Student App Initialized');
} else if (path.includes('admin_dashboard.html') || title.includes('Admin Dashboard')) {
    window.adminApp = new AdminController(dm, auth);
    console.log('Admin App Initialized');
} else {
    // Default to Login Logic (index.html)
    new LoginController(auth);
    console.log('Login App Initialized');
}
