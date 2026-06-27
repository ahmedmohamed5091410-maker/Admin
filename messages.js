/* Inbox Messages Controller */

import { Users, Messages } from './storage.js';
import { updateHeaderBadges } from './app.js';
import { searchCollection } from './search.js';
import { timeAgo } from './utils.js';

// Controller state
let activeContactId = null;
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  // Initial threads load
  renderChatThreads();

  // Check URL parameters for active chat trigger
  const params = new URLSearchParams(window.location.search);
  const activeChatParam = params.get('chat');
  if (activeChatParam) {
    selectContactThread(activeChatParam);
  }

  // Setup Event Listeners
  setupInteractionListeners();
});

// Calculate and group threads
function getChatThreads() {
  const users = Users.getAll();
  const messages = Messages.getAll();
  
  // Get contacts (all users except admin Olivia Ryhe)
  const contacts = users.filter(u => u.id !== 'usr-1');

  return contacts.map(c => {
    // Find all messages involving this contact
    const chatLogs = messages.filter(m => m.senderId === c.id || (m.senderId === 'usr-1' && m.recipientId === c.id));
    
    // Last message
    const lastMsg = chatLogs[0] || null; // messages is sorted desc in database
    
    // Count unread
    const unreadCount = chatLogs.filter(m => m.senderId === c.id && !m.read).length;

    return {
      ...c,
      lastMessage: lastMsg,
      unreadCount
    };
  });
}

function renderChatThreads() {
  const threads = getChatThreads();
  
  // 1. Search filter
  const filtered = searchCollection(threads, searchQuery, ['name']);

  const container = document.getElementById('chat-threads-container');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.85rem;">No contacts found</div>`;
    return;
  }

  container.innerHTML = filtered.map(t => {
    const isActive = t.id === activeContactId;
    const hasUnread = t.unreadCount > 0;
    
    const previewText = t.lastMessage ? t.lastMessage.messageText : 'No messages yet';
    const timeText = t.lastMessage ? timeAgo(t.lastMessage.timestamp) : '';

    return `
      <div class="chat-item ${isActive ? 'active' : ''} ${hasUnread ? 'unread' : ''}" data-contact-id="${t.id}">
        <img src="${t.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" alt="${t.name}" class="avatar">
        <div class="chat-item-body">
          <div class="chat-item-header">
            <span class="chat-item-name">${t.name}</span>
            <span class="chat-item-time">${timeText}</span>
          </div>
          <div class="flex-between" style="gap:0.5rem; align-items: center;">
            <span class="chat-item-preview">${previewText}</span>
            ${hasUnread ? `<span class="badge badge-danger" style="padding: 2px 6px; font-size: 0.7rem; border-radius:10px;">${t.unreadCount}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach thread clicking
  container.querySelectorAll('.chat-item').forEach(item => {
    item.addEventListener('click', () => {
      const contactId = item.dataset.contactId;
      selectContactThread(contactId);
    });
  });
}

function selectContactThread(contactId) {
  activeContactId = contactId;

  // Mark all messages from this contact as read in DB
  const messages = Messages.getAll();
  messages.forEach(m => {
    if (m.senderId === contactId) {
      m.read = true;
    }
  });
  Messages.save(messages);

  // Update navbar count badges
  if (window.updateHeaderBadges) {
    window.updateHeaderBadges();
  }

  // Toggle UI Layout views
  document.getElementById('chat-empty-state').style.display = 'none';
  const chatArea = document.getElementById('chat-messages-area');
  chatArea.style.display = 'flex';

  // Load Contact Header info
  const contact = Users.getById(contactId);
  if (contact) {
    document.getElementById('chat-active-avatar').src = contact.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
    document.getElementById('chat-active-name').innerText = contact.name;
  }

  // Render Bubbles list
  renderChatBubbles();
  renderChatThreads();
}

function renderChatBubbles() {
  const container = document.getElementById('chat-messages-scroll');
  if (!container || !activeContactId) return;

  const messages = Messages.getAll();
  
  // Filter messages involving current contact and sorted chronological
  const chatLogs = messages
    .filter(m => (m.senderId === activeContactId && !m.recipientId) || 
                 (m.senderId === 'usr-1' && m.recipientId === activeContactId))
    .reverse(); // reverse to chronological (old to new)

  if (chatLogs.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.85rem; padding: 2rem 0;">Say hello to start the conversation!</div>`;
    return;
  }

  container.innerHTML = chatLogs.map(m => {
    const isOutgoing = m.senderId === 'usr-1';
    
    return `
      <div class="message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}">
        <div>${m.messageText}</div>
        <div style="font-size: 0.65rem; opacity: 0.7; margin-top: 4px; text-align: ${isOutgoing ? 'right' : 'left'};">
          ${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    `;
  }).join('');

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

// Interactivity Listeners Setup
function setupInteractionListeners() {
  // Search conversations input
  const searchInput = document.getElementById('chats-search');
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    renderChatThreads();
  });

  // Sending message submit form
  const form = document.getElementById('chat-send-form');
  const input = document.getElementById('chat-message-input');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!activeContactId) return;

    const text = input.value.trim();
    if (text === '') return;

    // 1. Add outgoing message to DB
    Messages.add({
      senderId: 'usr-1',
      senderName: 'Olivia Ryhe',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80',
      recipientId: activeContactId,
      messageText: text
    });

    input.value = '';
    renderChatBubbles();
    renderChatThreads();

    // 2. Trigger auto response simulation
    simulateContactResponse();
  });
}

// Mock Chatbot auto response
function simulateContactResponse() {
  const contactId = activeContactId; // lock current contact ID
  
  const responses = [
    "Thanks for the message! I'm reviewing the reports and will update you shortly.",
    "That sounds perfect. Let's touch base during our weekly sync call tomorrow.",
    "I will make sure to update the server packages first. Thanks for pointing it out!",
    "Could you send me the dashboard spreadsheet via email?",
    "Understood. Let me discuss this with Drew and get back to you by end of day."
  ];

  const randomText = responses[Math.floor(Math.random() * responses.length)];

  // Set typing delay simulation
  setTimeout(() => {
    // Verify user hasn't switched threads in the interim
    if (activeContactId !== contactId) return;

    const contact = Users.getById(contactId);
    if (!contact) return;

    // Add incoming message to DB
    Messages.add({
      senderId: contact.id,
      senderName: contact.name,
      senderAvatar: contact.avatar,
      messageText: randomText
    });

    renderChatBubbles();
    renderChatThreads();
    
    // Play alert sound if needed or simply update header badges
    if (window.updateHeaderBadges) {
      window.updateHeaderBadges();
    }
  }, 1200);
}
