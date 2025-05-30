// Custom icons
const userIcon = L.divIcon({
    className: 'bg-blue-500 w-4 h-4 rounded-full border-2 border-white shadow-lg',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
});

const ambulansIcon = L.divIcon({
    className: 'bg-red-500 w-4 h-4 rounded-full border-2 border-white shadow-lg',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
});

// Initialize map centered on Indonesia
const map = L.map('map').setView([-2.5489, 118.0149], 5);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Store markers and routing control
let markers = [];
let userMarker = null;
let routingControl = null;
let userLocation = null;

// Haversine distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Format price to IDR
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(price);
}

// Format facilities array to badges
function formatFacilities(facilities) {
    if (typeof facilities === 'string') {
        facilities = JSON.parse(facilities);
    }
    return facilities.map(facility => {
        const facilityNames = {
            'oksigen': 'Tabung Oksigen',
            'stretcher': 'Stretcher',
            'ventilator': 'Ventilator',
            'defibrillator': 'Defibrillator',
            'medkit': 'Medical Kit'
        };
        return `<span class="facility-badge">${facilityNames[facility] || facility}</span>`;
    }).join(' ');
}

// Show route between user and ambulance
function showRoute(ambulansPosition) {
    if (!userLocation) {
        alert('Mohon izinkan akses lokasi untuk melihat rute');
        return;
    }

    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(userLocation.lat, userLocation.lng),
            L.latLng(ambulansPosition[0], ambulansPosition[1])
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        lineOptions: {
            styles: [{ color: '#3B82F6', opacity: 0.6, weight: 4 }]
        }
    }).addTo(map);
}

// Create popup content for ambulance marker
function createPopupContent(ambulance) {
    let distanceText = '';
    if (userLocation) {
        const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            ambulance.latitude,
            ambulance.longitude
        );
        distanceText = `<p class="mb-2"><span class="font-semibold">Jarak:</span> ${distance.toFixed(1)} km</p>`;
    }

    return `
        <div class="p-4">
            <h3 class="font-bold text-lg text-blue-600 mb-2">${ambulance.nama}</h3>
            
            <div class="mb-3">
                <p class="text-gray-600">${ambulance.alamat}</p>
                <p class="text-gray-600">${ambulance.kota}, ${ambulance.provinsi}</p>
            </div>

            <div class="mb-3">
                <p>
                    <span class="font-semibold">Status:</span>
                    <span class="${ambulance.status === 'gratis' ? 'text-green-600' : 'text-blue-600'}">
                        ${ambulance.status.charAt(0).toUpperCase() + ambulance.status.slice(1)}
                    </span>
                </p>
                <p>
                    <span class="font-semibold">Tipe:</span>
                    <span class="text-gray-800">${ambulance.tipe_instansi.toUpperCase()}</span>
                </p>
                <p>
                    <span class="font-semibold">Layanan:</span>
                    <span class="text-gray-800">${ambulance.jenis_layanan.replace('_', ' ').toUpperCase()}</span>
                </p>
                ${ambulance.harga ? `
                    <p>
                        <span class="font-semibold">Harga:</span>
                        <span class="text-gray-800">${formatPrice(ambulance.harga)}</span>
                    </p>
                ` : ''}
            </div>

            <div class="mb-3">
                <p class="font-semibold mb-1">Fasilitas:</p>
                <div class="flex flex-wrap gap-1">
                    ${formatFacilities(ambulance.fasilitas)}
                </div>
            </div>

            ${distanceText}

            <div class="flex justify-between items-center mt-4">
                <a href="/detail/${ambulance.id}" 
                   class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Lihat Detail
                </a>
                <a href="https://wa.me/${ambulance.kontak.replace(/^0/, '62')}?text=${encodeURIComponent(`Halo, saya tertarik dengan layanan ambulans ${ambulance.nama}. Apakah masih tersedia?`)}"
                   target="_blank"
                   class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                    <i class="fab fa-whatsapp mr-2"></i>
                    Hubungi
                </a>
            </div>
        </div>
    `;
}

// Load and display ambulance markers
async function loadAmbulances(filters = {}) {
    try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.provinsi) queryParams.append('provinsi', filters.provinsi);
        if (filters.kota) queryParams.append('kota', filters.kota);
        if (filters.status && filters.status.length) queryParams.append('status', filters.status.join(','));
        if (filters.fasilitas && filters.fasilitas.length) queryParams.append('fasilitas', filters.fasilitas.join(','));
        if (filters.maxDistance && userLocation) {
            queryParams.append('lat', userLocation.lat);
            queryParams.append('lng', userLocation.lng);
            queryParams.append('radius', filters.maxDistance);
        }

        const response = await fetch(`/api/ambulans?${queryParams}`);
        const ambulances = await response.json();
        
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];

        // Add ambulance markers
        ambulances.forEach(ambulance => {
            const marker = L.marker([ambulance.latitude, ambulance.longitude], { icon: ambulansIcon });
            
            marker.bindPopup(createPopupContent(ambulance));
            marker.on('click', () => {
                showRoute([ambulance.latitude, ambulance.longitude]);
            });
            marker.addTo(map);
            markers.push(marker);
        });

        // Update result count
        document.getElementById('resultCount').textContent = ambulances.length;
    } catch (error) {
        console.error('Error loading ambulances:', error);
        alert('Terjadi kesalahan saat memuat data ambulans');
    }
}

// Get user's location
async function getUserLocation() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        // Add or update user marker
        if (userMarker) {
            userMarker.setLatLng([userLocation.lat, userLocation.lng]);
        } else {
            userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                .bindPopup('Lokasi Anda')
                .addTo(map);
        }

        map.setView([userLocation.lat, userLocation.lng], 12);
        return true;
    } catch (error) {
        console.error('Error getting location:', error);
        alert('Mohon izinkan akses lokasi untuk pengalaman yang lebih baik');
        return false;
    }
}

// Handle search button click
document.getElementById('searchBtn').addEventListener('click', () => {
    const filters = {
        provinsi: document.getElementById('provinsi').value,
        kota: document.getElementById('searchKota').value,
        status: Array.from(document.querySelectorAll('input[name="status"]:checked')).map(cb => cb.value),
        fasilitas: Array.from(document.querySelectorAll('input[name="fasilitas"]:checked')).map(cb => cb.value),
        maxDistance: document.getElementById('maxDistance').value
    };

    loadAmbulances(filters);
});

// Handle province selection
document.getElementById('provinsi').addEventListener('change', (e) => {
    window.indonesiaData.populateCities(e.target.value);
});

// Handle distance slider
const distanceSlider = document.getElementById('maxDistance');
const distanceValue = document.getElementById('distanceValue');
distanceSlider.addEventListener('input', (e) => {
    distanceValue.textContent = e.target.value;
});

// Check authentication status and update UI
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        if (data.authenticated) {
            document.getElementById('userSection').classList.remove('hidden');
            document.getElementById('guestSection').classList.add('hidden');
        } else {
            document.getElementById('userSection').classList.add('hidden');
            document.getElementById('guestSection').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (response.ok) {
            window.location.reload();
        }
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Terjadi kesalahan saat logout');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Populate province select
    window.indonesiaData.populateProvinces();
    
    // Get user location and load ambulances
    await getUserLocation();
    loadAmbulances();
    
    // Check authentication
    checkAuth();
}); 