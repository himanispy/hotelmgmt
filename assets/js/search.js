/**
 * ⚜   AETHERSTAY SEARCH & FILTER ENGINE
 * Dynamic memory queries with responsive DOM rendering
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial hydration on catalogue page load
    renderCatalogue(roomsData);
});

/**
 * Dynamically paint the catalog room container
 */
function renderCatalogue(suites) {
    const container = document.getElementById("roomsCatalogueContainer");
    const noResults = document.getElementById("noResults");
    
    if (!container) return;
    
    container.innerHTML = "";
    
    if (suites.length === 0) {
        container.style.display = "none";
        if (noResults) noResults.style.display = "block";
        return;
    }
    
    container.style.display = "grid";
    if (noResults) noResults.style.display = "none";
    
    suites.forEach(room => {
        const card = document.createElement("div");
        card.className = "room-card";
        
        // Assemble dynamic amenities checklist tags
        const amenitiesHTML = room.amenities
            .map(am => `<span style="font-size: 11px; background: var(--color-bg-canvas); padding: 4px 8px; border-radius: var(--radius-sm); font-weight: 500; opacity: 0.85;">${am}</span>`)
            .join("");
            
        card.innerHTML = `
            <div class="room-image-wrapper">
                <img src="${room.image}" alt="${room.name}" loading="lazy">
                <span class="room-badge">${room.capacity}</span>
            </div>
            <div class="room-content">
                <h3>${room.name}</h3>
                <p class="room-desc">${room.description}</p>
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
                    ${amenitiesHTML}
                </div>
                <div class="room-meta">
                    <div class="room-price-info">
                        <span>Rate Per Night</span>
                        <div class="room-price-amount">₹${room.price.toLocaleString('en-IN')}</div>
                    </div>
                    <a href="booking.html?room=${room.id}" class="room-btn">Book Suite</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Filter and search suite database in memory
 */
function searchRoom() {
    const query = document.getElementById("search").value.toLowerCase().trim();
    const priceFilter = document.getElementById("priceFilter").value;
    
    const filtered = roomsData.filter(room => {
        // A. Search Query Match (Title, description, amenities list, capacity details)
        const matchesQuery = 
            room.name.toLowerCase().includes(query) ||
            room.description.toLowerCase().includes(query) ||
            room.capacity.toLowerCase().includes(query) ||
            room.amenities.some(am => am.toLowerCase().includes(query));
            
        // B. Price Category Range Match
        let matchesPrice = true;
        if (priceFilter === "4000") {
            matchesPrice = room.price < 4000;
        } else if (priceFilter === "6000") {
            matchesPrice = room.price < 6000;
        } else if (priceFilter === "8000+") {
            matchesPrice = room.price >= 8000;
        }
        
        return matchesQuery && matchesPrice;
    });
    
    renderCatalogue(filtered);
}

/**
 * Clean all text/select filters
 */
function resetSearchFilters() {
    const searchInput = document.getElementById("search");
    const priceSelect = document.getElementById("priceFilter");
    
    if (searchInput) searchInput.value = "";
    if (priceSelect) priceSelect.value = "all";
    
    renderCatalogue(roomsData);
}