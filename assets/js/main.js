/**
 * ⚜️ AETHERSTAY OS — GLOBAL CLIENT CONTROLLER v2.0
 * Central Room Database · Dark Mode Engine · AI Concierge Chatbot · Layout Injector · Toast System
 */

// =============================================================
// 1. CENTRAL ROOM DATABASE (Single Source of Truth)
// =============================================================
const roomsData = [
    {
        id: "deluxe",
        name: "Deluxe Alabaster Room",
        price: 3000,
        image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&q=80",
        description: "An elegant, light-filled room featuring panoramic city skyline views, custom travertine furniture, and dynamic ambient lighting systems.",
        amenities: ["📶 Gigabit Fiber WiFi", "🏊 Infinity Pool Access", "🍽️ Organic Breakfast", "🚗 Valet Parking"],
        capacity: "2 Guests",
        tags: ["city view", "deluxe", "alabaster", "affordable"]
    },
    {
        id: "executive",
        name: "Executive Champagne Suite",
        price: 5000,
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1000&q=80",
        description: "Premium corporate suite with dedicated workspace annex, high-fidelity acoustics, luxury bath fixtures, and an open bar cabinet.",
        amenities: ["📶 Gigabit Fiber WiFi", "🏊 Infinity Pool Access", "🍽️ Organic Breakfast", "🚗 Valet Parking", "👔 Express Valet"],
        capacity: "3 Guests",
        tags: ["executive", "champagne", "business", "workspace", "premium"]
    },
    {
        id: "suite",
        name: "Royal Obsidian Penthouse",
        price: 8000,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80",
        description: "The pinnacle of architectural hospitality. Double-height ceilings, private heated splash pool, 24/7 butler service, and dedicated security entrance.",
        amenities: ["📶 Gigabit Fiber WiFi", "🏊 Infinity Pool Access", "🍽️ Organic Breakfast", "🚗 Valet Parking", "🤵 Personal Butler", "🍷 Private Wine Cellar"],
        capacity: "4 Guests",
        tags: ["suite", "penthouse", "obsidian", "royal", "luxury", "butler"]
    }
];

// =============================================================
// 2. DARK MODE ENGINE
// =============================================================
const ThemeEngine = {
    init() {
        const saved = localStorage.getItem("aetherstay_theme") || "light";
        this.apply(saved);
    },
    apply(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("aetherstay_theme", theme);
        // Update all toggle button icons on page
        document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
            btn.textContent = theme === "dark" ? "☀️" : "🌙";
            btn.setAttribute("title", theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");
        });
    },
    toggle() {
        const current = document.documentElement.getAttribute("data-theme") || "light";
        this.apply(current === "dark" ? "light" : "dark");
    }
};

// =============================================================
// 3. GLOBAL TOAST NOTIFICATION ENGINE
// =============================================================
const Toast = {
    show(message, type = "success") {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            container.setAttribute("style", `
                position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
                z-index: 99999; display: flex; flex-direction: column-reverse; gap: 10px;
                max-width: 420px; width: 90%; pointer-events: none;
            `);
            document.body.appendChild(container);
        }

        const colorMap = {
            success: "#198754", danger: "#DC3545", warning: "#B89970"
        };
        const iconMap = {
            success: "✓", danger: "✕", warning: "⚠"
        };

        const border = colorMap[type] || colorMap.success;
        const icon = iconMap[type] || "✓";

        const toast = document.createElement("div");
        toast.setAttribute("style", `
            display: flex; align-items: center; gap: 14px;
            padding: 14px 18px;
            background: var(--color-bg-card);
            color: var(--color-brand-primary);
            border-left: 3px solid ${border};
            border-radius: 10px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
            transform: translateY(20px); opacity: 0; pointer-events: auto;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        `);
        toast.innerHTML = `
            <span style="width:22px;height:22px;border-radius:50%;background:${border}1A;color:${border};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;flex-shrink:0;">${icon}</span>
            <span style="flex:1;">${message}</span>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;font-size:18px;cursor:pointer;color:currentColor;opacity:0.35;flex-shrink:0;">×</button>
        `;
        container.appendChild(toast);
        setTimeout(() => { toast.style.transform = "translateY(0)"; toast.style.opacity = "1"; }, 20);
        setTimeout(() => {
            toast.style.transform = "translateY(-16px)"; toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 400);
        }, 4200);
    }
};

// =============================================================
// 4. GLOBAL LAYOUT INJECTOR (Navbar + Footer + Theme Toggle + Chat FAB)
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
    ThemeEngine.init();
    injectNavbar();
    injectFooter();
    injectChatWidget();
});

function injectNavbar() {
    const navHTML = `
        <div class="navbar-wrapper">
            <a href="index.html" class="logo">Aether<span>Stay</span></a>
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="rooms.html">Rooms</a></li>
                <li><a href="gallery.html">Gallery</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="contact.html">Contact</a></li>
                <li><a href="admin.html" class="admin-badge">Admin</a></li>
            </ul>
            <div style="display:flex;align-items:center;gap:10px;">
                <button class="theme-toggle-btn" onclick="ThemeEngine.toggle()" title="Toggle Theme">🌙</button>
                <a href="booking.html" class="book-cta">Book Suite ⚜️</a>
            </div>
        </div>
    `;

    const existingHeader = document.querySelector("header");
    if (existingHeader) {
        existingHeader.innerHTML = navHTML;
        existingHeader.className = "global-header";
    } else {
        const header = document.createElement("header");
        header.className = "global-header";
        header.innerHTML = navHTML;
        document.body.insertBefore(header, document.body.firstChild);
    }

    // Re-apply theme icon after injection
    ThemeEngine.init();

    // Highlight active link
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(link => {
        if (link.getAttribute("href") === currentPath) link.classList.add("active");
    });
}

function injectFooter() {
    const footerHTML = `
        <div class="footer-grid">
            <div class="footer-info">
                <a href="index.html" class="logo">Aether<span>Stay</span></a>
                <p>Architectural retreats and luxury stays curated for remote-first executives and modern creative nomads.</p>
            </div>
            <div class="footer-links">
                <h4>Explore</h4>
                <ul>
                    <li><a href="index.html">Home Landing</a></li>
                    <li><a href="rooms.html">Suite Catalogue</a></li>
                    <li><a href="gallery.html">Visual Gallery</a></li>
                </ul>
            </div>
            <div class="footer-links">
                <h4>Company</h4>
                <ul>
                    <li><a href="about.html">Our Vision</a></li>
                    <li><a href="contact.html">Elite Concierge</a></li>
                    <li><a href="admin.html">Operations Center</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© 2026 AetherStay Hospitality OS. Crafted with premium design tokens.</p>
            <p>Enterprise-secured · Investor-ready · Portfolio-grade</p>
        </div>
    `;

    const existingFooter = document.querySelector("footer");
    if (existingFooter) {
        existingFooter.innerHTML = footerHTML;
        existingFooter.className = "global-footer";
    } else {
        const footer = document.createElement("footer");
        footer.className = "global-footer";
        footer.innerHTML = footerHTML;
        document.body.appendChild(footer);
    }
}

// =============================================================
// 5. AI CONCIERGE CHATBOT ENGINE
// =============================================================
function injectChatWidget() {
    // Don't inject on admin page
    if (window.location.pathname.includes("admin")) return;

    const chatHTML = `
        <!-- Floating Action Button -->
        <button class="chat-fab" id="chatFab" onclick="AIConcierge.toggleDrawer()" aria-label="Open AI Concierge">
            🤖
            <span class="chat-badge"></span>
        </button>

        <!-- Sliding Chat Drawer -->
        <div class="chat-drawer" id="chatDrawer">
            <div class="chat-drawer-header">
                <div class="chat-drawer-title">
                    <h4>Aether AI</h4>
                    <span>Online</span>
                </div>
                <button class="chat-close-btn" onclick="AIConcierge.toggleDrawer()">×</button>
            </div>

            <div class="chat-messages" id="chatMessages"></div>

            <div class="chat-suggestions" id="chatSuggestions">
                <button class="chat-suggestion-chip" onclick="AIConcierge.send('Show rooms under ₹5000')">Rooms under ₹5K</button>
                <button class="chat-suggestion-chip" onclick="AIConcierge.send('Book the penthouse')">Book Penthouse</button>
                <button class="chat-suggestion-chip" onclick="AIConcierge.send('What amenities are included?')">Amenities</button>
                <button class="chat-suggestion-chip" onclick="AIConcierge.send('Check availability')">Availability</button>
            </div>

            <div class="chat-input-row">
                <input type="text" id="chatInput" placeholder="Ask about rooms, pricing, amenities…"
                    onkeyup="if(event.key==='Enter') AIConcierge.sendFromInput()">
                <button class="chat-send-btn" onclick="AIConcierge.sendFromInput()">➤</button>
            </div>
        </div>
    `;

    const chatMount = document.createElement("div");
    chatMount.id = "chat-widget-root";
    chatMount.innerHTML = chatHTML;
    document.body.appendChild(chatMount);

    // Show welcome message after short delay
    setTimeout(() => AIConcierge.welcome(), 1200);
}

const AIConcierge = {
    isOpen: false,

    toggleDrawer() {
        const drawer = document.getElementById("chatDrawer");
        if (!drawer) return;
        this.isOpen = !this.isOpen;
        drawer.classList.toggle("open", this.isOpen);
    },

    welcome() {
        this.addMessage("ai", "Welcome to **AetherStay** ⚜️\n\nI'm your AI Concierge. I can help you find the perfect suite, check pricing, or start your reservation instantly. What are you looking for?");
    },

    sendFromInput() {
        const input = document.getElementById("chatInput");
        if (!input || !input.value.trim()) return;
        const msg = input.value.trim();
        input.value = "";
        this.send(msg);
    },

    send(message) {
        // Open drawer if closed
        if (!this.isOpen) this.toggleDrawer();
        // Remove suggestion chips after first interaction
        const suggestions = document.getElementById("chatSuggestions");
        if (suggestions) suggestions.style.display = "none";

        this.addMessage("user", message);
        this.showTyping();

        // Simulate AI processing delay
        setTimeout(() => {
            this.removeTyping();
            const reply = this.processNLP(message.toLowerCase().trim());
            this.addMessage("ai", reply);
        }, 900 + Math.random() * 600);
    },

    processNLP(query) {
        // Price filter queries
        const priceMatch = query.match(/under\s*[₹]?\s*(\d+)/i) || query.match(/below\s*[₹]?\s*(\d+)/i);
        if (priceMatch) {
            const limit = parseInt(priceMatch[1]);
            const matches = roomsData.filter(r => r.price <= limit);
            if (matches.length === 0) return `I couldn't find any suites under ₹${limit.toLocaleString('en-IN')}. Our entry-level Deluxe Alabaster Room starts at ₹3,000/night.`;
            return `Here are suites within your ₹${limit.toLocaleString('en-IN')} budget:\n\n${matches.map(r =>
                `🏨 **${r.name}** — ₹${r.price.toLocaleString('en-IN')}/night\n<a href="booking.html?room=${r.id}">→ Reserve Now</a>`
            ).join("\n\n")}`;
        }

        // Booking intent queries
        if (query.includes("book") || query.includes("reserve") || query.includes("checkout")) {
            if (query.includes("penthouse") || query.includes("suite") || query.includes("royal")) {
                return `Excellent choice! Our **Royal Obsidian Penthouse** is our finest suite.\n\n🍷 Private Wine Cellar · 🤵 Personal Butler · 🏊 Private Pool\n\n<a href="booking.html?room=suite">→ Begin Your Reservation</a>`;
            }
            if (query.includes("executive") || query.includes("champagne")) {
                return `The **Executive Champagne Suite** is perfect for focused work and luxury rest.\n\n<a href="booking.html?room=executive">→ Reserve Executive Suite</a>`;
            }
            if (query.includes("deluxe") || query.includes("alabaster")) {
                return `Our **Deluxe Alabaster Room** offers beautiful city views at excellent value.\n\n<a href="booking.html?room=deluxe">→ Reserve Deluxe Room</a>`;
            }
            return `I'd love to help you reserve a suite! Which one interests you?\n\n${roomsData.map(r =>
                `• <a href="booking.html?room=${r.id}">${r.name}</a> — ₹${r.price.toLocaleString('en-IN')}/night`
            ).join("\n")}`;
        }

        // Amenities queries
        if (query.includes("amenit") || query.includes("includ") || query.includes("facility") || query.includes("feature")) {
            return `All AetherStay suites include:\n\n📶 Symmetric Gigabit Fiber\n🏊 Infinity Pool Access\n🍽️ Organic Curated Breakfast\n🚗 Valet Parking\n\nPremium suites additionally include personal butler service, private wine cellars, and express valet.`;
        }

        // Pricing queries
        if (query.includes("price") || query.includes("cost") || query.includes("rate") || query.includes("how much")) {
            return `Our current nightly rates:\n\n${roomsData.map(r =>
                `🏨 **${r.name}** — ₹${r.price.toLocaleString('en-IN')}/night`
            ).join("\n")}\n\n*Weekend rates include a 25% premium. Seasonal rates may vary.*`;
        }

        // Availability queries
        if (query.includes("availab") || query.includes("vacant") || query.includes("free")) {
            return `All three of our suites are currently available for booking. To check real-time availability for specific dates, please use our reservation system:\n\n<a href="booking.html">→ Check Availability & Reserve</a>`;
        }

        // Capacity / guests queries
        if (query.includes("guest") || query.includes("people") || query.includes("capacity") || query.includes("person")) {
            return `Suite capacities:\n\n👥 **Deluxe Alabaster** — Up to 2 guests\n👥 **Executive Champagne** — Up to 3 guests\n👥 **Royal Obsidian Penthouse** — Up to 4 guests`;
        }

        // WiFi / workspace queries
        if (query.includes("wifi") || query.includes("work") || query.includes("internet") || query.includes("remote")) {
            return `AetherStay is purpose-built for remote-first professionals. Every suite features:\n\n📶 Symmetric 1 Gbps fiber with redundant backhaul\n💺 Herman Miller ergonomic workstation\n🔇 Acoustic isolation panels\n🖥️ 4K external display included`;
        }

        // Location queries
        if (query.includes("locat") || query.includes("where") || query.includes("address") || query.includes("city")) {
            return `AetherStay operates boutique retreats across premium urban centers. Our flagship property is located at:\n\n📍 12 Alabaster Drive, Tech Sector 4\n\n<a href="contact.html">→ Contact Our Concierge</a> for exact coordinates and airport transfer arrangements.`;
        }

        // Pool queries
        if (query.includes("pool") || query.includes("swim") || query.includes("wellness") || query.includes("spa")) {
            return `Our heated infinity pool deck overlooks dramatic skyline panoramas. All guests receive unlimited pool access. The Royal Penthouse additionally includes a **private heated splash pool** on the suite terrace.`;
        }

        // Greeting
        if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query === "help") {
            return `Hello! I'm your AetherStay AI Concierge ⚜️\n\nI can help you:\n• Find the perfect suite for your budget\n• Explain included amenities\n• Start your reservation instantly\n• Answer any property questions\n\nWhat would you like to know?`;
        }

        // Default fallback
        return `I'm not sure I understood that, but I'm here to help! Try asking:\n\n• "Show rooms under ₹5000"\n• "Book the penthouse"\n• "What amenities are included?"\n• "How many guests can stay?"\n\nOr <a href="contact.html">contact our human concierge team</a> for bespoke requests.`;
    },

    addMessage(role, text) {
        const feed = document.getElementById("chatMessages");
        if (!feed) return;

        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${role}`;

        // Convert **bold** and \n to HTML
        const html = text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br>");
        bubble.innerHTML = html;

        feed.appendChild(bubble);
        feed.scrollTop = feed.scrollHeight;
    },

    showTyping() {
        const feed = document.getElementById("chatMessages");
        if (!feed) return;
        const indicator = document.createElement("div");
        indicator.className = "typing-indicator";
        indicator.id = "typing-indicator";
        indicator.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
        feed.appendChild(indicator);
        feed.scrollTop = feed.scrollHeight;
    },

    removeTyping() {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) indicator.remove();
    }
};
