// ==========================================
// MANGROVE GUARDIAN - CHATBOT.JS
// AI Assistant untuk tanya jawab mangrove
// ==========================================

// ========== CHAT DATA ==========
let chatMessages = [];

// ========== KNOWLEDGE BASE ==========
const mangroveKnowledge = {
    greeting: [
        "Halo! 👋 Saya AI Assistant Mangrove Guardian. Ada yang bisa saya bantu?",
        "Hi! 🌿 Senang bertemu dengan Anda. Mau tanya tentang mangrove?",
        "Selamat datang! 🌱 Saya siap membantu Anda belajar tentang mangrove!"
    ],
    
    about_mangrove: {
        keywords: ["apa itu mangrove", "pengertian mangrove", "definisi mangrove", "mangrove adalah"],
        response: "Mangrove adalah ekosistem unik yang tumbuh di zona intertidal (antara pasang surut air laut). Mangrove memiliki akar khusus yang kuat dan dapat mentolerir air asin. Di Indonesia, terdapat 202 jenis mangrove dari 89 spesies! 🌳\n\nMangrove sangat penting karena:\n🛡️ Melindungi pantai dari abrasi dan tsunami\n🐟 Habitat ikan, kepiting, dan udang\n💨 Menyerap CO2 4x lebih banyak dari hutan daratan\n🌊 Menyaring air dan mencegah polusi"
    },
    
    types: {
        keywords: ["jenis mangrove", "tipe mangrove", "spesies mangrove", "macam mangrove"],
        response: "Di Indonesia ada 4 jenis mangrove yang paling umum:\n\n🌳 **Rhizophora (Bakau)** - Punya akar tunjang, paling banyak di Indonesia\n🌿 **Avicennia (Api-api)** - Punya akar napas, tahan salinitas tinggi\n🌸 **Sonneratia (Pedada)** - Bunga putih cantik, buahnya bisa dimakan\n🦵 **Bruguiera (Tumu)** - Punya akar lutut yang unik\n\nGunakan fitur Scanner untuk identifikasi jenis mangrove dari foto! 📷"
    },
    
    benefits: {
        keywords: ["manfaat mangrove", "kegunaan mangrove", "fungsi mangrove"],
        response: "Mangrove punya banyak manfaat luar biasa! 💚\n\n**Ekologi:**\n🌊 Pelindung pantai dari abrasi & tsunami\n🐠 Nursery ground untuk ikan & udang\n🦀 Habitat kepiting & biota laut\n🌱 Menjaga kualitas air\n\n**Ekonomi:**\n🎣 Mendukung industri perikanan\n🍯 Sumber madu lebah\n🪵 Kayu berkualitas tinggi\n🍎 Buah pedada untuk sirup\n\n**Iklim:**\n💨 Menyerap CO2 1.5 ton/hektar/tahun\n♻️ Mitigasi perubahan iklim\n🌡️ Menurunkan suhu pesisir"
    },
    
    threats: {
        keywords: ["ancaman mangrove", "bahaya mangrove", "kerusakan mangrove", "hilang"],
        response: "Sayangnya, mangrove menghadapi banyak ancaman: 😢\n\n⚠️ **Konversi lahan** - Dijadikan tambak, perumahan, industri\n🏗️ **Pembangunan pesisir** - Reklamasi pantai\n🌊 **Perubahan iklim** - Kenaikan muka air laut\n🗑️ **Polusi** - Sampah plastik & limbah industri\n🪓 **Penebangan liar** - Untuk kayu bakar\n\nSetiap tahun Indonesia kehilangan ~2% mangrove. Yuk bantu konservasi dengan adopsi mangrove! 🌱"
    },
    
    conservation: {
        keywords: ["konservasi", "pelestarian", "rehabilitasi", "restorasi", "cara melestarikan"],
        response: "Cara melestarikan mangrove: 🌿\n\n**Yang bisa kamu lakukan:**\n✅ Adopsi mangrove lewat Real Impact Zone\n✅ Ikut kegiatan penanaman mangrove\n✅ Kurangi sampah plastik di pantai\n✅ Edukasi teman & keluarga\n✅ Dukung produk ramah mangrove\n\n**Di aplikasi ini:**\n🌱 Tanam mangrove virtual di garden\n📷 Gunakan scanner untuk belajar jenis mangrove\n🗺️ Pantau kesehatan mangrove di peta\n\nSetiap aksi kecil membuat perbedaan besar! 💪"
    },
    
    locations: {
        keywords: ["lokasi mangrove", "dimana mangrove", "tempat mangrove", "daerah mangrove"],
        response: "Lokasi konservasi mangrove di Indonesia: 📍\n\n**Yang tersedia di app:**\n🏝️ **Pulau Tunda, Banten** - Ekosistem mangrove yang masih alami\n🌊 **Pulau Panjang, Jepara** - Kawasan pesisir dengan mangrove luas\n🏖️ **Kepulauan Seribu, Jakarta** - Program rehabilitasi mangrove aktif\n\n**Daerah lain dengan mangrove:**\n- Papua (terluas di Indonesia)\n- Kalimantan (Berau, Sambas)\n- Sumatra (Riau, Aceh)\n- Sulawesi (Gorontalo)\n\nCek Health Map untuk lihat sebaran mangrove! 🗺️"
    },
    
    how_to_play: {
        keywords: ["cara main", "cara bermain", "tutorial", "panduan", "bagaimana main"],
        response: "Cara bermain Mangrove Guardian: 🎮\n\n**1. Real Impact Zone** 🌍\nAdopsi mangrove asli di lokasi nyata, dapat foto progress!\n\n**2. Virtual Garden** 🌳\nTanam & rawat mangrove virtual, kumpulkan koin, naik level!\n\n**3. Visit Friends** 👥\nKunjungi garden teman, siram buat dapat bonus koin!\n\n**4. Scanner** 📷\nUpload foto mangrove untuk identifikasi jenis dengan AI!\n\n**5. Shop** 🛍️\nBeli kostum & aksesori untuk avatar pakai koin atau e-wallet!\n\n**Tips:**\n💧 Siram garden tiap hari\n🎁 Panen koin dari mangrove dewasa\n🏆 Lihat leaderboard untuk tantangan!"
    },
    
    coins: {
        keywords: ["koin", "poin", "dapat koin", "cara dapat koin", "points"],
        response: "Cara mendapatkan koin: 🪙\n\n**Aktivitas Harian:**\n🌱 Tanam mangrove: +10 koin\n💧 Siram garden: +5 koin\n🎁 Panen mangrove dewasa: +15-20 koin\n📷 Scan mangrove: +20 koin\n💬 Chat dengan AI: +5 koin\n\n**Multiplayer:**\n👥 Siram garden teman: +10 koin\n🏆 Ranking leaderboard: bonus koin!\n\n**Special:**\n🌍 Adopsi mangrove real: +50 koin\n⬆️ Level up: +100 koin\n\n**Beli Koin:**\nKlik tombol \"Top Up\" pakai Dana/GoPay/OVO! 💰"
    },
    
    payment: {
        keywords: ["bayar", "payment", "dana", "gopay", "ovo", "shopeepay", "e-wallet"],
        response: "Metode pembayaran yang tersedia: 💳\n\n💵 **DANA** - Transfer instan\n💰 **GoPay** - Cashback tersedia\n💳 **OVO** - Points reward\n🛒 **ShopeePay** - Promo spesial\n\n**Paket Top Up Koin:**\n🪙 100 koin = Rp 10.000\n🪙 500 koin = Rp 45.000 (bonus +50!)\n🪙 1000 koin = Rp 85.000 (bonus +150!)\n\nSemua transaksi aman & terenkripsi! 🔒"
    },
    
    avatar: {
        keywords: ["avatar", "kostum", "aksesori", "baju", "topi", "customize"],
        response: "Customize avatar kamu! 👤\n\n**Item yang tersedia:**\n🎩 Topi (Safari, Petani, dll)\n👕 Baju (Kaos Konservasi, dll)\n🕶️ Aksesoris (Kacamata, Tas, dll)\n👟 Sepatu (Boots, Sneakers, dll)\n\n**Cara beli:**\n1. Buka Avatar Shop 🛍️\n2. Pilih item yang diinginkan\n3. Bayar pakai koin atau e-wallet\n4. Klik avatar untuk customize!\n\nTampil keren sambil selamatkan mangrove! 😎"
    }
};

// ========== HANDLE CHAT MESSAGE ==========
function handleChatMessage(message) {
    if (!message || message.trim() === '') return;
    
    // Add user message
    addChatMessage('user', message);
    
    // Process and get bot response
    setTimeout(() => {
        const response = getBotResponse(message.toLowerCase());
        addChatMessage('bot', response);
        
        // Award points for using chat
        if (Math.random() > 0.7) {
            window.mangroveApp.addPoints(5);
        }
    }, 500);
}

// ========== GET BOT RESPONSE ==========
function getBotResponse(message) {
    // Check for greetings
    if (message.match(/^(hi|halo|hai|hello|hey|selamat)/i)) {
        return mangroveKnowledge.greeting[Math.floor(Math.random() * mangroveKnowledge.greeting.length)];
    }
    
    // Check for thanks
    if (message.match(/(terima kasih|thanks|thank you|makasih)/i)) {
        return "Sama-sama! 😊 Senang bisa membantu. Ada pertanyaan lain tentang mangrove?";
    }
    
    // Check for help
    if (message.match(/(help|bantuan|tolong)/i)) {
        return "Tentu! Saya bisa membantu dengan:\n\n📚 Informasi tentang mangrove\n🎮 Cara bermain game\n🪙 Cara dapat koin\n🛍️ Cara beli item di shop\n📷 Cara gunakan scanner\n🗺️ Info lokasi konservasi\n\nSilakan tanya apa saja! 😊";
    }
    
    // Search in knowledge base
    for (let topic in mangroveKnowledge) {
        const data = mangroveKnowledge[topic];
        if (data.keywords) {
            for (let keyword of data.keywords) {
                if (message.includes(keyword)) {
                    return data.response;
                }
            }
        }
    }
    
    // Default response with suggestions
    return "Hmm, saya belum paham pertanyaan Anda. 🤔\n\nCoba tanya tentang:\n• Apa itu mangrove?\n• Jenis-jenis mangrove\n• Manfaat mangrove\n• Cara bermain game\n• Cara dapat koin\n• Lokasi konservasi\n\nAtau ketik 'help' untuk melihat semua yang bisa saya bantu! 😊";
}

// ========== ADD CHAT MESSAGE ==========
function addChatMessage(sender, text) {
    const chatMessagesContainer = document.getElementById('chatMessages');
    if (!chatMessagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    if (sender === 'bot') {
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <strong>Mangrove Bot</strong>
                <p>${text.replace(/\n/g, '<br>')}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar" style="background: #2d5016;">👤</div>
            <div class="message-content">
                <strong>Anda</strong>
                <p>${text}</p>
            </div>
        `;
    }
    
    chatMessagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    
    // Save to history
    chatMessages.push({
        sender: sender,
        text: text,
        timestamp: Date.now()
    });
    
    // Save to localStorage
    localStorage.setItem('mangrove_chat', JSON.stringify(chatMessages));
}

// ========== LOAD CHAT HISTORY ==========
function loadChatHistory() {
    const saved = localStorage.getItem('mangrove_chat');
    if (saved) {
        chatMessages = JSON.parse(saved);
        
        // Display only last 10 messages
        const recentMessages = chatMessages.slice(-10);
        recentMessages.forEach(msg => {
            addChatMessage(msg.sender, msg.text);
        });
    }
}

// ========== CLEAR CHAT ==========
function clearChat() {
    if (!confirm('Hapus semua riwayat chat?')) return;
    
    chatMessages = [];
    localStorage.removeItem('mangrove_chat');
    
    const chatMessagesContainer = document.getElementById('chatMessages');
    if (chatMessagesContainer) {
        chatMessagesContainer.innerHTML = `
            <div class="chat-message bot">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <strong>Mangrove Bot</strong>
                    <p>Chat telah direset. Halo! Ada yang bisa saya bantu? 🌿</p>
                </div>
            </div>
        `;
    }
    
    window.mangroveApp.showNotification('success', '🗑️ Chat history cleared');
}

// ========== QUICK REPLIES ==========
function showQuickReplies() {
    const quickReplies = [
        "Apa itu mangrove?",
        "Jenis-jenis mangrove",
        "Cara bermain",
        "Cara dapat koin",
        "Manfaat mangrove"
    ];
    
    return quickReplies;
}

// ========== SEND QUICK REPLY ==========
function sendQuickReply(text) {
    const input = document.getElementById('chatInput');
    if (input) {
        input.value = text;
        handleChatMessage(text);
        input.value = '';
    }
}

// ========== EXPORT CHAT ==========
function exportChat() {
    const chatText = chatMessages.map(msg => 
        `[${new Date(msg.timestamp).toLocaleString('id-ID')}] ${msg.sender === 'bot' ? 'Bot' : 'Anda'}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mangrove_chat_history.txt';
    link.click();
    
    URL.revokeObjectURL(url);
    window.mangroveApp.showNotification('success', '📥 Chat history exported!');
}

// ========== INIT CHATBOT ==========
function initChatbot() {
    // Load chat history if exists
    // loadChatHistory(); // Optional: comment out to start fresh each time
}

// ========== EXPORT ==========
window.chatbotModule = {
    handleChatMessage,
    addChatMessage,
    loadChatHistory,
    clearChat,
    showQuickReplies,
    sendQuickReply,
    exportChat,
    initChatbot
};