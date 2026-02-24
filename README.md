# 🎓 College Project — System Architecture

> A collection of 5 web-based college management systems built with **HTML, CSS, and vanilla JavaScript**, using **LocalStorage** as the persistence layer. Each project follows a multi-page architecture with role-based access control.

---

## 📑 Table of Contents

| # | Project | Description |
|---|---------|-------------|
| 1 | [Equipment Booking System](#1--equipment-booking-system) | Book and manage college equipment |
| 2 | [Fest Registration Portal](#2--fest-registration-portal) | Register for college fest events |
| 3 | [Lost & Found Portal](#3--lost--found-portal) | Report and track lost/found items |
| 4 | [Learning Portal (LMS)](#4--learning-portal-lms) | Course enrollment and video-based learning |
| 5 | [Smart Token System](#5--smart-token-system) | College canteen ordering with wallet & tokens |

---

## 1. 📦 Equipment Booking System

**EquipBook** — A system for students to browse and book college equipment (cameras, laptops, projectors, etc.) and for admins to manage inventory.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (Glassmorphism), JavaScript ES6+ |
| Storage | LocalStorage (JSON) |
| Fonts/Icons | Google Fonts (Outfit), Font Awesome 6 |
| Auth | SessionStorage-based role sessions |

### File Structure

```
equipment-booking-system/
├── index.html              # Login page (Student / Admin)
├── student_dashboard.html   # Student: browse & book equipment
├── admin_dashboard.html     # Admin: manage inventory & bookings
├── script.js               # All classes & controllers
└── style.css               # Glassmorphism theme
```

### System Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        LP["index.html<br/>Login Page"]
        SD["student_dashboard.html<br/>Student Dashboard"]
        AD["admin_dashboard.html<br/>Admin Dashboard"]
    end

    subgraph "Controller Layer"
        LC["LoginController<br/>• Tab switching<br/>• Form validation<br/>• Redirect on login"]
        SC["StudentController<br/>• Browse equipment<br/>• Search & filter<br/>• Book equipment<br/>• View/cancel history"]
        AC["AdminController<br/>• Manage inventory (CRUD)<br/>• View all bookings<br/>• Add new equipment"]
    end

    subgraph "Service Layer"
        AM["AuthManager<br/>• loginStudent() / loginAdmin()<br/>• checkAuth(role)<br/>• Session management"]
        DM["DataManager<br/>• Equipment CRUD<br/>• Booking CRUD<br/>• Availability calculation<br/>• Date-based filtering"]
    end

    subgraph "Persistence Layer"
        LS["LocalStorage<br/>equipBook_equipment_v2<br/>equipBook_bookings_v2"]
        SS["SessionStorage<br/>equipBook_user_session"]
    end

    LP --> LC
    SD --> SC
    AD --> AC

    LC --> AM
    SC --> AM
    SC --> DM
    AC --> AM
    AC --> DM

    AM --> SS
    DM --> LS
```

### Data Flow

```mermaid
sequenceDiagram
    actor Student
    participant Login as Login Page
    participant Auth as AuthManager
    participant Dashboard as Student Dashboard
    participant DM as DataManager
    participant Storage as LocalStorage

    Student->>Login: Enter Name & Roll No
    Login->>Auth: loginStudent(name, id)
    Auth->>Storage: Save session (SessionStorage)
    Auth-->>Login: Redirect to dashboard

    Student->>Dashboard: Browse Equipment
    Dashboard->>DM: getAllEquipment()
    DM->>Storage: Read equipment list
    Storage-->>DM: Equipment JSON
    DM-->>Dashboard: Render equipment cards

    Student->>Dashboard: Click "Book Now"
    Dashboard->>DM: getAvailability(id, date)
    DM->>Storage: Count existing bookings
    DM-->>Dashboard: Available count
    Student->>Dashboard: Confirm Booking
    Dashboard->>DM: addBooking(booking)
    DM->>Storage: Save booking
    DM-->>Dashboard: Show toast "Booking Confirmed!"
```

---

## 2. 🎪 Fest Registration Portal

**College Fest 2026** — An event registration system for college fests. Students can browse events and register; admins can create, edit, and manage events.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (Glassmorphism), JavaScript ES6+ |
| Storage | LocalStorage (JSON) |
| Fonts/Icons | Google Fonts (Outfit), Font Awesome 6 |
| Auth | SessionStorage-based role sessions |

### File Structure

```
fest-registration-portal/
├── index.html              # Login page (Student / Admin)
├── student-portal.html     # Student: browse events & register
├── admin-dashboard.html    # Admin: manage events & registrations
├── script.js               # All classes & controllers
└── style.css               # Glassmorphism theme
```

### System Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        LP["index.html<br/>Login Page"]
        SP["student-portal.html<br/>Student Portal"]
        AD["admin-dashboard.html<br/>Admin Dashboard"]
    end

    subgraph "Controller Layer"
        LC["LoginController<br/>• Role tab switching<br/>• Admin password auth<br/>• Student direct entry"]
        STC["StudentController<br/>• Browse events<br/>• Search & category filter<br/>• Event registration form<br/>• Duplicate check<br/>• View ticket / registrations"]
        ADC["AdminController<br/>• Create / Edit / Delete events<br/>• View all registrations<br/>• Filter by event<br/>• Live statistics"]
    end

    subgraph "Service Layer"
        AU["AuthManager<br/>• loginAdmin(password)<br/>• loginStudent()<br/>• checkAuth(role)"]
        SV["StorageService<br/>• Event CRUD<br/>• Registration management<br/>• Seat availability<br/>• Duplicate detection<br/>• Statistics engine"]
    end

    subgraph "Persistence Layer"
        LS["LocalStorage<br/>festPortal_events<br/>festPortal_registrations"]
        SS["SessionStorage<br/>festPortal_session"]
    end

    LP --> LC
    SP --> STC
    AD --> ADC

    LC --> AU
    STC --> AU
    STC --> SV
    ADC --> AU
    ADC --> SV

    AU --> SS
    SV --> LS
```

### Data Flow

```mermaid
sequenceDiagram
    actor Student
    participant Portal as Student Portal
    participant SV as StorageService
    participant Storage as LocalStorage

    Student->>Portal: Search / Filter events
    Portal->>SV: getAllEvents()
    SV->>Storage: Read events
    Storage-->>SV: Events array
    SV-->>Portal: Render event cards

    Student->>Portal: Click "Register Now"
    Portal->>SV: getAvailableSeats(eventId)
    SV-->>Portal: Seats remaining

    Student->>Portal: Fill registration form
    Portal->>SV: checkDuplicate(email, eventId)
    SV-->>Portal: Not duplicate ✓
    Portal->>SV: registerStudent(registration)
    SV->>Storage: Save registration
    SV-->>Portal: Show e-ticket modal
```

---

## 3. 🔍 Lost & Found Portal

**Nexus Retrieve** — A portal for students to report lost or found items, view item details, and manage secure handovers with identity verification.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (Neon/Dark theme), JavaScript ES6+ |
| Storage | LocalStorage (JSON) |
| Architecture | Monolithic SPA-like with URL routing |
| Image Upload | Base64 FileReader API |

### File Structure

```
last-and-found-portal/
├── index.html              # Home feed — all lost/found items
├── report-item.html        # Report a lost or found item
├── item-details.html       # Item details + handover action
├── dashboard.html          # User's reported items
├── css/
│   └── style.css           # Neon-dark glassmorphism theme
└── js/
    └── script.js           # NexusCore engine (monolithic)
```

### System Architecture

```mermaid
graph TB
    subgraph "Pages"
        HP["index.html<br/>Home Feed"]
        RP["report-item.html<br/>Report Item"]
        DP["item-details.html<br/>Item Details"]
        DB["dashboard.html<br/>My Items"]
    end

    subgraph "NexusCore Engine"
        RT["Router<br/>• initRouter()<br/>• Page detection<br/>• Nav state update"]
        DM["Data Manager<br/>• loadState() / saveState()<br/>• addItem() / getItem()<br/>• updateItemStatus()<br/>• Filter items"]
        PM["Page Modules<br/>• initHome() — feed + search<br/>• initReport() — form + image<br/>• initDetails() — view + actions<br/>• initDashboard() — my items"]
        HM["Handover Module<br/>• openHandoverModal()<br/>• confirmHandover()<br/>• ID verification<br/>• Receiver details capture"]
    end

    subgraph "Persistence"
        LS["LocalStorage<br/>nexus_data_v1<br/>(items[] + userActions[])"]
    end

    HP --> RT
    RP --> RT
    DP --> RT
    DB --> RT

    RT --> PM
    PM --> DM
    PM --> HM
    HM --> DM
    DM --> LS
```

### Item Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Open: Item reported
    Open --> Pending: Under review
    Pending --> Resolved: Handover confirmed
    Open --> Resolved: Handover confirmed

    state Resolved {
        [*] --> Verified
        Verified: Receiver Name ✓
        Verified: Student/Staff ID ✓
        Verified: Identity Certified ✓
    }
```

---

## 4. 📚 Learning Portal (LMS)

**Learning Management System** — A full-featured LMS for staff to manage courses and for students to enroll, watch video lessons, and track progress.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (Light/Dark theme), JavaScript ES6+ |
| Storage | LocalStorage (JSON) |
| Architecture | Modular (separate JS modules per concern) |
| Video Player | Embedded YouTube (iframe) |
| Auth | Email-based with role (staff/student) |

### File Structure

```
learning-portal/
├── index.html               # Login page
├── student-dashboard.html   # Student: enrolled courses + progress
├── staff-dashboard.html     # Staff: manage courses & enrollments
├── learning-player.html     # Video player + lesson navigation
├── assets/                  # Static assets
├── css/
│   ├── theme.css            # Design tokens & variables
│   └── components.css       # Reusable component styles
└── js/
    ├── storage.js           # LocalStorage abstraction (Storage)
    ├── auth.js              # Authentication module (Auth)
    ├── courses.js           # Course CRUD module (Courses)
    ├── enrollments.js       # Enrollment & progress module (Enrollments)
    └── ui.js                # Toast, Modal, Theme, Loader (UI)
```

### System Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        LG["index.html<br/>Login"]
        STD["student-dashboard.html<br/>Student Dashboard"]
        SFD["staff-dashboard.html<br/>Staff Dashboard"]
        VPL["learning-player.html<br/>Video Player"]
    end

    subgraph "Module Layer"
        UI["UI Module<br/>• showToast()<br/>• showModal() / closeModal()<br/>• toggleTheme()<br/>• showLoader() / hideLoader()<br/>• confirm()"]
        AUTH["Auth Module<br/>• login(email, role)<br/>• logout()<br/>• requireAuth(role)<br/>• isStaff() / isStudent()"]
        CRS["Courses Module<br/>• getAll() / getById()<br/>• create() / update() / delete()<br/>• getStats()<br/>• search()"]
        ENR["Enrollments Module<br/>• enroll(studentId, courseId)<br/>• markLessonComplete()<br/>• getByStudent()<br/>• getNextLesson()<br/>• Progress tracking"]
    end

    subgraph "Storage Layer"
        STR["Storage Module<br/>• get(key) / set(key)<br/>• remove(key)<br/>• initializeSeedData()"]
    end

    subgraph "Persistence"
        LS["LocalStorage<br/>lms_users / lms_courses<br/>lms_enrollments / lms_session<br/>lms_theme"]
    end

    LG --> AUTH
    STD --> AUTH
    STD --> CRS
    STD --> ENR
    SFD --> AUTH
    SFD --> CRS
    SFD --> ENR
    VPL --> ENR
    VPL --> CRS

    LG --> UI
    STD --> UI
    SFD --> UI
    VPL --> UI

    AUTH --> STR
    CRS --> STR
    ENR --> STR
    UI --> STR

    STR --> LS
```

### Student Learning Flow

```mermaid
sequenceDiagram
    actor Student
    participant Dash as Student Dashboard
    participant ENR as Enrollments
    participant CRS as Courses
    participant Player as Learning Player

    Student->>Dash: View available courses
    Dash->>CRS: getAll()
    CRS-->>Dash: Course list

    Student->>Dash: Click "Enroll"
    Dash->>ENR: enroll(studentId, courseId)
    ENR-->>Dash: Enrollment created (progress: 0%)

    Student->>Dash: Click "Continue Learning"
    Dash->>Player: Open lesson player
    Player->>ENR: getNextLesson(enrollmentId)
    ENR-->>Player: Next incomplete lesson

    Student->>Player: Watch lesson → Mark Complete
    Player->>ENR: markLessonComplete(enrollmentId, lessonId)
    ENR-->>Player: Updated progress (e.g., 40%)

    Note over ENR: When all lessons done → completed: true
```

---

## 5. 🍽️ Smart Token System

**Nexus-Crave** — A canteen ordering system with a digital wallet, menu browsing, cart checkout, token-based order tracking, and an admin panel for managing menu items and order statuses.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript (ES Modules) |
| Storage | LocalStorage (JSON) |
| Architecture | Multi-page with shared ES Module state |
| Currency | ₹ (INR) |
| Auth | Token-based login (localStorage) |

### File Structure

```
smart-token-system/
├── index.html              # Menu browsing + add to cart
├── login.html              # Student login
├── checkout.html           # Cart review & wallet payment
├── my-orders.html          # Order tracking with token IDs
├── admin-login.html        # Admin login
├── canteen-admin.html      # Admin: manage menu & orders
├── SharedState.js          # Shared state manager (ES Module)
├── menu.js                 # Default menu items data
├── styles.css              # Global styles
└── theme.css               # Theme variables
```

### System Architecture

```mermaid
graph TB
    subgraph "Student Pages"
        LG["login.html<br/>Student Login"]
        MN["index.html<br/>Menu Browser"]
        CK["checkout.html<br/>Cart & Checkout"]
        MO["my-orders.html<br/>Order Tracking"]
    end

    subgraph "Admin Pages"
        AL["admin-login.html<br/>Admin Login"]
        CA["canteen-admin.html<br/>Admin Dashboard"]
    end

    subgraph "SharedState (ES Module)"
        WM["Wallet Manager<br/>• getWalletBalance()<br/>• deductBalance()"]
        MM["Menu Manager<br/>• getMenu()<br/>• addMenuItem()<br/>• updateMenuItem()<br/>• deleteMenuItem()"]
        OM["Order Manager<br/>• placeOrder(cart, total)<br/>• updateOrderStatus()<br/>• getOrders()"]
        TG["Token Generator<br/>• generateToken()<br/>• 4-digit token ID"]
        EV["Event System<br/>• listenForUpdates()<br/>• 'order-updated' event<br/>• 'menu-updated' event<br/>• Cross-tab sync"]
    end

    subgraph "Persistence"
        LS["LocalStorage<br/>nexus_wallet_balance<br/>nexus_orders<br/>nexus_menu_items"]
    end

    LG --> MN
    MN --> MM
    MN --> WM
    CK --> WM
    CK --> OM
    MO --> OM
    CA --> MM
    CA --> OM

    WM --> LS
    MM --> LS
    OM --> LS
    OM --> TG
    EV --> LS
```

### Order Flow

```mermaid
sequenceDiagram
    actor Student
    participant Menu as Menu Page
    participant Cart as Checkout
    participant State as SharedState
    participant Storage as LocalStorage
    actor Admin

    Student->>Menu: Browse & add items to cart
    Menu->>Storage: Save temp cart

    Student->>Cart: Review cart
    Student->>Cart: Click "Place Order"
    Cart->>State: placeOrder(cartItems, total)
    State->>State: deductBalance(total)
    State->>State: generateToken() → "8472"
    State->>Storage: Save order
    State-->>Cart: Order confirmed + Token #8472

    Admin->>State: getOrders()
    State-->>Admin: All pending orders
    Admin->>State: updateOrderStatus(id, "Preparing")
    Admin->>State: updateOrderStatus(id, "Ready")
    Student->>State: Check token status → "Ready for pickup!"
```

---

## 🏗️ Common Architecture Pattern

All 5 projects share a similar architectural philosophy:

```mermaid
graph LR
    subgraph "Common Pattern"
        A["HTML Pages<br/>(Multi-Page)"] --> B["JavaScript Controllers<br/>(Business Logic)"]
        B --> C["Service / State Layer<br/>(Data Operations)"]
        C --> D["LocalStorage<br/>(Persistence)"]
    end

    style A fill:#4f46e5,color:#fff
    style B fill:#7c3aed,color:#fff
    style C fill:#2563eb,color:#fff
    style D fill:#059669,color:#fff
```

| Feature | Equipment Booking | Fest Portal | Lost & Found | Learning Portal | Smart Token |
|---------|:-:|:-:|:-:|:-:|:-:|
| Multi-page | ✅ | ✅ | ✅ | ✅ | ✅ |
| Role-based auth | ✅ | ✅ | ❌ | ✅ | ✅ |
| LocalStorage | ✅ | ✅ | ✅ | ✅ | ✅ |
| Glassmorphism UI | ✅ | ✅ | ✅ | ✅ | ❌ |
| ES Modules | ❌ | ❌ | ❌ | ❌ | ✅ |
| Seed Data | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search/Filter | ✅ | ✅ | ✅ | ✅ | ✅ |
| Toast Notifications | ✅ | ✅ | ❌ | ✅ | ✅ |

---

## 🚀 How to Run

All projects are **purely frontend** — no server or build step needed:

1. Open any project folder
2. Launch `index.html` in a modern browser
3. Data persists in your browser's LocalStorage

---

> **Built with ❤️ for College Coursework**
