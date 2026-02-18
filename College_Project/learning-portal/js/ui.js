/**
 * UI Utilities Module
 * Toast notifications, modals, theme switching, loaders
 */

const UI = {
    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, info, warning)
     * @param {number} duration - Duration in ms (default 3000)
     */
    showToast(message, type = 'info', duration = 3000) {
        // Remove existing toasts
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };
        return icons[type] || icons.info;
    },

    /**
     * Show modal
     * @param {string} title - Modal title
     * @param {string} content - Modal content (HTML)
     * @param {Array} buttons - Array of button objects {text, class, onClick}
     */
    showModal(title, content, buttons = []) {
        // Remove existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="UI.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${buttons.map((btn, idx) =>
            `<button class="btn ${btn.class || 'btn-secondary'}" data-btn-idx="${idx}">${btn.text}</button>`
        ).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Attach button handlers
        buttons.forEach((btn, idx) => {
            const btnEl = modal.querySelector(`[data-btn-idx="${idx}"]`);
            if (btnEl && btn.onClick) {
                btnEl.addEventListener('click', btn.onClick);
            }
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Close on ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        setTimeout(() => modal.classList.add('show'), 10);
    },

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    },

    /**
     * Toggle theme (dark/light)
     */
    toggleTheme() {
        const currentTheme = Storage.get(Storage.KEYS.THEME, 'light');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        Storage.set(Storage.KEYS.THEME, newTheme);

        this.showToast(`Switched to ${newTheme} mode`, 'success', 2000);
    },

    /**
     * Initialize theme on page load
     */
    initTheme() {
        const theme = Storage.get(Storage.KEYS.THEME, 'light');
        document.documentElement.setAttribute('data-theme', theme);
    },

    /**
     * Show loading overlay
     */
    showLoader() {
        const loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = `
            <div class="loader-spinner"></div>
        `;
        document.body.appendChild(loader);
    },

    /**
     * Hide loading overlay
     */
    hideLoader() {
        const loader = document.querySelector('.loader-overlay');
        if (loader) loader.remove();
    },

    /**
     * Confirm dialog
     * @param {string} message - Confirmation message
     * @returns {Promise<boolean>}
     */
    confirm(message) {
        return new Promise((resolve) => {
            this.showModal('Confirm', `<p>${message}</p>`, [
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    onClick: () => {
                        this.closeModal();
                        resolve(false);
                    }
                },
                {
                    text: 'Confirm',
                    class: 'btn-primary',
                    onClick: () => {
                        this.closeModal();
                        resolve(true);
                    }
                }
            ]);
        });
    }
};

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    UI.initTheme();
});
