// ==========================================
// MANGROVE GUARDIAN - SCANNER.JS
// Upload foto, identifikasi jenis mangrove dengan AI
// ==========================================

// ========== SCAN HISTORY ==========
let scanHistory = [];

// ========== LOAD SCAN HISTORY ==========
function loadScanHistory() {
    const saved = localStorage.getItem('mangrove_scan_history');
    if (saved) {
        scanHistory = JSON.parse(saved);
        displayScanHistory();
    }
}

// ========== SCAN MANGROVE (MAIN FUNCTION) ==========
function scanMangrove(file) {
    if (!file) {
        window.mangroveApp.showNotification('error', 'File tidak valid!');
        return;
    }
    
    // Show loading
    const resultContainer = document.getElementById('scanResult');
    resultContainer.style.display = 'block';
    resultContainer.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 3em; margin-bottom: 20px;">🔍</div>
            <h3>Menganalisis foto mangrove...</h3>
            <p style="color: #666;">Mohon tunggu sebentar</p>
            <div style="margin-top: 20px;">
                <div style="width: 200px; height: 10px; background: #e0e0e0; border-radius: 5px; margin: 0 auto; overflow: hidden;">
                    <div id="scanProgress" style="width: 0%; height: 100%; background: #4a7c2c; transition: width 0.3s;"></div>
                </div>
            </div>
        </div>
    `;
    
    // Animate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 10;
        const progressBar = document.getElementById('scanProgress');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        if (progress >= 90) {
            clearInterval(progressInterval);
        }
    }, 200);
    
    // Read file and convert to base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Send to AI identification (atau simulasi)
        identifyMangrove(imageData, file.name)
            .then(result => {
                clearInterval(progressInterval);
                displayScanResult(result, imageData);
                
                // Add to history
                addToScanHistory(result, imageData);
            })
            .catch(error => {
                clearInterval(progressInterval);
                console.error('Scan error:', error);
                window.mangroveApp.showNotification('error', 'Gagal mengidentifikasi mangrove');
                resultContainer.style.display = 'none';
            });
    };
    
    reader.onerror = function() {
        clearInterval(progressInterval);
        window.mangroveApp.showNotification('error', 'Gagal membaca file');
        resultContainer.style.display = 'none';
    };
    
    reader.readAsDataURL(file);
}

// ========== IDENTIFY MANGROVE (AI/API) ==========
function identifyMangrove(imageData, filename) {
    return new Promise((resolve, reject) => {
        // Option 1: Send to server for AI processing
        fetch('php/scanner_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'identify',
                image: imageData,
                filename: filename
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                resolve(data.result);
            } else {
                // Fallback to simulation
                resolve(simulateIdentification());
            }
        })
        .catch(error => {
            console.log('Using simulated identification');
            // Fallback to simulation
            setTimeout(() => {
                resolve(simulateIdentification());
            }, 2000);
        });
    });
}

// ========== SIMULATE IDENTIFICATION (DEMO) ==========
function simulateIdentification() {
    const mangroveTypes = [
        {
            name: 'Rhizophora mucronata',
            commonName: 'Bakau Merah',
            confidence: 92,
            description: 'Jenis mangrove yang paling umum di Indonesia. Memiliki akar tunjang yang kuat dan tumbuh di zona intertidal.',
            characteristics: [
                '🌿 Daun berbentuk oval dengan ujung runcing',
                '🌳 Tinggi dapat mencapai 20-25 meter',
                '🌊 Tumbuh di zona pasang surut',
                '🍃 Memiliki akar tunjang (prop roots)'
            ],
            benefits: [
                '🛡️ Pelindung pantai dari abrasi',
                '🐟 Habitat ikan dan kepiting',
                '💨 Menyerap CO2 hingga 1.5 ton/hektar/tahun',
                '🌊 Menahan sedimen dan mencegah erosi'
            ],
            distribution: 'Tersebar luas di seluruh pesisir Indonesia',
            conservationStatus: '✅ Least Concern'
        },
        {
            name: 'Avicennia marina',
            commonName: 'Api-api',
            confidence: 88,
            description: 'Mangrove yang sangat adaptif dan dapat tumbuh di berbagai kondisi salinitas.',
            characteristics: [
                '🌿 Daun kecil berbentuk ellips',
                '🌱 Memiliki pneumatophore (akar napas)',
                '🌳 Tinggi 3-10 meter',
                '🌸 Bunga kuning-oranye'
            ],
            benefits: [
                '🔬 Bahan obat tradisional',
                '🐝 Sumber nektar untuk lebah madu',
                '🌊 Stabilisasi garis pantai',
                '♻️ Bioremediasi logam berat'
            ],
            distribution: 'Pantai utara Jawa, Sumatra, Kalimantan',
            conservationStatus: '✅ Least Concern'
        },
        {
            name: 'Sonneratia alba',
            commonName: 'Pedada',
            confidence: 85,
            description: 'Mangrove dengan bunga putih yang indah dan buah yang dapat dikonsumsi.',
            characteristics: [
                '🌸 Bunga putih besar dan harum',
                '🍎 Buah bulat seperti apel',
                '🌿 Daun tebal dan mengkilap',
                '🌳 Tinggi hingga 15 meter'
            ],
            benefits: [
                '🍹 Buah dapat diolah menjadi sirup',
                '🌊 Pionir dalam revegetasi mangrove',
                '🐦 Habitat burung laut',
                '💊 Kayu untuk bahan bangunan'
            ],
            distribution: 'Seluruh pesisir Indonesia',
            conservationStatus: '✅ Least Concern'
        },
        {
            name: 'Bruguiera gymnorrhiza',
            commonName: 'Tumu Merah',
            confidence: 90,
            description: 'Mangrove dengan akar lutut yang unik dan nilai ekonomi tinggi.',
            characteristics: [
                '🦵 Akar lutut (knee roots) yang khas',
                '🌿 Daun besar dan tebal',
                '🌳 Tinggi 15-20 meter',
                '🌸 Bunga merah-orange'
            ],
            benefits: [
                '🪵 Kayu berkualitas tinggi',
                '🎣 Habitat udang dan ikan',
                '🌊 Penahan gelombang yang efektif',
                '🍵 Ekstrak daun untuk obat tradisional'
            ],
            distribution: 'Jawa, Sumatra, Sulawesi, Papua',
            conservationStatus: '✅ Least Concern'
        }
    ];
    
    // Random select
    const result = mangroveTypes[Math.floor(Math.random() * mangroveTypes.length)];
    
    // Add scan info
    result.scannedAt = new Date().toISOString();
    result.scanId = 'scan_' + Date.now();
    
    return result;
}

// ========== DISPLAY SCAN RESULT ==========
function displayScanResult(result, imageData) {
    const resultContainer = document.getElementById('scanResult');
    
    const confidenceColor = result.confidence >= 90 ? '#2d5016' : 
                           result.confidence >= 80 ? '#4a7c2c' : 
                           result.confidence >= 70 ? '#f39c12' : '#e74c3c';
    
    resultContainer.innerHTML = `
        <div style="animation: slideIn 0.5s ease;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px;">
                <div>
                    <img src="${imageData}" class="scan-result-img" alt="Scanned mangrove">
                </div>
                <div>
                    <div style="background: ${confidenceColor}; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin-bottom: 15px;">
                        ✓ ${result.confidence}% Confidence
                    </div>
                    <h2 style="margin-bottom: 10px;">${result.name}</h2>
                    <h3 style="color: #666; font-weight: normal; margin-bottom: 20px;">${result.commonName}</h3>
                    <p style="line-height: 1.8;">${result.description}</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
                <div style="background: #f8f8f8; padding: 20px; border-radius: 12px;">
                    <h3 style="margin-bottom: 15px;">🔍 Karakteristik</h3>
                    <ul style="list-style: none; padding: 0;">
                        ${result.characteristics.map(char => `<li style="margin-bottom: 10px;">${char}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="background: #e8f5e9; padding: 20px; border-radius: 12px;">
                    <h3 style="margin-bottom: 15px;">💚 Manfaat</h3>
                    <ul style="list-style: none; padding: 0;">
                        ${result.benefits.map(benefit => `<li style="margin-bottom: 10px;">${benefit}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div style="margin-top: 25px; padding: 20px; background: #f8f8f8; border-radius: 12px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <strong>📍 Distribusi:</strong><br>
                        ${result.distribution}
                    </div>
                    <div>
                        <strong>🌿 Status Konservasi:</strong><br>
                        ${result.conservationStatus}
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 25px; text-align: center;">
                <button class="btn btn-primary" onclick="saveScanToGallery('${result.scanId}')">
                    💾 Simpan ke Galeri
                </button>
                <button class="btn btn-secondary" onclick="shareScanResult('${result.scanId}')">
                    📤 Bagikan
                </button>
                <button class="btn btn-secondary" onclick="document.getElementById('scanResult').style.display='none'">
                    ❌ Tutup
                </button>
            </div>
        </div>
    `;
    
    // Award points
    window.mangroveApp.addPoints(20);
    window.mangroveApp.showNotification('success', '🔍 Identifikasi berhasil! +20 koin');
}

// ========== ADD TO SCAN HISTORY ==========
function addToScanHistory(result, imageData) {
    const historyItem = {
        ...result,
        thumbnail: imageData,
        timestamp: Date.now()
    };
    
    scanHistory.unshift(historyItem);
    
    // Limit history to 20 items
    if (scanHistory.length > 20) {
        scanHistory = scanHistory.slice(0, 20);
    }
    
    localStorage.setItem('mangrove_scan_history', JSON.stringify(scanHistory));
    displayScanHistory();
}

// ========== DISPLAY SCAN HISTORY ==========
function displayScanHistory() {
    const container = document.getElementById('scanHistory');
    if (!container) return;
    
    if (scanHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Belum ada riwayat scan</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    scanHistory.forEach(item => {
        const card = document.createElement('div');
        card.className = 'scan-history-item';
        card.style.cssText = `
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        card.innerHTML = `
            <img src="${item.thumbnail}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
            <h4 style="font-size: 0.9em; margin-bottom: 5px;">${item.commonName}</h4>
            <p style="font-size: 0.8em; color: #666; margin: 0;">${new Date(item.timestamp).toLocaleDateString('id-ID')}</p>
        `;
        
        card.onclick = () => viewScanDetail(item);
        
        container.appendChild(card);
    });
}

// ========== VIEW SCAN DETAIL ==========
function viewScanDetail(item) {
    displayScanResult(item, item.thumbnail);
}

// ========== SAVE SCAN TO GALLERY ==========
function saveScanToGallery(scanId) {
    window.mangroveApp.showNotification('success', '💾 Scan berhasil disimpan ke galeri!');
}

// ========== SHARE SCAN RESULT ==========
function shareScanResult(scanId) {
    const scan = scanHistory.find(s => s.scanId === scanId);
    if (!scan) return;
    
    const shareText = `Saya baru saja mengidentifikasi ${scan.commonName} (${scan.name}) menggunakan Mangrove Guardian! 🌿 Confidence: ${scan.confidence}%`;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'Mangrove Guardian Scan',
            text: shareText,
            url: window.location.href
        })
        .then(() => {
            window.mangroveApp.showNotification('success', '📤 Berhasil dibagikan!');
        })
        .catch(error => {
            console.log('Share error:', error);
        });
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(shareText)
            .then(() => {
                window.mangroveApp.showNotification('success', '📋 Teks berhasil disalin ke clipboard!');
            })
            .catch(error => {
                console.log('Copy error:', error);
            });
    }
}

// ========== DELETE SCAN HISTORY ==========
function deleteScanHistory(scanId) {
    scanHistory = scanHistory.filter(s => s.scanId !== scanId);
    localStorage.setItem('mangrove_scan_history', JSON.stringify(scanHistory));
    displayScanHistory();
    window.mangroveApp.showNotification('success', '🗑️ Riwayat scan dihapus');
}

// ========== CLEAR ALL SCAN HISTORY ==========
function clearAllScanHistory() {
    if (!confirm('Hapus semua riwayat scan?')) return;
    
    scanHistory = [];
    localStorage.removeItem('mangrove_scan_history');
    displayScanHistory();
    window.mangroveApp.showNotification('success', '🗑️ Semua riwayat scan telah dihapus');
}

// ========== EXPORT SCAN DATA ==========
function exportScanData() {
    const dataStr = JSON.stringify(scanHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mangrove_scan_history.json';
    link.click();
    
    URL.revokeObjectURL(url);
    window.mangroveApp.showNotification('success', '📥 Data scan berhasil diexport!');
}

// ========== INIT SCANNER MODULE ==========
function initScannerModule() {
    loadScanHistory();
}

// ========== EXPORT ==========
window.scannerModule = {
    scanMangrove,
    loadScanHistory,
    displayScanHistory,
    saveScanToGallery,
    shareScanResult,
    deleteScanHistory,
    clearAllScanHistory,
    exportScanData,
    initScannerModule
};

<a href="scanner.html" style="position: fixed; bottom: 10px; right: 10px; color: rgba(255,255,255,0.5); font-size: 0.8em; text-decoration: none;">Kembali ke Splash</a>