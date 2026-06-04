/**
 * ⚜️ AETHEROS OPERATIONS CONTROLLER v2.0
 * Auth · KPI Engine · SVG Charts · Housekeeping CRUD · AI Pricing ·
 * CRM Table · LTV Scoring · CSV Export · Inbox · Scrolling Audit Log
 */

// ─────────────────────────────────────────────────────────────────
// 1. AUTH SHIELD
// ─────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("aetherstay_token");

    if (token === "authorized_jwt_token") {
        showDashboard();
    } else {
        document.getElementById("authScreen").style.display  = "flex";
        document.getElementById("adminDashboard").style.display = "none";
        document.getElementById("authPin")?.focus();
    }
});

function verifyAdminAccess() {
    const pin = document.getElementById("authPin")?.value.trim();
    if (pin === "2026") {
        sessionStorage.setItem("aetherstay_token", "authorized_jwt_token");
        appendAuditEntry("Admin session authorized. Terminal unlocked.");
        showDashboard();
    } else {
        Toast.show("Incorrect authorization key. Access denied.", "danger");
        const pinInput = document.getElementById("authPin");
        if (pinInput) { pinInput.value = ""; pinInput.focus(); }
    }
}

function showDashboard() {
    document.getElementById("authScreen").style.display  = "none";
    const dash = document.getElementById("adminDashboard");
    if (dash) {
        dash.style.display = "grid";
        hydrateDashboard();
        initHousekeeping();
        initAiPricing();
        updateChecklistBadge();
    }
}

function terminateAdminSession() {
    sessionStorage.removeItem("aetherstay_token");
    appendAuditEntry("Admin session terminated. Terminal locked.");
    Toast.show("Terminal locked. Session cleared.", "warning");
    setTimeout(() => window.location.reload(), 600);
}

// ─────────────────────────────────────────────────────────────────
// 2. TAB SWITCHER
// ─────────────────────────────────────────────────────────────────
const tabMeta = {
    "overview":     { title: "Operations Overview",      sub: "Real-time analytics for AetherStay boutique operations." },
    "analytics":    { title: "Revenue Analytics",        sub: "Deep-dive into booking revenue, suite popularity, and forecasts." },
    "timeline":     { title: "Room Scheduler",           sub: "Visual allocation grid for all suite assignments." },
    "crm":          { title: "Guest CRM Database",       sub: "Manage reservations, compute LTV, and export records." },
    "housekeeping": { title: "Housekeeping Operations",  sub: "Assign, track, and complete room maintenance tasks." },
    "ai_pricing":   { title: "AI Autopilot Pricing",     sub: "Algorithmic rate management powered by occupancy signals." },
    "messages":     { title: "Concierge Inbox",          sub: "Direct guest inquiries submitted via contact form." },
    "audit":        { title: "Security Audit Trail",     sub: "Immutable log of all platform events and operations." },
};

function switchTab(tabId) {
    // Hide panes
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    // De-activate all buttons
    document.querySelectorAll(".side-btn").forEach(b => b.classList.remove("active"));

    // Activate target
    const pane = document.getElementById(`tab-${tabId}`);
    if (pane) pane.classList.add("active");

    // Activate button
    const btn = document.querySelector(`.side-btn[onclick="switchTab('${tabId}')"]`);
    if (btn) btn.classList.add("active");

    // Update header
    const meta = tabMeta[tabId] || {};
    const titleEl    = document.getElementById("tabTitle");
    const subtitleEl = document.getElementById("tabSubtitle");
    if (titleEl)    titleEl.textContent    = meta.title   || "Dashboard";
    if (subtitleEl) subtitleEl.textContent = meta.sub     || "";

    // Re-render data on tab switch
    hydrateDashboard();
}

// ─────────────────────────────────────────────────────────────────
// 3. MASTER DATA HYDRATOR
// ─────────────────────────────────────────────────────────────────
function hydrateDashboard() {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const messages = JSON.parse(localStorage.getItem("aetherstay_messages")) || [];
    const auditLog = JSON.parse(localStorage.getItem("aetherstay_audit")) || [];

    hydrateKPIs(bookings);
    hydrateSparkline(bookings);
    hydrateRevChart(bookings);
    hydrateSuiteBreakdown(bookings);
    hydrateForecastPanel(bookings);
    hydrateTimeline(bookings);
    hydrateCrmTable(bookings);
    hydrateInbox(messages);
    hydrateAuditFeed(auditLog);
}

// ─────────────────────────────────────────────────────────────────
// 4. KPI CARDS
// ─────────────────────────────────────────────────────────────────
function hydrateKPIs(bookings) {
    let totalRev = 0, totalNights = 0;
    bookings.forEach(b => {
        totalRev    += b.totalPrice ? Number(b.totalPrice) : Number(b.room) * Number(b.days);
        totalNights += Number(b.days || 1);
    });
    const avgNights   = bookings.length ? (totalNights / bookings.length).toFixed(1) : 0;
    const occupancy   = bookings.length ? Math.min(97, 40 + bookings.length * 12) : 0;

    setText("kpiRevenue",     `₹${totalRev.toLocaleString("en-IN")}`);
    setText("kpiBookings",    bookings.length);
    setText("kpiOccupancy",   `${occupancy}%`);
    setText("kpiAvgNights",   avgNights);
    setText("kpiRevenueTrend",   bookings.length ? `+${Math.round(totalRev * 0.18 / 100) * 100} vs last period` : "No data yet");
    setText("kpiBookingsTrend",  bookings.length ? `${bookings.length} total reservations` : "No bookings yet");
    setText("kpiOccupancyTrend", bookings.length ? `${3 - Math.min(3, bookings.length)} suites available` : "3 suites open");
}

// ─────────────────────────────────────────────────────────────────
// 5. SVG SPARKLINE (Overview mini-chart)
// ─────────────────────────────────────────────────────────────────
function hydrateSparkline(bookings) {
    const svg = document.getElementById("sparklineSvg");
    if (!svg) return;

    const recent = bookings.slice(-7);
    if (recent.length < 2) {
        svg.innerHTML = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="rgba(18,18,17,0.25)" font-size="12" font-family="Inter">No data yet — complete bookings to see trends</text>`;
        return;
    }

    const vals  = recent.map(b => b.totalPrice ? Number(b.totalPrice) : Number(b.room) * Number(b.days));
    const W = 400, H = 80, pad = 8;
    const minV = Math.min(...vals), maxV = Math.max(...vals);
    const range = maxV - minV || 1;

    const points = vals.map((v, i) => {
        const x = pad + (i / (vals.length - 1)) * (W - 2 * pad);
        const y = H - pad - ((v - minV) / range) * (H - 2 * pad);
        return `${x},${y}`;
    }).join(" ");

    const areaPoints = `${pad},${H - pad} ${points} ${W - pad},${H - pad}`;

    svg.innerHTML = `
        <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#C5A880" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#C5A880" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <polygon points="${areaPoints}" fill="url(#sparkGrad)"/>
        <polyline points="${points}" fill="none" stroke="#C5A880" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
            stroke-dasharray="1000" stroke-dashoffset="1000"
            style="animation: draw-line 1.2s ease forwards;"/>
        ${vals.map((v, i) => {
            const x = pad + (i / (vals.length - 1)) * (W - 2 * pad);
            const y = H - pad - ((v - minV) / range) * (H - 2 * pad);
            return `<circle cx="${x}" cy="${y}" r="3" fill="#C5A880" stroke="white" stroke-width="1.5"/>`;
        }).join("")}
    `;
}

// ─────────────────────────────────────────────────────────────────
// 6. FULL REVENUE CHART (Analytics tab)
// ─────────────────────────────────────────────────────────────────
function hydrateRevChart(bookings) {
    const svg = document.getElementById("revenueChartSvg");
    if (!svg) return;

    if (bookings.length < 1) {
        svg.innerHTML = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="rgba(18,18,17,0.25)" font-size="14" font-family="Inter">Complete bookings to populate analytics chart</text>`;
        return;
    }

    const W = 700, H = 220, padL = 60, padB = 40, padT = 20, padR = 20;
    const vals  = bookings.map(b => b.totalPrice ? Number(b.totalPrice) : Number(b.room) * Number(b.days));
    const labels = bookings.map((b, i) => b.bookingId ? b.bookingId.slice(-4) : `#${i + 1}`);

    const minV = 0;
    const maxV = Math.max(...vals) * 1.15;
    const chartW = W - padL - padR;
    const chartH = H - padB - padT;

    const barW = Math.min(40, chartW / vals.length - 8);

    const barsHTML = vals.map((v, i) => {
        const x = padL + (i / vals.length) * chartW + (chartW / vals.length - barW) / 2;
        const barH = (v / maxV) * chartH;
        const y = padT + chartH - barH;
        return `
            <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4"
                fill="url(#barGrad)" opacity="0.9"/>
            <text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle"
                font-size="9" fill="rgba(18,18,17,0.6)" font-family="Inter" font-weight="600">
                ₹${(v / 1000).toFixed(0)}K
            </text>
            <text x="${x + barW / 2}" y="${H - padB + 16}" text-anchor="middle"
                font-size="9" fill="rgba(18,18,17,0.45)" font-family="Inter">
                ${labels[i]}
            </text>
        `;
    }).join("");

    // Grid lines
    const gridLines = [0.25, 0.5, 0.75, 1].map(pct => {
        const y = padT + chartH - pct * chartH;
        const val = Math.round(maxV * pct);
        return `
            <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}"
                stroke="rgba(18,18,17,0.06)" stroke-width="1" stroke-dasharray="4,4"/>
            <text x="${padL - 8}" y="${y + 4}" text-anchor="end"
                font-size="9" fill="rgba(18,18,17,0.4)" font-family="Inter">
                ₹${(val / 1000).toFixed(0)}K
            </text>
        `;
    }).join("");

    svg.innerHTML = `
        <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#C5A880"/>
                <stop offset="100%" stop-color="#B89970" stop-opacity="0.7"/>
            </linearGradient>
        </defs>
        ${gridLines}
        <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + chartH}"
            stroke="rgba(18,18,17,0.12)" stroke-width="1"/>
        <line x1="${padL}" y1="${padT + chartH}" x2="${W - padR}" y2="${padT + chartH}"
            stroke="rgba(18,18,17,0.12)" stroke-width="1"/>
        ${barsHTML}
    `;
}

// ─────────────────────────────────────────────────────────────────
// 7. SUITE POPULARITY BREAKDOWN
// ─────────────────────────────────────────────────────────────────
function hydrateSuiteBreakdown(bookings) {
    const el = document.getElementById("suiteBreakdown");
    if (!el) return;

    const counts = { deluxe: 0, executive: 0, suite: 0 };
    bookings.forEach(b => { if (b.suiteId && counts[b.suiteId] !== undefined) counts[b.suiteId]++; });

    const total = bookings.length || 1;
    const suites = [
        { id: "deluxe",    name: "Deluxe Alabaster",      color: "#C5A880" },
        { id: "executive", name: "Executive Champagne",   color: "#B89970" },
        { id: "suite",     name: "Royal Penthouse",       color: "#A08060" },
    ];

    el.innerHTML = suites.map(s => {
        const pct = Math.round((counts[s.id] / total) * 100);
        return `
            <div class="breakdown-row">
                <div class="breakdown-label">
                    <span>${s.name}</span>
                    <span>${counts[s.id]} booking${counts[s.id] !== 1 ? "s" : ""} (${pct}%)</span>
                </div>
                <div class="breakdown-bar-bg">
                    <div class="breakdown-bar-fill" style="width:${pct}%;background:${s.color};"></div>
                </div>
            </div>
        `;
    }).join("");
}

// ─────────────────────────────────────────────────────────────────
// 8. AI REVENUE FORECAST (Analytics panel)
// ─────────────────────────────────────────────────────────────────
function hydrateForecastPanel(bookings) {
    const el = document.getElementById("forecastGrid");
    if (!el || bookings.length === 0) {
        if (el) el.innerHTML = `<div class="forecast-row"><span>Add bookings to enable AI revenue forecasting</span></div>`;
        return;
    }

    const totalRev = bookings.reduce((s, b) => s + (b.totalPrice ? Number(b.totalPrice) : Number(b.room) * Number(b.days)), 0);
    const avgRev   = totalRev / bookings.length;

    el.innerHTML = [
        { label: "Weekly Projection",   val: avgRev * 7  },
        { label: "Monthly Projection",  val: avgRev * 30 },
        { label: "Quarterly Projection",val: avgRev * 90 },
    ].map(item => `
        <div class="forecast-row">
            <span>${item.label}</span>
            <strong>₹${Math.round(item.val).toLocaleString("en-IN")}</strong>
        </div>
    `).join("");
}

// ─────────────────────────────────────────────────────────────────
// 9. ROOM TIMELINE SCHEDULER
// ─────────────────────────────────────────────────────────────────
function hydrateTimeline(bookings) {
    const container = document.getElementById("timelineGridContainer");
    if (!container) return;
    container.innerHTML = "";

    const assets = [
        { no: "101", type: "Deluxe Suite",      key: "deluxe"    },
        { no: "102", type: "Executive Suite",   key: "executive" },
        { no: "103", type: "Royal Penthouse",   key: "suite"     },
    ];

    assets.forEach(asset => {
        const booking = bookings.find(b => b.suiteId === asset.key);
        const row = document.createElement("div");
        row.className = "timeline-room-row";
        row.innerHTML = `
            <div class="timeline-room-label">
                <h4>Suite ${asset.no}</h4>
                <span>${asset.type}</span>
            </div>
            <div class="timeline-allocation-bar">
                ${booking
                    ? `<div class="timeline-block" style="flex:1;">
                        <span>🤵 ${booking.name}</span>
                        <span style="font-size:10px;opacity:0.65;">(${booking.days} nights · ${booking.checkin})</span>
                      </div>`
                    : `<span class="timeline-block-vacant">✨ Suite vacant — Available for reservation</span>`
                }
            </div>
        `;
        container.appendChild(row);
    });
}

// ─────────────────────────────────────────────────────────────────
// 10. GUEST CRM TABLE WITH LTV SCORING
// ─────────────────────────────────────────────────────────────────
function hydrateCrmTable(bookings) {
    const tbody = document.getElementById("bookingTable");
    if (!tbody) return;

    if (bookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:48px;opacity:0.4;">No reservations logged yet.</td></tr>`;
        return;
    }

    // Compute max total for LTV bar scaling
    const maxTotal = Math.max(...bookings.map(b => b.totalPrice ? Number(b.totalPrice) : Number(b.room) * Number(b.days)));

    tbody.innerHTML = bookings.map((b, idx) => {
        const cost    = b.totalPrice ? Number(b.totalPrice) : Number(b.room) * Number(b.days);
        const ltvPct  = Math.round((cost / maxTotal) * 100);
        const refId   = b.bookingId || `AST-LEGACY-${idx}`;

        return `
            <tr>
                <td><span class="crm-ref-badge">${refId}</span></td>
                <td>
                    <div class="crm-guest-name">${b.name}</div>
                    <div class="crm-guest-email">${b.email}</div>
                </td>
                <td>🛏️ ${b.roomName || "Luxury Suite"}</td>
                <td><span class="crm-nights-badge">${b.days} nights</span></td>
                <td style="font-weight:700;">₹${cost.toLocaleString("en-IN")}</td>
                <td>
                    <div class="ltv-bar-wrapper">
                        <div class="ltv-bar" style="width:${ltvPct}px;max-width:80px;"></div>
                        <span style="font-size:11px;font-weight:600;opacity:0.65;">${ltvPct}%</span>
                    </div>
                </td>
                <td>
                    <button onclick="cancelBooking('${refId}', ${idx})" class="cancel-action-btn">Cancel</button>
                </td>
            </tr>
        `;
    }).join("");
}

function cancelBooking(id, idx) {
    if (!confirm(`Cancel reservation ${id} and release the suite?`)) return;
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings = bookings.filter((b, i) => b.bookingId !== id && i !== idx);
    localStorage.setItem("bookings", JSON.stringify(bookings));
    appendAuditEntry(`Reservation ${id} cancelled by admin.`);
    Toast.show(`Reservation ${id} cancelled.`, "success");
    hydrateDashboard();
}

function clearAllBookings() {
    if (!confirm("⚠ Permanently wipe ALL reservations from CRM?")) return;
    localStorage.removeItem("bookings");
    appendAuditEntry("Admin wiped entire booking CRM database.");
    Toast.show("CRM database cleared.", "warning");
    hydrateDashboard();
}

// ─────────────────────────────────────────────────────────────────
// 11. CSV EXPORT
// ─────────────────────────────────────────────────────────────────
function exportCsvBookings() {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    if (bookings.length === 0) { Toast.show("No data to export.", "danger"); return; }

    const headers = ["Ref ID", "Name", "Email", "Suite", "Check-in", "Check-out", "Nights", "Total (INR)", "Timestamp"];
    const rows = bookings.map(b => [
        b.bookingId || "AST-LEGACY",
        b.name, b.email,
        b.roomName || "Suite",
        b.checkin, b.checkout,
        b.days,
        b.totalPrice || (Number(b.room) * Number(b.days)),
        b.timestamp || ""
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `aetherstay_bookings_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    appendAuditEntry(`Admin exported ${bookings.length} booking records as CSV.`);
    Toast.show(`${bookings.length} records exported as CSV.`, "success");
}

// ─────────────────────────────────────────────────────────────────
// 12. INBOX
// ─────────────────────────────────────────────────────────────────
function hydrateInbox(messages) {
    const container = document.getElementById("messageFeedContainer");
    if (!container) return;

    if (messages.length === 0) {
        container.innerHTML = `<div class="feed-empty-state"><span>✉️</span><p>No client inquiries logged yet.</p></div>`;
        return;
    }

    container.innerHTML = messages.map(msg => {
        const time = new Date(msg.timestamp).toLocaleDateString("en-IN", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        });
        return `
            <div class="message-card">
                <div class="message-card-header">
                    <div class="message-sender">${msg.name} <span>&lt;${msg.email}&gt;</span></div>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-body">${msg.message}</div>
            </div>
        `;
    }).join("");
}

function clearAllMessages() {
    if (!confirm("Clear all concierge messages?")) return;
    localStorage.removeItem("aetherstay_messages");
    appendAuditEntry("Admin cleared all concierge inbox messages.");
    Toast.show("Inbox cleared.", "warning");
    hydrateDashboard();
}

// ─────────────────────────────────────────────────────────────────
// 13. SCROLLING AUDIT LOG
// ─────────────────────────────────────────────────────────────────
function hydrateAuditFeed(logs) {
    const feed = document.getElementById("auditFeed");
    if (!feed) return;

    if (logs.length === 0) {
        feed.innerHTML = `<div style="padding:24px;text-align:center;opacity:0.4;font-size:13px;">No audit entries recorded yet.</div>`;
        return;
    }

    feed.innerHTML = logs.map(entry => {
        const time = new Date(entry.timestamp).toLocaleString("en-IN", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
        });
        return `
            <div class="audit-entry">
                <span class="audit-time">${time}</span>
                <span class="audit-msg">${entry.message}</span>
            </div>
        `;
    }).join("");
}

function appendAuditEntry(message) {
    try {
        const logs = JSON.parse(localStorage.getItem("aetherstay_audit")) || [];
        logs.unshift({ message, timestamp: new Date().toISOString() });
        if (logs.length > 300) logs.splice(300);
        localStorage.setItem("aetherstay_audit", JSON.stringify(logs));
    } catch { /* Storage quota */ }
}

function clearAuditLog() {
    if (!confirm("Permanently clear audit trail?")) return;
    localStorage.removeItem("aetherstay_audit");
    Toast.show("Audit log cleared.", "warning");
    hydrateAuditFeed([]);
}

// ─────────────────────────────────────────────────────────────────
// 14. HOUSEKEEPING MODULE
// ─────────────────────────────────────────────────────────────────
function initHousekeeping() {
    const stored = JSON.parse(localStorage.getItem("aetherstay_housekeeping")) || [];
    if (stored.length === 0) {
        // Seed with default tasks
        const defaults = [
            { id: "hk1", text: "Deep clean Deluxe Alabaster Room", room: "Suite 101 — Deluxe", priority: "high", done: false },
            { id: "hk2", text: "Restock wine cellar and reorder spirits", room: "Suite 103 — Penthouse", priority: "medium", done: false },
            { id: "hk3", text: "Replace HVAC filters in all suites", room: "Common Areas", priority: "low", done: true },
        ];
        localStorage.setItem("aetherstay_housekeeping", JSON.stringify(defaults));
    }
    renderHousekeeping();
}

function renderHousekeeping() {
    const list  = document.getElementById("housekeepingList");
    if (!list) return;

    const tasks = JSON.parse(localStorage.getItem("aetherstay_housekeeping")) || [];

    if (tasks.length === 0) {
        list.innerHTML = `<div style="padding:32px;text-align:center;opacity:0.4;font-size:13px;">No housekeeping tasks. Click '+ New Task' to add one.</div>`;
        return;
    }

    list.innerHTML = tasks.map(task => `
        <div class="hk-task-card ${task.done ? "done" : ""}">
            <div class="hk-priority-dot priority-${task.priority}"></div>
            <div class="hk-task-body">
                <div class="hk-task-text">${task.text}</div>
                <div class="hk-task-room">${task.room}</div>
            </div>
            <button onclick="completeHKTask('${task.id}')"
                class="hk-complete-btn ${task.done ? "done-btn" : ""}">
                ${task.done ? "✓ Done" : "Mark Done"}
            </button>
            <button onclick="deleteHKTask('${task.id}')" class="cancel-action-btn" style="margin-left:4px;">✕</button>
        </div>
    `).join("");
}

function showAddTaskModal() {
    const form = document.getElementById("addTaskForm");
    if (form) form.style.display = form.style.display === "none" ? "flex" : "none";
}

function addHousekeepingTask() {
    const text     = document.getElementById("newTaskText")?.value.trim();
    const room     = document.getElementById("newTaskRoom")?.value;
    const priority = document.getElementById("newTaskPriority")?.value;

    if (!text) { Toast.show("Please enter a task description.", "danger"); return; }

    const tasks = JSON.parse(localStorage.getItem("aetherstay_housekeeping")) || [];
    tasks.push({ id: `hk${Date.now()}`, text, room, priority, done: false });
    localStorage.setItem("aetherstay_housekeeping", JSON.stringify(tasks));

    appendAuditEntry(`Housekeeping task added: "${text}" — ${room}`);
    Toast.show("Task added to housekeeping queue.", "success");

    document.getElementById("newTaskText").value = "";
    document.getElementById("addTaskForm").style.display = "none";
    renderHousekeeping();
}

function completeHKTask(id) {
    const tasks = JSON.parse(localStorage.getItem("aetherstay_housekeeping")) || [];
    const task = tasks.find(t => t.id === id);
    if (task && !task.done) {
        task.done = true;
        localStorage.setItem("aetherstay_housekeeping", JSON.stringify(tasks));
        appendAuditEntry(`Housekeeping task completed: "${task.text}"`);
        Toast.show("Task marked as complete.", "success");
        renderHousekeeping();
    }
}

function deleteHKTask(id) {
    let tasks = JSON.parse(localStorage.getItem("aetherstay_housekeeping")) || [];
    const task = tasks.find(t => t.id === id);
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem("aetherstay_housekeeping", JSON.stringify(tasks));
    if (task) appendAuditEntry(`Housekeeping task deleted: "${task.text}"`);
    Toast.show("Task removed.", "warning");
    renderHousekeeping();
}

// ─────────────────────────────────────────────────────────────────
// 15. AI AUTOPILOT PRICING MODULE
// ─────────────────────────────────────────────────────────────────
let autopilotEnabled = false;
const month = new Date().getMonth();
const seasonalMultiplier = (month >= 5 && month <= 7) ? 1.40 : (month >= 10 || month <= 1) ? 1.20 : 1.0;

function initAiPricing() {
    renderAiPricingCards(false);
    recalcForecast(75);
}

function toggleAutopilot(enabled) {
    autopilotEnabled = enabled;
    const statusEl = document.getElementById("autopilotStatus");
    if (statusEl) statusEl.textContent = enabled ? "Enabled" : "Disabled";

    appendAuditEntry(`AI Autopilot Pricing ${enabled ? "ENABLED" : "DISABLED"} by admin.`);
    Toast.show(`AI Autopilot Pricing ${enabled ? "activated" : "deactivated"}.`, enabled ? "success" : "warning");
    renderAiPricingCards(enabled);
}

function renderAiPricingCards(autopilot) {
    const grid = document.getElementById("aiPricingGrid");
    if (!grid) return;

    const cards = roomsData.map(room => {
        const weekendRate = Math.round(room.price * 1.25);
        const aiRate      = autopilot ? Math.round(room.price * seasonalMultiplier * 1.1) : room.price;
        const multiplier  = autopilot ? `${((aiRate / room.price - 1) * 100).toFixed(0)}%+` : "Base Rate";

        return `
            <div class="ai-price-card">
                <h4>${room.name}</h4>
                <div class="ai-price-base">Base: ₹${room.price.toLocaleString("en-IN")} / night</div>
                <div class="ai-price-base">Weekend: ₹${weekendRate.toLocaleString("en-IN")} / night</div>
                <div class="ai-price-current">
                    ₹${aiRate.toLocaleString("en-IN")}
                    ${autopilot ? `<span class="ai-multiplier-badge">+${multiplier}</span>` : ""}
                </div>
                <div style="font-size:11px;opacity:0.45;margin-top:6px;">
                    ${autopilot
                        ? `AI-adjusted · ${month >= 5 && month <= 7 ? "Peak Season (+40%)": month >= 10 || month <= 1 ? "Holiday Season (+20%)" : "Standard Season"}`
                        : "Manual pricing mode — toggle AI Autopilot to activate"
                    }
                </div>
            </div>
        `;
    }).join("");

    grid.innerHTML = cards;
}

function recalcForecast(occupancyPct) {
    const label = document.getElementById("occupancyLabel");
    if (label) label.textContent = `Occupancy: ${occupancyPct}%`;

    const totalRooms  = 3;
    const avgNightRate = (3000 + 5000 + 8000) / 3; // ₹5,333
    const activeRooms = totalRooms * (occupancyPct / 100);

    const monthly   = Math.round(activeRooms * avgNightRate * 30);
    const quarterly = monthly * 3;
    const annual    = monthly * 12;

    setText("fcastMonthly",   `₹${monthly.toLocaleString("en-IN")}`);
    setText("fcastQuarterly", `₹${quarterly.toLocaleString("en-IN")}`);
    setText("fcastAnnual",    `₹${annual.toLocaleString("en-IN")}`);
}

// ─────────────────────────────────────────────────────────────────
// 16. CHECKLIST BADGE COUNTER
// ─────────────────────────────────────────────────────────────────
function updateChecklistBadge() {
    const items  = document.querySelectorAll("#overviewChecklist input[type='checkbox']");
    const done   = Array.from(items).filter(c => c.checked).length;
    const badge  = document.getElementById("checklistBadge");
    if (badge) badge.textContent = `${done}/${items.length} done`;
}

// ─────────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────────
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}