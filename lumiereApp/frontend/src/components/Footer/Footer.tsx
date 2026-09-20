import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo_lumiere.png'
import styles from './Footer.module.scss'
import { IconoFacebook, IconoInstagram, IconoLibro, IconoTikTok, IconoX, IconoYouTube } from './iconos.tsx'

const columnas = [
  {
    titulo: 'Lumiere',
    enlaces: [
      { texto: 'Quiénes somos', a: '/quienes-somos' },
      { texto: 'Nuestros cines', a: '/nuestros-cines' },
      { texto: 'Trabaja con nosotros', a: '/trabaja-con-nosotros' },
      { texto: 'Contáctanos', a: '/contacto' },
    ],
  },
  {
    titulo: 'Ayuda',
    enlaces: [
      { texto: 'Preguntas frecuentes', a: '/preguntas-frecuentes' },
      { texto: 'Cómo comprar tus entradas', a: '/como-comprar' },
      { texto: 'Cambios y devoluciones', a: '/cambios-y-devoluciones' },
    ],
  },
  {
    titulo: 'Legal',
    enlaces: [
      { texto: 'Términos y condiciones', a: '/terminos-y-condiciones' },
      { texto: 'Políticas de privacidad', a: '/politicas-de-privacidad' },
      { texto: 'Política de cookies', a: '/politica-de-cookies' },
    ],
  },
]

// Reemplazar por las cuentas reales de Lumiere.
const redes = [
  { nombre: 'Facebook', href: 'https://www.facebook.com/', Icono: IconoFacebook },
  { nombre: 'Instagram', href: 'https://www.instagram.com/', Icono: IconoInstagram },
  { nombre: 'TikTok', href: 'https://www.tiktok.com/', Icono: IconoTikTok },
  { nombre: 'YouTube', href: 'https://www.youtube.com/', Icono: IconoYouTube },
  { nombre: 'X', href: 'https://x.com/', Icono: IconoX },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.contenido}>
        <div className={styles.marca}>
          <Link to="/" aria-label="Lumiere Cines, inicio">
            <img src={logo} alt="Lumiere Cines" />
          </Link>
          <p>Cartelera, preventas y estrenos en tu cine Lumiere, con butacas a tu elección.</p>
          <ul className={styles.redes} aria-label="Redes sociales">
            {redes.map(({ nombre, href, Icono }) => (
              <li key={nombre}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={nombre} title={nombre}>
                  <Icono />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {columnas.map((c) => (
          <nav key={c.titulo} className={styles.columna} aria-label={c.titulo}>
            <h3>{c.titulo}</h3>
            <ul>
              {c.enlaces.map((e) => (
                <li key={e.a}>
                  <Link to={e.a}>{e.texto}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className={styles.inferior}>
        <p>© {new Date().getFullYear()} Lumiere Cines. Todos los derechos reservados.</p>
        <Link to="/libro-de-reclamaciones" className={styles.reclamaciones}>
          <IconoLibro />
          Libro de Reclamaciones
        </Link>
      </div>
    </footer>
  )
}
