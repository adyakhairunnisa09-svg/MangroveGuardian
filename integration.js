// ========== INTEGRATION PATCH - PASTIKAN SEMUA NYAMBUNG ==========
// File ini menggabungkan Part 1, 2, dan 3 supaya tidak bentrok

// ========== FIX: Override plantMangrove & waterMangrove ==========
// Ganti function lama dengan yang baru (enhanced version)
if (typeof plantMangrove !== 'undefined') {
    // Keep old function as backup
    window.plantMangroveOld = plantMangrove;
}
if (typeof waterMangrove !== 'undefined') {
    window.waterMangroveOld = waterMangrove;
}

// Use enhanced versions
window.plantMangrove = plantMangroveEnhanced;
window.waterMangrove = waterMangroveEnhanced;

// ========== FIX: Update HUD with new stats ==========
function updateHUDExtended() {
    if (typeof updateHUD === 'function') {
        updateHUD();
    }
    
    // Update additional UI
    document.getElementById('inv-coins').textContent = gameState.coins;
    
    // Update shop balance if modal open
    const shopBalance = document.getElementById('shop-balance');
    if (shopBalance) {
        shopBalance.textContent = gameState.coins;
    }
    
    // Update inventory display
    const invCoinsDisplay = document.getElementById('inv-coins-display');
    if (invCoinsDisplay) {
        invCoinsDisplay.textContent = gameState.coins;
    }
    
    // Update pet status if pet exists
    if (gameState.pet.type !== 'none') {
        const petStatus = document.getElementById('pet-status');
        if (petStatus) {
            petStatus.style.display = 'block';
            document.getElementById('pet-happiness').textContent = Math.floor(gameState.pet.happiness);
            document.getElementById('pet-hunger').textContent = Math.floor(gameState.pet.hunger);
        }
    }
}

// Override updateHUD
window.updateHUD = updateHUDExtended;

// ========== FIX: Enhanced animate loop ==========
// Merge original animate with extended features
const originalAnimate = window.animate;

window.animate = function() {
    requestAnimationFrame(window.animate);

    // Player movement (from original)
    const move = new THREE.Vector3();
    const speed = keys['shift'] ? 0.2 : 0.15;

    // Don't move if sitting
    if (!gameState.isSitting) {
        if (keys['w']) move.z = speed;
        if (keys['s']) move.z = -speed;
        if (keys['a']) move.x = -speed;
        if (keys['d']) move.x = speed;
    }

    if (keys['arrowleft']) mouseX += 0.04;
    if (keys['arrowright']) mouseX -= 0.04;

    camera.rotation.y = mouseX;

    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    if (!gameState.isSitting) {
        // Track distance
        const oldPos = player.position.clone();
        
        player.position.add(forward.multiplyScalar(move.z));
        player.position.add(right.multiplyScalar(move.x));
        
        const newPos = player.position.clone();
        const distMoved = oldPos.distanceTo(newPos);
        gameState.distanceWalked += distMoved;
    }

    // Bounds
    player.position.x = Math.max(-240, Math.min(240, player.position.x));
    player.position.z = Math.max(-30, Math.min(240, player.position.z));

    // Walking animation (only if not sitting)
    if (move.length() > 0 && !gameState.isSitting) {
        const t = Date.now() * 0.01;
        if (player.userData.leftLeg) player.userData.leftLeg.rotation.x = Math.sin(t) * 0.3;
        if (player.userData.rightLeg) player.userData.rightLeg.rotation.x = -Math.sin(t) * 0.3;
        if (player.userData.leftArm) player.userData.leftArm.rotation.x = -Math.sin(t) * 0.2;
        if (player.userData.rightArm) player.userData.rightArm.rotation.x = Math.sin(t) * 0.2;
        player.position.y = 0.9 + Math.abs(Math.sin(t)) * 0.05;
    } else {
        if (player.userData.leftLeg) player.userData.leftLeg.rotation.x = 0;
        if (player.userData.rightLeg) player.userData.rightLeg.rotation.x = 0;
        if (player.userData.leftArm) player.userData.leftArm.rotation.x = 0;
        if (player.userData.rightArm) player.userData.rightArm.rotation.x = 0;
        if (!gameState.isSitting) player.position.y = 0.9;
    }

    if (!gameState.isSitting) {
        camera.position.copy(player.position);
        camera.position.y += 1.8;
    }

    // Animate animals
    animals.forEach(animal => {
        if (animal.geometry.type === 'ConeGeometry') {
            // Fish
            animal.userData.angle += 0.02;
            animal.position.x += Math.cos(animal.userData.angle) * animal.userData.speed;
            animal.position.z += Math.sin(animal.userData.angle) * animal.userData.speed;
            animal.rotation.y = -animal.userData.angle - Math.PI / 2;

            if (animal.position.x < -100) animal.position.x = 100;
            if (animal.position.x > 100) animal.position.x = -100;
            if (animal.position.z < -100) animal.position.z = -50;
            if (animal.position.z > -50) animal.position.z = -100;
        } else if (animal.geometry.type === 'BoxGeometry') {
            // Crabs
            animal.userData.direction += (Math.random() - 0.5) * 0.1;
            animal.position.x += Math.cos(animal.userData.direction) * animal.userData.speed;
            animal.position.z += Math.sin(animal.userData.direction) * animal.userData.speed;
            animal.rotation.y = -animal.userData.direction;

            if (Math.abs(animal.position.x) > 100) animal.userData.direction += Math.PI;
            if (animal.position.z < -20 || animal.position.z > 40) animal.userData.direction += Math.PI;
        } else if (animal.geometry.type === 'SphereGeometry') {
            // Birds
            animal.userData.path += 0.01;
            animal.position.x += Math.cos(animal.userData.path) * animal.userData.speed;
            animal.position.z += Math.sin(animal.userData.path) * animal.userData.speed;
            animal.position.y += Math.sin(animal.userData.path * 2) * 0.02;

            if (Math.abs(animal.position.x) > 200) animal.userData.path += Math.PI;
            if (Math.abs(animal.position.z) > 200) animal.userData.path += Math.PI;
        }
    });

    // Animate NPC volunteers
    otherVolunteers.forEach(volunteer => {
        if (!volunteer.userData.isNPC) return;

        if (!volunteer.userData.targetPos || Math.random() < 0.01) {
            volunteer.userData.targetPos = new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                0.9,
                10 + Math.random() * 30
            );
        }

        const direction = new THREE.Vector3().subVectors(volunteer.userData.targetPos, volunteer.position);
        direction.y = 0;
        const dist = direction.length();

        if (dist > 0.5) {
            direction.normalize();
            volunteer.position.add(direction.multiplyScalar(0.02));
            volunteer.lookAt(volunteer.userData.targetPos);
            volunteer.rotation.x = 0;
            volunteer.rotation.z = 0;

            const t = Date.now() * 0.01;
            volunteer.position.y = 0.9 + Math.abs(Math.sin(t)) * 0.03;
        }
    });

    // ========== EXTENDED FEATURES ==========
    
    // Update pet
    if (typeof updatePet === 'function') {
        updatePet();
    }
    
    // Update weather
    if (typeof updateWeather === 'function') {
        updateWeather();
    }
    
    // Update day/night
    if (typeof updateDayNightCycle === 'function') {
        updateDayNightCycle();
    }

    // Check proximity to buildings
    let nearBuilding = false;
    let nearBench = false;
    
    buildings.forEach(building => {
        if (!building.userData.interactive) return;

        const dist = Math.sqrt(
            Math.pow(building.position.x - player.position.x, 2) +
            Math.pow(building.position.z - player.position.z, 2)
        );

        if (dist < 5) {
            nearBuilding = true;
            
            if (building.userData.type === 'booth') {
                showPrompt('🎫 Loket Pembelian Bibit - Tekan E untuk beli');
            } else if (building.userData.type === 'warung') {
                showPrompt('🏪 Warung - Tekan E untuk belanja');
            } else if (building.userData.type === 'photo') {
                showPrompt('📸 Spot Foto - Tekan P');
            } else if (building.userData.type === 'bench') {
                nearBench = true;
                if (gameState.isSitting) {
                    showPrompt('🪑 Bangku - Tekan E untuk berdiri');
                } else {
                    showPrompt('🪑 Bangku - Tekan E untuk duduk');
                }
            }
        }
    });

    if (!nearBuilding && !nearBench) {
        hidePrompt();
    }

    renderer.render(scene, camera);
};

// ========== FIX: Enhanced save/load ==========
const originalSaveGameData = window.saveGameData;

window.saveGameData = function() {
    if (typeof saveGameDataExtended === 'function') {
        saveGameDataExtended();
    } else if (typeof originalSaveGameData === 'function') {
        originalSaveGameData();
    }
    
    // Extra save for quest progress
    const questData = {
        activeQuests: gameState.activeQuests,
        completedQuests: gameState.completedQuests
    };
    localStorage.setItem('manggroveQuests', JSON.stringify(questData));
};

const originalLoadGameData = window.loadGameData;

window.loadGameData = function() {
    if (typeof loadGameDataExtended === 'function') {
        loadGameDataExtended();
    } else if (typeof originalLoadGameData === 'function') {
        originalLoadGameData();
    }
    
    // Load quest progress
    const questData = localStorage.getItem('manggroveQuests');
    if (questData) {
        const data = JSON.parse(questData);
        gameState.activeQuests = data.activeQuests || [];
        gameState.completedQuests = data.completedQuests || [];
    }
};

// ========== FIX: Enhanced building interactions ==========
document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT') return;

    // Check if near warung
    let nearWarung = false;
    buildings.forEach(building => {
        if (building.userData.type === 'warung') {
            const dist = Math.sqrt(
                Math.pow(building.position.x - player.position.x, 2) +
                Math.pow(building.position.z - player.position.z, 2)
            );
            if (dist < 5) nearWarung = true;
        }
    });

    // Check if near booth
    let nearBooth = false;
    buildings.forEach(building => {
        if (building.userData.type === 'booth') {
            const dist = Math.sqrt(
                Math.pow(building.position.x - player.position.x, 2) +
                Math.pow(building.position.z - player.position.z, 2)
            );
            if (dist < 5) nearBooth = true;
        }
    });

    // Override E key for warung/booth
    if (e.key.toLowerCase() === 'e' && (nearWarung || nearBooth)) {
        if (typeof openShop === 'function') {
            openShop();
            e.preventDefault();
        }
    }
});

// ========== FIX: Initialize on game start ==========
const originalInitGame = window.initGame;

window.initGame = function() {
    // Call original init
    if (typeof originalInitGame === 'function') {
        originalInitGame();
    }
    
    // Then add extended features
    setTimeout(() => {
        if (typeof initExtendedFeatures === 'function') {
            initExtendedFeatures();
            console.log('✅ Extended features initialized!');
        }
        
        // Update UI
        updateHUDExtended();
        
        // Start quest system
        if (typeof updateQuestUI === 'function') {
            updateQuestUI();
        }
    }, 500);
};

// ========== FIX: Mobile joystick controls ==========
document.querySelectorAll('.joystick-btn').forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const dir = btn.getAttribute('data-dir');
        keys[dir] = true;
    });
    
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        const dir = btn.getAttribute('data-dir');
        keys[dir] = false;
    });
});

// ========== FIX: Auto-update quest progress ==========
setInterval(() => {
    if (typeof checkQuests === 'function') {
        checkQuests();
    }
}, 5000); // Check every 5 seconds

// ========== FIX: Time played tracker ==========
setInterval(() => {
    if (gameState.volunteerName) {
        gameState.timePlayedMinutes += 1;
    }
}, 60000); // Every minute

// ========== HELPER: Easy access functions ==========
window.gameHelpers = {
    // Give coins
    addCoins: (amount) => {
        gameState.coins += amount;
        updateHUDExtended();
        notify(`💰 +${amount} koin!`, 'success');
    },
    
    // Give items
    addItems: (item, amount) => {
        if (gameState.inventory[item] !== undefined) {
            gameState.inventory[item] += amount;
            updateInventoryUI();
            notify(`✅ +${amount} ${item}!`, 'success');
        }
    },
    
    // Complete all quests (cheat)
    completeAllQuests: () => {
        gameState.activeQuests.forEach(quest => {
            completeQuest(quest);
        });
    },
    
    // Unlock all achievements
    unlockAllAchievements: () => {
        ACHIEVEMENTS.forEach(ach => {
            if (!gameState.achievements.includes(ach.id)) {
                gameState.achievements.push(ach.id);
            }
        });
        notify('🏆 Semua achievement terbuka!', 'success');
    },
    
    // Teleport
    teleport: (x, z) => {
        player.position.set(x, 0.9, z);
        camera.position.copy(player.position);
        camera.position.y += 1.8;
    },
    
    // Change weather
    setWeather: (weather) => {
        changeWeather(weather);
    },
    
    // Get stats
    getStats: () => {
        console.log('📊 Game Statistics:');
        console.log('👤 Volunteer:', gameState.volunteerName);
        console.log('🌳 Trees planted:', gameState.treesPlanted);
        console.log('💧 Trees watered:', gameState.treesWatered);
        console.log('📸 Photos taken:', gameState.photosTaken);
        console.log('💰 Coins:', gameState.coins);
        console.log('🚶 Distance walked:', Math.floor(gameState.distanceWalked), 'm');
        console.log('⏱️ Time played:', gameState.timePlayedMinutes, 'minutes');
        console.log('🐾 Pet:', gameState.pet.type);
        return gameState;
    }
};

// ========== CONSOLE HELPERS ==========
console.log(`
╔══════════════════════════════════════════════════════════╗
║   🔧 INTEGRATION PATCH LOADED SUCCESSFULLY! 🔧          ║
║                                                          ║
║   Semua fitur sudah terintegrasi dengan baik!           ║
║                                                          ║
║   🎮 Gunakan gameHelpers untuk cheat/debug:             ║
║   - gameHelpers.addCoins(1000)                          ║
║   - gameHelpers.addItems('seeds', 99)                   ║
║   - gameHelpers.completeAllQuests()                     ║
║   - gameHelpers.teleport(0, 100)                        ║
║   - gameHelpers.setWeather('rainy')                     ║
║   - gameHelpers.getStats()                              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);

// ========== READY TO PLAY! ==========
console.log('🌱 Game siap dimainkan! Selamat menanam manggrove! 🌱');