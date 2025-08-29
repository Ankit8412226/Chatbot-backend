/**
 * AI Agent Writer - Chat Widget
 * Easy integration for companies to add chat support to their websites
 *
 * Usage:
 * 1. Include this script in your website
 * 2. Configure with your API key
 * 3. Chat widget will appear automatically
 */

class AIAgentChatWidget {
    constructor(config) {
        this.config = {
            apiKey: config.apiKey,
            domain: config.domain || 'https://yourdomain.com',
            companyName: config.companyName || 'Support',
            position: config.position || 'bottom-right',
            theme: config.theme || 'blue',
            ...config
        };

        this.sessionId = null;
        this.isOpen = false;
        this.messages = [];

        this.init();
    }

    init() {
        this.createWidget();
        this.attachEventListeners();
    }

    createWidget() {
        // Create chat button
        this.chatButton = document.createElement('div');
        this.chatButton.id = 'ai-chat-button';
        this.chatButton.innerHTML = '💬 Need Help?';
        this.chatButton.className = 'ai-chat-button';
        this.chatButton.style.cssText = `
            position: fixed;
            ${this.config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
            ${this.config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
            background: ${this.getThemeColor()};
            color: white;
            padding: 15px 20px;
            border-radius: 25px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            user-select: none;
        `;

        // Create chat window
        this.chatWindow = document.createElement('div');
        this.chatWindow.id = 'ai-chat-window';
        this.chatWindow.className = 'ai-chat-window';
        this.chatWindow.style.cssText = `
            position: fixed;
            ${this.config.position.includes('bottom') ? 'bottom: 80px;' : 'top: 80px;'}
            ${this.config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            display: none;
            flex-direction: column;
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: 1px solid #e1e5e9;
        `;

        // Chat header
        this.chatHeader = document.createElement('div');
        this.chatHeader.style.cssText = `
            background: ${this.getThemeColor()};
            color: white;
            padding: 15px;
            border-radius: 10px 10px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
        `;
        this.chatHeader.innerHTML = `
            <span>Chat with ${this.config.companyName}</span>
            <button id="ai-chat-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">✕</button>
        `;

        // Chat messages area
        this.messagesArea = document.createElement('div');
        this.messagesArea.id = 'ai-chat-messages';
        this.messagesArea.style.cssText = `
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: #f8f9fa;
        `;

        // Chat input area
        this.inputArea = document.createElement('div');
        this.inputArea.style.cssText = `
            padding: 15px;
            border-top: 1px solid #e1e5e9;
            background: white;
            border-radius: 0 0 10px 10px;
        `;

        this.inputArea.innerHTML = `
            <div style="display: flex; gap: 10px;">
                <input type="text" id="ai-chat-input" placeholder="Type your message..."
                       style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;">
                <button id="ai-chat-send"
                        style="background: ${this.getThemeColor()}; color: white; border: none;
                               padding: 10px 15px; border-radius: 5px; cursor: pointer; font-size: 14px;">
                    Send
                </button>
            </div>
        `;

        // Assemble chat window
        this.chatWindow.appendChild(this.chatHeader);
        this.chatWindow.appendChild(this.messagesArea);
        this.chatWindow.appendChild(this.inputArea);

        // Add to page
        document.body.appendChild(this.chatButton);
        document.body.appendChild(this.chatWindow);
    }

    attachEventListeners() {
        // Chat button click
        this.chatButton.addEventListener('click', () => {
            if (!this.sessionId) {
                this.startChat();
            } else {
                this.toggleChat();
            }
        });

        // Close button
        document.getElementById('ai-chat-close').addEventListener('click', () => {
            this.closeChat();
        });

        // Send button
        document.getElementById('ai-chat-send').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key in input
        document.getElementById('ai-chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    async startChat() {
        try {
            // Show loading state
            this.chatButton.innerHTML = '⏳ Connecting...';
            this.chatButton.style.cursor = 'not-allowed';

            // Get customer info (you can customize this)
            const customerName = this.getCustomerName();
            const customerEmail = this.getCustomerEmail();

            // Start chat session
            const response = await fetch(`${this.config.domain}/api/v1/company/api/chat/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.config.apiKey
                },
                body: JSON.stringify({
                    name: customerName,
                    email: customerEmail,
                    phoneNumber: '+1234567890',
                    serviceType: 'general_support'
                })
            });

            const data = await response.json();

            if (data.sessionId) {
                this.sessionId = data.sessionId;
                this.openChat();
                this.addMessage('ai', `Hi ${customerName}! How can I help you today?`);
            } else {
                throw new Error('Failed to start chat session');
            }

        } catch (error) {
            console.error('Error starting chat:', error);
            this.chatButton.innerHTML = '❌ Error - Click to retry';
            this.chatButton.style.cursor = 'pointer';
        }
    }

    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();

        if (!message || !this.sessionId) return;

        // Add user message
        this.addMessage('user', message);
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send to API
            const response = await fetch(`${this.config.domain}/api/v1/company/api/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.config.apiKey
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    message: message
                })
            });

            const data = await response.json();

            // Hide typing indicator
            this.hideTypingIndicator();

            // Add AI response
            if (data.response) {
                this.addMessage('ai', data.response);
            } else {
                this.addMessage('ai', 'Sorry, I\'m having trouble responding right now. Please try again.');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessage('ai', 'Sorry, there was an error sending your message. Please try again.');
        }
    }

    addMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 8px;
            max-width: 80%;
            word-wrap: break-word;
            ${type === 'user'
                ? 'background: #007bff; color: white; margin-left: auto; text-align: right;'
                : 'background: white; color: #333; border: 1px solid #e1e5e9;'
            }
        `;

        messageDiv.innerHTML = `<strong>${type === 'user' ? 'You' : this.config.companyName}:</strong> ${text}`;

        this.messagesArea.appendChild(messageDiv);
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;

        // Store message
        this.messages.push({ type, text, timestamp: new Date() });
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'ai-typing-indicator';
        typingDiv.style.cssText = `
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 8px;
            background: white;
            color: #666;
            border: 1px solid #e1e5e9;
            font-style: italic;
        `;
        typingDiv.innerHTML = `${this.config.companyName} is typing...`;

        this.messagesArea.appendChild(typingDiv);
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('ai-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    openChat() {
        this.chatWindow.style.display = 'flex';
        this.isOpen = true;
        this.chatButton.innerHTML = '💬 Chat Active';
        this.chatButton.style.background = '#28a745';

        // Focus input
        setTimeout(() => {
            document.getElementById('ai-chat-input').focus();
        }, 100);
    }

    closeChat() {
        this.chatWindow.style.display = 'none';
        this.isOpen = false;
        this.chatButton.innerHTML = '💬 Need Help?';
        this.chatButton.style.background = this.getThemeColor();
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    getCustomerName() {
        // Try to get from localStorage or prompt
        let name = localStorage.getItem('ai_chat_customer_name');
        if (!name) {
            name = prompt('What\'s your name?') || 'Customer';
            localStorage.setItem('ai_chat_customer_name', name);
        }
        return name;
    }

    getCustomerEmail() {
        // Try to get from localStorage or prompt
        let email = localStorage.getItem('ai_chat_customer_email');
        if (!email) {
            email = prompt('What\'s your email?') || 'customer@example.com';
            localStorage.setItem('ai_chat_customer_email', email);
        }
        return email;
    }

    getThemeColor() {
        const themes = {
            blue: '#007bff',
            green: '#28a745',
            purple: '#6f42c1',
            orange: '#fd7e14',
            red: '#dc3545'
        };
        return themes[this.config.theme] || themes.blue;
    }

    // Public methods for external control
    open() {
        if (this.sessionId) {
            this.openChat();
        } else {
            this.startChat();
        }
    }

    close() {
        this.closeChat();
    }

    destroy() {
        if (this.chatButton) this.chatButton.remove();
        if (this.chatWindow) this.chatWindow.remove();
    }
}

// Auto-initialize if config is provided
if (typeof window.AI_CHAT_CONFIG !== 'undefined') {
    window.aiChatWidget = new AIAgentChatWidget(window.AI_CHAT_CONFIG);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAgentChatWidget;
}
