
const dataAPI = 'https://primdev.alwaysdata.net/api';
// token---------------------------
let token = localStorage.getItem('token');
let author;



function toggleNav() {
    const sideNav = document.getElementById('sideNav');
    const topNav = document.querySelector('.top-nav');
    const content = document.getElementById('contents');
    
    sideNav.classList.toggle('hidden');
    topNav.classList.toggle('shifted'); 
    content.classList.toggle('shifted'); 
}
//page dashboard
function activateMenu(link) {
    const links = document.querySelectorAll('.side-nav a');
    links.forEach(item => item.classList.remove('active'));
    link.classList.add('active');
}

function loadContent(page, event = null) {
    if (event) {
        event.preventDefault();
        activateMenu(event.currentTarget);
    }

    const currentUrl = window.location.origin;
    const route = page.replace('.html', '');
    history.pushState({ page }, '', `${currentUrl}/${route}`);

    fetch(page)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('contents').innerHTML = data;

            // Inisialisasi berdasarkan halaman
            if (page === 'blog.html') {
                initializeTableAndPagination();
            } else if (page === 'dashboard.html') {
                fetchData();
            } 
        })
        .catch(error => console.error('Fetch error:', error));
}

async function fetchUserData() {
    try {
        const response = await fetch(`${dataAPI}/user`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // Kirim token di header
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Error saat mengambil data pengguna:", error.message);
            alert(`Error: ${error.message}`);
            return;
        }

        const userData = await response.json();
        const dataUsername = userData.name;

        // Set author ID
        author = userData.id;

        // Update the username in the UI
        document.getElementById("userName").textContent = dataUsername;

        // Return the author ID for further use
        return author;
    } catch (error) {
        // console.error("Terjadi kesalahan saat mengambil data pengguna:", error);
        // alert("Terjadi kesalahan saat memuat data pengguna.");
        // throw error;
    }
}


//setup pagination-------------------------------------------------------------------------------------------------
let data = []; 
let currentPage = 1; 
const rowsPerPage = 5; 

function initializeTableAndPagination() {
    currentPage = 1; 
    fetchData(); 
}

//fetch data blog----------------------------------------------------------------------------------------
async function fetchData(authorId) {
    const url = `${dataAPI}/blog/author/${author}`;
    try {
        // const response = await fetch(`${dataAPI}/blog`);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Tambahkan token atau API key
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const apiData = await response.json();
        // console.log(apiData);
        
        data = apiData;
        updateDataCount(data.length);
        displayTableData(currentPage);
        setupPagination();
    } catch (error) {
        // return console.error('Error fetching data:', error);
    }
}
function updateDataCount(count) {
    const numberElement = document.querySelector('.number');
    if (numberElement) {
        numberElement.textContent = `${count}`;
    }
}
//initializing page--------------------------------------
(async function initializePage() {
    try {
        const authorId = await fetchUserData(); // Wait until user data is fetched
        if (authorId) {
            await fetchData(authorId); // Fetch blog count only after user data is ready
        }
    } catch (error) {
        console.error("Gagal menginisialisasi halaman:", error);
    }
})();









function displayFilteredData(filteredData) {
    const tableBody = document.querySelector("#dataTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = ""; 

    
    filteredData.forEach(item => {
        const row = `
            <tr>
                <td>${item.id}</td>
                <td><img src="${item.image}" alt=""></td>
                <td>${item.title}</td>
                <td>${item.content}</td>
                <td>
                    <button class="btn edit" onclick="openModal('edit', { id: ${item.id}, title: '${item.title}', content: '${item.content}', imageUrl: '${item.image}' })">Edit</button>
                    <button class="btn delete" onclick="openModal('delete', { id: ${item.id}, title: '${item.title}'})">Delete</button>

                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    
    const pagination = document.getElementById("pagination");
    if (pagination) pagination.innerHTML = "";
}

//cari data--------------------------------------------
function filterTable() {
    const searchInput = document.getElementById("search");
    const searchTerm = searchInput.value.toLowerCase();

    if (!searchTerm) {
        currentPage = 1; 
        displayTableData(currentPage); 
        setupPagination(); 
        return;
    }

    const filteredData = data.filter(item =>
        item.title.toLowerCase().includes(searchTerm)
    );

    currentPage = 1; 
    if (filteredData.length === 0) {
        displayNoDataMessage();
        hidePagination();
    } else {
        setupPagination(filteredData); 
        displayTableData(currentPage, filteredData); 
    }
}

function setupPagination(customData = null) {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    const dataset = customData || data; 
    pagination.innerHTML = ""; 

    if (dataset.length === 0) return;

    const pageCount = Math.ceil(dataset.length / rowsPerPage); 
    const maxVisiblePages = 5; 
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const createButton = (text, page, disabled = false) => {
        const button = document.createElement("button");
        button.textContent = text;
        if (disabled) {
            button.disabled = true;
        } else {
            button.onclick = () => {
                currentPage = page;
                displayTableData(currentPage, dataset); 
                setupPagination(dataset); 
            };
        }
        return button;
    };

    pagination.appendChild(createButton("First", 1, currentPage === 1));
    pagination.appendChild(createButton("Previous", currentPage - 1, currentPage === 1));

    for (let i = startPage; i <= endPage; i++) {
        const button = createButton(i, i, false);
        if (i === currentPage) {
            button.classList.add("active");
        }
        pagination.appendChild(button);
    }

    pagination.appendChild(createButton("Next", currentPage + 1, currentPage === pageCount));
    pagination.appendChild(createButton("Last", pageCount, currentPage === pageCount));
}

function displayTableData(page, customData = null) {
    const tableBody = document.querySelector("#dataTable tbody");
    const pagination = document.getElementById("pagination");
    if (!tableBody) return;

    tableBody.innerHTML = ""; 

    const dataset = customData || data; 
    if (dataset.length === 0) {
        displayNoDataMessage();
        hidePagination();
        return;
    }

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = dataset.slice(start, end);

    pageData.forEach(item => {
        const row = `
            <tr>
            <td>${item.id}</td>
                <td><img src="${item.image}" alt=""></td>
                <td>${item.title}</td>
                <td>${item.content}</td>
                <td>
                     <button class="btn edit" onclick="openModal('edit', { id: ${item.id}, title: '${item.title}', content: '${item.content}', imageUrl: '${item.image}' })">Edit</button>
                    <button class="btn delete" onclick="openModal('delete', { id: ${item.id}, title: '${item.title}'})">Delete</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function displayNoDataMessage() {
    const tableBody = document.querySelector("#dataTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "<tr><td colspan='5' style='text-align: center;'>Tidak ada data</td></tr>";
}

function hidePagination() {
    const pagination = document.getElementById("pagination");
    if (pagination) pagination.innerHTML = "";
}


//route---------------------------
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        loadContent(event.state.page);
    }
});





function SeeMore(event, page, menuId) {
    event.preventDefault(); 
    const menuLink = document.getElementById(menuId);
    if (menuLink) {
        activateMenu(menuLink);
    }
    loadContent(page);
}


// --------------------------------------------------------------------------------------------------------------------------------
// blog modal------------------------------------------------------------------------------------------------------------------------



//---------------------------------------------------------------------------------------------------------------------------------

function openModal(mode, blogData = {}) {
    const modal = document.getElementById("modal");
    const modalContent = document.querySelector(".modal-content");
    const deleteAlert = document.querySelector(".delete-alert");

    modal.style.display = "flex";

    if (mode === "delete") {
        // Mode Delete
        modalContent.style.display = "none";
        deleteAlert.style.display = "flex";

        // Isi data konfirmasi delete
        document.getElementById("delBlogId").value = blogData.id || "";
        document.getElementById("delTitle").textContent = blogData.title || "";
    } else {
        // Mode Tambah/Edit
        modalContent.style.display = "block";
        deleteAlert.style.display = "none";

        // Reset form untuk tambah/edit
        const blogForm = document.getElementById("blogForm");
        blogForm.reset();

        if (mode === "edit") {
            document.getElementById("formTitle").textContent = "Edit Blog";
            document.getElementById("blogId").value = blogData.id || "";
            document.getElementById("title").value = blogData.title || "";
            document.getElementById("content").value = blogData.content || "";
            if (blogData.imageUrl) {
                const imagePreview = document.getElementById("imagePreview");
                imagePreview.src = blogData.imageUrl; // URL gambar dari API
                imagePreview.style.display = "block"; // Tampilkan elemen gambar
            }
        
            blogForm.onsubmit = (event) => handleFormSubmit(event, blogData.id);
        } else {
            document.getElementById("formTitle").textContent = "Tambah Blog";
            blogForm.onsubmit = (event) => handleFormSubmit(event);
        }
    }
}

function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";

    // Reset semua tampilan modal
    document.querySelector(".modal-content").style.display = "none";
    document.querySelector(".delete-alert").style.display = "none";
    document.getElementById("blogForm").reset();
    document.getElementById("imagePreview").src = "";
}

// Fungsi untuk menangani submit form (Tambah/Edit Blog)
async function handleFormSubmit(event, blogId = null) {
    event.preventDefault(); // Hentikan perilaku default form

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const imageInput = document.getElementById("image");
    const image = imageInput?.files?.[0] || null;

    if (!title || !content || (!image && !blogId)) {
        alert("Semua field harus diisi!");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    if (image) {
        formData.append("image", image);
    }

    try {
        let response;

        if (blogId) {
            formData.append("_method", "PUT");
            response = await fetch(`https://primdev.alwaysdata.net/api/blog/${blogId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });
        } else {
            response = await fetch("https://primdev.alwaysdata.net/api/blog/store", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });
        }

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const textResponse = await response.text();
        const result = textResponse ? JSON.parse(textResponse) : null;

        if (result) {
            alert(blogId ? "Blog berhasil diperbarui!" : "Blog berhasil ditambahkan!");
            closeModal();
            loadContent("blog.html"); // Muat ulang halaman blog
        } else {
            alert("Respons kosong dari server.");
        }
    } catch (error) {
        console.error("Request error:", error);
        alert("Terjadi kesalahan saat mengirim data.");
    }
}

  


  async function deleteBlog() {
    const blogId = document.getElementById("delBlogId").value;

    if (!blogId) {
      alert("ID blog tidak ditemukan.");
      return;
    }

    try {
      const response = await fetch(`https://primdev.alwaysdata.net/api/blog/${blogId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer 2|HhnUrmaHAwSNUDf7Pz5IasQo4foBnU2KKr1gQLUW`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      alert("Blog berhasil dihapus!");
      closeModal();
      loadContent('blog.html');
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Terjadi kesalahan saat menghapus blog.");
    }
  }
  

// --------------------------------------------------------------------------------------------------------------------------------
// login-register------------------------------------------------------------------------------------------------------------------------
const API_URL = "https://primdev.alwaysdata.net/api";

// Fungsi untuk login
async function handleSignIn(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        alert("Email dan password harus diisi.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.message}`);
            return;
        }

        const result = await response.json();
        
        alert("Login berhasil!");

        // Simpan token ke localStorage
        localStorage.setItem("token", result.token);
        // localStorage.setItem("author_id", result.author_id);

        // Arahkan ke halaman dashboard
        window.location.href = "/index.html";
    } catch (error) {
        console.error("Error saat login:", error);
        alert("Terjadi kesalahan saat login.");
    }
}

// Fungsi untuk registrasi
async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirm_password = document.getElementById("confirmPassword").value.trim();

    // Validate fields
    if (!name || !email || !password || !confirm_password) {
        alert("Semua field harus diisi.");
        return;
    }

    // Validate password match
    if (password !== confirm_password) {
        alert("Password dan Confirm Password tidak cocok!");
        return;
    }

    const payload = { name, email, password ,confirm_password};

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            // Handle error response gracefully
            let errorMessage = "Terjadi kesalahan.";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                errorMessage = await response.text();
            }
            alert(`Error: ${errorMessage}`);
            return;
        }

        // Successful registration
        alert("Registrasi berhasil! Silakan login.");
        window.location.href = "/login.html"; // Redirect to login page
    } catch (error) {
        console.error("Error saat registrasi:", error);
        alert("Terjadi kesalahan saat mencoba mendaftar. Silakan coba lagi.");
    }
}






// Fungsi untuk logout
function logout(event) {
    event.preventDefault();
    localStorage.removeItem("token"); // Hapus token dari localStorage
    alert("Logout berhasil. Anda akan diarahkan ke halaman login.");
    window.location.href = "/login.html"; // Arahkan ke halaman login
}


// Pengecekan token dan routing
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token"); // Ambil token dari localStorage
    const currentPath = window.location.pathname; // Path saat ini

    // Redirect jika belum login
    if (!token) {
        if (currentPath !== "/login.html") {
            window.location.href = "/login.html"; // Redirect ke halaman login
        } 
        return; // Hentikan eksekusi di sini jika belum login
    }

    // Redirect jika sudah login ke halaman default
    if (currentPath === "/login.html") {
        window.location.href = "/index.html";
        return;
    }

    // Logika Dashboard
    if (["/dashboard.html", "/index.html"].includes(currentPath)) {
        const dashboardLink = document.getElementById('dashboard');
        if (dashboardLink) {
            activateMenu(dashboardLink);
        }
        loadContent('dashboard.html');

        // Ubah URL tanpa reload jika path kosong atau root
        if (currentPath === "/" || currentPath === "") {
            const dashboardPath = `${window.location.origin}/dashboard`;
            history.replaceState({ page: "dashboard.html" }, "Dashboard", dashboardPath);
        }
    } else if (!["/blog.html"].includes(currentPath)) {
        // Redirect ke halaman default jika path tidak valid
        window.location.href = "/index.html";
    }
});

