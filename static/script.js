// Chat functionality
class SREChatInterface {
    async deleteAllHistory() {
        if (!this.currentUserId) {
            this.showToast('No user session found.', 'error');
            return;
        }
        // Show confirmation modal
        this.showConfirmationModal('Are you sure you want to delete all chat history?', async () => {
            try {
                const apiUrl = 'https://sre-agent-948325778469.northamerica-northeast2.run.app/api/chat-history';
                const response = await fetch(apiUrl, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: this.currentUserId })
                });
                if (response.ok) {
                    this.chatMessages.innerHTML = '';
                    this.showToast('Chat history deleted!');
                } else {
                    this.showToast('Failed to delete chat history.', 'error');
                }
            } catch (error) {
                this.showToast('Network error. Please try again.', 'error');
            }
        });
    }

    showConfirmationModal(message, onConfirm) {
        // Remove any existing modal
        const existing = document.getElementById('confirmationModal');
        if (existing) existing.remove();
        const modal = document.createElement('div');
        modal.id = 'confirmationModal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-dialog">
                <div class="modal-message">${message}</div>
                <div class="modal-actions">
                    <button class="modal-btn confirm">Yes</button>
                    <button class="modal-btn cancel">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        // Style
        const style = document.createElement('style');
        style.textContent = `
            #confirmationModal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2000; display: flex; align-items: center; justify-content: center; }
            #confirmationModal .modal-overlay { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); }
            #confirmationModal .modal-dialog { position: relative; background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); padding: 2rem 2.5rem; z-index: 2; min-width: 320px; max-width: 90vw; }
            #confirmationModal .modal-message { font-size: 1.1rem; margin-bottom: 1.5rem; color: #222; }
            #confirmationModal .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
            #confirmationModal .modal-btn { padding: 0.5rem 1.2rem; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; transition: background 0.2s; }
            #confirmationModal .modal-btn.confirm { background: #ef4444; color: #fff; }
            #confirmationModal .modal-btn.cancel { background: #e5e7eb; color: #222; }
            #confirmationModal .modal-btn.confirm:hover { background: #dc2626; }
            #confirmationModal .modal-btn.cancel:hover { background: #d1d5db; }
        `;
        document.head.appendChild(style);
        // Button events
        modal.querySelector('.confirm').onclick = () => {
            modal.remove();
            style.remove();
            onConfirm();
        };
        modal.querySelector('.cancel').onclick = () => {
            modal.remove();
            style.remove();
        };
    }
    startNewChat() {
        // Just clear the chat view without deleting from database
        this.chatMessages.innerHTML = '';
        this.showToast('Started new chat session!');
    }
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    newChat() {
        // Clear all chat messages
        this.chatMessages.innerHTML = '';
        // Optionally clear input
        this.chatInput.value = '';
        // Optionally reset chat history or state
        // this.chatHistory = [];
        // this.currentUserId = null; // Uncomment if you want to reset user session
        this.showToast('Started a new chat!');
    }
    async sendToAPI(message) {
        // Sends the user message to the backend and handles the response
        try {
            const apiUrl = 'https://sre-agent-948325778469.northamerica-northeast2.run.app/api/chat';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    user_id: this.currentUserId
                })
            });
            if (response.ok) {
                const data = await response.json();
                this.currentUserId = data.user_id;
                // Persist userId for future visits
                localStorage.setItem('sre_user_id', this.currentUserId);
                this.addMessage(data.response, 'bot');
            } else {
                this.addMessage('Sorry, there was a problem getting a response from the AI.', 'bot');
            }
        } catch (error) {
            this.addMessage('Network error. Please try again later.', 'bot');
        }
    }
    constructor() {
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.currentUserId = null;
        this.chatHistory = [];
        this.initializeEventListeners();
        this.initializeUserSession();
        // Try to load userId from localStorage (if available)
        const storedUserId = localStorage.getItem('sre_user_id');
        if (storedUserId) {
            this.currentUserId = storedUserId;
            this.loadRecentChatOnStartup();
        }
    }
    
    initializeEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key press
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Auto-resize input (removed unused autoResizeInput call)
        // this.chatInput.addEventListener('input', () => {
        //     this.autoResizeInput();
        // });
    }
    
    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.chatInput.value = '';
        
        // Show typing indicator (removed unused showTypingIndicator call)
        // this.showTypingIndicator();
        
        // Make API call to FastAPI backend
        this.sendToAPI(message);
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Use innerHTML for bot messages to render HTML, textContent for user messages for security
        if (sender === 'bot') {
            // Convert markdown to HTML if needed
            const htmlContent = this.convertMarkdownToHTML(content);
            messageContent.innerHTML = htmlContent;
            
            messageDiv.appendChild(messageContent);
            
            // Add Save to PDF button for bot messages below the content
            const pdfButton = document.createElement('button');
            pdfButton.className = 'pdf-button';
            pdfButton.innerHTML = '📄 Save to PDF';
            pdfButton.onclick = () => this.saveToPDF(htmlContent);
            messageDiv.appendChild(pdfButton);
        } else {
            messageContent.textContent = content;
            messageDiv.appendChild(messageContent);
        }
        
        this.chatMessages.appendChild(messageDiv);
        
        // Smooth scroll to the new message
        setTimeout(() => {
            messageDiv.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }
    
    convertMarkdownToHTML(markdown) {
        let html = markdown;
        
        // Convert code blocks (```language or ```)
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
            const lang = language ? ` class="language-${language}"` : '';
            return `<pre><code${lang}>${this.escapeHtml(code.trim())}</code></pre>`;
        });
        
        // Convert inline code (`code`)
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert bold text (**text** or __text__)
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // Convert italic text (*text* or _text_)
        html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
        html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
        
        // Convert headers (# ## ###)
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // Convert horizontal rules (--- or ***)
        html = html.replace(/^(-{3,}|\*{3,})$/gm, '<hr>');
        
        // Convert line breaks to paragraphs
        html = html.replace(/\n\n+/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Clean up empty paragraphs and fix paragraph tags around block elements
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre>.*?<\/pre>)<\/p>/gs, '$1');
        html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
        
        // Convert single line breaks to <br> within paragraphs
        html = html.replace(/(?<!<\/p>)\n(?!<p>)/g, '<br>');
        
        return html;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveToPDF(content) {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        
        // Create the HTML content for the PDF
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>SRE Agent Response</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    
                    h1, h2, h3 {
                        color: #2c3e50;
                        margin-top: 30px;
                        margin-bottom: 15px;
                    }
                    
                    h1 { font-size: 24px; }
                    h2 { font-size: 20px; }
                    h3 { font-size: 18px; }
                    
                    p {
                        margin-bottom: 15px;
                        text-align: justify;
                    }
                    
                    code {
                        background-color: #f4f4f4;
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                    }
                    
                    pre {
                        background-color: #f8f9fa;
                        border: 1px solid #e9ecef;
                        border-radius: 6px;
                        padding: 16px;
                        margin: 20px 0;
                        overflow-x: auto;
                    }
                    
                    pre code {
                        background: none;
                        padding: 0;
                        font-size: 13px;
                        line-height: 1.4;
                    }
                    
                    strong {
                        font-weight: 600;
                        color: #2c3e50;
                    }
                    
                    em {
                        font-style: italic;
                        color: #555;
                    }
                    
                    hr {
                        border: none;
                        border-top: 2px solid #eee;
                        margin: 30px 0;
                    }
                    
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #3498db;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    
                    .header h1 {
                        color: #3498db;
                        margin: 0;
                    }
                    
                    .timestamp {
                        color: #666;
                        font-size: 12px;
                        text-align: right;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                    }
                    
                    @media print {
                        body {
                            font-size: 12px;
                            line-height: 1.4;
                        }
                        
                        h1 { font-size: 18px; }
                        h2 { font-size: 16px; }
                        h3 { font-size: 14px; }
                        
                        pre {
                            page-break-inside: avoid;
                        }
                        
                        .header {
                            page-break-after: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>SRE Agent Response</h1>
                </div>
                
                <div class="content">
                    ${content}
                </div>
                
                <div class="timestamp">
                    Generated on: ${new Date().toLocaleString()}
                </div>
            </body>
            </html>
        `;
        
        // Write the HTML to the new window
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for the content to load, then print
        printWindow.onload = function() {
            printWindow.print();
            // Close the window after printing (optional)
            printWindow.onafterprint = function() {
                printWindow.close();
            };
        };
        
        // Show success message
        this.showToast('PDF generation initiated! Please check your downloads folder.');
    }

    async displayChatHistoryModal() {
        if (!this.currentUserId) {
            this.showToast('No chat history available', 'warning');
            return;
        }
        // Remove any existing modal
        const existing = document.getElementById('chatHistoryModal');
        if (existing) existing.remove();
        try {
            const apiUrl = 'https://sre-agent-948325778469.northamerica-northeast2.run.app/api/chat-history';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: this.currentUserId,
                    limit: 50
                })
            });
            if (response.ok) {
                const data = await response.json();
                const allHistory = data.history || [];
                this.showHistoryModalModal(allHistory);
            } else {
                this.showToast('Failed to load chat history', 'error');
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
            this.showToast('Failed to load chat history', 'error');
        }
    }

    showHistoryModalModal(history) {
        // Remove any existing modal
        const existing = document.getElementById('chatHistoryModal');
        if (existing) existing.remove();
        const modal = document.createElement('div');
        modal.id = 'chatHistoryModal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-dialog chat-history-modal">
                <div class="modal-header">
                    <h3>Chat History (Last 7 Days)</h3>
                    <span class="close" style="cursor:pointer;font-size:1.5rem;" title="Close">&times;</span>
                </div>
                <div class="modal-body" id="historyContent">
                    <!-- History content will be loaded here -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        // Style
        const style = document.createElement('style');
        style.textContent = `
            #chatHistoryModal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2000; display: flex; align-items: center; justify-content: center; }
            #chatHistoryModal .modal-overlay { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); }
            #chatHistoryModal .modal-dialog { position: relative; background: #fff; border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); padding: 2.5rem 2.5rem 2rem 2.5rem; z-index: 2; min-width: 350px; max-width: 95vw; max-height: 80vh; overflow-y: auto; }
            #chatHistoryModal .modal-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e5e7eb; margin-bottom: 1.2rem; }
            #chatHistoryModal .modal-header h3 { margin: 0; font-size: 1.3rem; color: #2563eb; }
            #chatHistoryModal .modal-body { max-height: 60vh; overflow-y: auto; }
            #chatHistoryModal .history-item { background: #f3f4f6; border-radius: 8px; margin-bottom: 1.2rem; padding: 1rem 1.2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
            #chatHistoryModal .user-message { color: #0f172a; font-weight: 600; margin-bottom: 0.5rem; }
            #chatHistoryModal .bot-response-container { margin-bottom: 0.5rem; }
            #chatHistoryModal .bot-response { background: #fff; border-radius: 6px; padding: 0.7rem 1rem; margin-top: 0.3rem; font-size: 0.98rem; color: #334155; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
            #chatHistoryModal .show-response-btn { background: #2563eb; color: #fff; border: none; border-radius: 5px; padding: 0.3rem 0.9rem; margin-top: 0.2rem; cursor: pointer; font-size: 0.95rem; transition: background 0.2s; }
            #chatHistoryModal .show-response-btn:hover { background: #1d4ed8; }
            #chatHistoryModal .timestamp { color: #64748b; font-size: 0.92rem; text-align: right; margin-top: 0.7rem; }
            #chatHistoryModal .no-history { color: #b91c1c; text-align: center; margin: 2rem 0; }
            #chatHistoryModal .close { color: #334155; font-weight: bold; margin-left: 1.5rem; }
            #chatHistoryModal .close:hover { color: #ef4444; }
        `;
        document.head.appendChild(style);
        // Close modal
        modal.querySelector('.close').onclick = () => { modal.remove(); style.remove(); };
        modal.querySelector('.modal-overlay').onclick = () => { modal.remove(); style.remove(); };
        // Fill content
        const historyContent = modal.querySelector('#historyContent');
        if (!history || history.length === 0) {
            historyContent.innerHTML = '<p class="no-history">No chat history available</p>';
        } else {
            historyContent.innerHTML = history.map((conversation, index) => `
                <div class="history-item">
                    <div class="user-message">
                        <strong>You:</strong> ${this.escapeHtml(conversation.user_message)}
                    </div>
                    <div class="bot-response-container">
                        <button class="show-response-btn" onclick="window.sreChat.toggleResponse(${index})">
                            Show Response
                        </button>
                        <div class="bot-response" id="response-${index}" style="display: none;">
                            <strong>AI:</strong> ${this.convertMarkdownToHTML(conversation.bot_response)}
                        </div>
                    </div>
                    <div class="timestamp">
                        ${this.formatTimestamp(conversation.timestamp)}
                    </div>
                </div>
            `).join('');
        }
    }

    showHistoryModal(history) {
        const modal = document.getElementById('chatHistoryModal');
        if (!modal) {
            this.createHistoryModal();
            return this.showHistoryModal(history);
        }
        
        const historyContent = document.getElementById('historyContent');
        
        if (history.length === 0) {
            historyContent.innerHTML = '<p class="no-history">No chat history available</p>';
        } else {
            historyContent.innerHTML = history.map((conversation, index) => `
                <div class="history-item">
                    <div class="user-message">
                        <strong>You:</strong> ${this.escapeHtml(conversation.user_message)}
                    </div>
                    <div class="bot-response-container">
                        <button class="show-response-btn" onclick="window.sreChat.toggleResponse(${index})">
                            Show Response
                        </button>
                        <div class="bot-response" id="response-${index}" style="display: none;">
                            <strong>AI:</strong> ${this.convertMarkdownToHTML(conversation.bot_response)}
                        </div>
                    </div>
                    <div class="timestamp">
                        ${this.formatTimestamp(conversation.timestamp)}
                    </div>
                </div>
            `).join('');
        }
        
        modal.style.display = 'block';
    }

    createHistoryModal() {
        const modal = document.createElement('div');
        modal.id = 'chatHistoryModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chat History (Last 7 Days)</h3>
                    <span class="close" onclick="document.getElementById('chatHistoryModal').style.display='none'">&times;</span>
                </div>
                <div id="historyContent" class="modal-body">
                    <!-- History content will be loaded here -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    toggleResponse(index) {
        const responseDiv = document.getElementById(`response-${index}`);
        const button = responseDiv.parentElement.querySelector('.show-response-btn');
        
        if (responseDiv.style.display === 'none') {
            responseDiv.style.display = 'block';
            button.textContent = 'Hide Response';
        } else {
            responseDiv.style.display = 'none';
            button.textContent = 'Show Response';
        }
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
    }
    
    initializeUserSession() {
        // Placeholder for user session logic (can be expanded as needed)
    }
    async loadRecentChatOnStartup() {
        // Load last 5 chat interactions for the user on page load
        if (!this.currentUserId) return;
        try {
            const apiUrl = 'https://sre-agent-948325778469.northamerica-northeast2.run.app/api/chat-history';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: this.currentUserId,
                    limit: 5
                })
            });
            if (response.ok) {
                const data = await response.json();
                const history = data.history || [];
                if (history.length > 0) {
                    history.reverse().forEach(conv => {
                        this.addMessage(conv.user_message, 'user');
                        this.addMessage(conv.bot_response, 'bot');
                    });
                }
            }
        } catch (error) {
            // Fail silently
        }
    }
}

// Question card interactions
class QuestionCardInteractions {
    constructor() {
        this.initializeCardClicks();
    }
    
    initializeCardClicks() {
        // Make individual question items clickable
        const questionItems = document.querySelectorAll('.question-card li');
        questionItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
                const questionText = item.textContent.trim();
                const chatInput = document.getElementById('chatInput');
                chatInput.value = questionText;
                chatInput.focus();
                
                // Scroll to chat section
                document.querySelector('.chat-section').scrollIntoView({
                    behavior: 'smooth'
                });
            });
            
            // Add cursor pointer to indicate clickability
            item.style.cursor = 'pointer';
            item.style.transition = 'background-color 0.2s ease';
            
            // Add hover effect
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f8f9fa';
                item.style.borderRadius = '4px';
                item.style.padding = '4px 8px';
                item.style.margin = '4px -8px';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
                item.style.padding = '0';
                item.style.margin = '12px 0';
            });
        });
        
        // Keep card click for general topic questions
        const questionCards = document.querySelectorAll('.question-card');
        questionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Only trigger if clicking on the card itself, not on list items
                if (e.target.tagName === 'LI') return;
                
                const title = card.querySelector('h3').textContent;
                const chatInput = document.getElementById('chatInput');
                chatInput.value = `Tell me more about ${title.toLowerCase()}`;
                chatInput.focus();
                
                // Scroll to chat section
                document.querySelector('.chat-section').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    }
}

// Smooth scrolling for better UX
class SmoothScrolling {
    constructor() {
        this.initializeSmoothScrolling();
    }
    
    initializeSmoothScrolling() {
        // Add smooth scrolling to any anchor links if added in future
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sreChat = new SREChatInterface();
    new QuestionCardInteractions();
    new SmoothScrolling();
    
    // Add some visual enhancements
    addVisualEnhancements();
    
    // Add global functions for HTML onclick handlers
    window.newChat = () => window.sreChat.newChat();
    window.deleteAllHistory = () => window.sreChat.deleteAllHistory();
    window.displayChatHistoryModal = () => window.sreChat.displayChatHistoryModal();
});

function addVisualEnhancements() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.question-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.cursor = 'pointer';
        });
    });
    
    // Add focus effects to input
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('focus', () => {
        chatInput.parentElement.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
    });
    
    chatInput.addEventListener('blur', () => {
        chatInput.parentElement.style.boxShadow = 'none';
    });
}

// Export classes for potential future use
window.SREChatInterface = SREChatInterface;
window.QuestionCardInteractions = QuestionCardInteractions;
