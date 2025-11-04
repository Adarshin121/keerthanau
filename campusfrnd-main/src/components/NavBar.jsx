import { AppBar, Button, Toolbar, Box, Typography, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import "./css/NavBar.css";

const NavBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <AppBar position="fixed" className="app-bar">
        <Toolbar className="toolbar">
          <Typography variant="h6" component="div" className="logo">
            CampusApp
          </Typography>
          
          {!isMobile ? (
            <Box className="nav-links">
              <Link to="/" className="nav-link">
                <Button variant="text" className="nav-button">Home</Button>
              </Link>
              <Link to="/profile" className="nav-link">
                <Button variant="text" className="nav-button">Profile</Button>
              </Link>
              <Link to="/requests" className="nav-link">
                <Button variant="text" className="nav-button">Requests</Button>
              </Link>
              <Link to="/viewpost" className="nav-link">
                <Button variant="text" className="nav-button">Posts</Button>
              </Link>
              <Link to="/connect" className="nav-link">
                <Button variant="text" className="nav-button">Find connections</Button>
              </Link>
              <Link to="/addpost" className="nav-link">
                <Button variant="contained" color="secondary" className="highlight-button">
                  Add Post
                </Button>
              </Link>
              <Button 
                color="error" 
                className="highlight-button"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
                sx={{ ml: 'auto' }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="mobile-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose} component={Link} to="/">Home</MenuItem>
                <MenuItem onClick={handleMenuClose} component={Link} to="/profile">Profile</MenuItem>
                <MenuItem onClick={handleMenuClose} component={Link} to="/requests">Requests</MenuItem>
                <MenuItem onClick={handleMenuClose} component={Link} to="/viewpost">Posts</MenuItem>
                <MenuItem onClick={handleMenuClose} component={Link} to="/connect">Find connections</MenuItem>
                <MenuItem 
                  onClick={handleMenuClose} 
                  component={Link} 
                  to="/addpost"
                  sx={{ color: theme.palette.secondary.main }}
                >
                  Add Post
                </MenuItem>
                <MenuItem 
                  onClick={() => {
                    handleMenuClose();
                    localStorage.clear();
                    window.location.href = "/login";
                  }}
                  sx={{ color: theme.palette.error.main }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <div className="app-bar-spacer" />
    </div>
  );
};

export default NavBar;