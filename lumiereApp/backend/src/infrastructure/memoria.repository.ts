import { Boleto, type BoletoRepository, AsientoOcupadoError } from '../domain/cinema.ts'

export class InMemoryBoletoRepository implements BoletoRepository {
  private boletos: Boleto[] = []

  async guardar(boleto: Boleto): Promise<void> {
    const existe = this.boletos.some(
      (b) => b.funcionId === boleto.funcionId && b.asiento === boleto.asiento
    )
    if (existe) {
      throw new AsientoOcupadoError(`El asiento ${boleto.asiento} ya está ocupado`)
    }
    this.boletos.push(boleto)
  }

  async buscarPorAsiento(funcionId: string, asiento: string): Promise<Boleto | null> {
    const encontrado = this.boletos.find(
      (b) => b.funcionId === funcionId && b.asiento === asiento
    )
    return encontrado ? new Boleto(
      encontrado.id,
      encontrado.funcionId,
      encontrado.asiento,
      encontrado.nombreCliente,
      encontrado.reservadoEn
    ) : null
  }

  limpiar(): void {
    this.boletos = []
  }
}
