// Archivo central de configuración
// Cambia esta variable según necesites: true = Producción, false = Desarrollo local
export const PRODUCCION = import.meta.env.VITE_PRODUCCION === 'true'

// URLs derivadas
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:5298'

export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000'

export const config = {
    PRODUCCION,
    API_BASE_URL,
    BACKEND_BASE_URL,
    FRONTEND_URL
}

export default config
