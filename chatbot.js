// Use an empty API key and the runtime will automatically provide it
const API_URL = `https://ai-agent-steel-ten.vercel.app/api/v1/AiAgent/Chat`;
// const API_URL = `http://localhost:4000/api/v1/AiAgent/Chat`;

// References to blog app DOM elements
const navAllBlogsBtn = document.getElementById('nav-all-blogs');
const navCreateBlogBtn = document.getElementById('nav-create-blog');
const blogsPage = document.getElementById('blogs-page');
const formPage = document.getElementById('form-page');
const blogsContainer = document.getElementById('blogs-container');
const formTitle = document.getElementById('form-title');
const blogForm = document.getElementById('blog-form');
const blogIdInput = document.getElementById('blog-id');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const contentInput = document.getElementById('content');
const cancelFormBtn = document.getElementById('cancel-form-btn');
const deleteModal = document.getElementById('delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const messageBox = document.getElementById('message-box');
const loadingSpinner = document.getElementById('loading');

// References to chatbot DOM elements
const chatFloatBtn = document.getElementById('chat-float-btn');
const aiChatbotContainer = document.getElementById('ai-chatbot');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// Chat history state
let history = [];

// Blog App Functions (minimal for demonstration)
function showPage(pageId) {
    blogsPage.classList.add('hidden');
    formPage.classList.add('hidden');
    document.getElementById(pageId).classList.remove('hidden');
}

function showBlogsPage() {
    showPage('blogs-page');
    blogsContainer.innerHTML = `<p class="text-gray-500">No blogs found. Create one!</p>`;
}

function showFormPage() {
    formTitle.textContent = 'Create New Blog';
    blogForm.reset();
    blogIdInput.value = '';
    showPage('form-page');
}

// Blog App Event Listeners
navAllBlogsBtn.addEventListener('click', showBlogsPage);
navCreateBlogBtn.addEventListener('click', showFormPage);
cancelFormBtn.addEventListener('click', showBlogsPage);

// Chatbot Functions
function renderMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;
    renderMessage(userMessage, 'user');
    userInput.value = '';
    sendBtn.disabled = true;

    const loadingDotsHtml = `
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            `;
    renderMessage(loadingDotsHtml, 'bot');

    try {
        const payload = { userMessage, history };
        console.log("Sending payload to AI API:", payload);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API error! Status: ${response.status}`);
        }

        const result = await response.json();
        const botResponse = result.message;
        const messages = result.messages;

        history = messages.slice(-15);
        chatMessages.removeChild(chatMessages.lastChild);
        renderMessage(botResponse, 'bot');
        // fetchAndRenderBlogs(); // Refresh blogs after bot interaction

    } catch (error) {
        console.error("Error fetching AI response:", error);
        chatMessages.removeChild(chatMessages.lastChild);
        renderMessage("Sorry, I'm having trouble connecting. Please try again later. 😟", 'bot');
    } finally {
        sendBtn.disabled = false;
    }
}

function toggleChatbot() {
    aiChatbotContainer.classList.toggle('open');
    const isOpen = aiChatbotContainer.classList.contains('open');
    chatFloatBtn.innerHTML = isOpen ? `<i class="fas fa-times"></i>` : `<i class="fas fa-comment-dots"></i>`;
    if (isOpen) {
        userInput.focus();
    }
}

function toggleDarkMode() {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    themeToggleBtn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

function checkThemePreference() {
    if (localStorage.getItem('theme') === 'dark' ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('theme'))) {
        body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Chatbot Event Listeners
chatFloatBtn.addEventListener('click', toggleChatbot);
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
themeToggleBtn.addEventListener('click', toggleDarkMode);

// Initial setup for Chatbot and Blog App
checkThemePreference();
showBlogsPage();
renderMessage("Hello! I am Echo AI Agent. How can I help with your blogs? 🤖", 'bot');
