import { Link } from 'react-router-dom'
import { useSede } from '../../context/sedeContext.ts'
import logo from '../../assets/images/logo_lumiere.png'
import styles from './Header.module.scss'

export function Header() {
  const { sede, cambiarSede } = useSede()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} aria-label="Lumiere Cines, inicio">
          <img src={logo} alt="Lumiere Cines" />
        </Link>

        <nav className={styles.nav} aria-label="Principal">
          <a href="#cartelera">Cartelera</a>
          <a href="#proximamente">Próximamente</a>
        </nav>

        <div className={styles.acciones}>
          <button type="button" className={styles.sede} onClick={cambiarSede} aria-label={`Cine: ${sede.nombre}. Cambiar de cine`}>
            {sede.nombre}
          </button>
          <button type="button" className={styles.ingresar}>
            Ingresar
          </button>
        </div>
      </div>
    </header>
  )
}
