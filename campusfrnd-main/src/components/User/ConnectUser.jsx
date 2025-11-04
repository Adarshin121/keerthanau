import { Avatar, Button, Card, CardContent, IconButton, Typography, Grid, Box, Chip } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import '../css/ConnectUser.css'; // Create this CSS file

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
  }
}));
const ConnectUser = () => {
  const [people, setPeople] = useState([]);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  useEffect(() => {
    axios.get("http://localhost:3006/api/user")
      .then((res) => {
        setPeople(res.data);
      });
  }, []);

  const handlerequest = (id) => {
    axios.post("http://localhost:3006/api/user/send-request", {
      fromId: currentUser._id,
      toId: id
    }).then((res) => {
      alert(res.data.message);

      // update currentUser (so checkStatus uses latest)
      setCurrentUser(prev => ({
        ...prev,
        requestsSent: [...(prev.requestsSent || []), id]
      }));

      // also update people list if needed
      setPeople(prev =>
        prev.map(person =>
          person._id === id
            ? { ...person, requestsSent: [...(person.requestsSent || []), currentUser._id] }
            : person
        )
      );

      // keep in sync with localStorage
      localStorage.setItem("user", JSON.stringify({
        ...currentUser,
        requestsSent: [...(currentUser.requestsSent || []), id]
      }));
    });
  };

  const checkStatus = (person) => {
    if (currentUser.connections?.includes(person._id)) return "connected";
    if (currentUser.requestsSent?.includes(person._id)) return "pending";
    return "connect";
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Connect with Others
      </Typography>

      <Grid container spacing={3}>
        {people
          .filter(person => person._id !== currentUser?._id)
          .map((person) => {
            const status = checkStatus(person);

            return (
              <Grid item xs={12} sm={6} md={4} key={person._id}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar src={person.profilePic} sx={{ width: 56, height: 56 }} />
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h6">{person.name}</Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                          {person.branch} • Year {person.year}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                      {status === "connect" && (
                        <Button
                          onClick={() => handlerequest(person._id)}
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{ borderRadius: "20px", textTransform: "none", fontWeight: 600 }}
                        >
                          Connect
                        </Button>
                      )}

                      {status === "pending" && (
                        <Chip
                          label="Request Sent"
                          color="info"
                          sx={{ width: "100%", borderRadius: "20px", fontWeight: 500 }}
                        />
                      )}

                      {status === "connected" && (
                        <Box sx={{ display: "flex", alignItems: "center", color: "success.main", width: "100%", justifyContent: "center" }}>
                          <CheckCircleIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">Connected</Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            );
          })}
      </Grid>
    </Box>
  );
};

export default ConnectUser;