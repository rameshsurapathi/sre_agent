# SRE Agent - Expert Site Reliability Engineering Assistant

A sophisticated AI-powered Site Reliability Engineering (SRE) assistant that provides expert guidance on monitoring, observability, incident response, and system reliability. Built with modern web technologies and powered by advanced language models.

## 🚀 Project Overview

The SRE Agent is designed to be your go-to expert for Site Reliability Engineering challenges. It specializes in:

- **SLI/SLO Design**: Service Level Indicators and Objectives implementation
- **Monitoring & Observability**: Comprehensive monitoring stack design using Prometheus, Grafana, and distributed tracing
- **Incident Response**: Structured incident management, blameless post-mortems, and escalation procedures
- **System Reliability**: Chaos engineering, capacity planning, and disaster recovery strategies
- **Best Practices**: 20+ years of SRE experience distilled into actionable guidance

## 🛠️ Technologies Used

### Backend
- **FastAPI**: Modern, fast web framework for building APIs with Python 3.13+
- **LangChain**: Framework for developing applications with language models
- **LangGraph**: Library for building stateful, multi-actor applications with LLMs
- **Google Generative AI**: Powered by Google's advanced language models
- **Google Firestore**: NoSQL document database for response caching and data persistence
- **Uvicorn**: ASGI web server for serving the FastAPI application

### Frontend
- **HTML5**: Modern semantic markup
- **CSS3**: Custom styling with responsive design and gradient backgrounds
- **Vanilla JavaScript**: Clean, modern ES6+ JavaScript without framework dependencies
- **Font Awesome**: Professional iconography
- **Responsive Design**: Mobile-first approach with flexible layouts

### Development Tools
- **Python 3.13+**: Latest Python features and performance improvements
- **Poetry/UV**: Modern Python dependency management
- **Environment Variables**: Secure configuration management with python-dotenv
- **Git**: Version control and collaboration

## 🎨 Key Features

### Interactive Chat Interface
- Real-time conversation with the SRE expert
- HTML-formatted responses with proper code syntax highlighting
- Markdown-to-HTML conversion for rich content display
- Smooth scrolling and responsive design

### Pre-built Question Templates
- Clickable sample questions for common SRE scenarios
- Three main categories: Monitoring & Observability, Incident Response, System Reliability
- Instant question population to the chat input

### Advanced UI/UX
- Beautiful gradient background matching the SRE theme
- Professional card-based layout for question categories
- Typing indicators and smooth animations
- Mobile-responsive design

### Backend Features
- Rate limiting to prevent abuse
- Firestore caching for improved response times and data persistence
- Comprehensive error handling
- CORS support for cross-origin requests

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   FastAPI       │    │   AI Services   │
│   (HTML/CSS/JS) │────│   Backend       │────│   (LangChain/   │
│                 │    │                 │    │    Google AI)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │ Google Firestore│
                       │    (Caching)    │
                       └─────────────────┘
```

## 📁 Project Structure

```
sre_agent/
├── app.py                 # FastAPI application entry point
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── styles.css        # CSS styling
│   └── script.js         # JavaScript functionality
├── src/
│   ├── ai_agent.py       # AI agent implementation
│   └── prompts.py        # System prompts and AI configuration
├── pyproject.toml        # Python dependencies and project config
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Python 3.13+
- Google Cloud Project with Firestore enabled
- Google API key for Generative AI
- Google Cloud credentials for Firestore access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sre_agent
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   # or using modern Python package managers
   uv sync
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root with your configuration. Example:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   LLM_MODEL=google-genai
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
   FIRESTORE_PROJECT_ID=your-gcp-project-id
   ```
---

## 🆕 New & Enhanced Features (2025-07-08)

- **Save to PDF**: Instantly export any AI response to a beautifully formatted PDF with a single click. The button appears directly below each AI message.
- **Chat History & Context Memory**: All chat history and context are saved per user (using browser fingerprint/localStorage) in Firestore, with 1-month cache and 1-week chat history retention.
- **Chat Controls**: Modern, responsive controls for New Chat, View History, and Delete History, now located in the chat header for better UX.
- **Confirmation Modals**: Friendly confirmation dialogs for deleting all chat history and starting a new chat ("This will clear the current conversation. Continue?").
- **Chat History Modal**: View your last 7 days of chat history in a beautiful, scrollable modal with collapsible AI responses and timestamps.
- **Session Persistence**: The last 5 chat interactions are automatically loaded for returning users.
- **Enhanced Greeting**: The initial greeting now asks for your name ("By the way, with whom do I have the pleasure to talk today?"), making the chat more friendly and personal.
- **UI/UX Polish**: Improved CSS for chat controls, PDF button, and modals. All controls are mobile-friendly and visually consistent.
- **Robust Error Handling**: Improved error messages and handling for all chat and history actions.
- **Sample Questions**: Clickable question cards for common SRE topics, with smooth scroll and instant population to the chat input.
- **No .env.example**: The setup instructions now reflect that you must create your own `.env` file (no template is provided).

4. **Configure your environment**
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   LLM_MODEL=google-genai
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
   FIRESTORE_PROJECT_ID=your-gcp-project-id
   ```

5. **Set up Google Cloud Firestore**
   - Create a Google Cloud Project
   - Enable the Firestore API
   - Create a service account and download the JSON key file
   - Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

6. **Run the application**
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

7. **Access the application**
   Open your browser and navigate to `http://localhost:8000`

## 🔧 Configuration

### Environment Variables
- `GOOGLE_API_KEY`: Your Google Generative AI API key
- `LLM_MODEL`: The language model to use (default: google-genai)
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Google Cloud service account JSON key file
- `FIRESTORE_PROJECT_ID`: Your Google Cloud Project ID
- `DEBUG`: Enable debug mode (default: true)

### Rate Limiting
The application includes built-in rate limiting:
- 5 requests per minute per IP address
- Configurable in `app.py`

## 📚 API Endpoints

### `GET /`
Serves the main HTML interface

### `POST /api/chat`
Chat endpoint for interacting with the SRE agent

**Request Body:**
```json
{
  "message": "How do I implement SLI/SLO monitoring?"
}
```

**Response:**
```json
{
  "response": "HTML-formatted response from the SRE expert"
}
```

## 🎯 Use Cases

### For SRE Teams
- **Incident Response Planning**: Get guidance on building runbooks and escalation procedures
- **Monitoring Strategy**: Design comprehensive observability solutions
- **Capacity Planning**: Learn about load testing and scaling strategies

### For DevOps Engineers
- **Tool Selection**: Compare monitoring tools and observability platforms
- **Best Practices**: Learn industry-standard SRE practices
- **Troubleshooting**: Get help with system reliability challenges

### For Engineering Managers
- **Team Building**: Understand SRE role requirements and team structures
- **Process Implementation**: Learn about implementing SRE practices in organizations
- **Risk Management**: Understand error budgets and reliability targets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with inspiration from Google's SRE practices and principles
- Leverages the power of modern language models for expert-level guidance
- Designed for the SRE community to share knowledge and best practices

## 📞 Support

For questions, issues, or contributions, please:
- Open an issue on GitHub
- Check the documentation in the `src/prompts.py` file for system behavior
- Review the code comments for implementation details

---

**Made with ❤️ for the SRE Community**