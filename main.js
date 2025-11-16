// ==========================================
// MANGROVE GUARDIAN - MAIN.JS
// Fungsi utama, navigation, dan core functionality
// ==========================================

// ========== GLOBAL VARIABLES ==========
let userData = {
    id: null,
    name: "Penjaga Mangrove",
    level: 1,
    points: 0,
    avatar: "🌿",
    equippedItems: [],
    adoptedMangroves: [],
    virtualGarden: []
};

// ========== INITIALIZE APP ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log("🌱 Mangrove Guardian App Started");
    
    // Hide loading screen after 2 seconds
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hide');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 2000);
    
    // Load user data dari localStorage atau database
    loadUserData();
    
    // Setup navigation
    setupNavigation();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
    
    // Show default section (hero akan selalu tampil)
    // showSection('impact'); // Commented out karena hero jadi landing page
});

// ========== LOAD USER DATA ==========
function loadUserData() {
    // Cek localStorage dulu
    const savedData = localStorage.getItem('mangrove_user');
    
    if (savedData) {
        userData = JSON.parse(savedData);
        updateUserDisplay();
    } else {
        // Jika belum ada, create new user
        userData.id = 'user_' + Date.now();
        saveUserData();
    }
}

// ========== SAVE USER DATA ==========
function saveUserData() {
    localStorage.setItem('mangrove_user', JSON.stringify(userData));
    updateUserDisplay();
    
    // Juga save ke database via PHP
    fetch('php/user_api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'save_user',
            data: userData
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ User data saved to database');
        }
    })
    .catch(error => console.error('Error saving user data:', error));
}

// ========== UPDATE USER DISPLAY ==========
function updateUserDisplay() {
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userLevel').textContent = userData.level;
    document.getElementById('userPoints').textContent = userData.points;
    document.getElementById('avatarDisplay').textContent = userData.avatar;
}

// ========== NAVIGATION SETUP ==========
function setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
            
            // Update active tab
            navTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ========== SHOW SECTION ==========
function showSection(sectionId) {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide all sections (except globe-hero-section)
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section-specific data
        loadSectionData(sectionId);
    }
}

// ========== LOAD SECTION DATA ==========
function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'impact':
            loadRealImpactData();
            break;
        case 'garden':
            loadGardenData();
            break;
        case 'visit':
            loadFriendsList();
            break;
        case 'scanner':
            // Scanner ready
            break;
        case 'chatbot':
            // Chatbot ready
            break;
        case 'map':
            // Map akan diload on demand
            break;
        case 'globe':
            // Globe akan diload on demand
            break;
        case 'shop':
            loadShopItems();
            break;
    }
}

// ========== SETUP EVENT LISTENERS ==========
function setupEventListeners() {
    // Scanner input
    const scannerInput = document.getElementById('scannerInput');
    if (scannerInput) {
        scannerInput.addEventListener('change', handleScannerUpload);
    }
    
    // Chat input - Enter key
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // Scanner dropzone drag & drop
    const dropzone = document.getElementById('scannerDropzone');
    if (dropzone) {
        dropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.background = 'linear-gradient(135deg, #c8e6c9, #a5d6a7)';
        });
        
        dropzone.addEventListener('dragleave', function() {
            this.style.background = '';
        });
        
        dropzone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.background = '';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                scannerInput.files = files;
                handleScannerUpload({ target: { files: files } });
            }
        });
    }
}

// ========== LOAD INITIAL DATA ==========
function loadInitialData() {
    // Load statistics
    fetch('php/stats_api.php?action=get_stats')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalPlanted').textContent = data.stats.totalPlanted || 1247;
                document.getElementById('activeGuardians').textContent = data.stats.activeGuardians || 523;
            }
        })
        .catch(error => {
            console.log('Using default stats');
            document.getElementById('totalPlanted').textContent = 1247;
            document.getElementById('activeGuardians').textContent = 523;
        });
}

// ========== REAL IMPACT - ADOPT MANGROVE ==========
function adoptMangrove(location) {
    const adoptionData = {
        userId: userData.id,
        location: location,
        timestamp: new Date().toISOString(),
        mangroveId: 'mg_' + Date.now()
    };
    
    // Kirim ke server
    fetch('php/adopt.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'adopt',
            data: adoptionData
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Add to user data
            userData.adoptedMangroves.push(adoptionData);
            userData.points += 50; // Bonus points
            
            saveUserData();
            
            // Show success message
            showNotification('success', `🎉 Berhasil mengadopsi mangrove di ${location}!`);
            
            // Reload adopted mangroves display
            loadAdoptedMangroves();
        } else {
            showNotification('error', 'Gagal mengadopsi mangrove. Coba lagi.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('error', 'Terjadi kesalahan. Periksa koneksi Anda.');
    });
}

// ========== LOAD REAL IMPACT DATA ==========
function loadRealImpactData() {
    loadAdoptedMangroves();
}

// ========== LOAD ADOPTED MANGROVES ==========
function loadAdoptedMangroves() {
    const container = document.getElementById('adoptedMangroves');
    
    if (userData.adoptedMangroves.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>🌱 Belum ada mangrove yang diadopsi</p>
                <p class="empty-desc">Mulai adopsi sekarang dan dapatkan update foto real!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    userData.adoptedMangroves.forEach(mangrove => {
        const card = document.createElement('div');
        card.className = 'adopted-card';
        card.innerHTML = `
            <div class="adopted-image">
                <img src="images/mangrove_${mangrove.location.replace(/\s+/g, '_')}.jpg" 
                     alt="${mangrove.location}"
                     onerror="this.parentElement.innerHTML='🌳';">
            </div>
            <h3>${mangrove.location}</h3>
            <p>ID: ${mangrove.mangroveId}</p>
            <p>Diadopsi: ${new Date(mangrove.timestamp).toLocaleDateString('id-ID')}</p>
            <button class="btn btn-secondary" onclick="viewMangroveProgress('${mangrove.mangroveId}')">
                📸 Lihat Progress
            </button>
        `;
        container.appendChild(card);
    });
}

// ========== VIEW MANGROVE PROGRESS ==========
function viewMangroveProgress(mangroveId) {
    // Fetch progress data
    fetch(`php/adopt.php?action=get_progress&id=${mangroveId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show progress modal or detail
                showNotification('info', 'Fitur progress foto akan segera hadir!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4a7c2c' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 350px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== ADD POINTS ==========
function addPoints(amount) {
    userData.points += amount;
    saveUserData();
    
    // Animation effect
    const pointsEl = document.getElementById('userPoints');
    pointsEl.style.transform = 'scale(1.3)';
    pointsEl.style.color = '#f39c12';
    
    setTimeout(() => {
        pointsEl.style.transform = 'scale(1)';
        pointsEl.style.color = '';
    }, 300);
}

// ========== CHECK LEVEL UP ==========
function checkLevelUp() {
    const nextLevelPoints = userData.level * 1000;
    
    if (userData.points >= nextLevelPoints) {
        userData.level++;
        userData.points -= nextLevelPoints;
        
        saveUserData();
        showNotification('success', `🎊 Level Up! Sekarang Level ${userData.level}`);
        
        // Bonus reward
        userData.points += 100;
        saveUserData();
    }
}

// ========== SCANNER UPLOAD HANDLER ==========
function handleScannerUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        showNotification('error', 'File harus berupa gambar!');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'Ukuran file maksimal 5MB!');
        return;
    }
    
    // Pass to scanner.js
    if (typeof scanMangrove === 'function') {
        scanMangrove(file);
    }
}

// ========== SEND CHAT MESSAGE ==========
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Pass to chatbot.js
    if (typeof handleChatMessage === 'function') {
        handleChatMessage(message);
        input.value = '';
    }
}

// ========== LOAD ARCGIS DATA ==========
function loadArcGISData() {
    if (typeof initArcGISMap === 'function') {
        initArcGISMap();
    } else {
        showNotification('info', 'Loading ArcGIS data...');
    }
}

// ========== REFRESH MAP DATA ==========
function refreshMapData() {
    showNotification('info', 'Refreshing map data...');
    if (typeof loadArcGISData === 'function') {
        loadArcGISData();
    }
}

// ========== GLOBE FUNCTIONS ==========
function initGlobe() {
    if (typeof init3DGlobe === 'function') {
        init3DGlobe();
    } else {
        showNotification('info', 'Loading 3D Globe...');
    }
}

function toggleAutoRotate() {
    if (typeof toggleGlobeRotation === 'function') {
        toggleGlobeRotation();
    }
}

function resetGlobeView() {
    if (typeof resetGlobe === 'function') {
        resetGlobe();
    }
}

// ========== AVATAR FUNCTIONS ==========
function openAvatarCustomization() {
    const modal = document.getElementById('avatarModal');
    if (modal) {
        modal.classList.add('show');
        loadAvatarCustomization();
    }
}

function closeAvatarModal() {
    const modal = document.getElementById('avatarModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function loadAvatarCustomization() {
    // Will be handled by avatar.js
    if (typeof displayEquippedItems === 'function') {
        displayEquippedItems();
    }
}

// ========== TOP UP MODAL ==========
function openTopUpModal() {
    const modal = document.getElementById('topupModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeTopUpModal() {
    const modal = document.getElementById('topupModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// ========== BUY COINS ==========
function buyCoins(amount, price) {
    // Pass to payment.js
    if (typeof processPayment === 'function') {
        processPayment({
            type: 'coins',
            amount: amount,
            price: price,
            currency: 'IDR'
        });
    }
}

// ========== UTILITY FUNCTIONS ==========
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function getRandomPosition() {
    return {
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 70) + 10
    };
}

// ========== ERROR HANDLER ==========
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// ========== EXPORT FOR OTHER MODULES ==========
window.mangroveApp = {
    userData,
    saveUserData,
    updateUserDisplay,
    addPoints,
    checkLevelUp,
    showNotification,
    formatNumber,
    formatDate
};