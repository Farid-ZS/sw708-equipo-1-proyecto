import styles from './CintaEstreno.module.scss'

// Cinta diagonal para la esquina superior izquierda de la foto. El contenedor debe tener
// `position: relative` y `overflow: hidden`.
export function CintaEstreno() {
  return <span className={styles.cinta}>Estreno</span>
}
