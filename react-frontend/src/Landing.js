import axios from "axios";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useState, useEffect } from "react";
import { getJwtToken, getRefreshToken } from "./context/AuthProvider";

export const Landing = () => {
  const [contactsList, setContactsList] = useState([]);
  useEffect(() => {
    const getUsers = async () => {
      try {
        const result = await axios.get('https://localhost:8000/users', {
          headers: {
            'authorization': getJwtToken(),
            'refreshToken': getRefreshToken()
          }
        });
        setContactsList(result.data['userList'])
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    getUsers();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <>
      <h2>Landing Contacts List:</h2>
      <List component="nav" aria-label="contacts list">
      {contactsList.map((contact, index) => (
        <ListItem key={index} button>
          <ListItemText primary={contact} />
        </ListItem>
      ))}
    </List>
    </>
  );
};