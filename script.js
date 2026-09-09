// ============================
// SUPABASE
// ============================

const SUPABASE_URL = "DÁN_SUPABASE_URL_CỦA_BẠN";
const SUPABASE_KEY = "DÁN_SUPABASE_ANON_KEY_CỦA_BẠN";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ============================
// MOBILE MENU
// ============================

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.querySelector(".nav-links");

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
    });
});


// ============================
// CONTACT FORM
// ============================

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

contactForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // Kiểm tra rỗng
    if (!name || !email || !message) {
        formMessage.textContent =
            "Vui lòng nhập đầy đủ thông tin.";
        return;
    }

    // Kiểm tra email
    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        formMessage.textContent =
            "Email không hợp lệ.";
        return;
    }

    // Đổi trạng thái nút
    const submitBtn =
        contactForm.querySelector(".submit-btn");

    submitBtn.disabled = true;
    submitBtn.textContent = "Đang gửi...";

    // Gửi dữ liệu lên Supabase
    const { data, error } = await supabaseClient
        .from("contacts")
        .insert([
            {
                name: name,
                email: email,
                message: message
            }
        ]);

    if (error) {

        console.error(error);

        formMessage.textContent =
            "Có lỗi xảy ra. Vui lòng thử lại.";

        submitBtn.disabled = false;
        submitBtn.textContent = "Gửi tin nhắn";

        return;
    }

    // Thành công
    formMessage.textContent =
        "Gửi tin nhắn thành công!";

    contactForm.reset();

    submitBtn.disabled = false;
    submitBtn.textContent = "Gửi tin nhắn";
});