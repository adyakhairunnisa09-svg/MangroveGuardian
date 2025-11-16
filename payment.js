// ==========================================
// MANGROVE GUARDIAN - PAYMENT.JS
// Payment system: Dana, GoPay, OVO, ShopeePay
// ==========================================

// ========== PAYMENT DATA ==========
let currentPaymentItem = null;

// ========== OPEN PAYMENT MODAL ==========
function openPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.add('show');
    }
}

// ========== CLOSE PAYMENT MODAL ==========
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('show');
    }
    currentPaymentItem = null;
}

// ========== BUY ITEM (FROM SHOP) ==========
function buyItem(itemName, price) {
    currentPaymentItem = {
        name: itemName,
        price: price,
        type: 'shop_item'
    };
    
    // Update payment info display
    const infoContainer = document.getElementById('paymentItemInfo');
    if (infoContainer) {
        infoContainer.innerHTML = `
            <h3>${itemName}</h3>
            <p style="font-size: 1.3em; font-weight: bold; color: #2d5016;">
                💰 ${price} Koin
            </p>
        `;
    }
    
    openPaymentModal();
}

// ========== SELECT PAYMENT METHOD ==========
function selectPayment(method) {
    if (!currentPaymentItem) {
        window.mangroveApp.showNotification('error', 'Item tidak valid!');
        return;
    }
    
    // Convert koin to rupiah (1 koin = Rp 100)
    const amountIDR = currentPaymentItem.price * 100;
    
    window.mangroveApp.showNotification('info', `Processing payment via ${method.toUpperCase()}...`);
    
    // Process payment
    processPayment({
        method: method,
        item: currentPaymentItem,
        amount: amountIDR,
        currency: 'IDR'
    });
}

// ========== PAY WITH COINS ==========
function payWithCoins() {
    if (!currentPaymentItem) {
        window.mangroveApp.showNotification('error', 'Item tidak valid!');
        return;
    }
    
    const userData = window.mangroveApp.userData;
    
    // Check if user has enough coins
    if (userData.points < currentPaymentItem.price) {
        window.mangroveApp.showNotification('error', `Koin tidak cukup! Anda butuh ${currentPaymentItem.price - userData.points} koin lagi.`);
        return;
    }
    
    // Deduct coins
    userData.points -= currentPaymentItem.price;
    
    // Add item to equipped items if it's shop item
    if (currentPaymentItem.type === 'shop_item') {
        if (!userData.equippedItems) {
            userData.equippedItems = [];
        }
        userData.equippedItems.push({
            name: currentPaymentItem.name,
            purchasedAt: Date.now()
        });
    }
    
    window.mangroveApp.saveUserData();
    window.mangroveApp.showNotification('success', `✅ Berhasil membeli ${currentPaymentItem.name}!`);
    
    closePaymentModal();
    
    // Reload shop if on shop page
    if (typeof loadShopItems === 'function') {
        loadShopItems();
    }
}

// ========== PROCESS PAYMENT ==========
function processPayment(paymentData) {
    // Show loading
    window.mangroveApp.showNotification('info', 'Memproses pembayaran...');
    
    // Send to server
    fetch('php/payment.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'create_payment',
            userId: window.mangroveApp.userData.id,
            payment: paymentData
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Payment URL received
            handlePaymentResponse(data);
        } else {
            window.mangroveApp.showNotification('error', data.message || 'Payment gagal!');
        }
    })
    .catch(error => {
        console.error('Payment error:', error);
        
        // DEMO MODE - Simulate successful payment
        simulatePaymentSuccess(paymentData);
    });
}

// ========== HANDLE PAYMENT RESPONSE ==========
function handlePaymentResponse(data) {
    if (data.paymentUrl) {
        // Open payment URL in new window
        const paymentWindow = window.open(data.paymentUrl, 'payment', 'width=600,height=800');
        
        // Check payment status
        checkPaymentStatus(data.transactionId, paymentWindow);
    } else if (data.qrCode) {
        // Show QR Code for payment
        showQRCodePayment(data.qrCode, data.transactionId);
    }
}

// ========== CHECK PAYMENT STATUS ==========
function checkPaymentStatus(transactionId, paymentWindow) {
    const checkInterval = setInterval(() => {
        // Check if payment window closed
        if (paymentWindow && paymentWindow.closed) {
            clearInterval(checkInterval);
            window.mangroveApp.showNotification('info', 'Payment window closed');
            closePaymentModal();
            return;
        }
        
        // Check payment status from server
        fetch(`php/payment.php?action=check_status&transactionId=${transactionId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    clearInterval(checkInterval);
                    if (paymentWindow) paymentWindow.close();
                    
                    handleSuccessfulPayment(data);
                } else if (data.status === 'failed') {
                    clearInterval(checkInterval);
                    if (paymentWindow) paymentWindow.close();
                    
                    window.mangroveApp.showNotification('error', 'Pembayaran gagal!');
                    closePaymentModal();
                }
            })
            .catch(error => {
                console.error('Error checking payment:', error);
            });
    }, 3000); // Check every 3 seconds
    
    // Stop checking after 5 minutes
    setTimeout(() => {
        clearInterval(checkInterval);
    }, 300000);
}

// ========== SHOW QR CODE PAYMENT ==========
function showQRCodePayment(qrCodeUrl, transactionId) {
    const modalBody = document.querySelector('#paymentModal .modal-body');
    
    if (modalBody) {
        modalBody.innerHTML = `
            <div style="text-align: center;">
                <h3>Scan QR Code untuk Pembayaran</h3>
                <img src="${qrCodeUrl}" alt="QR Code" style="width: 300px; height: 300px; margin: 20px auto;">
                <p>Scan dengan aplikasi e-wallet Anda</p>
                <div id="paymentTimer" style="font-size: 1.2em; color: #e74c3c; margin: 20px 0;">
                    Waktu tersisa: <span id="timerDisplay">10:00</span>
                </div>
                <button class="btn btn-secondary" onclick="closePaymentModal()">Batal</button>
            </div>
        `;
        
        // Start timer
        startPaymentTimer(600, transactionId); // 10 minutes
        
        // Start checking payment status
        checkPaymentStatus(transactionId, null);
    }
}

// ========== START PAYMENT TIMER ==========
function startPaymentTimer(seconds, transactionId) {
    const timerDisplay = document.getElementById('timerDisplay');
    let remainingTime = seconds;
    
    const timerInterval = setInterval(() => {
        remainingTime--;
        
        const minutes = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        
        if (timerDisplay) {
            timerDisplay.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
        
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            window.mangroveApp.showNotification('error', 'Waktu pembayaran habis!');
            closePaymentModal();
        }
    }, 1000);
}

// ========== HANDLE SUCCESSFUL PAYMENT ==========
function handleSuccessfulPayment(data) {
    const userData = window.mangroveApp.userData;
    
    // Add coins if it's a coin purchase
    if (data.type === 'coins') {
        userData.points += data.amount;
        window.mangroveApp.saveUserData();
        window.mangroveApp.showNotification('success', `🎉 Berhasil! +${data.amount} koin ditambahkan!`);
    }
    
    // Add item if it's shop item purchase
    if (data.type === 'shop_item' && currentPaymentItem) {
        if (!userData.equippedItems) {
            userData.equippedItems = [];
        }
        userData.equippedItems.push({
            name: currentPaymentItem.name,
            purchasedAt: Date.now()
        });
        window.mangroveApp.saveUserData();
        window.mangroveApp.showNotification('success', `✅ Berhasil membeli ${currentPaymentItem.name}!`);
    }
    
    closePaymentModal();
    
    // Reload relevant sections
    if (typeof loadShopItems === 'function') {
        loadShopItems();
    }
}

// ========== SIMULATE PAYMENT SUCCESS (DEMO MODE) ==========
function simulatePaymentSuccess(paymentData) {
    window.mangroveApp.showNotification('info', '🔧 DEMO MODE: Simulasi pembayaran...');
    
    setTimeout(() => {
        const userData = window.mangroveApp.userData;
        
        if (paymentData.type === 'coins') {
            userData.points += paymentData.amount;
            window.mangroveApp.saveUserData();
            window.mangroveApp.showNotification('success', `✅ DEMO: +${paymentData.amount} koin ditambahkan!`);
        } else if (currentPaymentItem) {
            if (!userData.equippedItems) {
                userData.equippedItems = [];
            }
            userData.equippedItems.push({
                name: currentPaymentItem.name,
                purchasedAt: Date.now()
            });
            window.mangroveApp.saveUserData();
            window.mangroveApp.showNotification('success', `✅ DEMO: Berhasil membeli ${currentPaymentItem.name}!`);
        }
        
        closePaymentModal();
        
        if (typeof loadShopItems === 'function') {
            loadShopItems();
        }
    }, 2000);
}

// ========== PAYMENT HISTORY ==========
function getPaymentHistory() {
    fetch(`php/payment.php?action=get_history&userId=${window.mangroveApp.userData.id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayPaymentHistory(data.history);
            }
        })
        .catch(error => {
            console.error('Error loading payment history:', error);
        });
}

// ========== DISPLAY PAYMENT HISTORY ==========
function displayPaymentHistory(history) {
    // This can be displayed in a modal or section
    console.log('Payment History:', history);
}

// ========== REFUND REQUEST ==========
function requestRefund(transactionId) {
    if (!confirm('Apakah Anda yakin ingin mengajukan refund?')) {
        return;
    }
    
    fetch('php/payment.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'request_refund',
            transactionId: transactionId,
            userId: window.mangroveApp.userData.id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.mangroveApp.showNotification('success', 'Permintaan refund berhasil diajukan!');
        } else {
            window.mangroveApp.showNotification('error', data.message || 'Refund gagal!');
        }
    })
    .catch(error => {
        console.error('Refund error:', error);
        window.mangroveApp.showNotification('error', 'Terjadi kesalahan saat mengajukan refund');
    });
}

// ========== VALIDATE PAYMENT ==========
function validatePayment(paymentData) {
    if (!paymentData.amount || paymentData.amount <= 0) {
        return { valid: false, message: 'Jumlah pembayaran tidak valid' };
    }
    
    if (!paymentData.method) {
        return { valid: false, message: 'Metode pembayaran belum dipilih' };
    }
    
    return { valid: true };
}

// ========== FORMAT CURRENCY ==========
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// ========== PAYMENT METHODS INFO ==========
const PAYMENT_METHODS = {
    dana: {
        name: 'DANA',
        icon: '💵',
        minAmount: 10000,
        maxAmount: 10000000,
        fee: 0
    },
    gopay: {
        name: 'GoPay',
        icon: '💰',
        minAmount: 10000,
        maxAmount: 10000000,
        fee: 0
    },
    ovo: {
        name: 'OVO',
        icon: '💳',
        minAmount: 10000,
        maxAmount: 10000000,
        fee: 0
    },
    shopeepay: {
        name: 'ShopeePay',
        icon: '🛒',
        minAmount: 10000,
        maxAmount: 10000000,
        fee: 0
    }
};

// ========== GET PAYMENT METHOD INFO ==========
function getPaymentMethodInfo(method) {
    return PAYMENT_METHODS[method] || null;
}

// ========== CALCULATE TOTAL WITH FEE ==========
function calculateTotalWithFee(amount, method) {
    const methodInfo = getPaymentMethodInfo(method);
    if (!methodInfo) return amount;
    
    return amount + methodInfo.fee;
}

// ========== EXPORT ==========
window.paymentModule = {
    openPaymentModal,
    closePaymentModal,
    buyItem,
    selectPayment,
    payWithCoins,
    processPayment,
    getPaymentHistory,
    requestRefund,
    formatCurrency,
    getPaymentMethodInfo
};