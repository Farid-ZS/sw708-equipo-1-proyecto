import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home.tsx'

// Cada pantalla nueva = una <Route> aquí + su carpeta en src/pages.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}
