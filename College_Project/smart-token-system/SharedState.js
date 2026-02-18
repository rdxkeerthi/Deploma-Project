/* SharedState.js */
const CONFIG = {
    WALLET_KEY: 'nexus_wallet_balance',
    ORDERS_KEY: 'nexus_orders',
    STATUS_KEY: 'nexus_system_status',
    MENU_KEY: 'nexus_menu_items'
};

const INITIAL_BALANCE = 500.00; // Starting simulated balance

class SharedState {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(CONFIG.WALLET_KEY)) {
            localStorage.setItem(CONFIG.WALLET_KEY, INITIAL_BALANCE.toFixed(2));
        }
        if (!localStorage.getItem(CONFIG.ORDERS_KEY)) {
            localStorage.setItem(CONFIG.ORDERS_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem(CONFIG.MENU_KEY)) {
            // Import default menu items (simulated import since we are inside class)
            const defaultMenu = [
                { id: 1, name: "Avocado Toast", price: 120.00, category: "breakfast", image: "https://images.unsplash.com/photo-1588137372308-15f75323a51d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", prepTime: "10 min" },
                { id: 2, name: "Berry Smoothie Bowl", price: 150.00, category: "breakfast", image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", prepTime: "8 min" },
                { id: 3, name: "Grilled Chicken Salad", price: 180.00, category: "lunch", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", prepTime: "15 min" },
                { id: 4, name: "Truffle Fries", price: 90.00, category: "lunch", image: "https://images.unsplash.com/photo-1573080496987-a2267dcbaa42?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", prepTime: "12 min" },
                { id: 5, name: "Iced Matcha Latte", price: 110.00, category: "drinks", image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", prepTime: "5 min" },
                { id: 6, name: "Espresso Tonic", price: 80.00, category: "drinks", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", prepTime: "3 min" }
            ];
            localStorage.setItem(CONFIG.MENU_KEY, JSON.stringify(defaultMenu));
        }
    }

    // Wallet Operations
    getWalletBalance() {
        return parseFloat(localStorage.getItem(CONFIG.WALLET_KEY) || 0);
    }

    deductBalance(amount) {
        const current = this.getWalletBalance();
        if (current >= amount) {
            localStorage.setItem(CONFIG.WALLET_KEY, (current - amount).toFixed(2));
            return true;
        }
        return false;
    }

    // Menu Operations
    getMenu() {
        return JSON.parse(localStorage.getItem(CONFIG.MENU_KEY) || '[]');
    }

    addMenuItem(item) {
        const menu = this.getMenu();
        item.id = Date.now(); // Simple ID generation
        menu.push(item);
        localStorage.setItem(CONFIG.MENU_KEY, JSON.stringify(menu));
        window.dispatchEvent(new Event('menu-updated'));
    }

    updateMenuItem(updatedItem) {
        const menu = this.getMenu();
        const index = menu.findIndex(i => i.id == updatedItem.id); // Loose equality for string/number id mix
        if (index > -1) {
            menu[index] = { ...menu[index], ...updatedItem };
            localStorage.setItem(CONFIG.MENU_KEY, JSON.stringify(menu));
            window.dispatchEvent(new Event('menu-updated'));
            return true;
        }
        return false;
    }

    deleteMenuItem(id) {
        let menu = this.getMenu();
        menu = menu.filter(i => i.id != id);
        localStorage.setItem(CONFIG.MENU_KEY, JSON.stringify(menu));
        window.dispatchEvent(new Event('menu-updated'));
    }

    // Order Operations
    getOrders() {
        return JSON.parse(localStorage.getItem(CONFIG.ORDERS_KEY) || '[]');
    }

    placeOrder(cartItems, total) {
        if (this.deductBalance(total)) {
            const newOrder = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                tokenId: this.generateToken(),
                items: cartItems,
                total: total,
                status: 'In Queue',
                timestamp: new Date().toISOString()
            };
            const orders = this.getOrders();
            orders.unshift(newOrder); // Add to top
            localStorage.setItem(CONFIG.ORDERS_KEY, JSON.stringify(orders));

            // Dispatch event for real-time updates
            window.dispatchEvent(new Event('order-updated'));
            return newOrder;
        }
        throw new Error("Insufficient Funds");
    }

    updateOrderStatus(orderId, newStatus) {
        const orders = this.getOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex > -1) {
            orders[orderIndex].status = newStatus;
            localStorage.setItem(CONFIG.ORDERS_KEY, JSON.stringify(orders));
            return true;
        }
        return false;
    }

    // Utilities
    generateToken() {
        // 4-digit token based on time (simple simulation)
        const now = Date.now().toString();
        return now.substr(now.length - 4);
    }

    listenForUpdates(callback) {
        window.addEventListener('storage', (e) => {
            if (e.key === CONFIG.ORDERS_KEY || e.key === CONFIG.WALLET_KEY || e.key === CONFIG.MENU_KEY) {
                callback(e.key);
            }
        });
        // Also listen for local custom events (for same-tab updates)
        window.addEventListener('order-updated', () => callback(CONFIG.ORDERS_KEY));
        window.addEventListener('menu-updated', () => callback(CONFIG.MENU_KEY));
    }
}

const state = new SharedState();
export default state;
