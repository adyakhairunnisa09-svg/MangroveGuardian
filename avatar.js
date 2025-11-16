// ==========================================
// MANGROVE GUARDIAN - AVATAR.JS
// Avatar customization & shop system
// ==========================================

// ========== SHOP ITEMS DATABASE ==========
const shopItems = [
    // HATS
    { id: 1, name: 'Topi Safari', emoji: '🎩', category: 'hat', price: 500, description: 'Topi penjelajah hutan mangrove' },
    { id: 2, name: 'Topi Petani', emoji: '👒', category: 'hat', price: 400, description: 'Topi untuk bekerja di kebun' },
    { id: 3, name: 'Topi Baseball', emoji: '🧢', category: 'hat', price: 350, description: 'Topi kasual yang keren' },
    { id: 4, name: 'Mahkota', emoji: '👑', category: 'hat', price: 1000, description: 'Untuk raja/ratu mangrove!' },
    
    // SHIRTS
    { id: 5, name: 'Kaos Konservasi', emoji: '👕', category: 'shirt', price: 300, description: 'Kaos hijau eco-friendly' },
    { id: 6, name: 'Kemeja Formal', emoji: '👔', category: 'shirt', price: 450, description: 'Tampil formal dan elegan' },
    { id: 7, name: 'Jaket Hoodie', emoji: '🧥', category: 'shirt', price: 600, description: 'Hangat dan nyaman' },
    { id: 8, name: 'Kaos Superhero', emoji: '🦸', category: 'shirt', price: 550, description: 'Pahlawan lingkungan!' },
    
    // ACCESSORIES
    { id: 9, name: 'Kacamata Keren', emoji: '🕶️', category: 'accessories', price: 400, description: 'Style untuk guardian sejati' },
    { id: 10, name: 'Tas Petualang', emoji: '🎒', category: 'accessories', price: 600, description: 'Untuk membawa alat konservasi' },
    { id: 11, name: 'Jam Tangan', emoji: '⌚', category: 'accessories', price: 700, description: 'Selalu tepat waktu!' },
    { id: 12, name: 'Kalung Daun', emoji: '📿', category: 'accessories', price: 450, description: 'Aksesoris natural' },
    
    // SHOES
    { id: 13, name: 'Sepatu Boots', emoji: '👢', category: 'shoes', price: 500, description: 'Untuk medan berat' },
    { id: 14, name: 'Sandal Jepit', emoji: '🩴', category: 'shoes', price: 200, description: 'Santai di pantai' },
    { id: 15, name: 'Sneakers', emoji: '👟', category: 'shoes', price: 550, description: 'Sporty dan nyaman' },
    
    // SPECIAL ITEMS
    { id: 16, name: 'Sayap Malaikat', emoji: '👼', category: 'special', price: 2000, description: 'Item langka dan spesial!' },
    { id: 17, name: 'Senter LED', emoji: '🔦', category: 'special', price: 800, description: 'Untuk ekspedisi malam' },
    { id: 18, name: 'Binokular', emoji: '🔭', category: 'special', price: 900, description: 'Amati mangrove dari jauh' }
];

// ========== LOAD SHOP ITEMS ==========
function loadShopItems(filterCategory = 'all') {
    const container = document.getElementById('shopItems');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Filter items
    const items = filterCategory === 'all' ? 
        shopItems : 
        shopItems.filter(item => item.category === filterCategory);
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'shop-item';
        card.setAttribute('data-category', item.category);
        
        // Check if user already owns this item
        const owned = isItemOwned(item.id);
        
        card.innerHTML = `
            <h3>${item.name}</h3>
            <div class="shop-item-preview">${item.emoji}</div>
            <p style="color: #666; min-height: 60px;">${item.description}</p>
            <div class="price-tag">💰 ${item.price} Koin</div>
            ${owned ? 
                '<button class="btn btn-secondary" style="margin-top: 15px;" disabled>✅ Sudah Dimiliki</button>' :
                `<button class="btn btn-primary" style="margin-top: 15px;" onclick="buyItem('${item.name}', ${item.price})">🛒 Beli</button>`
            }
        `;
        
        container.appendChild(card);
    });
    
    // Setup filter buttons
    setupShopFilters();
}

// ========== SETUP SHOP FILTERS ==========
function setupShopFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Add active to clicked
            this.classList.add('active');
            
            // Get category
            const category = this.getAttribute('data-category');
            
            // Filter items
            loadShopItems(category);
        });
    });
}

// ========== CHECK IF ITEM OWNED ==========
function isItemOwned(itemId) {
    const userData = window.mangroveApp.userData;
    if (!userData.equippedItems) return false;
    
    return userData.equippedItems.some(item => {
        const shopItem = shopItems.find(si => si.name === item.name);
        return shopItem && shopItem.id === itemId;
    });
}

// ========== DISPLAY EQUIPPED ITEMS ==========
function displayEquippedItems() {
    const container = document.getElementById('avatarEquipped');
    const modalContainer = document.getElementById('equippedItemsList');
    
    if (!window.mangroveApp.userData.equippedItems) {
        if (container) container.innerHTML = '<p style="color: #666;">Belum ada item yang dipakai</p>';
        if (modalContainer) modalContainer.innerHTML = '<p style="color: #666;">Belum ada item yang dipakai</p>';
        return;
    }
    
    const html = `
        <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
            ${window.mangroveApp.userData.equippedItems.map(item => {
                const shopItem = shopItems.find(si => si.name === item.name);
                if (!shopItem) return '';
                
                return `
                    <div style="background: white; border: 2px solid #4a7c2c; border-radius: 12px; padding: 15px; text-align: center; min-width: 100px;">
                        <div style="font-size: 2.5em;">${shopItem.emoji}</div>
                        <div style="font-size: 0.8em; margin-top: 5px;">${shopItem.name}</div>
                        <button class="btn btn-secondary" style="margin-top: 10px; padding: 5px 10px; font-size: 0.8em;" 
                                onclick="unequipItem('${item.name}')">
                            ❌ Lepas
                        </button>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    if (container) container.innerHTML = html;
    if (modalContainer) modalContainer.innerHTML = html;
    
    // Update avatar preview
    updateAvatarPreview();
}

// ========== UPDATE AVATAR PREVIEW ==========
function updateAvatarPreview() {
    // Get dominant item or use default
    let avatarEmoji = '🌿';
    
    if (window.mangroveApp.userData.equippedItems && window.mangroveApp.userData.equippedItems.length > 0) {
        const lastItem = window.mangroveApp.userData.equippedItems[window.mangroveApp.userData.equippedItems.length - 1];
        const shopItem = shopItems.find(si => si.name === lastItem.name);
        if (shopItem) {
            avatarEmoji = shopItem.emoji;
        }
    }
    
    // Update all avatar displays
    const avatarDisplays = document.querySelectorAll('#avatarDisplay, #avatarPreviewEmoji, #modalAvatarPreview');
    avatarDisplays.forEach(el => {
        if (el) el.textContent = avatarEmoji;
    });
    
    // Save to userData
    window.mangroveApp.userData.avatar = avatarEmoji;
    window.mangroveApp.saveUserData();
}

// ========== UNEQUIP ITEM ==========
function unequipItem(itemName) {
    if (!confirm(`Lepas ${itemName}?`)) return;
    
    const userData = window.mangroveApp.userData;
    if (!userData.equippedItems) return;
    
    userData.equippedItems = userData.equippedItems.filter(item => item.name !== itemName);
    window.mangroveApp.saveUserData();
    
    displayEquippedItems();
    window.mangroveApp.showNotification('success', `${itemName} telah dilepas`);
}

// ========== EQUIP ITEM ==========
function equipItem(itemName) {
    const userData = window.mangroveApp.userData;
    
    // Check if already equipped
    if (userData.equippedItems && userData.equippedItems.some(item => item.name === itemName)) {
        window.mangroveApp.showNotification('info', 'Item sudah dipakai!');
        return;
    }
    
    // Add to equipped
    if (!userData.equippedItems) {
        userData.equippedItems = [];
    }
    
    userData.equippedItems.push({
        name: itemName,
        equippedAt: Date.now()
    });
    
    window.mangroveApp.saveUserData();
    displayEquippedItems();
    
    window.mangroveApp.showNotification('success', `✅ ${itemName} telah dipakai!`);
}

// ========== GET ITEM BY NAME ==========
function getItemByName(itemName) {
    return shopItems.find(item => item.name === itemName);
}

// ========== GET USER INVENTORY ==========
function getUserInventory() {
    const userData = window.mangroveApp.userData;
    if (!userData.equippedItems) return [];
    
    return userData.equippedItems.map(item => {
        const shopItem = getItemByName(item.name);
        return {
            ...item,
            ...shopItem
        };
    });
}

// ========== SELL ITEM ==========
function sellItem(itemName) {
    const item = getItemByName(itemName);
    if (!item) return;
    
    const sellPrice = Math.floor(item.price * 0.5); // 50% of original price
    
    if (!confirm(`Jual ${itemName} seharga ${sellPrice} koin?`)) return;
    
    // Remove from inventory
    const userData = window.mangroveApp.userData;
    if (!userData.equippedItems) return;
    
    userData.equippedItems = userData.equippedItems.filter(i => i.name !== itemName);
    
    // Add coins
    userData.points += sellPrice;
    
    window.mangroveApp.saveUserData();
    displayEquippedItems();
    loadShopItems();
    
    window.mangroveApp.showNotification('success', `${itemName} terjual! +${sellPrice} koin`);
}

// ========== SHOW INVENTORY ==========
function showInventory() {
    const inventory = getUserInventory();
    
    if (inventory.length === 0) {
        window.mangroveApp.showNotification('info', 'Inventory kosong! Beli item di shop.');
        return;
    }
    
    let inventoryHTML = '<h3>📦 Inventory Saya</h3><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; margin-top: 20px;">';
    
    inventory.forEach(item => {
        inventoryHTML += `
            <div style="background: white; border: 2px solid #e0e0e0; border-radius: 12px; padding: 15px; text-align: center;">
                <div style="font-size: 3em;">${item.emoji}</div>
                <div style="font-weight: bold; margin: 10px 0;">${item.name}</div>
                <button class="btn btn-primary" style="margin: 5px; padding: 8px 12px; font-size: 0.85em;" 
                        onclick="equipItem('${item.name}')">
                    ✓ Pakai
                </button>
                <button class="btn btn-secondary" style="margin: 5px; padding: 8px 12px; font-size: 0.85em;" 
                        onclick="sellItem('${item.name}')">
                    💰 Jual
                </button>
            </div>
        `;
    });
    
    inventoryHTML += '</div>';
    
    // Show in modal or dedicated section
    alert('Inventory feature - akan ditampilkan di modal');
}

// ========== AVATAR PRESETS ==========
const avatarPresets = [
    { name: 'Eco Warrior', emoji: '🌿', items: ['Kaos Konservasi', 'Topi Safari'] },
    { name: 'Beach Explorer', emoji: '🏖️', items: ['Sandal Jepit', 'Kacamata Keren'] },
    { name: 'Forest Ranger', emoji: '🌳', items: ['Jaket Hoodie', 'Sepatu Boots', 'Tas Petualang'] },
    { name: 'Mangrove King', emoji: '👑', items: ['Mahkota', 'Kemeja Formal'] }
];

// ========== APPLY PRESET ==========
function applyAvatarPreset(presetName) {
    const preset = avatarPresets.find(p => p.name === presetName);
    if (!preset) return;
    
    const userData = window.mangroveApp.userData;
    
    // Check if user owns all items
    const missingItems = preset.items.filter(itemName => {
        return !userData.equippedItems || !userData.equippedItems.some(i => i.name === itemName);
    });
    
    if (missingItems.length > 0) {
        window.mangroveApp.showNotification('error', `Anda belum memiliki: ${missingItems.join(', ')}`);
        return;
    }
    
    // Clear current items
    userData.equippedItems = [];
    
    // Apply preset items
    preset.items.forEach(itemName => {
        userData.equippedItems.push({
            name: itemName,
            equippedAt: Date.now()
        });
    });
    
    window.mangroveApp.saveUserData();
    displayEquippedItems();
    
    window.mangroveApp.showNotification('success', `✅ Preset "${presetName}" diterapkan!`);
}

// ========== RANDOM AVATAR ==========
function randomizeAvatar() {
    const ownedItems = getUserInventory();
    
    if (ownedItems.length === 0) {
        window.mangroveApp.showNotification('info', 'Beli item dulu untuk randomize!');
        return;
    }
    
    // Clear current
    window.mangroveApp.userData.equippedItems = [];
    
    // Select 2-4 random items
    const count = Math.floor(Math.random() * 3) + 2;
    const shuffled = ownedItems.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, ownedItems.length));
    
    selected.forEach(item => {
        window.mangroveApp.userData.equippedItems.push({
            name: item.name,
            equippedAt: Date.now()
        });
    });
    
    window.mangroveApp.saveUserData();
    displayEquippedItems();
    
    window.mangroveApp.showNotification('success', '🎲 Avatar di-randomize!');
}

// ========== INIT AVATAR MODULE ==========
function initAvatarModule() {
    loadShopItems();
    displayEquippedItems();
}

// ========== EXPORT ==========
window.avatarModule = {
    loadShopItems,
    displayEquippedItems,
    equipItem,
    unequipItem,
    sellItem,
    showInventory,
    applyAvatarPreset,
    randomizeAvatar,
    getUserInventory,
    initAvatarModule
};