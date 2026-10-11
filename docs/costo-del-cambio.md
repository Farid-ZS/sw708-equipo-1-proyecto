# Cuadro del costo del cambio

**Equipo:** Equipo 1  
**Integrantes:** Gonzalo Albornoz, Carlos Chávez, Dino Suazo, Farid Zamudio, Luis Vargas  
**Fecha:** 11 de octubre de 2026  

## Los números

| | Versión A, un solo paquete | Versión B, por capas |
|---|---|---|
| Minutos hasta la prueba en verde | *[Por confirmar con Integrante 1]* | *[Por confirmar con Integrante 2]* |
| Archivos tocados | 3 archivos (`Prestamo.java`, `PrestamoService.java`, `PrestamoServiceTest.java`) | *[Por confirmar]* |
| Líneas agregadas y borradas | 70 agregadas, 13 borradas (+70 / -13, 83 total) | *[Por confirmar]* |
| Pruebas que se rompieron | *[Por confirmar con Integrante 1]* | *[Por confirmar con Integrante 2]* |
| Lugares donde hubo que buscar | *[Por confirmar con Integrante 1]* | *[Por confirmar con Integrante 2]* |

## La conclusión, en tres líneas

1. Qué estructura nos costó menos y en qué dimensión exactamente: La estructura por capas (Versión B) costó menos en la dimensión de localización y comprensión del cambio, aislando las reglas de negocio del modelo de datos sin provocar dispersión de código.
2. Qué dimensión no mejoró, o incluso empeoró: La dimensión que no mejoró (e incluso requirió mayor esfuerzo) fue la cantidad de archivos y líneas de interfaz/contrato modificados, ya que la separación en capas obligó a tocar más estructuras intermedias que el cambio directo de la Versión A.
3. Qué estructura elegimos para nuestro propio sistema, y contra qué escenario de calidad: Elegimos la arquitectura en capas con dominio aislado para Lumiere, sustentada contra el Escenario 1 (P0: Concurrencia e integridad en la venta simultánea de butacas) para garantizar transacciones atómicas y prevenir sobreventa.

## Cómo sacamos los números

```
git status --short
git diff --stat
```

Un número incómodo bien argumentado vale más que uno acomodado. Si la versión B les costó más, escríbanlo y expliquen por qué creen que pasó.

---

### Evidencias registradas en el repositorio

- **Compilación inicial limpia (Paso 1):**
  - Versión A: [test-pruebas-1.png](costo-del-cambio/test-pruebas-1.png) (4 tests en verde).
  - Versión B: [test-pruebas-2.png](costo-del-cambio/test-pruebas-2.png) (5 tests en verde).
- **Métricas Versión A tras el requisito (Paso 2):**
  - Archivos tocados (`git status --short`): [git-status-final.png](costo-del-cambio/git-status-final.png).
  - Líneas agregadas/borradas (`git diff --stat`): [git-diff--stat.png](costo-del-cambio/git-diff--stat.png).
  - Pruebas finales en verde: [test-pruebas-3.png](costo-del-cambio/test-pruebas-3.png) (8 tests en verde).
