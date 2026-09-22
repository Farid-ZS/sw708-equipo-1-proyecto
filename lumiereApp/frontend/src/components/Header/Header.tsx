import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSede } from '../../context/sedeContext.ts'
import { Acceso } from '../Acceso/Acceso.tsx'
import logo from '../../assets/images/logo_lumiere.png'
import styles from './Header.module.scss'

export function Header() {
  const { sede, cambiarSede } = useSede()
  const [accesoAbierto, setAccesoAbierto] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} aria-label="Lumiere Cines, inicio">
          <img src={logo} alt="Lumiere Cines" />
        </Link>

        <nav className={styles.nav} aria-label="Principal">
          <a href="#cartelera">Cartelera</a>
          <a href="#preventa">Preventa</a>
          <a href="#proximamente">Próximamente</a>
        </nav>

        <div className={styles.acciones}>
          <button
            type="button"
            className={styles.sede}
            onClick={cambiarSede}
            aria-label={sede ? `Cine: ${sede.nombre}. Cambiar de cine` : 'Elegir cine'}
          >
            {sede ? sede.nombre : 'Elegir cine'}
          </button>
          <button type="button" className={styles.ingresar} onClick={() => setAccesoAbierto(true)}>
            Ingresar
          </button>
        </div>
      </div>

      <Acceso abierto={accesoAbierto} alCerrar={() => setAccesoAbierto(false)} />
    </header>
  )
}
