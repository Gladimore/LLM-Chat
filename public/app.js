// app.js
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Add event listener for clear memory button
document.getElementById('clear-btn').addEventListener('click', clearMemory);

// Load messages and password from localStorage when the page loads
window.onload = () => {
  loadMessages();
  loadPassword();
};

async function sendMessage() {
  const userInput = document.getElementById('user-input');
  const passwordInput = document.getElementById('password');
  const message = userInput.value.trim();
  const password = passwordInput.value.trim();

  if (!message || !password) {
    alert("Please enter both the message and the password.");
    return;
  }

  // Display user's message and save it to local storage
  addMessageToChat('user', message);
  saveMessageToLocal('user', message);

  // Clear the input field
  userInput.value = '';

  // Show loading indicator
  showLoading();

  // Load all messages from localStorage to include in the request
  const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];

  // Prepare the request data with all chat history
  const requestData = {
    password: password,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      ...messages,
      { role: "user", content: message },  // Add the current user message
    ],
  };

  try {
    // Make a POST request to the server
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (response.ok) {
      // Display AI's response and save it to local storage
      addMessageToChat('ai', data.response);
      saveMessageToLocal('ai', data.response);
    } else {
      addMessageToChat('ai', `Error: ${data.error || "An error occurred"}`);
    }
  } catch (err) {
    console.error("Failed to send the message", err);
    addMessageToChat('ai', "Error: Failed to send the message.");
  } finally {
    // Hide loading indicator
    hideLoading();
  }
}

function addMessageToChat(role, text) {
  const messagesContainer = document.getElementById('messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  messageDiv.textContent = text;

  // If the message is from AI, add a copy button
  if (role === 'ai') {
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.className = 'copy-btn';
    copyButton.onclick = () => copyToClipboard(text);
    messageDiv.appendChild(copyButton);
  }

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to copy text to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to clipboard!");
  }).catch(err => {
    console.error('Could not copy text: ', err);
  });
}

function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
}

// Save message to local storage
function saveMessageToLocal(role, content) {
  const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
  messages.push({ role, content });
  localStorage.setItem('chatMessages', JSON.stringify(messages));
}

// Load messages from local storage
function loadMessages() {
  const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
  messages.forEach(({ role, content }) => {
    addMessageToChat(role, content);
  });
}

// Clear memory function
function clearMemory() {
  localStorage.removeItem('chatMessages');
  document.getElementById('messages').innerHTML = ''; // Clear the displayed messages
  alert("Memory cleared!");
}

// Load password from local storage
function loadPassword() {
  const savedPassword = localStorage.getItem('password');
  const passwordInput = document.getElementById('password');

  if (savedPassword) {
    passwordInput.value = savedPassword; // Fill in the saved password
    passwordInput.disabled = true; // Disable the input to prevent overwriting
  }
}

// Save password to local storage
function savePassword(password) {
  localStorage.setItem('password', password);
}

// Call savePassword when the password input loses focus to save it only once
document.getElementById('password').addEventListener('blur', function() {
  const passwordInput = document.getElementById('password');
  const savedPassword = localStorage.getItem('password');

  if (!savedPassword && passwordInput.value) { // Save password only if it's not already saved
    savePassword(passwordInput.value);
  }
});