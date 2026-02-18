/**
 * Nexus Retrieve - Core Application Engine
 * Handles State Management, Routing, and Page Logic
 */

class NexusCore {
    constructor() {
        this.storageKey = 'nexus_data_v1';
        this.currentUser = 'student_admin_01'; // Simulated logged-in user
        this.state = this.loadState();

        // Router initiation
        document.addEventListener('DOMContentLoaded', () => this.initRouter());
    }

    // --- Data Management ---

    loadState() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            return JSON.parse(stored);
        }

        // Initial Seed Data if empty
        const initialData = {
            items: [
                {
                    id: 'item_001',
                    title: 'Blue Hydro Flask',
                    description: 'Left it in the library near the quiet zone section B. Has a sticker of a cat on it.',
                    location: 'Central Library, 2nd Floor',
                    category: 'Lost',
                    date: new Date().toISOString(),
                    status: 'Open',
                    image: null, // Placeholder logic used in UI
                    author: 'student_123'
                },
                {
                    id: 'item_002',
                    title: 'Calculus Textbook',
                    description: 'Found on a bench outside the cafeteria. Looks new.',
                    location: 'Cafeteria Gardens',
                    category: 'Found',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    status: 'Pending',
                    image: null,
                    author: 'student_456'
                }
            ],
            userActions: []
        };
        this.saveState(initialData);
        return initialData;
    }

    saveState(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data || this.state));
        this.state = data || this.state;
    }

    addItem(itemData) {
        const newItem = {
            id: `item_${Date.now()}`,
            date: new Date().toISOString(),
            status: 'Open',
            author: this.currentUser,
            ...itemData
        };
        this.state.items.unshift(newItem);
        this.saveState();
        return newItem;
    }

    getItem(id) {
        return this.state.items.find(i => i.id === id);
    }

    updateItemStatus(id, newStatus, handoverDetails = null) {
        const itemIndex = this.state.items.findIndex(i => i.id === id);
        if (itemIndex > -1) {
            this.state.items[itemIndex].status = newStatus;
            if (handoverDetails) {
                this.state.items[itemIndex].handover = handoverDetails;
                this.state.items[itemIndex].resolvedDate = new Date().toISOString();
            }
            this.saveState();
            return true;
        }
        return false;
    }

    getItems(filterFn = null) {
        if (!filterFn) return this.state.items;
        return this.state.items.filter(filterFn);
    }

    // --- Router & Page Init ---

    initRouter() {
        this.injectGlobalModal(); // Ensure modal exists on all pages

        const path = window.location.pathname;
        const page = path.split('/').pop();

        console.log(`Nexus Engine Linked: ${page}`);

        if (page === 'index.html' || page === '') this.initHome();
        else if (page === 'report-item.html') this.initReport();
        else if (page === 'item-details.html') this.initDetails();
        else if (page === 'dashboard.html') this.initDashboard();

        this.updateNavState(page);
    }

    injectGlobalModal() {
        if (document.getElementById('handover-modal')) return;

        const modalHTML = `
            <div id="handover-modal" class="modal">
                <div class="glass-panel" style="width: 450px; max-width: 90%;">
                    <h2 style="margin-bottom: 1rem; color: var(--accent-neon);">🔐 Secure Handover</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
                        To mark this item as resolved/returned, you must strictly record the receiver's details.
                    </p>
                    
                    <div class="form-group">
                        <label class="form-label">Receiver Full Name *</label>
                        <input type="text" id="receiver-name" class="form-control" placeholder="e.g. Jane Doe">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Student / Staff ID *</label>
                        <input type="text" id="receiver-id" class="form-control" placeholder="e.g. 2024-CSE-042">
                    </div>

                    <div class="form-group" style="display: flex; align-items: flex-start; gap: 0.5rem; margin-top: 1rem;">
                        <input type="checkbox" id="verify-check" style="margin-top: 0.3rem;">
                        <label for="verify-check" style="font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;">
                            I certify that I have seen a valid ID card matches the person claiming this item.
                        </label>
                    </div>

                    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                        <button onclick="app.closeModal()" class="btn btn-outline" style="flex: 1;">Cancel</button>
                        <button id="confirm-handover" onclick="app.confirmHandover()" class="btn btn-primary" style="flex: 1;">Confirm Handover</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    updateNavState(page) {
        // Simple active state highlighter
        const map = {
            'index.html': 'nav-home',
            'report-item.html': 'nav-report',
            'dashboard.html': 'nav-dash'
        };
        const activeId = map[page] || map['index.html']; // Default to home
        const el = document.getElementById(activeId);
        if (el) el.classList.add('active');
    }

    // --- Page Logic Implementations ---

    initHome() {
        const grid = document.getElementById('items-feed');
        const searchInput = document.getElementById('search-input');

        const render = (items) => {
            if (!grid) return;
            grid.innerHTML = items.map(item => this.createCardHTML(item)).join('');
        };

        // Initial Render
        if (grid) render(this.state.items);

        // Search Listener
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = this.state.items.filter(item =>
                    item.title.toLowerCase().includes(term) ||
                    item.location.toLowerCase().includes(term)
                );
                render(filtered);
            });
        }
    }

    initReport() {
        const form = document.getElementById('report-form');
        const fileInput = document.getElementById('item-image');
        const previewEl = document.getElementById('preview-img');
        let base64Image = null;

        if (!form) return;

        // Image Preview Logic
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    base64Image = ev.target.result;
                    previewEl.src = base64Image;
                    previewEl.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });

        // Form Submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            const newItem = {
                title: formData.get('title'),
                category: formData.get('category'),
                location: formData.get('location'),
                description: formData.get('description'),
                image: base64Image
            };

            this.addItem(newItem);
            alert('Item Reported Successfully! Redirecting...');
            window.location.href = 'index.html';
        });
    }

    initDetails() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const container = document.getElementById('details-container');

        if (!id) {
            // window.location.href = 'index.html';
            return;
        }

        const item = this.getItem(id);
        if (!item || !container) {
            if (container) container.innerHTML = '<h2>Item not found</h2>';
            return;
        }

        // Render Details
        document.getElementById('detail-title').textContent = item.title;
        document.getElementById('detail-status').innerHTML = this.getStatusBadge(item.status);
        document.getElementById('detail-desc').textContent = item.description;
        document.getElementById('detail-loc').textContent = item.location;
        document.getElementById('detail-date').textContent = new Date(item.date).toLocaleDateString();

        if (item.image) {
            document.getElementById('detail-img').src = item.image;
        }

        // Action Buttons Logic
        const actionArea = document.getElementById('action-area');
        if (item.author === this.currentUser && item.status !== 'Resolved') {
            actionArea.innerHTML = `
                <button onclick="app.openHandoverModal('${item.id}')" class="btn btn-primary">Mark as Returned / Resolved</button>
            `;
        } else if (item.status === 'Resolved' && item.handover) {
            actionArea.innerHTML = `
                <div class="glass-panel" style="padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);">
                    <h3 style="color: var(--success); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.5rem;">✓</span> Item Successfully Returned
                    </h3>
                    <div style="display: grid; gap: 0.75rem;">
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">Received By:</div>
                            <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">${item.handover.receiver}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">Student/Staff ID:</div>
                            <div style="font-size: 1rem; color: var(--text-primary);">${item.handover.receiverId}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">Handover Date:</div>
                            <div style="font-size: 0.95rem; color: var(--text-primary);">${new Date(item.handover.date).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    initDashboard() {
        const listContainer = document.getElementById('my-items-list');
        const userItems = this.getItems(i => i.author === this.currentUser);

        if (!listContainer) return;

        const renderRow = (item) => {
            const resolvedInfo = item.status === 'Resolved' && item.handover ? `
                <div style="margin-top: 0.5rem; padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-left: 3px solid var(--success); border-radius: 6px;">
                    <div style="font-size: 0.85rem; color: var(--success); font-weight: 600;">✓ Handed Over To:</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.3rem;">
                        <strong>${item.handover.receiver}</strong> (ID: ${item.handover.receiverId})
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">
                        ${new Date(item.handover.date).toLocaleString()}
                    </div>
                </div>
            ` : '';

            return `
                <div class="glass-panel" style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <div style="flex: 1; min-width: 200px;">
                            <h3 style="font-size: 1.1rem;">${item.title}</h3>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
                                ${new Date(item.date).toLocaleDateString()} • ${item.location}
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            ${this.getStatusBadge(item.status)}
                            <div style="display: flex; gap: 0.5rem;">
                                <a href="item-details.html?id=${item.id}" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.8rem;">View</a>
                                ${item.status !== 'Resolved' ?
                    `<button onclick="app.openHandoverModal('${item.id}')" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Resolve</button>`
                    : ''}
                            </div>
                        </div>
                    </div>
                    ${resolvedInfo}
                </div>
            `;
        };

        listContainer.innerHTML = userItems.length ? userItems.map(renderRow).join('') : '<p style="color: var(--text-secondary)">No activity yet.</p>';
    }

    // --- Utilities ---

    createCardHTML(item) {
        const imgParams = item.image ? `src="${item.image}"` : 'style="background: linear-gradient(45deg, #1e293b, #0f172a)"';
        const imgTag = item.image ? `<img src="${item.image}" class="item-image" alt="${item.title}">` : `<div class="item-image" ${imgParams}></div>`;

        return `
            <article class="item-card" onclick="window.location.href='item-details.html?id=${item.id}'">
                ${imgTag}
                <div class="item-content">
                    <div class="item-meta">
                        <span class="badge badge-${item.category.toLowerCase()}">${item.category}</span>
                        <span>${new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <h3 class="item-title">${item.title}</h3>
                    <div class="item-location">
                        <span>📍</span> ${item.location}
                    </div>
                    <div style="margin-top: 0.5rem">
                        ${this.getStatusBadge(item.status)}
                    </div>
                </div>
            </article>
        `;
    }

    getStatusBadge(status) {
        let cls = 'resolved';
        if (status === 'Open') cls = 'lost'; // Re-using lost color for open/active
        if (status === 'Pending') cls = 'found'; // Pending verification
        return `<span class="badge badge-${cls}">${status}</span>`;
    }

    // Global Modal Functions
    openHandoverModal(itemId) {
        const modal = document.getElementById('handover-modal');
        if (modal) {
            modal.classList.add('active');
            const btn = document.getElementById('confirm-handover');
            if (btn) btn.dataset.itemId = itemId;

            // Clear previous inputs
            document.getElementById('receiver-name').value = '';
            document.getElementById('receiver-id').value = '';
            document.getElementById('verify-check').checked = false;
        } else {
            console.error('Modal not found in DOM');
        }
    }

    closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) modal.classList.remove('active');
    }

    confirmHandover() {
        const receiverName = document.getElementById('receiver-name').value;
        const receiverId = document.getElementById('receiver-id').value;
        const isVerified = document.getElementById('verify-check').checked;
        const itemId = document.getElementById('confirm-handover').dataset.itemId;

        if (!receiverName || !receiverId) {
            alert('⚠️ Please fill in all required fields (Name & ID).');
            return;
        }

        if (!isVerified) {
            alert('⚠️ You must certify that you have verified the receiver\'s identity.');
            return;
        }

        this.updateItemStatus(itemId, 'Resolved', {
            receiver: receiverName,
            receiverId: receiverId,
            date: new Date().toISOString()
        });

        this.closeModal();
        // Refresh page to show updates
        window.location.reload();
    }
}

// Initialize Global Instance
const app = new NexusCore();
