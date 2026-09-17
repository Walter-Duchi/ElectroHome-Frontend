import { useMediaQuery, useTheme } from '@mui/material';

export const PUNTOS_CORTE = {
  movil: 'sm' as const,
  tablet: 'md' as const,
  escritorio: 'lg' as const,
  ancho: 'xl' as const,
};

export interface InfoResponsive {
  esMovil: boolean;
  esTablet: boolean;
  esEscritorio: boolean;
  esPantallaAncha: boolean;
  esMovilOTablet: boolean;
  esVertical: boolean;
  spacing: (base: number) => { xs: string; sm: string; md: string };
  anchoPantalla: number;
}

export const useResponsive = (): InfoResponsive => {
  const theme = useTheme();
  const esMovil = useMediaQuery(theme.breakpoints.down('sm'));
  const esTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const esEscritorio = useMediaQuery(theme.breakpoints.up('md'));
  const esPantallaAncha = useMediaQuery(theme.breakpoints.up('lg'));
  const esVertical = useMediaQuery('(orientation: portrait)');
  const anchoPantalla =
    typeof window !== 'undefined' && window.innerWidth ? window.innerWidth : 0;

  const spacing = (base: number) => ({
    xs: theme.spacing(base * 0.75),
    sm: theme.spacing(base),
    md: theme.spacing(base * 1.25),
  });

  return {
    esMovil,
    esTablet,
    esEscritorio,
    esPantallaAncha,
    esMovilOTablet: esMovil || esTablet,
    esVertical,
    spacing,
    anchoPantalla,
  };
};

export default useResponsive;
