# Hotel Management System

A full-stack Hotel Management System built using the MERN Stack (MongoDB, Express.js, React.js, Node.js). This application helps manage hotel rooms, bookings, customers, and administrative operations through a user-friendly interface.

## Features

### User Features

* User Registration and Login
* Browse Available Rooms
* View Room Details
* Book Rooms Online
* Manage Bookings
* User Dashboard

### Admin Features

* Admin Authentication
* Add, Update, and Delete Rooms
* Manage Bookings
* View Customer Details
* Monitor Hotel Operations

## Tech Stack

### Frontend

* React.js
* React Router
* Axios
* CSS / Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

## Project Structure

hotel-management/
├── client/
│ ├── src/
│ ├── public/
│ └── package.json
├── server/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ └── package.json
└── README.md

## Installation

### Clone Repository

```bash
git clone https://github.com/himanispy/hotelmgmt.git
cd hotelmgmt
```

### Install Dependencies

Frontend:

```bash
cd client
npm install
```

Backend:

```bash
cd server
npm install
```

### Configure Environment Variables

Create a `.env` file inside the server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Run Backend

```bash
cd server
npm start
```

### Run Frontend

```bash
cd client
npm start
```

## Screenshots

Add screenshots of:

* Home Page
* Login Page
* Booking Page
* Admin Dashboard

## Future Enhancements

* Online Payment Integration
* Email Notifications
* Room Availability Calendar
* Hotel Analytics Dashboard
* Multi-Hotel Support

## Author

Himani Tripathi

GitHub: https://github.com/himanispy

## License

This project is licensed under the MIT License.
