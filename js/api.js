// Base API URL
const API_BASE_URL = "https://primdev.alwaysdata.net/api";

// Fungsi untuk mengambil token
const getToken = () => localStorage.getItem("token");

// Redirect jika belum login
document.addEventListener("DOMContentLoaded", () => {
  const token = getToken();

  if (!token && window.location.pathname.includes("index.html")) {
    alert("Please log in first!");
    window.location.href = "login/login.html";
  }

  if (token && window.location.pathname.includes("/karya/karya.html")) {
    getBlogs();
  }
});

// Login Code
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Mohon mengisi Email dan Password Anda!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        alert("Anda Berhasil Log In!");
        window.location.href = "../index.html";
      } else {
        alert(data.message || "Cek Kembali Data Anda!");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login. Please try again.");
    }
  });
}

// Register Code
const registerForm = document.getElementById("regist-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const conPassword = document.getElementById("con-pass").value.trim();

    if (!name || !email || !password || !conPassword) {
      alert("Harap Mengisi Semua Data!");
      return;
    }

    if (password !== conPassword) {
      alert("Password Anda tidak pass!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirm_password: password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Anda Berhasil Mendaftar, Mohon untuk Log In!");
        window.location.href = "../login/login.html";
      } else {
        alert(data.message || "Anda gagal mendaftar!");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred during registration. Please try again.");
    }
  });
}

// Logout
const logoutButton = document.getElementById("logout-btn");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "../login/login.html";
  });
}

// CRUD
async function getBlogs() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Unauthorized! Please log in.");
    window.location.href = "../login/login.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/blog`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const blogs = await response.json();

    if (!response.ok) {
      throw new Error(
        blogs.message || `Error fetching blogs: ${response.status}`
      );
    }

    let table = `
      <tr>
        <th>ID</th>
        <th>Gamabar</th>
        <th>Judul</th>
        <th>Cerita</th>
        <th>Action</th>
      </tr>`;

    blogs.forEach((blog) => {
      table += `
        <tr>
          <td>${blog.id}</td>
          <td>
            <img 
              src="${blog.image}" 
              alt="Blog Image" 
              style="width: 50px; height: auto;" 
            />
          </td>
          <td>${blog.title}</td>
          <td>${blog.content}</td>
          <td class="btn-blog">
            <button 
              class="edit-btn" 
              onclick="editBlog(${blog.id}, '${blog.image}', '${blog.title}', '${blog.content}')"
            >
              Edit
            </button>
            <button 
              class="delete-btn" 
              onclick="deleteBlog(${blog.id})"
            >
              Delete
            </button>
          </td>
        </tr>`;
    });

    document.getElementById("daftarKarya").innerHTML = table;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    alert(`Error: ${error.message}`);
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const storyForm = document.getElementById("create-form");
  const blogId = storyForm.dataset.blogId || null;

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const imageInput = document.getElementById("image");
  const image = imageInput?.files?.[0] || null;
  const token = localStorage.getItem("token");

  // Validasi input
  if (!title || !content || (!image && !blogId)) {
    alert("Mohon mengisi semua data!");
    return;
  }

  // Buat FormData
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);

  if (image) {
    formData.append("image", image);
  }

  try {
    let response;

    // Tentukan apakah ini update atau store
    if (blogId) {
      formData.append("_method", "PUT");
      response = await fetch(
        `https://primdev.alwaysdata.net/api/blog/${blogId}`,
        {
          method: "POST", // Laravel menerima metode POST dengan _method untuk update
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
    } else {
      response = await fetch("https://primdev.alwaysdata.net/api/blog/store", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    }

    // Periksa respons
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    if (result) {
      alert(
        blogId ? "Blog berhasil diperbarui!" : "Blog berhasil ditambahkan!"
      );
      storyForm.reset(); // Reset form setelah pengiriman
      delete storyForm.dataset.blogId; // Hapus blogId dari dataset
      document.getElementById("image").style.display = "none"; // Sembunyikan pratinjau gambar
      // Tambahkan logika untuk memuat ulang daftar blog jika diperlukan
    } else {
      alert("Respons kosong dari server.");
    }
  } catch (error) {
    console.error("Request error:", error);
    alert("Terjadi kesalahan saat mengirim data.");
  }
}

// Kode Anda untuk handleFormSubmit tetap sama
function editBlog(id, image, title, content) {
  // Tandai form sedang dalam mode edit
  const storyForm = document.getElementById("create-form");
  storyForm.dataset.blogId = id;

  // Isi nilai form dengan data blog yang akan diedit
  document.getElementById("title").value = title;
  document.getElementById("content").value = content;

  // Tampilkan pratinjau gambar jika ada
  const imagePreview = document.getElementById("img-view");
  if (image) {
    imagePreview.src = image;
    imagePreview.style.display = "block";
  } else {
    imagePreview.style.display = "none";
  }
}

// Delete blog post
async function deleteBlog(id) {
  const token = localStorage.getItem("token"); // Ambil token dari localStorage

  if (!token) {
    alert("Unauthorized! Please log in.");
    window.location.href = "../login/login.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // Gunakan template literal untuk memasukkan token
      },
    });

    const data = await response.json();

    if (response.ok) {
      alert("Blog deleted successfully!");
      getBlogs(); // Panggil ulang fungsi untuk memperbarui daftar blog
    } else {
      alert(data.message || "Failed to delete blog");
    }
  } catch (error) {
    console.error("Error deleting blog:", error);
    alert("Error deleting blog. Please try again.");
  }
}
