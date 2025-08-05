import { useState } from "react"
import { LanguageProvider } from "./contexts/LanguageContext"
import LoginScreen from "./pages/LoginScreen"
import Dashboard from "./pages/Dashboard"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./App.css"

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<LoginScreen isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App
