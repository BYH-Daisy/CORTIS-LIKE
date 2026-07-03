import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import MemberPage from './MemberPage.jsx'
import { AudioProvider } from './AudioContext.jsx'

createRoot(document.getElementById('root')).render(
  <AudioProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/martin" element={<MemberPage name="MARTIN" bgColor="#fca5a5" bgImage="/martin-bg.png" fgImage="/martin-overlay.png" />} />
        <Route path="/james" element={<MemberPage name="JAMES" bgColor="#fdba74" bgImage="/james-bg.png" fgImage="/james-overlay.png" />} />
        <Route path="/juhoon" element={<MemberPage name="JUHOON" bgColor="#93c5fd" bgImage="/juhoon-bg.png" fgImage="/juhoon-overlay.png" />} />
        <Route path="/seonghyeon" element={<MemberPage name="SEONGHYEON" bgColor="#6ee7b7" bgImage="/seonghyeon-bg.png" fgImage="/seonghyeon-overlay.png" />} />
        <Route path="/keonho" element={<MemberPage name="KEONHO" bgColor="#c4b5fd" bgImage="/keonho-bg.png" fgImage="/keonho-overlay.png" />} />
      </Routes>
    </HashRouter>
  </AudioProvider>,
)
