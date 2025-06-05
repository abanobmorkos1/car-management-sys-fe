// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2' // your primary color
    },
    secondary: {
      main: '#ff5722' // 🔧 override secondary color globally
    }
  },
  typography: {
    fontFamily: `'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif`, // 🔧 global font
    button: {
      textTransform: 'none', // optional: disables uppercase on buttons
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // global button shape
        }
      }
    }
  }
});

export default theme;
