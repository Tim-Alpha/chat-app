// const mixed = prompt("Enter username: ");
const mixed = "kinha";

// const flicToken = prompt("Paste your Flic-Token to login: ");
// const flicToken = "flic_f9014c2ce769a83bced4f9418781630601de66b7e7228ba1730756800ef549c6";
const flicToken = "flic_11f7ef5c7892ecf4a8c27245891ef6097e60f00497c4a66d130ff65354cebec9";

// Get DOM elements
const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const pingInterval = 10000 * 5;

// Set up the WebSocket connection 
// const socket = new WebSocket(`ws://localhost:8080?token=${flicToken}`);
const socket = new WebSocket(`wss://api.socialverseapp.com/websocket?token=${flicToken}`);

// WebSocket event for when the connection is open
socket.onopen = function (e) {
    console.log("Connection to server established.");

    // Start sending ping messages at regular intervals
    setInterval(function () {
        if (socket.readyState === WebSocket.OPEN) {
            console.log("pong");
            const pongMessage = JSON.stringify({type: "heartbeat", beat: "pong" });
            socket.send(pongMessage);
        }
    }, pingInterval);

};

// WebSocket event for receiving a message
socket.onmessage = function (e) {
    console.log(e.data);
    const message = JSON.parse(e.data);

    if (e.data.beat === 'ping') {
        console.log("Ping received:  Heart is beating...");
    }

    else if (e.data.receiver_id != null || e.data.receiver_id != undefined) {
        console.log("PERSONAL MESSAGE RECEIVED");
    } 
    
    else if (message.sender !== undefined && message.message_text !== undefined && message.sent_at !== undefined) {
        const isSentByCurrentUser = message.sender.username === mixed;
        displayMessage(message.sender.username, message.message_text, message.sent_at, isSentByCurrentUser, message.sender.profile_url);
    }
};

// Send button event listener
sendButton.addEventListener("click", () => {
    const messageText = messageInput.value.trim();
    if (messageText !== "") {
        sendMessage(messageText);
    }
});

// Function to send a message
function sendMessage(messageText) {
    const message = {
        type: "groupChat",
        sender: { username: mixed },
        message_text: messageText,
        sent_at: new Date().toISOString() // Use ISO string for consistency
    };
    socket.send(JSON.stringify(message));
    displayMessage(mixed, messageText, new Date().toLocaleTimeString(), true);
    messageInput.value = "";
}

// Function to display a message
function displayMessage(sender, text, timestamp, sentByCurrentUser, profileUrl = '') {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    let innerHTMLContent;

    if (sentByCurrentUser) {
        innerHTMLContent = `
            <div class="message-content">
                <strong>${sender}</strong> <span>${timestamp}</span>
                <p>${text}</p>
            </div>`;
        messageElement.classList.add("message-sent");
    } else {
        innerHTMLContent = `
            <img class="profile-image" src="${profileUrl}" alt="${sender}">
            <div class="message-content">
                <strong>${sender}</strong> <span>${timestamp}</span>
                <p>${text}</p>
            </div>`;
        messageElement.classList.add("message-received");
    }

    messageElement.innerHTML = innerHTMLContent;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the latest message
}

// Modify the send button to have text instead of an icon
sendButton.textContent = "Send";

// Update the property names in the UserChats class constructor to match the API response
class UserChats {
  constructor(type, id, user_id, sender_username, last_message, sent_at, name, profileUrl) {
      this.type = type;
      this.id = id;
      this.user_id = user_id;
      this.sender_username = sender_username;
      this.last_message = last_message;
      this.sent_at = sent_at;
      this.name = name;
      this.profileUrl = profileUrl;
  }
}

// Function to fetch and render the user list and groups
function fetchData() {
  Promise.all([
      fetchUserList(),
  ]).then(() => {
      console.log('All data has been fetched and rendered.');
  });
}

// Function to fetch the user list
async function fetchUserList() {
//   const response = await fetch('http://localhost:8000/user/chats?page=1', {
    const response = await fetch('https://api.socialverseapp.com/user/chats?page=1', {
      method: 'GET',
      headers: {
          'Flic-Token': flicToken
      }
  });
  const data = await response.json();
  console.log("Fetched user data:", data);
  const UserChat = data.chats.map(chat => {
      return new UserChats(
          chat.type,
          chat.id,
          chat.user_id,
          chat.sender_username,
          chat.last_message,
          chat.sent_at,
          chat.name,
          chat.profile_url
      );
  });
  renderList(UserChat);
}

// Function to render both users and groups in the list
function renderList(items) {
  const userListElement = document.getElementById("user-list");

  items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('list');

      // Create the inner HTML content using data from the UserChats model
      itemDiv.innerHTML = `
          <div class="list-item">
            <img class="profile-image" src="${item.profileUrl}" alt="Profile image">
              <div class="user-info">
                  <div class="name-time-container">
                    ${item.name !== "null" ? `<p class="user-name">${item.name}</p>` : ""}
                    ${item.sent_at !== "null" ? `<p class="sent-time">${formatTime(item.sent_at)}</p>` : ""}
                    </div>
                    <div class="last-message-container">
                      ${item.sender_username !== "null" ? `<p class="sender-username">${item.sender_username == mixed ? "you" : item.sender_username}: ${item.last_message}</p>` : ""}
                    </div>
                </div>
          </div>
      `;

      // Add click listener to display name in prompt
      itemDiv.addEventListener('click', () => {
          // Display the name in a prompt
          prompt('Name:', item.name);
      });

      userListElement.appendChild(itemDiv);
  });
}


function formatTime(dateTimeStr) {
  const time = new Date(dateTimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return time;
}

// Call fetchUserList on page load to populate the user list
window.onload = fetchData;

















/*
// ... existing code ...

socket.onmessage = function (e) {
    console.log(e.data);
    const message = JSON.parse(e.data);

    if (message.type === 'userOnlineStatus') {
        updateOnlineStatusIndicator(message.userId, message.isOnline);
    } else {
        // ... existing message handling code ...
    }
};

// Function to update online status indicator
function updateOnlineStatusIndicator(userId, isOnline) {
    // Update the user's online status indicator
    const userElement = document.getElementById(`user-${userId}`);
    if (userElement) {
        if (isOnline) {
            userElement.classList.add('online');
        } else {
            userElement.classList.remove('online');
        }
    }
}

// ... existing code ...
*/
