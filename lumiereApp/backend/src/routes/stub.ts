import type { Request, Response } from 'express'

// Handler temporal: responde qué endpoint se pidió y qué datos llegaron.
// Al implementar una pantalla, se reemplaza `stub` por el controlador real.
export const stub = (descripcion: string) => (req: Request, res: Response) => {
  res.json({
    pendiente: true,
    endpoint: `${req.method} ${req.baseUrl}${req.path === '/' ? '' : req.path}`,
    descripcion,
    params: req.params,
    query: req.query,
    body: req.body ?? null,
  })
}
