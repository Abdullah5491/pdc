import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/Layout"
import Analytics from "./pages/Analytics"
import Chat from "./pages/Chat"
import Documents from "./pages/Documents"
import Settings from "./pages/Settings"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Chat />} />
          <Route path="/chat/:chatId" element={<Chat />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
