#!/usr/bin/env python3
"""
Diagnostico local y seguro de una Supabase Secret Key.

- No contiene ninguna clave real.
- Pide la clave con getpass (no se muestra en pantalla).
- Limpia SOLO: espacios al borde, comillas envolventes, y el prefijo
  accidental exacto "echo" si aparece inmediatamente antes de "sb_secret_".
- No modifica ningun otro caracter de la clave.
- No imprime la clave completa ni su final, no escribe nada a disco,
  no genera logs.
"""

import getpass
import re

EXPECTED_PREFIX = "sb_secret_"

# Coincide con "echo" seguido de cero o mas espacios, solo si justo
# despues viene "sb_secret_". No toca nada mas de la cadena.
_ECHO_PREFIX_RE = re.compile(r"^echo\s*(?=" + re.escape(EXPECTED_PREFIX) + r")")


def clean_secret(raw: str) -> str:
    value = raw.strip()

    if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
        value = value[1:-1]

    value = _ECHO_PREFIX_RE.sub("", value)

    return value


def main() -> None:
    raw_input_value = getpass.getpass("Pega la Supabase Secret Key (no se mostrara): ")

    secret_value = clean_secret(raw_input_value)

    length = len(secret_value)
    is_valid = length > 0 and secret_value.startswith(EXPECTED_PREFIX)

    print(f"Longitud: {length}")
    if is_valid:
        print(f"Inicio: {EXPECTED_PREFIX}***")
        print("✅ SECRET KEY VÁLIDA")
    else:
        print("❌ SECRET KEY INVÁLIDA")

    # secret_value vive solo en esta variable local durante la ejecucion.
    # No se escribe a disco, no se loguea, no se imprime completa.
    del secret_value
    del raw_input_value


if __name__ == "__main__":
    main()
