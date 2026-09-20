import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout/Layout.tsx'
import { SedeProvider } from './context/SedeProvider.tsx'
import EnConstruccion from './pages/EnConstruccion/EnConstruccion.tsx'
import Home from './pages/Home/Home.tsx'

// Cada pantalla nueva = una <Route> aquí + su carpeta en src/pages.
// Las que van dentro de <Layout> llevan header y footer.
export default function App() {
  return (
    <SedeProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<EnConstruccion />} />
        </Route>
      </Routes>
    </SedeProvider>
  )
}
