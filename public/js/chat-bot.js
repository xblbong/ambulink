const toggleBtn = document.getElementById("chatbotToggle");
const chatbotWindow = document.getElementById("chatbotWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const closeBtn = document.getElementById("chatbotClose");

toggleBtn.addEventListener("click", toggleChatbot);

function toggleChatbot() {
    chatbotWindow.classList.toggle("hidden");
}

closeBtn.addEventListener("click", () => {
    chatbotWindow.classList.add("hidden");
});

function saveChat() {
    localStorage.setItem("chatHistory", chatMessages.innerHTML);
}
function appendMessage(message, sender) {
    const msg = document.createElement("div");
    msg.innerHTML = message;
    msg.className =
        sender === "user"
            ? "bg-[#AA1919] text-white px-3 py-2 rounded-lg self-end ml-auto w-fit"
            : "bg-gray-100 text-gray-800 px-3 py-2 rounded-lg w-fit";
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    saveChat();
}

function getBotResponse(msg) {
    const m = msg.toLowerCase().trim();

    if (
        [
            "halo",
            "hai",
            "hi",
            "helo",
            "selamat pagi",
            "selamat siang",
            "selamat malam",
        ].includes(m)
    ) {
        return "Halo! Ada yang bisa saya bantu? 😊";
    }

    if (
        m.includes("tambah ambulans") ||
        m.includes("menambahkan ambulans") ||
        m.includes("daftar ambulans")
    ) {
        return "Untuk menambahkan ambulans, hubungi admin melalui email: admin@ambulink.id atau gunakan fitur 'Daftar Ambulans' jika tersedia di dashboard.";
    }

    if (m.includes("ambulans") || m.includes("pencarian")) {
        return "Untuk mencari ambulans, klik tombol 'Mulai Pencarian' di halaman utama ya.";
    }

    if (m.includes("review") || m.includes("ulasan")) {
        return "Klik tombol 'Lihat Review' pada kartu ambulans untuk melihat atau memberi ulasan.";
    }

    if (m.includes("hubungi") || m.includes("kontak") || m.includes("telepon")) {
        return "Di setiap ambulans, ada ikon telepon dan WhatsApp untuk langsung menghubungi.";
    }

    if (
        m.includes("bisa bantu") ||
        m.includes("tolong") ||
        m.includes("bantuan") ||
        m.includes("butuh bantuan")
    ) {
        return "Tentu! Saya bisa bantu info tentang pencarian ambulans, review, atau kontak layanan.";
    }

    return "Untuk pertanyaan lainnya, silakan hubungi kami melalui email: <strong>info@ambulink.id</strong>";
}

const savedChat = localStorage.getItem("chatHistory");
if (savedChat) {
    chatMessages.innerHTML = savedChat;
} else {
    chatMessages.innerHTML = `
    <div class="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg w-fit">
      Halo! Ada yang bisa saya bantu? 😊<br><br>
      Berikut beberapa hal yang bisa kamu tanyakan:
      <ul class="list-disc ml-5 mt-2 text-sm text-gray-700">
        <li><b>Cari ambulans</b><br><span class="text-gray-500">contoh: "saya mau cari ambulans"</span></li>
        <li><b>Lihat ulasan ambulans</b><br><span class="text-gray-500">contoh: "lihat review ambulans"</span></li>
        <li><b>Hubungi ambulans</b><br><span class="text-gray-500">contoh: "bagaimana cara menghubungi ambulans"</span></li>
        <li><b>Tambah ambulans</b><br><span class="text-gray-500">contoh: "bagaimana cara menambahkan ambulans saya"</span></li>
      </ul>
      <div class="mt-3">Jika pertanyaanmu di luar itu, silakan hubungi kami di <b>info@ambulink.id</b></div>
    </div>
  `;
}

chatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;
    appendMessage(userMessage, "user");
    chatInput.value = "";
    setTimeout(() => {
        const botReply = getBotResponse(userMessage);
        appendMessage(botReply, "bot");
    }, 600);
});
