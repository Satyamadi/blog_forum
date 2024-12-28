//following circle
const circle = document.querySelector('.circle');

document.addEventListener('mousemove', e => {
  const centerX = circle.offsetLeft + circle.clientWidth / 2;
  const centerY = circle.offsetTop + circle.clientHeight / 2;
  const distanceFromCenter = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
  const maxDistance = circle.clientWidth / 2 - 10;
  let x, y;
  if (distanceFromCenter > maxDistance) {
    x = e.clientX - centerX;
    y = e.clientY - centerY;
  } else {
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    x = Math.cos(angle) * maxDistance;
    y = Math.sin(angle) * maxDistance;
  }
  circle.style.transform = `translate(${x}px, ${y}px)`;
});
//cursor hover
    const cursor = document.getElementById("cursor");
    document.addEventListener("mouseover", function(event) {

      const cursorType = getComputedStyle(event.target).getPropertyValue("cursor");
      
      if (cursorType === "pointer" || cursorType === "text") {
        cursor.classList.add("active");
      }
    });
  
    document.addEventListener("mouseout", function(event) {
      cursor.classList.remove("active");
    });

//fetching data blog
// Variabel untuk pagination
let currentPage = 1;
const rowsPerPage = 6;
let selectedBlog = null; // Untuk menyimpan blog yang dipilih

// Fungsi untuk menampilkan data berdasarkan halaman
function displayTableData(page, dataset) {
  const blogContent = document.getElementById('blogCotent');
  blogContent.innerHTML = '';

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = dataset.slice(startIndex, endIndex);

  paginatedData.forEach(blog => {
    const blogElement = document.createElement('div');
    blogElement.className = 'port-item';

    blogElement.innerHTML = `
      <div class="item-img">
        <a class="arrow-side" onclick="showBlog(${encodeURIComponent(JSON.stringify(blog))})">
          <img src="${blog.imagePreview}" alt="" id="imagePreview" />
          <h1 id="author">${blog.author_id}</h1>
        </a>
      </div>
      <div class="more-warp">
        <div class="item-more">
          <h1 id="title">${blog.title}</h1>
          <a class="arrow-side" onclick="showBlog(${encodeURIComponent(JSON.stringify(blog))})">
            <h2>More</h2>
            <span class="arr-side"></span>
          </a>
        </div>
      </div>
    `;
    blogElement.querySelector(".arrow-side").addEventListener("click", () => {
      showBlog(blog); // Panggil fungsi showBlog dengan data blog
    });

    blogContent.appendChild(blogElement);
  });
}

// Fungsi untuk setup pagination
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

function showBlog(blogData) {
  if (!blogData) {
      console.error("No blog data provided.");
      return;
  }

  // Simpan data blog ke localStorage
  localStorage.setItem("selectedBlog", JSON.stringify(blogData));
  
  // Redirect ke halaman viewforum.html
  window.location.href = "viewforum.html";
}


// Fungsi untuk memuat blog yang dipilih di viewforum.html
function loadSelectedBlog() {
  const blogInfo = document.getElementById('blogInfo');
  if (!blogInfo) return;

  const blog = JSON.parse(localStorage.getItem('selectedBlog'));
  if (!blog) return;

  const formattedDate = blog.created_at ? blog.created_at.split('T')[0] : 'Unknown';

  blogInfo.innerHTML = `
    <h1>Title: ${blog.title}</h1>
    <h2>
      by: ${blog.author_id}
    </h2>
    <h4>
      Created at: ${formattedDate}
    </h4>
    <img src="${blog.imagePreview}" class="info-blog-image" alt="Blog Image" />
    <div class="blog-content"><p>${blog.content || 'No content available'}</p></div>
  `;
}

// Integrasi pagination dengan fetchBlogs
async function fetchBlogs() {
  try {
    const response = await fetch('https://primdev.alwaysdata.net/api/blog');
    if (!response.ok) {
      throw new Error('Gagal mengambil data dari API');
    }
    const data = await response.json();
    displayTableData(currentPage, data);
    setupPagination(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
document.addEventListener('DOMContentLoaded', loadSelectedBlog);

// Event listener untuk input pencarian
const searchInput = document.querySelector('.navbar input[type="search"]');
searchInput.addEventListener('input', () => {
  fetch('https://primdev.alwaysdata.net/api/blog')
    .then(response => {
      if (!response.ok) {
        throw new Error('Gagal mengambil data dari API');
      }
      return response.json();
    })
    .then(data => {
      const query = searchInput.value.toLowerCase();
      const filteredBlogs = data.filter(blog => blog.title.toLowerCase().includes(query));
      
      if (filteredBlogs.length === 0) {
        const portTag = document.querySelector('.port-tag');
        if (portTag) {
          portTag.textContent = "Not Found";
        }
      } else {
        const portTag = document.querySelector('.port-tag');
        if (portTag) {
          portTag.textContent = "Blog";
        }
      }
      
      displayTableData(currentPage, filteredBlogs);
      setupPagination(filteredBlogs);
    })
    .catch(error => console.error('Error:', error));
});



document.addEventListener('DOMContentLoaded', fetchBlogs);

function clearBlogStorage() {
  localStorage.removeItem('selectedBlog');
}