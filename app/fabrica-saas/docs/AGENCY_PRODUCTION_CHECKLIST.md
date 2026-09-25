# AGENCY_PRODUCTION_CHECKLIST — Paso G

**28 Items Pre-Producción para SaaS de Agencia**

`evaluateProductionChecklist(checks)` valida el estado de cada item.

---

## Items por Categoría

### CODE_QUALITY (4)
| ID | Item | Crítico |
|---|---|---|
| PC-01 | Lint 0 errores | ✅ |
| PC-02 | Build sin warnings | ✅ |
| PC-03 | Sin TODO/FIXME bloqueantes | No |
| PC-04 | Dead code eliminado | No |

### TESTING (5)
| ID | Item | Crítico |
|---|---|---|
| PC-05 | Todos los tests pasan | ✅ |
| PC-06 | Sin tests críticos omitidos | ✅ |
| PC-07 | Post-deploy QA checklist listo | ✅ |
| PC-08 | Visual QA por breakpoints revisado | No |
| PC-09 | Mobile en dispositivo real | No |

### SECURITY (6)
| ID | Item | Crítico |
|---|---|---|
| PC-10 | Sin secretos en código | ✅ |
| PC-11 | Security headers configurados | ✅ |
| PC-12 | CORS policy revisada | ✅ |
| PC-13 | Auth flows probados | ✅ |
| PC-14 | Role gates verificados | ✅ |
| PC-15 | Dependency CVE audit completado | No |

### COMPLIANCE (3)
| ID | Item | Crítico |
|---|---|---|
| PC-16 | GDPR consent (si aplica) | No |
| PC-17 | Data retention documentada | No |
| PC-18 | Privacy policy accesible | No |

### PERFORMANCE (3)
| ID | Item | Crítico |
|---|---|---|
| PC-19 | LCP < 2.5s estimado | No |
| PC-20 | Sin recursos bloqueantes de render | No |
| PC-21 | Bundle size revisado | No |

### DEPLOY_PROCESS (4)
| ID | Item | Crítico |
|---|---|---|
| PC-22 | Deploy target configurado | ✅ |
| PC-23 | Env vars configuradas en proveedor | ✅ |
| PC-24 | Rollback plan definido | ✅ |
| PC-25 | Human approval obtenida | ✅ |

### MONITORING (2)
| ID | Item | Crítico |
|---|---|---|
| PC-26 | Health check endpoint configurado | No |
| PC-27 | Alertas de error documentadas | No |

### CLIENT_HANDOFF (1)
| ID | Item | Crítico |
|---|---|---|
| PC-28 | Cliente notificado de ventana de deploy | No |

---

## readyForProduction

`true` si: todos los críticos pasan Y ningún crítico está en PENDING.

> Production checklist = validación operacional agencia. No es auditoría legal.
