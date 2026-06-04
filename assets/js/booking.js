/**
 * ⚜️ AETHERSTAY BOOKING SUBMISSION v2 — Stripe Processing Overlay + CRM Logger
 */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("bookingForm");
    if (form) form.addEventListener("submit", processCheckoutReservation);
});

async function processCheckoutReservation(e) {
    e.preventDefault();

    const nameInput     = document.getElementById("name");
    const emailInput    = document.getElementById("email");
    const checkinInput  = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");
    const roomSelect    = document.getElementById("room");
    const hiddenDays    = document.getElementById("days");
    const submitBtn     = document.getElementById("submitBtn");

    const nights = Number(hiddenDays?.value || 0);

    // Guard: dates must be selected
    if (nights <= 0) {
        Toast.show("Please select your check-in and check-out dates.", "danger");
        return;
    }

    // Guard: card fields filled (basic demo validation)
    const cardNum = document.getElementById("cardNumber")?.value.replace(/\s/g, "");
    if (!cardNum || cardNum.length < 12) {
        Toast.show("Please enter a valid card number for demo mode.", "danger");
        return;
    }

    const suiteId = roomSelect.value;
    const suite = roomsData.find(r => r.id === suiteId) || roomsData[0];

    // ── Step 1: Show Stripe-style processing overlay ──────────────────────
    const overlay        = document.getElementById("processingOverlay");
    const spinner        = document.getElementById("processingSpinner");
    const checkmark      = document.getElementById("processingCheckmark");
    const processingLabel = document.getElementById("processingLabel");

    if (overlay) {
        overlay.classList.add("active");
        if (spinner) spinner.style.display = "block";
        if (checkmark) checkmark.style.display = "none";
        if (processingLabel) processingLabel.textContent = "Securing your reservation…";
    }
    if (submitBtn) submitBtn.disabled = true;

    // ── Step 2: Simulate server processing (1.8s) ─────────────────────────
    await new Promise(r => setTimeout(r, 1800));
    if (processingLabel) processingLabel.textContent = "Confirming with concierge team…";

    await new Promise(r => setTimeout(r, 900));

    // ── Step 3: Compute invoice totals ────────────────────────────────────
    const checkinDate  = new Date(checkinInput.value);
    const checkoutDate = new Date(checkoutInput.value);
    let baseSum = 0;

    const tempDate = new Date(checkinDate);
    for (let i = 0; i < nights; i++) {
        const dow  = tempDate.getDay();
        let rate   = suite.price;
        if (dow === 5 || dow === 6) rate = Math.round(suite.price * 1.25);
        baseSum   += rate;
        tempDate.setDate(tempDate.getDate() + 1);
    }

    const gst        = Math.round(baseSum * 0.18);
    const grandTotal = baseSum + gst;

    // ── Step 4: Build CRM record ──────────────────────────────────────────
    const bookingId = `AST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const record = {
        bookingId,
        name:      nameInput.value.trim(),
        email:     emailInput.value.trim(),
        checkin:   checkinInput.value,
        checkout:  checkoutInput.value,
        room:      suite.price,
        roomName:  suite.name,
        suiteId:   suite.id,
        days:      String(nights),
        totalPrice: grandTotal,
        timestamp:  new Date().toISOString()
    };

    try {
        const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
        bookings.push(record);
        localStorage.setItem("bookings", JSON.stringify(bookings));

        // Append audit log entry
        appendAuditLog(`New booking ${bookingId} — ${record.name} · ${suite.name} · ₹${grandTotal.toLocaleString("en-IN")}`);
    } catch {
        /* Storage quota — silent in demo */
    }

    // ── Step 5: Show checkmark success state ──────────────────────────────
    if (spinner) spinner.style.display = "none";
    if (checkmark) checkmark.style.display = "flex";
    if (processingLabel) processingLabel.textContent = `Confirmed! Ref: ${bookingId}`;

    await new Promise(r => setTimeout(r, 2200));

    // ── Step 6: Dismiss and reset ─────────────────────────────────────────
    if (overlay) overlay.classList.remove("active");
    if (submitBtn) submitBtn.disabled = false;

    Toast.show(`✓ Reservation ${bookingId} confirmed! Check your inbox.`, "success");

    e.target.reset();
    calculateInvoice();

    // Reset card visual
    syncCardName("");
    syncCardNumber("");
    syncCardExpiry("");
}

/* Push entry to audit log stored in localStorage */
function appendAuditLog(message) {
    try {
        const logs = JSON.parse(localStorage.getItem("aetherstay_audit")) || [];
        logs.unshift({ message, timestamp: new Date().toISOString() });
        if (logs.length > 200) logs.splice(200); // Cap at 200 entries
        localStorage.setItem("aetherstay_audit", JSON.stringify(logs));
    } catch { /* ignore */ }
}