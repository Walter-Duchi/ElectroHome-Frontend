import { GlobalStyles as MuiGlobalStyles } from '@mui/material';

export const GlobalStyles = () => (
  <MuiGlobalStyles
    styles={{
      'html, body, #root': { width: '100%', maxWidth: '100vw' },
      '#root': { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
      body: { overflowX: 'clip' },
      'input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button': {
        WebkitAppearance: 'none', margin: 0,
      },
      'input[type=number]': { MozAppearance: 'textfield' },
      '::selection': { backgroundColor: 'rgba(0, 86, 179, 0.2)' },
      '::-moz-selection': { backgroundColor: 'rgba(0, 86, 179, 0.2)' },
      '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
      '@keyframes slideInUp': {
        from: { transform: 'translateY(20px)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
      },
      '@keyframes pulse': {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.05)' },
        '100%': { transform: 'scale(1)' },
      },
      '*:focus-visible': { outline: '2px solid #0056b3', outlineOffset: '2px', borderRadius: '4px' },
      'canvas, img, svg, video, iframe': { transition: 'none !important' },
      img: { maxWidth: '100%', height: 'auto' },
      '.MuiTableContainer-root': { overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
      '.MuiDialog-paper': { maxWidth: 'calc(100vw - 24px)' },
      '.MuiDrawer-paper': { boxSizing: 'border-box' },
      '@media (max-width: 599.95px)': {
        '.responsive-stack': { flexDirection: 'column !important', alignItems: 'stretch !important' },
        '.responsive-hide-mobile': { display: 'none !important' },
        '.responsive-full-width': { width: '100% !important' },
        '.MuiCard-root': { borderRadius: '10px' },
      },
      '@media (min-width: 600px)': {
        '.responsive-hide-desktop': { display: 'none !important' },
      },
      '@media print': {
        body: { backgroundColor: '#fff !important', color: '#000 !important' },
        'nav, footer, .no-print': { display: 'none !important' },
      },
    }}
  />
);
