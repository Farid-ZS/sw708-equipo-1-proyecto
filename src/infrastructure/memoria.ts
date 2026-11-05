import { Boleto, type BoletoRepository } from '../domain/cinema.ts'

export class InMemoryBoletoRepository implements BoletoRepository {
  private readonly boletos = new Map<string, Boleto>()

  async guardar(boleto: Boleto): Promise<void> {
    this.boletos.set(this.clave(boleto.funcionId, boleto.asiento), boleto)
  }

  async buscarPorAsiento(funcionId: string, asiento: string): Promise<Boleto | null> {
    return this.boletos.get(this.clave(funcionId, asiento)) ?? null
  }

  private clave(funcionId: string, asiento: string): string {
    return `${funcionId}::${asiento}`
  }
}
