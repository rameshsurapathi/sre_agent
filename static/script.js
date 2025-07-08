// Chat functionality
class SREChatInterface {
    constructor() {
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.currentUserId = null;
        this.chatHistory = [];
        
        this.initializeEventListeners();
        this.initializeUserSession();
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
        
        // Auto-resize input
        this.chatInput.addEventListener('input', () => {
            this.autoResizeInput();
        });
    }
    
    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.chatInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
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

        try {
            const response = await fetch('/api/chat-history', {
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
                this.showHistoryModal(allHistory);
            } else {
                this.showToast('Failed to load chat history', 'error');
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
            this.showToast('Failed to load chat history', 'error');
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
