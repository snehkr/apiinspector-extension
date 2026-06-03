<div align="center">
  <img src="src/assets/logo.png" width="128" alt="APIInspector Logo">
  <h1>🚀 APIInspector</h1>
  <p><strong>The Ultimate, High-Performance Developer Tool for Network Analysis</strong></p>
</div>

---

**APIInspector** is a hyper-optimized Chrome DevTools extension built for power users. It completely replaces the default Chrome Network tab, offering a significantly more powerful, beautiful, and feature-rich interface to monitor, debug, and analyze network requests.

Built entirely with React, Vite, TailwindCSS, and Zustand.

---

## ✨ Features

### ⚡ Blazing Fast Performance
- **Virtualized DOM Rendering**: Powered by `@tanstack/react-virtual`. Seamlessly scroll through **10,000+ network requests** simultaneously without your browser breaking a sweat.
- **Memory Cap**: Hard-capped request store prevents background memory leaks on analytics-heavy websites.

### 🧠 Google Gemini AI Insights
- **Built-in AI Assistant**: Confused by a massive JSON response or a weird 500 Server Error? Click the **✨ AI Insights** tab.
- APIInspector uses the Google Gemini API to instantly read the request and response, explaining exactly what the API does, why an error occurred, and how you can fix it.

### 🔍 Advanced Analyzers
- **GraphQL Parser**: Automatically detects GraphQL requests. Parses deeply nested queries, variables, and mutations into beautifully highlighted syntax.
- **JWT Decoder**: Automatically intercepts `Authorization: Bearer` headers. Extracts your JWT tokens, decodes the base64 payload, and shows you the exact claims (exp, sub, iat) without having to copy-paste into jwt.io.

### 🛠️ Power User Tools
- **Advanced Filtering**: Filter your traffic stream by text, HTTP Method (`GET`, `POST`, `PUT`, `DELETE`), or Status Code (isolate failing `4xx/5xx` errors instantly).
- **Code Snippet Generator**: Found a request you want to test in code? Export it instantly as **cURL**, **Native Fetch API**, or **Axios**.
- **HAR Session Export**: Download your entire filtered network session as a `.har` (HTTP Archive) file. Drag and drop it straight into Postman, Insomnia, or share it with your backend team.
- **Replay Requests**: Re-fire any recorded network request directly from the UI with a single click.

### 🎨 Gorgeous Modern UI
- **TailwindCSS Architecture**: A stunning, modern dark-mode interface.
- **Resizable Panels**: Perfect 40/60 split allowing you to browse requests and analyze deeply nested JSON responses side-by-side.
- **Tabbed Inspector**: Cleanly separates Headers, Query Params, Payload, Response Body, Cookies, and Timings.

---

## 🚀 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SnehKr/apiinspector-extension.git
   cd apiinspector-extension
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Extension**
   ```bash
   npm run build
   ```

4. **Load into Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **"Developer mode"** in the top right corner.
   - Click **"Load unpacked"** and select the generated `dist/` folder inside the project.

5. **Configure AI (Optional)**
   - Click the APIInspector icon in your Chrome extensions bar to open the popup.
   - Click the **Settings (⚙️)** button.
   - Paste in your Google Gemini API Key.
   - Now you can use the AI Insights tab inside DevTools!

---

## 💻 Tech Stack
- **Framework**: React 18
- **Bundler**: Vite (with CRXJS Vite Plugin)
- **Styling**: TailwindCSS & Lucide React
- **State Management**: Zustand
- **Performance**: Tanstack Virtual
- **Syntax Highlighting**: React Syntax Highlighter

---

<div align="center">
  <i>Built with ❤️ for Developers</i>
</div>
