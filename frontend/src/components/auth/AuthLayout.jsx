import { Link } from 'react-router-dom';

const AuthLayout = ({ children, type }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-400 mb-2">
            🐙 Lovecraftian Escape Room
          </h1>
          <p className="text-gray-400 text-sm">
            Escapa de la gruta oscura antes de que sea demasiado tarde...
          </p>
        </div>
        
        {/* Form content */}
        {children}
        
        {/* Toggle between login and register */}
        <div className="text-center mt-6">
          {type === 'login' ? (
            <p className="text-gray-400">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold">
                Regístrate aquí
              </Link>
            </p>
          ) : (
            <p className="text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                Inicia sesión aquí
              </Link>
            </p>
          )}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-xs">
          <p>Inspirado en las obras de H.P. Lovecraft</p>
          <p className="mt-1">© 2026 Lovecraftian Escape Room</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
