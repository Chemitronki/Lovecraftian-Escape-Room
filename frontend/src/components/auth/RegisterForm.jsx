import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../../features/auth/authSlice';

const RegisterForm = () => {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number, one symbol
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol,
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSymbol,
    };
  };

  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!formData.username) {
      errors.username = 'El nombre de usuario es obligatorio';
    } else if (formData.username.length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (formData.username.length > 50) {
      errors.username = 'El nombre de usuario no puede exceder 50 caracteres';
    } else if (!validateUsername(formData.username)) {
      errors.username = 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos';
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Debe proporcionar un correo electrónico válido';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else {
      const passwordCheck = validatePassword(formData.password);
      if (!passwordCheck.isValid) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo';
      }
    }
    
    // Password confirmation validation
    if (!formData.password_confirmation) {
      errors.password_confirmation = 'Debe confirmar su contraseña';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Las contraseñas no coinciden';
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
    
    dispatch(register(formData));
  };

  // Redirect to login after successful registration
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-400">Registrarse</h2>
        
        {/* Server error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded">
            {error}
          </div>
        )}
        
        {/* Username field */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="username">
            Nombre de Usuario
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              validationErrors.username ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="usuario123"
            disabled={loading}
          />
          {validationErrors.username && (
            <p className="text-red-400 text-xs italic mt-1">{validationErrors.username}</p>
          )}
        </div>
        
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
        <div className="mb-4">
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
        
        {/* Password confirmation field */}
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password_confirmation">
            Confirmar Contraseña
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            value={formData.password_confirmation}
            onChange={handleChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              validationErrors.password_confirmation ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="••••••••"
            disabled={loading}
          />
          {validationErrors.password_confirmation && (
            <p className="text-red-400 text-xs italic mt-1">{validationErrors.password_confirmation}</p>
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
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
