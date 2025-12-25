# LaTomate 🍅

> An elegant and powerful Chrome Pomodoro extension to improve your focus and productivity

![Version](https://img.shields.io/badge/version-0.6.1-red.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)

## 🎯 What is LaTomate?

LaTomate is a modern Chrome extension that implements the Pomodoro Technique to help you stay focused and productive. Built with TypeScript and React, it combines ease of use with advanced features.

### ✨ Features

#### Current Version (v0.6.0)
- ⏱️ **Multiple Timer Modes**
  - 🍅 Classic Pomodoro (25/5/15)
  - 💪 Intensive Mode (45/15/30)
  - 💻 Developer Mode 52-17 (52/17/17)
  - ⚙️ Custom Mode (define your own durations)
- ⏸️ **Timer Controls**: Start/Pause/Reset with double-click reset all
- 🔔 **Smart Notifications**: Customizable end-of-session alerts
- 🏷️ **Tags System**
  - Create custom tags to organize your sessions
  - 8 color options for visual identification
  - Filter statistics by tags
  - Analyze productivity by category
- 📅 **Custom Date Filters**: Select precise date ranges for detailed analysis
- 📊 **Advanced Statistics**
  - Overview with current streak and key metrics
  - GitHub-style activity heatmap (365 days)
  - Interactive charts (sessions over time, focus time, completion rate)
  - Detailed session history with advanced filters
  - Tag-based analytics and insights
- 💬 **User Feedback System**: Rate, suggest features, or report bugs directly from the app
- 🎨 **Modern UI**: Clean and minimalist interface with Material Icons
- 🌓 **Theme Support**: Light, Dark, and Auto (follows system)
- 🌍 **Multi-language**: English and French

#### Coming Soon
- 🎵 Ambient sounds (rain, café, nature)
- 📝 Note-taking during sessions
- 🚫 Tab management and site blocking
- 🤖 Integrated LLM assistant
- ☁️ Cloud sync with Firebase

## 🚀 Installation

### For Users

1. Download the latest version from the [Chrome Web Store](https://chromewebstore.google.com/detail/latomate/cjfogkmednfbmgdgnpikdajnkmbpdegl)
2. Click on the LaTomate icon in your toolbar
3. Start your first focus session! 🍅

### For Developers

```bash
# Clone the repository
git clone https://github.com/your-username/latomate.git
cd latomate

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

#### Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `dist` folder generated after building

## 🛠️ Tech Stack

- **TypeScript** - Type safety and better DX
- **React 18** - Reactive and modern UI
- **Vite** - Ultra-fast build tool
- **@crxjs/vite-plugin** - Native Chrome Extension support
- **Chrome Extension Manifest V3** - Latest API version

## 📖 How to Use

### Basic Usage

1. **Choose your mode**: Select from Pomodoro, Intensive, 52-17, or Custom in Settings
2. **Create tags** (optional): Organize your work with custom tags (Projects, Tasks, etc.)
3. **Start a session**: Click the "Start" button and select relevant tags
4. **Focus**: Work during your session without distractions
5. **Take breaks**: Enjoy short breaks between sessions
6. **Track progress**: View your statistics, filter by tags, and analyze productivity

### Statistics Page

Access detailed insights about your productivity:

- **Overview Tab**: Current streak, today's stats, weekly and monthly summaries
- **Activity Heatmap**: GitHub-style visualization of your last 365 days
- **Details Tab**: Complete session history with advanced filters (date ranges, session types, tags)
- **Tags Tab**: Analyze productivity by tags with detailed statistics
- **Charts Tab**: Visual analytics with interactive graphs

### Settings

Customize LaTomate to your needs:

- **Timer**: Choose your preferred work/break pattern
- **Tags**: Create and manage custom tags for organizing your sessions
- **Theme**: Light, Dark, or Auto (system preference)
- **Language**: English or French
- **Notifications**: Enable/disable session completion alerts
- **Feedback**: Rate the app, suggest features, or report issues

## 🎨 Screenshots

![Screenshot](https://lh3.googleusercontent.com/AN8hGhPxgo_gP74Mx10u2LoqWvlx8jSvvZjGbavn15AsjAUCbPX4cgA-kLtQJHuAzYp-uLcxEqWYW-noOJmvl89SeEs=s1600-w1600-h1000)

## 🤝 Contributing

Contributions are welcome! Here's how to participate:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


### Next Steps
- [ ] Ambient sounds
- [ ] Note-taking during sessions
- [ ] Tab management and site blocking
- [ ] Cloud sync with Firebase

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- The Pomodoro Technique developed by Francesco Cirillo
- The open-source community
- All project contributors

## 📬 Contact

- GitHub: [@vFoex](https://github.com/vFoex)
- LinkedIn: [Valentin Foex](https://www.linkedin.com/in/valentin-foex)
