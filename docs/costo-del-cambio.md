# Cuadro del costo del cambio

**Equipo:** Equipo 1  
**Integrantes:** Gonzalo Albornoz, Carlos Chávez, Dino Suazo, Farid Zamudio, Luis Vargas  
**Fecha:** 11 de octubre de 2026  

## Los números

| | Versión A, un solo paquete | Versión B, por capas |
|---|---|---|
| Minutos hasta la prueba en verde | 3,6 min (3:34) | 18:35 |
| Archivos tocados | 3 archivos (`Prestamo.java`, `PrestamoService.java`, `PrestamoServiceTest.java`) | 5 archivos (`Prestamo.java`, `dominio/PrestamoService.java`, `dominio/ReglasDePrestamo.java`, `dominio/PrestamoServiceTest.java`, `infraestructura/RepositorioEnMemoriaTest.java`) |
| Líneas agregadas y borradas | 70 agregadas, 13 borradas (+70 / -13, 83 total) | 42 agregadas, 17 borradas (+42 / -17, 59 total) |
| Pruebas que se rompieron | Ninguna; las 4 pruebas iniciales siguieron en verde | 5 errores de compilación en las pruebas (0 fallos de aserción) |
| Lugares donde hubo que buscar | 3 archivos del mismo paquete: modelo, servicio y prueba | 5 archivos distribuidos entre dominio e infraestructura: modelo, servicio, reglas, prueba del servicio y prueba del repositorio |

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
  - Versión A: [test-pruebas-01-version-A-antes.png](costo-del-cambio/version-a/test-pruebas-01-version-A-antes.png) (4 tests en verde).
  - Versión B: [inicio-version-b.png](costo-del-cambio/version-b/inicio-version-b.png) (5 tests en verde).
- **Métricas y resultado de la Versión A tras el requisito (Paso 2):**
  - Archivos tocados (`git status --short`): [git-status-final.png](costo-del-cambio/version-a/git-status-final.png).
  - Líneas agregadas/borradas (`git diff --stat`): [git-diff--stat.png](costo-del-cambio/version-a/git-diff--stat.png).
  - Pruebas finales en verde: [test-pruebas-03-version-A-después.png](costo-del-cambio/version-a/test-pruebas-03-version-A-después.png) (8 tests en verde).
- **Métricas y resultado de la Versión B tras el requisito (Paso 2):**
  - Pruebas rotas antes de corregir el cambio: [test-pruebas-rotas.png](costo-del-cambio/version-b/test-pruebas-rotas.png) (5 errores de compilación).
  - Archivos tocados (`git status --short`): [git-status--short.png](costo-del-cambio/version-b/git-status--short.png).
  - Líneas agregadas/borradas (`git diff --stat`): [git-diff--stat.png](costo-del-cambio/version-b/git-diff--stat.png).
  - Pruebas finales en verde: [test-pruebas-verde.png](costo-del-cambio/version-b/test-pruebas-verde.png) (5 tests en verde).

Los tiempos se calcularon con las marcas de las capturas: en A, de 11:22:02 a 11:25:36; en B, de 16:30:50 a 16:35:12. Se mide desde la primera ejecución afectada por el cambio hasta la ejecución verde posterior, no desde la compilación inicial.
