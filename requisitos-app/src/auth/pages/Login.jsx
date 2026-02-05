export default function Login() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        padding: "16px",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "24px 20px",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12)",
          border: "1px solid #e5e7eb",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "4px",
            color: "#111827",
            textAlign: "center",
          }}
        >
          Iniciar sesión
        </h1>
        <form>
          <div style={{ marginBottom: "14px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "#4b5563",
                marginBottom: "4px",
              }}
            >
              Correo
            </label>
            <input
              id="email"
              type="email"
              placeholder="nombre@correo.com"
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "#4b5563",
                marginBottom: "4px",
              }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "9px 10px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Entrar
          </button>
        </form>

        <div
          style={{
            marginTop: "14px",
            fontSize: "13px",
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              color: "#2563eb",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Crear usuario
          </button>
        </div>
      </div>
    </div>
  );
}