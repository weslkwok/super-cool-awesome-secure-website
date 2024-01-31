import { useAuth, setJwtToken, setRefreshToken, hashPassword } from "./context/AuthProvider";

import axios from 'axios';

import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Controller, useForm } from "react-hook-form"
import * as Yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

const defaultValues = {
  email: "",
  password: "",
}

const schema = Yup.object().shape({
  email: Yup.string()
    .email()
    .label("Email")
    .trim()
    .required()
    .min(2)
    .max(64),
  password: Yup.string()
    .label("Password")
    .trim()
    .min(4)
    .max(64),
})


const themeBlue = createTheme({
  palette: {
    background: {
      default: "#1e90ff"
    },
    text: {
      primary: "#ffffff",
      secondary: "#ffffff"
    }
  }
});

export const Home = () => {
  const { value } = useAuth();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: yupResolver(schema)
  });
  
const handleSubmission = async (data) => {
  try {
    const response = await axios.post('https://localhost:8000/account/login', data);

    setJwtToken(response.data['authorization']);
    setRefreshToken(response.data['refresh']);
    
    /* TODO: update login function to take in token from server (instead of having the fake one)
    - add argument to pass in token? Or handle login completely in the auth component (probs better)
    */
    value.onLogin()
  } catch (error) {
    console.error('Failed Login:', error.response ? error.response.data : error.message);
    /* TODO: better handle error when failed login
    - some indication of failed login on page (either in form, or around form?)
    */
  }
};

  return (
    <ThemeProvider theme={themeBlue}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit(handleSubmission)} sx={{ mt: 1 }}>
            <Controller
              control={control}
              name="email"
              rules={{required: true}}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={
                      errors.email && `${errors.email.message}`
                  }
                  autoFocus
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              rules={{required: true}}
              render={({field}) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  error={!!errors.password}
                  helperText={
                      errors.password && `${errors.password.message}`
                  }
                  autoComplete="current-password"
                />
              )}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
  };