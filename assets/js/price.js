/**
 * ⚜️ AETHERSTAY PRICE ENGINE v2 — Dynamic Pricing, Date Validation, Invoice Hydrator
 */

document.addEventListener("DOMContentLoaded", () => {
    const checkinInput  = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");
    const roomSelect    = document.getElementById("room");

    // Clamp min date to today
    const todayStr = new Date().toISOString().split("T")[0];
    if (checkinInput) {
        checkinInput.min = todayStr;
        checkinInput.addEventListener("change", () => {
            if (checkoutInput) checkoutInput.min = checkinInput.value;
            calculateInvoice();
        });
    }
    if (checkoutInput) checkoutInput.addEventListener("change", calculateInvoice);
    if (roomSelect) roomSelect.addEventListener("change", calculateInvoice);

    // Run pre-fill from URL params
    prefillCheckoutFromParams();
});

/* -------------------------------------------------------
   Pre-fill from URL Search Params (?room=executive)
   ------------------------------------------------------- */
function prefillCheckoutFromParams() {
    const params     = new URLSearchParams(window.location.search);
    const roomParam  = params.get("room");
    const cinParam   = params.get("checkin");
    const coutParam  = params.get("checkout");

    const roomSelect    = document.getElementById("room");
    const checkinInput  = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");

    if (roomParam && roomSelect) {
        for (const opt of roomSelect.options) {
            if (opt.value === roomParam) { opt.selected = true; break; }
        }
    }
    if (cinParam  && checkinInput)  checkinInput.value  = cinParam;
    if (coutParam && checkoutInput) {
        checkoutInput.value = coutParam;
        if (checkinInput) checkoutInput.min = checkinInput.value;
    }
    calculateInvoice();
}

/* -------------------------------------------------------
   Credit Card Visual Sync Helpers
   ------------------------------------------------------- */
function syncCardName(val) {
    const el = document.getElementById("cardNameDisplay");
    if (el) el.textContent = val.toUpperCase() || "YOUR NAME";
}

function syncCardNumber(val) {
    // Auto-format with spaces
    const digits = val.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
    const input = document.getElementById("cardNumber");
    if (input) input.value = formatted;

    const el = document.getElementById("cardNumberDisplay");
    if (el) {
        const padded = digits.padEnd(16, "•");
        el.textContent = padded.replace(/(.{4})/g, "$1 ").trim();
    }
}

function syncCardExpiry(val) {
    // Auto-format MM / YY
    const digits = val.replace(/\D/g, "").slice(0, 4);
    let formatted = digits;
    if (digits.length >= 3) formatted = digits.slice(0, 2) + " / " + digits.slice(2);
    const input = document.getElementById("cardExpiry");
    if (input) input.value = formatted;

    const el = document.getElementById("cardExpiryDisplay");
    if (el) el.textContent = formatted || "MM / YY";
}

/* -------------------------------------------------------
   Core Invoice Calculation Engine
   ------------------------------------------------------- */
function calculateInvoice() {
    const checkinInput  = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");
    const roomSelect    = document.getElementById("room");

    // UI outlets
    const previewName      = document.getElementById("previewRoomName");
    const previewCapacity  = document.getElementById("previewRoomCapacity");
    const previewImage     = document.getElementById("previewRoomImage");
    const dailyRateEl      = document.getElementById("invoiceDailyRate");
    const subtotalEl       = document.getElementById("invoiceSubtotal");
    const taxEl            = document.getElementById("invoiceTax");
    const grandTotalEl     = document.getElementById("totalPrice");
    const hiddenDays       = document.getElementById("days");
    const daysLabelEl      = document.getElementById("invoiceDaysLabel");
    const amenitiesEl      = document.getElementById("invoiceAmenities");
    const weekendRow       = document.getElementById("weekendSurgeRow");
    const weekendSurgeEl   = document.getElementById("invoiceWeekendSurge");
    const dynamicBadge     = document.getElementById("dynamicPriceBadge");

    if (!roomSelect || !previewName) return;

    // Look up suite in DB
    const suiteId = roomSelect.value;
    const suite = roomsData.find(r => r.id === suiteId) || roomsData[0];

    // Update basic preview
    if (previewName) previewName.textContent = suite.name;
    if (previewImage) previewImage.src = suite.image;
    if (dailyRateEl) dailyRateEl.textContent = `₹${suite.price.toLocaleString("en-IN")}`;

    // Render amenity pills
    if (amenitiesEl) {
        amenitiesEl.innerHTML = suite.amenities
            .slice(0, 3)
            .map(a => `<span>${a}</span>`)
            .join("");
    }

    // Reset if dates not set
    if (!checkinInput?.value || !checkoutInput?.value) {
        if (previewCapacity) previewCapacity.textContent = `${suite.capacity} · Select dates to see total`;
        if (subtotalEl) subtotalEl.textContent = "₹0";
        if (taxEl) taxEl.textContent = "₹0";
        if (grandTotalEl) grandTotalEl.textContent = "₹0";
        if (hiddenDays) hiddenDays.value = "0";
        if (daysLabelEl) daysLabelEl.textContent = "Nightly Rate";
        if (weekendRow) weekendRow.style.display = "none";
        if (dynamicBadge) dynamicBadge.style.display = "none";
        return;
    }

    const checkinDate  = new Date(checkinInput.value);
    const checkoutDate = new Date(checkoutInput.value);

    // Guard: checkout must be after checkin
    if (checkoutDate <= checkinDate) {
        if (typeof Toast !== "undefined") Toast.show("Check-out must be after Check-in date.", "danger");
        checkoutInput.value = "";
        return;
    }

    // Calculate nights
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.round((checkoutDate - checkinDate) / msPerDay);
    if (hiddenDays) hiddenDays.value = nights;
    if (daysLabelEl) daysLabelEl.textContent = `Nightly Rate × ${nights} night${nights > 1 ? "s" : ""}`;
    if (previewCapacity) previewCapacity.textContent = `${suite.capacity} · ${nights} night${nights > 1 ? "s" : ""}`;

    // Dynamic pricing: iterate each night for weekend surges
    let baseSum = 0;
    let weekendSurgeTotal = 0;
    const tempDate = new Date(checkinDate);

    for (let i = 0; i < nights; i++) {
        const dow = tempDate.getDay(); // 5=Fri, 6=Sat
        let rate = suite.price;
        if (dow === 5 || dow === 6) {
            const surgeAmount = Math.round(suite.price * 0.25);
            weekendSurgeTotal += surgeAmount;
            rate += surgeAmount;
        }
        baseSum += rate;
        tempDate.setDate(tempDate.getDate() + 1);
    }

    // Show/hide weekend surge row
    if (weekendRow && weekendSurgeEl) {
        if (weekendSurgeTotal > 0) {
            weekendRow.style.display = "flex";
            weekendSurgeEl.textContent = `+₹${weekendSurgeTotal.toLocaleString("en-IN")}`;
            if (dynamicBadge) dynamicBadge.style.display = "block";
        } else {
            weekendRow.style.display = "none";
            if (dynamicBadge) dynamicBadge.style.display = "none";
        }
    }

    const gst      = Math.round(baseSum * 0.18);
    const total    = baseSum + gst;

    if (subtotalEl)   subtotalEl.textContent   = `₹${(baseSum - weekendSurgeTotal).toLocaleString("en-IN")}`;
    if (taxEl)        taxEl.textContent         = `₹${gst.toLocaleString("en-IN")}`;
    if (grandTotalEl) grandTotalEl.textContent  = `₹${total.toLocaleString("en-IN")}`;
}