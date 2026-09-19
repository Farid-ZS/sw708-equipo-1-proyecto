import logo from '../../assets/images/logo_lumiere.png'
import styles from './Footer.module.scss'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <img src={logo} alt="Lumiere Cines" />
      <p>© {new Date().getFullYear()} Lumiere Cines · Prototipo</p>
    </footer>
  )
}
