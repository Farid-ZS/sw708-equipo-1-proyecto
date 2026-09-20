import { Outlet } from 'react-router-dom'
import { Footer } from '../Footer/Footer.tsx'
import { Header } from '../Header/Header.tsx'
import styles from './Layout.module.scss'

// Marco común: header + contenido + footer. Las pantallas que no lo necesiten
// (p. ej. el mapa de butacas a pantalla completa) van fuera de esta ruta en App.tsx.
export function Layout() {
  return (
    <div className={styles.pagina}>
      <Header />
      <main className={styles.contenido}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
