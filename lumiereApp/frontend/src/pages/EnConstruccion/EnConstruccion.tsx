import { Link } from 'react-router-dom'
import styles from './EnConstruccion.module.scss'

// Destino temporal de los enlaces del footer y de cualquier ruta que aún no existe.
export default function EnConstruccion() {
  return (
    <section className={styles.pagina}>
      <h1>Página en construcción</h1>
      <p>Estamos preparando esta sección. Vuelve pronto.</p>
      <Link to="/" className={styles.volver}>
        Volver al inicio
      </Link>
    </section>
  )
}
