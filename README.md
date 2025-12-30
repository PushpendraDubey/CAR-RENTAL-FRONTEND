# Car Rental Frontend

Modern web interface for the car rental application.

## Tech Stack
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- Node.js + Express (server)

## Running Locally

### With Node.js
```powershell
npm install
npm start
```

### With Docker
```powershell
docker build -t car-rental-frontend .
docker run -p 3000:3000 car-rental-frontend
```

## Features
- Browse available cars
- Add new cars to inventory
- Rent cars with customer information
- View and manage rentals
- Complete or cancel rentals

## Configuration
Backend API URL is auto-configured based on environment:
- Local: `http://localhost:8080/api`
- Docker: `http://backend:8080/api`

Access at: http://localhost:3000