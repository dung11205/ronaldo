
// ============================
// SUPABASE
// ============================

// URL Supabase
const SUPABASE_URL = "https://ihsixkizhrxysfoizawm.supabase.co";

// Dán Publishable key của project vào đây
const SUPABASE_KEY = "sb_publishable_ItgnO2KJpSVip-xIC7LCZw_YI4ac9B6";

// Khởi tạo Supabase
const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ============================
// MOBILE MENU
// ============================

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        if (navLinks) {
            navLinks.classList.remove("active");
        }
    });
});


// ============================
// CONTACT FORM
// ============================

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

if (contactForm) {

    contactForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        // Lấy dữ liệu
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        // ============================
        // KIỂM TRA DỮ LIỆU
        // ============================

        if (!name || !email || !message) {
            formMessage.textContent =
                "Vui lòng nhập đầy đủ thông tin.";

            formMessage.style.color = "red";
            return;
        }

        // Kiểm tra email
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            formMessage.textContent =
                "Email không hợp lệ.";

            formMessage.style.color = "red";
            return;
        }


        // ============================
        // BUTTON ĐANG GỬI
        // ============================

        const submitBtn =
            contactForm.querySelector(".submit-btn");

        submitBtn.disabled = true;
        submitBtn.textContent = "Đang gửi...";

        formMessage.textContent = "";


        // ============================
        // GỬI DỮ LIỆU SUPABASE
        // ============================

        try {

            const { data, error } = await supabaseClient
                .from("contacts")
                .insert([
                    {
                        name: name,
                        email: email,
                        message: message
                    }
                ])
                .select();

            // ============================
            // XỬ LÝ LỖI
            // ============================

            if (error) {

                console.error("Supabase Error:", error);

                formMessage.textContent =
                    "Không thể gửi tin nhắn. Vui lòng thử lại.";

                formMessage.style.color = "red";

                submitBtn.disabled = false;
                submitBtn.textContent = "Gửi tin nhắn";

                return;
            }


            // ============================
            // THÀNH CÔNG
            // ============================

            console.log("Contact đã lưu:", data);

            formMessage.textContent =
                "Gửi tin nhắn thành công! Cảm ơn bạn.";

            formMessage.style.color = "green";

            // Xóa form
            contactForm.reset();

            submitBtn.disabled = false;
            submitBtn.textContent = "Gửi tin nhắn";


        } catch (error) {

            console.error("Lỗi:", error);

            formMessage.textContent =
                "Có lỗi kết nối. Vui lòng thử lại.";

            formMessage.style.color = "red";

            submitBtn.disabled = false;
            submitBtn.textContent = "Gửi tin nhắn";
        }

    });

}

