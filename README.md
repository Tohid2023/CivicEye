🚀 CivicEye – Smart Rural Issue Reporting Platform

CivicEye is a mobile-first web application designed for rural areas to help citizens report local issues and connect with nearby service providers (helpers) such as electricians, plumbers, and technicians.

⸻

🌍 Problem Statement

In rural areas:
	•	No centralized system for reporting local issues
	•	Difficulty in finding nearby service providers
	•	Lack of transparency and delayed resolution

👉 CivicEye solves this by enabling real-time issue reporting and GPS-based intelligent helper matching.

⸻

💡 Solution

CivicEye provides a simple and efficient platform where users can:
	•	Report issues (electricity, plumbing, road, etc.)
	•	Upload images of problems
	•	Automatically capture location
	•	Find nearby helpers
	•	Book services
	•	Rate and review helpers

⸻

⚙️ Tech Stack

Frontend
	•	React.js (Vite)
	•	Tailwind CSS

Backend
	•	Node.js
	•	Express.js

Database
	•	MongoDB (Mongoose)

Other Tools
	•	JWT Authentication
	•	Multer (Image Upload)
	•	Geolocation API

⸻

🔥 Key Features
	•	📍 GPS-based helper matching
	•	🧑‍🔧 Helper listing with distance & ratings
	•	📸 Image upload for issue reporting
	•	🔐 OTP-based secure registration
	•	📦 Booking system
	•	⭐ Rating & feedback system
	•	📊 Basic admin dashboard

⸻

🧠 Core Algorithm (Helper Matching)
	1.	Capture user location (latitude, longitude)
	2.	Filter helpers:
	•	Matching category
	•	Availability = true
	3.	Calculate distance using Haversine Formula
	4.	Rank helpers:
	•	Nearest distance first
	•	Higher rating priority
	5.	Return top relevant helpers

⸻

📁 Project Structure

CivicEye/
│
├── client/        # React Frontend
├── server/        # Node Backend
├── .gitignore
├── README.md

⸻

🚀 How to Run the Project

1. Clone Repository

git clone https://github.com/Tohid2023/CivicEye.git
cd CivicEye

⸻

2. Install Dependencies

cd client
npm install

cd ../server
npm install

⸻

3. Setup Environment Variables

Create .env file inside server folder:

MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret
PORT=8080

⸻

4. Run the Project

Backend

cd server
npm run dev

Frontend

cd client
npm run dev
