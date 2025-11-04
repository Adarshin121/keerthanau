import { Button, TextField, Paper, Typography, Box, Container, CssBaseline, Avatar } from "@mui/material";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#3a4a6b' },
    secondary: { main: '#ff6b6b' },
  },
});

const Login = () => {
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const inputHandler = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on typing
  };

  const validate = () => {
    const newErrors = {};
    if (!inputs.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email))
      newErrors.email = "Enter a valid email";

    if (!inputs.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loginHandler = (e) => {
    e.preventDefault();
    if (!validate()) return;

    axios.post("http://localhost:3006/api/user/login", inputs)
      .then((res) => {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        alert("Login successful");
        navigate("/profile");
        window.location.reload();
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Login failed");
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">Sign in</Typography>
          <Paper elevation={3} sx={{ mt: 3, p: 4, width: '100%' }}>
            <Box component="form" onSubmit={loginHandler} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={inputs.email}
                onChange={inputHandler}
                error={!!errors.email}
                helperText={errors.email || " "}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={inputs.password}
                onChange={inputHandler}
                error={!!errors.password}
                helperText={errors.password || " "}
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>
                Sign In
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Button onClick={() => navigate('/signup')} color="primary" sx={{ textTransform: 'none' }}>
                  Don't have an account? Sign Up
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Login;
