// API Configuration
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : 'http://backend:8080/api';

let selectedCar = null;

// Navigation
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${sectionName}-section`).classList.add('active');
    event.target.classList.add('active');

    if (sectionName === 'cars') {
        loadCars();
    }
}

// Load all cars
async function loadCars() {
    const carsGrid = document.getElementById('cars-grid');
    carsGrid.innerHTML = '<div class="loading">Loading cars...</div>';

    try {
        const response = await fetch(`${API_URL}/cars`);
        const cars = await response.json();

        if (cars.length === 0) {
            carsGrid.innerHTML = '<p class="info-message">No cars available. Add some cars to get started!</p>';
            return;
        }

        carsGrid.innerHTML = cars.map(car => `
            <div class="car-card">
                <img src="${car.imageUrl}" alt="${car.brand} ${car.model}" class="car-image"
                     onerror="this.src='https://via.placeholder.com/400x200?text=Car+Image'">
                <div class="car-info">
                    <h3 class="car-title">${car.brand} ${car.model}</h3>
                    <div class="car-details">
                        ${car.year} • ${car.color} • ${car.licensePlate}
                    </div>
                    <div class="car-price">$${car.dailyRate}/day</div>
                    <span class="status-badge ${car.available ? 'status-available' : 'status-rented'}">
                        ${car.available ? 'Available' : 'Rented'}
                    </span>
                    <button class="btn ${car.available ? 'btn-primary' : 'btn-danger'} btn-full"
                            onclick="${car.available ? `showRentModal(${car.id})` : 'return false;'}"
                            ${!car.available ? 'disabled' : ''}>
                        ${car.available ? 'Rent Now' : 'Not Available'}
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading cars:', error);
        carsGrid.innerHTML = '<p class="info-message">Error loading cars. Please try again.</p>';
    }
}

// Add Car Modal
function showAddCarModal() {
    document.getElementById('add-car-modal').style.display = 'block';
}

function closeAddCarModal() {
    document.getElementById('add-car-modal').style.display = 'none';
    document.getElementById('add-car-form').reset();
}

async function addCar(event) {
    event.preventDefault();

    const carData = {
        brand: document.getElementById('car-brand').value,
        model: document.getElementById('car-model').value,
        year: parseInt(document.getElementById('car-year').value),
        color: document.getElementById('car-color').value,
        dailyRate: parseFloat(document.getElementById('car-rate').value),
        licensePlate: document.getElementById('car-plate').value,
        imageUrl: document.getElementById('car-image').value,
        available: true
    };

    try {
        const response = await fetch(`${API_URL}/cars`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carData)
        });

        if (response.ok) {
            alert('Car added successfully!');
            closeAddCarModal();
            loadCars();
        } else {
            alert('Error adding car. Please try again.');
        }
    } catch (error) {
        console.error('Error adding car:', error);
        alert('Error adding car. Please try again.');
    }
}

// Rent Car Modal
async function showRentModal(carId) {
    try {
        const response = await fetch(`${API_URL}/cars/${carId}`);
        selectedCar = await response.json();

        const rentCarInfo = document.getElementById('rent-car-info');
        rentCarInfo.innerHTML = `
            <div class="car-details" style="margin-bottom: 20px;">
                <h3>${selectedCar.brand} ${selectedCar.model}</h3>
                <p>${selectedCar.year} • ${selectedCar.color}</p>
                <p class="car-price">$${selectedCar.dailyRate}/day</p>
            </div>
        `;

        // Set minimum dates
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('start-date').min = today;
        document.getElementById('end-date').min = today;

        document.getElementById('rent-modal').style.display = 'block';

        // Add event listeners for date changes
        document.getElementById('start-date').addEventListener('change', calculateTotal);
        document.getElementById('end-date').addEventListener('change', calculateTotal);
    } catch (error) {
        console.error('Error loading car details:', error);
        alert('Error loading car details. Please try again.');
    }
}

function closeRentModal() {
    document.getElementById('rent-modal').style.display = 'none';
    document.getElementById('rent-form').reset();
    selectedCar = null;
}

function calculateTotal() {
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);

    if (startDate && endDate && endDate > startDate && selectedCar) {
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const total = days * selectedCar.dailyRate;
        document.getElementById('total-cost').innerHTML = `
            <strong>Rental Period:</strong> ${days} day(s)<br>
            <strong>Total Cost:</strong> $${total.toFixed(2)}
        `;
    } else {
        document.getElementById('total-cost').innerHTML = '';
    }
}

async function rentCar(event) {
    event.preventDefault();

    if (!selectedCar) {
        alert('No car selected');
        return;
    }

    const rentalData = {
        car: { id: selectedCar.id },
        customerName: document.getElementById('customer-name').value,
        customerEmail: document.getElementById('customer-email').value,
        customerPhone: document.getElementById('customer-phone').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value
    };

    try {
        const response = await fetch(`${API_URL}/rentals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rentalData)
        });

        if (response.ok) {
            alert('Car rented successfully! Check "My Rentals" to view your booking.');
            closeRentModal();
            loadCars();
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
    } catch (error) {
        console.error('Error renting car:', error);
        alert('Error renting car. Please try again.');
    }
}

// Search Rentals
async function searchRentals() {
    const email = document.getElementById('search-email').value;
    if (!email) {
        alert('Please enter an email address');
        return;
    }

    const rentalsList = document.getElementById('rentals-list');
    rentalsList.innerHTML = '<div class="loading">Loading rentals...</div>';

    try {
        const response = await fetch(`${API_URL}/rentals/customer/${encodeURIComponent(email)}`);
        const rentals = await response.json();

        if (rentals.length === 0) {
            rentalsList.innerHTML = '<p class="info-message">No rentals found for this email.</p>';
            return;
        }

        rentalsList.innerHTML = rentals.map(rental => `
            <div class="rental-card">
                <div class="rental-header">
                    <span class="rental-id">Rental #${rental.id}</span>
                    <span class="status-badge ${
                        rental.status === 'ACTIVE' ? 'status-available' :
                        rental.status === 'COMPLETED' ? 'status-badge' :
                        'status-rented'
                    }">${rental.status}</span>
                </div>
                <div class="rental-details">
                    <div class="rental-detail">
                        <span class="rental-label">Car</span>
                        <span class="rental-value">${rental.car.brand} ${rental.car.model}</span>
                    </div>
                    <div class="rental-detail">
                        <span class="rental-label">Start Date</span>
                        <span class="rental-value">${rental.startDate}</span>
                    </div>
                    <div class="rental-detail">
                        <span class="rental-label">End Date</span>
                        <span class="rental-value">${rental.endDate}</span>
                    </div>
                    <div class="rental-detail">
                        <span class="rental-label">Total Cost</span>
                        <span class="rental-value">$${rental.totalCost}</span>
                    </div>
                </div>
                ${rental.status === 'ACTIVE' ? `
                    <div class="rental-actions">
                        <button class="btn btn-success" onclick="completeRental(${rental.id})">
                            Complete Rental
                        </button>
                        <button class="btn btn-danger" onclick="cancelRental(${rental.id})">
                            Cancel Rental
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading rentals:', error);
        rentalsList.innerHTML = '<p class="info-message">Error loading rentals. Please try again.</p>';
    }
}

async function completeRental(rentalId) {
    if (!confirm('Are you sure you want to complete this rental?')) return;

    try {
        const response = await fetch(`${API_URL}/rentals/${rentalId}/complete`, {
            method: 'PUT'
        });

        if (response.ok) {
            alert('Rental completed successfully!');
            searchRentals();
        } else {
            alert('Error completing rental. Please try again.');
        }
    } catch (error) {
        console.error('Error completing rental:', error);
        alert('Error completing rental. Please try again.');
    }
}

async function cancelRental(rentalId) {
    if (!confirm('Are you sure you want to cancel this rental?')) return;

    try {
        const response = await fetch(`${API_URL}/rentals/${rentalId}/cancel`, {
            method: 'PUT'
        });

        if (response.ok) {
            alert('Rental cancelled successfully!');
            searchRentals();
        } else {
            alert('Error cancelling rental. Please try again.');
        }
    } catch (error) {
        console.error('Error cancelling rental:', error);
        alert('Error cancelling rental. Please try again.');
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const addCarModal = document.getElementById('add-car-modal');
    const rentModal = document.getElementById('rent-modal');

    if (event.target === addCarModal) {
        closeAddCarModal();
    }
    if (event.target === rentModal) {
        closeRentModal();
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadCars();
});
