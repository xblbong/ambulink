const toggleBtn = document.getElementById("chatbotToggle");
const chatbotWindow = document.getElementById("chatbotWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const closeBtn = document.getElementById("chatbotClose");
const typingIndicator = document.getElementById("typingIndicator");

toggleBtn.addEventListener("click", toggleChatbot);

function toggleChatbot() {
    chatbotWindow.classList.toggle("hidden");
    if (!chatbotWindow.classList.contains("hidden")) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

closeBtn.addEventListener("click", () => {
    chatbotWindow.classList.add("hidden");
});

function saveChat() {
    localStorage.setItem("chatHistory", chatMessages.innerHTML);
}

function showTypingIndicator() {
    typingIndicator.classList.remove("hidden");
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    typingIndicator.classList.add("hidden");
}

function formatMessageContent(content) {
    // Format numbered lists
    content = content.replace(/(\d+\. .*?)(?=\n\d+\.|$)/g, '<div class="mb-2">$1</div>');
    
    // Format bullet points
    content = content.replace(/[•●] (.*?)(?=\n[•●]|$)/g, '<div class="flex items-start mb-2"><span class="mr-2">•</span><span>$1</span></div>');
    
    // Format sections with emojis
    content = content.replace(/([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}])\s([^\n]+)/gu, '<div class="flex items-start mb-2"><span class="mr-2">$1</span><span>$2</span></div>');
    
    // Add spacing after paragraphs
    content = content.replace(/\n\n/g, '</div><div class="mt-3">');
    
    return content;
}

function appendMessage(content, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "flex items-start space-x-3 mb-4 animate-fade-in";

    const formattedContent = formatMessageContent(content);

    if (sender === "user") {
        messageDiv.innerHTML = `
            <div class="ml-auto flex items-start space-x-3">
                <div class="bg-[#AA1919] text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm">
                    <div class="prose prose-sm prose-invert">
                        ${formattedContent}
                    </div>
                </div>
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                    <i class="fas fa-user text-sm"></i>
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-[#AA1919] flex items-center justify-center text-white flex-shrink-0">
                <i class="fas fa-robot text-sm"></i>
            </div>
            <div class="bg-gray-100 rounded-2xl rounded-tl-none p-4 max-w-[80%] shadow-sm">
                <div class="prose prose-sm">
                    ${formattedContent}
                </div>
            </div>
        `;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    saveChat();
}

function createSuggestionButtons(suggestions) {
    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "flex flex-wrap gap-2 mt-4";
    
    suggestions.forEach(suggestion => {
        const button = document.createElement("button");
        button.className = "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2 hover:border-[#AA1919]";
        
        // Add relevant icon based on suggestion content
        let icon = "fas fa-arrow-right";
        if (suggestion.toLowerCase().includes("login")) icon = "fas fa-sign-in-alt";
        if (suggestion.toLowerCase().includes("cari")) icon = "fas fa-search";
        if (suggestion.toLowerCase().includes("kontak") || suggestion.toLowerCase().includes("darurat")) icon = "fas fa-phone";
        if (suggestion.toLowerCase().includes("review")) icon = "fas fa-star";
        if (suggestion.toLowerCase().includes("tambah")) icon = "fas fa-plus";
        if (suggestion.toLowerCase().includes("lokasi")) icon = "fas fa-map-marker-alt";
        
        button.innerHTML = `<i class="${icon}"></i>${suggestion}`;
        button.onclick = () => {
            chatInput.value = suggestion;
            chatForm.dispatchEvent(new Event('submit'));
        };
        buttonsDiv.appendChild(button);
    });
    
    return buttonsDiv;
}

function getBotResponse(msg) {
    const m = msg.toLowerCase().trim();
    
    // Common greetings
    if (["halo", "hai", "hi", "helo", "selamat pagi", "selamat siang", "selamat malam"].includes(m)) {
        return {
            message: "Halo! Saya AmbuBot, asisten virtual AmbuLink. Ada yang bisa saya bantu? 😊",
            suggestions: [
                "Cara mencari ambulans",
                "Bagaimana cara review",
                "Kontak darurat",
                "Tambah ambulans"
            ]
        };
    }

    // Ambulance related
    if (m.includes("tambah ambulans") || m.includes("menambahkan ambulans") || m.includes("daftar ambulans")) {
        return {
            message: `Untuk menambahkan ambulans ke sistem kami, Anda memiliki beberapa opsi:

1. 📧 Email admin@ambulink.id
2. 🖥️ Gunakan fitur "Tambah Ambulans" di dashboard (perlu login)
3. 📱 Hubungi tim support di WhatsApp

Pilih metode yang paling nyaman untuk Anda.`,
            suggestions: [
                "Cara login",
                "Kontak support",
                "Persyaratan pendaftaran"
            ]
        };
    }

    if (m.includes("cari") && m.includes("ambulans")) {
        return {
            message: `Untuk mencari ambulans terdekat, ikuti langkah berikut:

1. 📍 Aktifkan lokasi Anda
2. 🔍 Gunakan filter pencarian untuk:
   - Radius pencarian
   - Provinsi/Kota
   - Tipe layanan
   - Status (gratis/berbayar)
3. 🚑 Pilih ambulans yang sesuai
4. 📞 Hubungi nomor yang tersedia

Butuh bantuan lebih spesifik?`,
            suggestions: [
                "Cara mengaktifkan lokasi",
                "Filter pencarian",
                "Kontak darurat"
            ]
        };
    }

    if (m.includes("review") || m.includes("ulasan")) {
        return {
            message: `Untuk melihat atau memberikan ulasan:

1. ⭐ Klik tombol "Lihat Review" pada kartu ambulans
2. 📝 Login jika ingin memberikan ulasan
3. ✍️ Tulis komentar dan beri rating
4. ✅ Klik "Kirim"

Review Anda sangat membantu pengguna lain!`,
            suggestions: [
                "Cara login",
                "Cari ambulans",
                "Lupa password"
            ]
        };
    }

    if (m.includes("kontak") || m.includes("telepon") || m.includes("darurat")) {
        return {
            message: `Kontak penting AmbuLink:

🚨 Darurat: 119
📞 Call Center: (021) 555-0119
📱 WhatsApp: +62 812-3456-7890
📧 Email: info@ambulink.id

Untuk ambulans spesifik, Anda bisa langsung menghubungi nomor yang tertera di profil ambulans.`,
            suggestions: [
                "Cari ambulans terdekat",
                "Layanan darurat",
                "Bantuan lain"
            ]
        };
    }

    // Default response
    return {
        message: `Mohon maaf, saya belum bisa menjawab pertanyaan tersebut dengan tepat. 

Berikut beberapa topik yang bisa saya bantu:
• 🚑 Pencarian ambulans
• ⭐ Review dan ulasan
• 📞 Kontak darurat
• ➕ Pendaftaran ambulans

Atau hubungi tim kami di info@ambulink.id untuk bantuan lebih lanjut.`,
        suggestions: [
            "Cari ambulans",
            "Lihat review",
            "Kontak darurat",
            "Tambah ambulans"
        ]
    };
}

// Initialize chat with welcome message
if (!localStorage.getItem("chatHistory")) {
    const welcomeResponse = getBotResponse("halo");
    appendMessage(welcomeResponse.message, "bot");
    const suggestionsDiv = createSuggestionButtons(welcomeResponse.suggestions);
    chatMessages.lastElementChild.querySelector('.bg-gray-100').appendChild(suggestionsDiv);
} else {
    chatMessages.innerHTML = localStorage.getItem("chatHistory");
}

chatForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Clear input and add user message
    chatInput.value = "";
    appendMessage(userMessage, "user");

    // Show typing indicator
    showTypingIndicator();

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Hide typing indicator and show response
    hideTypingIndicator();
    const response = getBotResponse(userMessage);
    appendMessage(response.message, "bot");

    // Add suggestion buttons
    if (response.suggestions) {
        const suggestionsDiv = createSuggestionButtons(response.suggestions);
        chatMessages.lastElementChild.querySelector('.bg-gray-100').appendChild(suggestionsDiv);
    }
});
