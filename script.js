    document.addEventListener('DOMContentLoaded', () => {
      const BASE_URL = 'https://ai-agent-steel-ten.vercel.app/api/v1/blog';

      // UI Elements
      const blogsPage = document.getElementById('blogs-page');
      const formPage = document.getElementById('form-page');
      const blogsContainer = document.getElementById('blogs-container');
      const blogForm = document.getElementById('blog-form');
      const formTitle = document.getElementById('form-title');
      const blogIdInput = document.getElementById('blog-id');
      const titleInput = document.getElementById('title');
      const authorInput = document.getElementById('author');
      const contentInput = document.getElementById('content');
      const loadingSpinner = document.getElementById('loading');
      const messageBox = document.getElementById('message-box');

      // Modal
      const deleteModal = document.getElementById('delete-modal');
      const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
      const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
      let blogToDeleteId = null;

      function showLoading() { loadingSpinner.classList.remove('hidden'); }
      function hideLoading() { loadingSpinner.classList.add('hidden'); }

      function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = "fixed top-6 right-6 z-50 px-4 py-2 rounded-lg font-medium";
        messageBox.classList.add(type, 'show');
        messageBox.classList.remove('hidden');
        setTimeout(() => {
          messageBox.classList.add('hidden');
          messageBox.classList.remove('show');
        }, 3000);
      }

      function showPage(pageId) {
        blogsPage.classList.add('hidden');
        formPage.classList.add('hidden');
        document.getElementById(pageId)?.classList.remove('hidden');
      }

      function setupForm(blog = null) {
        if (blog) {
          formTitle.textContent = 'Update Blog';
          blogIdInput.value = blog._id;
          titleInput.value = blog.title;
          authorInput.value = blog.author;
          contentInput.value = blog.content;
        } else {
          formTitle.textContent = 'Create New Blog';
          blogIdInput.value = '';
          blogForm.reset();
        }
        showPage('form-page');
      }

      async function fetchAndRenderBlogs() {
        showLoading();
        blogsContainer.innerHTML = '';
        try {
          const res = await fetch(`${BASE_URL}/all`);
          const blogs = await res.json();
          renderBlogs(blogs.blogs || []);
        } catch (err) {
          showMessage('Failed to fetch blogs', 'error');
        } finally {
          hideLoading();
        }
      }

      async function createBlog(blogData) {
        showLoading();
        try {
          const res = await fetch(`${BASE_URL}/create`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(blogData),
          });
          const result = await res.json();
          if (res.ok) {
            showMessage('Blog created!', 'success');
            showPage('blogs-page');
            fetchAndRenderBlogs();
          } else showMessage(result?.message || 'Create failed', 'error');
        } catch { showMessage('Error creating blog', 'error'); }
        finally { hideLoading(); }
      }

      // ✅ Update Blog
      async function updateBlog(id, blogData) {
        showLoading();
        try {
          const res = await fetch(`${BASE_URL}/updateById`, {
            method: 'POST', // 👈 since your API uses POST
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...blogData }),
          });
          const result = await res.json();
          if (res.ok) {
            showMessage('Blog updated!', 'success');
            showPage('blogs-page');
            fetchAndRenderBlogs();
          } else {
            showMessage(result?.message || 'Update failed', 'error');
          }
        } catch {
          showMessage('Error updating blog', 'error');
        } finally {
          hideLoading();
        }
      }

      // ✅ Delete Blog
      async function deleteBlog(id) {
        showLoading();
        try {
          const res = await fetch(`${BASE_URL}/deleteById`, {
            method: 'POST', // 👈 your backend uses POST for delete
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          });
          const result = await res.json();
          if (res.ok) {
            showMessage('Blog deleted!', 'success');
            fetchAndRenderBlogs();
          } else {
            showMessage(result?.message || 'Delete failed', 'error');
          }
        } catch {
          showMessage('Error deleting blog', 'error');
        } finally {
          hideLoading();
        }
      }

      function createBlogCard(blog) {
        const date = new Date(blog?.createdAt || Date.now()).toLocaleDateString();
        const snippet = blog?.content?.substring(0, 500) + '...';
        return `
        <div class="bg-white h-[400px] w-[400px] rounded-xl shadow-md overflow-hidden hover:scale-[1.02] transition">
          <div class="p-6">
            <h2 class="text-xl font-bold mb-2">${blog?.title || 'Untitled'}</h2>
            <h5 class="text-xs font-bold mb-2">ID: ${blog?._id || 'Untitled'}</h5>
            <p class="text-sm text-gray-500 mb-4">By ${blog?.author || 'Unknown'} on ${date}</p>
            <p class="text-gray-600 mb-6">${snippet || ''}</p>
            <div class="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
              <button data-id="${blog?._id}" data-action="edit" class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg">Edit</button>
              <button data-id="${blog?._id}" data-action="delete" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      `;
      }

      function renderBlogs(blogs) {
        blogsContainer.innerHTML = blogs?.length
          ? blogs.map(b => createBlogCard(b)).join('')
          : '<p class="text-center text-gray-500">No blogs yet.</p>';
      }

      // Events
      document.getElementById('nav-all-blogs').addEventListener('click', () => {
        showPage('blogs-page'); fetchAndRenderBlogs();
      });
      document.getElementById('nav-create-blog').addEventListener('click', () => setupForm());

      blogForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = blogIdInput.value;
        const data = { title: titleInput.value, author: authorInput.value, content: contentInput.value };
        id ? updateBlog(id, data) : createBlog(data);
      });

      blogsContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const { action, id } = btn.dataset;

        // ✅ Get Blog by ID
        if (action === 'edit') {
          showLoading();
          try {
            const res = await fetch(`${BASE_URL}/getById`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
            });
            const result = await res.json();
            if (res.ok && result?.blog) {
              setupForm(result.blog);
            } else {
              showMessage('Failed to fetch blog', 'error');
            }
          } catch {
            showMessage('Error editing blog', 'error');
          } finally {
            hideLoading();
          }
        }

        if (action === 'delete') {
          blogToDeleteId = id;
          deleteModal.classList.remove('hidden');
        }
      });

      document.getElementById('cancel-form-btn').addEventListener('click', () => showPage('blogs-page'));
      cancelDeleteBtn.addEventListener('click', () => deleteModal.classList.add('hidden'));
      confirmDeleteBtn.addEventListener('click', () => {
        if (blogToDeleteId) { deleteBlog(blogToDeleteId); blogToDeleteId = null; }
        deleteModal.classList.add('hidden');
      });

      // Initial load
      fetchAndRenderBlogs();
    });







// Disable certain key combinations
// document.addEventListener("keydown", function (e) {
//     // F12
//     if (e.key === "F12") {
//         e.preventDefault();
//     }

//     // Ctrl+Shift+I / J / C
//     if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) {
//         e.preventDefault();
//     }

//     // Ctrl+U
//     if (e.ctrlKey && e.key.toLowerCase() === "u") {
//         e.preventDefault();
//     }

//     // Ctrl+S (Prevent Save Page)
//     if (e.ctrlKey && e.key.toLowerCase() === "s") {
//         e.preventDefault();
//     }
// });

// // Disable right click
// document.addEventListener("contextmenu", function (e) {
//     e.preventDefault();
// });