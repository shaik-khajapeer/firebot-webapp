"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#087db7", dark: "#066799" },
    background: { default: "#102955", paper: "#ffffff" },
    text: { primary: "#171717", secondary: "#626262" },
  },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
    button: { textTransform: "none", fontWeight: 400 },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 34,
          fontSize: 12,
          "&.Mui-focusVisible": {
            outline: "3px solid #102955",
            outlineOffset: 3,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: 12,
          backgroundColor: "#ffffff",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d5d5d5" },
        },
        input: {
          padding: "8px 10px",
          "&::placeholder": { color: "#767676", opacity: 1 },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        asterisk: { color: "#c62828" },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
