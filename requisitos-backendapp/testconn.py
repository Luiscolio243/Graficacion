import psycopg

passwords = ["Fernado2003", "Fernando2003", "Fernado2003+", "Fernando2003+", "Fernado252003", "Fernando252003"]

for pwd in passwords:
    try:
        conn = psycopg.connect(f"host=localhost port=5432 user=postgres password={pwd} dbname=postgres")
        print(f"PASSWORD CORRECTA: '{pwd}'")
        conn.close()
        break
    except Exception:
        print(f"Incorrecta: '{pwd}'")
