export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg p-6">
        <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
          Iniciar sesión
        </h1>

        <form className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo
            </label>
            <input
              id="email"
              type="email"
              placeholder="nombre@correo.com"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 transition-colors"
          >
            Entrar
          </button>
        </form>

        <div className="mt-3 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline font-medium"
          >
            Crear usuario
          </button>
        </div>
      </div>
    </div>
  );
}