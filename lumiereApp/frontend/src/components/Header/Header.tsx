import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo_lumiere.png'
import styles from './Header.module.scss'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} aria-label="Lumiere Cines, inicio">
          <img src={logo} alt="Lumiere Cines" />
        </Link>

        <nav className={styles.nav} aria-label="Principal">
          <a href="#cartelera">Cartelera</a>
          <a href="#proximamente">Próximamente</a>
          <a href="#confiteria">Confitería</a>
        </nav>

        <div className={styles.acciones}>
          <select className={styles.sede} aria-label="Sede">
            <option>Lumiere Centro</option>
            <option>Lumiere Norte</option>
          </select>
          <button type="button" className={styles.ingresar}>
            Ingresar
          </button>
        </div>
      </div>
    </header>
  )
}
