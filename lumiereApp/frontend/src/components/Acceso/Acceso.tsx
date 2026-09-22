import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/logo_lumiere.png'
import styles from './Acceso.module.scss'

type Vista = 'iniciar' | 'crear' | 'olvide'

interface Props {
  abierto: boolean
  alCerrar: () => void
}

// Panel lateral (mismo patrón que SedeSelector) con inicio de sesión, crear
// cuenta y recuperar contraseña. Sin backend todavía: al enviar cualquier
// formulario cae en la ruta comodín, igual que el resto de acciones del prototipo.
export function Acceso({ abierto, alCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const navigate = useNavigate()
  const [vista, setVista] = useState<Vista>('iniciar')

  useEffect(() => {
    const d = dialogo.current
    if (!d) return
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  // Siempre arranca en "Iniciar sesión", sin importar en qué vista se quedó la vez anterior.
  useEffect(() => {
    if (abierto) setVista('iniciar')
  }, [abierto])

  // Igual que en SedeSelector: evita la doble barra de scroll y el salto de
  // layout al ocultar la del fondo mientras el panel está abierto.
  useEffect(() => {
    if (!abierto) return
    const anchoBarra = window.innerWidth - document.documentElement.clientWidth
    const overflowOriginal = document.body.style.overflow
    const paddingOriginal = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (anchoBarra > 0) document.body.style.paddingRight = `${anchoBarra}px`
    return () => {
      document.body.style.overflow = overflowOriginal
      document.body.style.paddingRight = paddingOriginal
    }
  }, [abierto])

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    alCerrar()
    navigate('/cuenta')
  }

  return (
    <dialog ref={dialogo} className={styles.dialogo} aria-labelledby="acceso-titulo" onClose={alCerrar}>
      <div className={styles.cabecera}>
        <img src={logo} alt="Lumiere Cines" className={styles.logo} />
        <button type="button" className={styles.cerrar} onClick={alCerrar} aria-label="Cerrar">
          ×
        </button>
      </div>

      {vista === 'iniciar' && (
        <>
          <h2 id="acceso-titulo">Iniciar sesión</h2>
          <p className={styles.ayuda}>Entra con tu cuenta para ver tus compras y beneficios.</p>

          <form className={styles.formulario} onSubmit={enviar}>
            <label>
              Correo electrónico
              <input type="email" name="correo" autoComplete="email" required />
            </label>
            <label>
              Contraseña
              <input type="password" name="clave" autoComplete="current-password" required />
            </label>

            <button type="button" className={styles.enlace} onClick={() => setVista('olvide')}>
              ¿Olvidaste tu contraseña?
            </button>

            <button type="submit" className={styles.primario}>
              Iniciar sesión
            </button>
          </form>

          <p className={styles.pie}>
            ¿No tienes cuenta?{' '}
            <button type="button" className={styles.enlace} onClick={() => setVista('crear')}>
              Crea una aquí
            </button>
          </p>
        </>
      )}

      {vista === 'crear' && (
        <>
          <h2 id="acceso-titulo">Crear cuenta</h2>
          <p className={styles.ayuda}>Regístrate para comprar boletos y guardar tus preferencias.</p>

          <form className={styles.formulario} onSubmit={enviar}>
            <label>
              Nombre completo
              <input type="text" name="nombre" autoComplete="name" required />
            </label>
            <label>
              Correo electrónico
              <input type="email" name="correo" autoComplete="email" required />
            </label>
            <label>
              Contraseña
              <input type="password" name="clave" autoComplete="new-password" minLength={8} required />
            </label>
            <label>
              Confirmar contraseña
              <input type="password" name="claveConfirmar" autoComplete="new-password" minLength={8} required />
            </label>

            <button type="submit" className={styles.primario}>
              Crear cuenta
            </button>
          </form>

          <p className={styles.pie}>
            ¿Ya tienes cuenta?{' '}
            <button type="button" className={styles.enlace} onClick={() => setVista('iniciar')}>
              Inicia sesión
            </button>
          </p>
        </>
      )}

      {vista === 'olvide' && (
        <>
          <h2 id="acceso-titulo">Recuperar contraseña</h2>
          <p className={styles.ayuda}>Te enviaremos un enlace a tu correo para restablecer tu contraseña.</p>

          <form className={styles.formulario} onSubmit={enviar}>
            <label>
              Correo electrónico
              <input type="email" name="correo" autoComplete="email" required />
            </label>

            <button type="submit" className={styles.primario}>
              Enviar enlace
            </button>
          </form>

          <p className={styles.pie}>
            <button type="button" className={styles.enlace} onClick={() => setVista('iniciar')}>
              Volver a iniciar sesión
            </button>
          </p>
        </>
      )}
    </dialog>
  )
}
