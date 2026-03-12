import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../features/auth/authSlice';

const LoginForm = () => {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Debe proporcionar un correo electrónico válido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    dispatch(login(formData));
  };

  // Redirect to game after successful login
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/game', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-400">Iniciar Sesión</h2>
        
        {/* Server error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded">
            {error}
          </div>
        )}
        
        {/* Email field */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              validationErrors.email ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="tu@email.com"
            disabled={loading}
          />
          {validationErrors.email && (
            <p className="text-red-400 text-xs italic mt-1">{validationErrors.email}</p>
          )}
        </div>
        
        {/* Password field */}
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              validationErrors.password ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="••••••••"
            disabled={loading}
          />
          {validationErrors.password && (
            <p className="text-red-400 text-xs italic mt-1">{validationErrors.password}</p>
          )}
        </div>
        
        {/* Submit button */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
