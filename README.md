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
- **Redis**: In-memory caching for response optimization
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
- Redis caching for improved response times
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
                       │   Redis Cache   │
                       │                 │
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
- Redis server (for caching)
- Google API key for Generative AI

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
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Configure your environment**
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   LLM_MODEL=google-genai
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

5. **Start Redis server**
   ```bash
   redis-server
   ```

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
- `REDIS_HOST`: Redis server hostname (default: localhost)
- `REDIS_PORT`: Redis server port (default: 6379)
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