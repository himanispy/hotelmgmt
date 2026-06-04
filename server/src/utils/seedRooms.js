const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Room = require('../models/Room');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const rooms = [
    {
        roomNumber: "101",
        type: "deluxe",
        name: "Deluxe Alabaster Room",
        basePrice: 3000,
        capacity: 2,
        amenities: ["📶 Gigabit Fiber WiFi", "🏊 Infinity Pool Access", "🍽️ Organic Breakfast", "🚗 Valet Parking"],
        images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&q=80"],
        description: "An elegant, light-filled room featuring panoramic city skyline views, custom travertine furniture, and dynamic ambient lighting systems."
    },
    {
        roomNumber: "102",
        type: "executive",
        name: "Executive Champagne Suite",
        basePrice: 5000,
        capacity: 3,
        amenities: ["📶 Gigabit Fiber WiFi", "🏊 Infinity Pool Access", "🍽️ Organic Breakfast", "🚗 Valet Parking", "👔 Express Valet"],
        images: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1000&q=80"],
        description: "Premium corporate suite with dedicated workspace annex, high-fidelity acoustics, luxury bath fixtures, and an open bar cabinet."
    },
    {
        roomNumber: "103",
        type: "suite",
        name: "Royal Obsidian Penthouse",
        basePrice: 8000,
        capacity: 4,
        amenities: ["📶 Gigabit Fiber WiFi", "🏊 Infinity Pool Access", "🍽️ Organic Breakfast", "🚗 Valet Parking", "🤵 Personal Butler", "🍷 Private Wine Cellar"],
        images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80"],
        description: "The pinnacle of architectural hospitality. Double-height ceilings, private heated splash pool, 24/7 butler service, and dedicated security entrance."
    }
];

const seedDB = async () => {
    try {
        const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/aetherstay';
        await mongoose.connect(dbUrl);
        console.log('Connected to DB for seeding...');
        
        // Clear existing rooms
        await Room.deleteMany();
        console.log('Cleared existing rooms.');

        // Insert new seed rooms
        const createdRooms = await Room.create(rooms);
        console.log('Rooms database seeded successfully:');
        createdRooms.forEach(r => console.log(` - Room #${r.roomNumber}: ${r.name} (${r._id})`));

        mongoose.connection.close();
        console.log('Database connection closed.');
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDB();
