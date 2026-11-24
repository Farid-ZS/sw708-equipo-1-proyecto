import { test, describe, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  AsientoOcupadoError,
  Boleto,
  ServicioNoDisponibleError,
  type BoletoRepository,
} from '@lumiere/reservas'
import {
  BoletoRepositoryConCircuitBreaker,
  type OpcionesResiliencia,
} from '../infrastructure/resiliencia.ts'

class RepoFalso implements BoletoRepository {
  llamadas = 0
  comportamiento: () => Promise<Boleto | null> = async () => null

  async guardar(_boleto: Boleto): Promise<void> {
    this.llamadas++
    await this.comportamiento()
  }

  async buscarPorAsiento(_funcionId: string, _asiento: string): Promise<Boleto | null> {
    this.llamadas++
    return this.comportamiento()
  }
}

const opciones = (cambios: Partial<OpcionesResiliencia> = {}): OpcionesResiliencia => ({
  timeout: 200,
  errorThresholdPercentage: 50,
  volumeThreshold: 2,
  resetTimeout: 60_000,
  reintentos: 0,
  esperaReintentoMs: 1,
  ...cambios,
})

describe('Resiliencia: timeout y circuit breaker sobre BoletoRepository', () => {
  let proteccion: BoletoRepositoryConCircuitBreaker | undefined

  afterEach(() => {
    proteccion?.cerrar()
    proteccion = undefined
  })

  const crear = (repo: RepoFalso, cambios: Partial<OpcionesResiliencia> = {}) => {
    proteccion = new BoletoRepositoryConCircuitBreaker(repo, opciones(cambios), () => {})
    return proteccion
  }

  test('con la base caída el circuito se abre y deja de llamarla', async () => {
    const repo = new RepoFalso()
    repo.comportamiento = async () => {
      throw new Error('ECONNREFUSED')
    }
    const repoProtegido = crear(repo)

    for (let i = 0; i < 2; i++) {
      await assert.rejects(
        () => repoProtegido.buscarPorAsiento('F001', 'A1'),
        (err: unknown) => err instanceof ServicioNoDisponibleError
      )
    }
    const llamadasAntes = repo.llamadas

    await assert.rejects(
      () => repoProtegido.buscarPorAsiento('F001', 'A1'),
      (err: unknown) => err instanceof ServicioNoDisponibleError
    )
    assert.equal(repo.llamadas, llamadasAntes)
  })

  test('una base que no responde falla por timeout, no espera para siempre', async () => {
    const repo = new RepoFalso()
    repo.comportamiento = () => new Promise<Boleto | null>(() => {})
    const repoProtegido = crear(repo, { timeout: 50 })

    const inicio = Date.now()
    await assert.rejects(
      () => repoProtegido.buscarPorAsiento('F001', 'A1'),
      (err: unknown) => err instanceof ServicioNoDisponibleError
    )
    assert.ok(Date.now() - inicio < 1000)
  })

  test('un asiento ocupado es respuesta de negocio: no abre el circuito', async () => {
    const repo = new RepoFalso()
    repo.comportamiento = async () => {
      throw new AsientoOcupadoError()
    }
    const repoProtegido = crear(repo)
    const boleto = Boleto.crear('F001', 'A1', 'Ana')

    for (let i = 0; i < 5; i++) {
      await assert.rejects(
        () => repoProtegido.guardar(boleto),
        (err: unknown) => err instanceof AsientoOcupadoError
      )
    }

    repo.comportamiento = async () => null
    await repoProtegido.guardar(boleto)
    assert.equal(repo.llamadas, 6)
  })

  test('cuando la base vuelve, el circuito se cierra solo', async () => {
    const repo = new RepoFalso()
    repo.comportamiento = async () => {
      throw new Error('ECONNREFUSED')
    }
    const repoProtegido = crear(repo, { volumeThreshold: 1, resetTimeout: 100 })

    await assert.rejects(
      () => repoProtegido.buscarPorAsiento('F001', 'A1'),
      (err: unknown) => err instanceof ServicioNoDisponibleError
    )

    repo.comportamiento = async () => null
    await new Promise((resolver) => setTimeout(resolver, 150))

    assert.equal(await repoProtegido.buscarPorAsiento('F001', 'A1'), null)
    assert.equal(await repoProtegido.buscarPorAsiento('F001', 'A1'), null)
  })

  test('una lectura que falla se reintenta y se recupera', async () => {
    const repo = new RepoFalso()
    let fallas = 2
    repo.comportamiento = async () => {
      if (fallas-- > 0) throw new Error('ECONNRESET')
      return null
    }
    const repoProtegido = crear(repo, { reintentos: 2, volumeThreshold: 10 })

    assert.equal(await repoProtegido.buscarPorAsiento('F001', 'A1'), null)
    assert.equal(repo.llamadas, 3)
  })

  test('guardar no se reintenta', async () => {
    const repo = new RepoFalso()
    repo.comportamiento = async () => {
      throw new Error('ECONNRESET')
    }
    const repoProtegido = crear(repo, { reintentos: 2, volumeThreshold: 10 })

    await assert.rejects(
      () => repoProtegido.guardar(Boleto.crear('F001', 'A1', 'Ana')),
      (err: unknown) => err instanceof ServicioNoDisponibleError
    )
    assert.equal(repo.llamadas, 1)
  })
})
