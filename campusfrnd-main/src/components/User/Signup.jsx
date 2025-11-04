import {
  Button, TextField, Paper, Typography, Box, Container,
  CssBaseline, Avatar, MenuItem
} from "@mui/material";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#3a4a6b' },
    secondary: { main: '#ff6b6b' },
  },
});

const yearOptions = [
  { value: '1', label: 'First Year' },
  { value: '2', label: 'Second Year' },
  { value: '3', label: 'Third Year' },
  { value: '4', label: 'Fourth Year' },
];

const branchOptions = [
  { value: 'CSE', label: 'Computer Science' },
  { value: 'ECE', label: 'Electronics' },
  { value: 'ME', label: 'Mechanical' },
  { value: 'CE', label: 'Civil' },
  { value: 'EE', label: 'Electrical' },
];

const Signup = () => {
  const [inputs, setInputs] = useState({
    name: "", email: "", password: "", phone: "", branch: "", year: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const inputHandler = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on typing
  };

  const validate = () => {
    const newErrors = {};
    if (!inputs.name.trim()) newErrors.name = "Name is required";
    if (!inputs.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email))
      newErrors.email = "Enter a valid email";
    
    if (!inputs.password) newErrors.password = "Password is required";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(inputs.password))
      newErrors.password = "Password must be 8+ chars with uppercase, lowercase, number";

    if (!inputs.phone) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(inputs.phone))
      newErrors.phone = "Phone number must be 10 digits";

    if (!inputs.branch) newErrors.branch = "Select branch";
    if (!inputs.year) newErrors.year = "Select year";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const signupHandler = (e) => {
    e.preventDefault();
    if (!validate()) return;

    axios.post("http://localhost:3006/api/user/signup", inputs)
      .then(() => {
        alert("User created successfully");
        navigate("/login");
      })
      .catch((err) => {
        alert(err.response?.data?.error || "Signup failed");
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <HowToRegIcon />
          </Avatar>
          <Typography component="h1" variant="h5">Create Account</Typography>
          <Paper elevation={3} sx={{ mt: 3, p: 4, width: '100%' }}>
            <Box component="form" onSubmit={signupHandler} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal" required fullWidth label="Full Name"
                name="name" value={inputs.name} onChange={inputHandler}
                error={!!errors.name} helperText={errors.name || " "}
              />
              <TextField
                margin="normal" required fullWidth label="Email Address"
                name="email" value={inputs.email} onChange={inputHandler}
                error={!!errors.email} helperText={errors.email || " "}
              />
              <TextField
                margin="normal" required fullWidth label="Password" type="password"
                name="password" value={inputs.password} onChange={inputHandler}
                error={!!errors.password} helperText={errors.password || " "}
              />
              <TextField
                margin="normal" required fullWidth label="Phone Number"
                name="phone" value={inputs.phone} onChange={inputHandler}
                error={!!errors.phone} helperText={errors.phone || " "}
              />
              <TextField
                select margin="normal" required fullWidth label="Branch"
                name="branch" value={inputs.branch} onChange={inputHandler}
                error={!!errors.branch} helperText={errors.branch || " "}
              >
                {branchOptions.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
              </TextField>
              <TextField
                select margin="normal" required fullWidth label="Year"
                name="year" value={inputs.year} onChange={inputHandler}
                error={!!errors.year} helperText={errors.year || " "}
              >
                {yearOptions.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
              </TextField>
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>Sign Up</Button>
              <Box sx={{ textAlign: 'center' }}>
                <Button onClick={() => navigate('/login')} color="primary" sx={{ textTransform: 'none' }}>
                  Already have an account? Sign In
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Signup;
