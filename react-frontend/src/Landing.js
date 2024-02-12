import axios from "axios";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useState, useEffect } from "react";
import { getJwtToken, getRefreshToken, useAuth } from "./context/AuthProvider";

export const Landing = () => {
  const { value } = useAuth();
  const [contactsList, setContactsList] = useState([]);
  useEffect(() => {
    const getUsers = async () => {
      try {
        console.log('on landing!');
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    getUsers();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <>
      <h2>Successfully logged in via OAUTH!!!</h2>
    </>
  );
};