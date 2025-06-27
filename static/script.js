// Chat functionality
class SREChatInterface {
    constructor() {
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        
        this.initializeEventListeners();
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
        } else {
            messageContent.textContent = content;
        }
        
        messageDiv.appendChild(messageContent);
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
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        
        // Smooth scroll to the typing indicator
        setTimeout(() => {
            typingDiv.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
        
        // Add CSS for typing animation
        this.addTypingAnimation();
    }
    
    hideTypingIndicator() {
        const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    addTypingAnimation() {
        if (document.querySelector('.typing-animation-styles')) return;
        
        const style = document.createElement('style');
        style.className = 'typing-animation-styles';
        style.textContent = `
            .typing-dots {
                display: flex;
                gap: 4px;
                align-items: center;
            }
            
            .typing-dots span {
                width: 6px;
                height: 6px;
                background-color: #999;
                border-radius: 50%;
                animation: typing 1.4s infinite ease-in-out;
            }
            
            .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
            .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
            .typing-dots span:nth-child(3) { animation-delay: 0s; }
            
            @keyframes typing {
                0%, 80%, 100% {
                    transform: scale(0.8);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    async sendToAPI(message) {
        try {
            const response = await fetch('api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.hideTypingIndicator();
            this.addMessage(data.response, 'bot');
            
        } catch (error) {
            console.error('Error sending message to API:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error while processing your request. Please try again later.', 'bot');
        }
    }
    
    autoResizeInput() {
        // Auto-resize input field if needed (future enhancement)
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = this.chatInput.scrollHeight + 'px';
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
    new SREChatInterface();
    new QuestionCardInteractions();
    new SmoothScrolling();
    
    // Add some visual enhancements
    addVisualEnhancements();
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
