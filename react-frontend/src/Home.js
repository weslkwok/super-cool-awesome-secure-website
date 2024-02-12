import axios from "axios";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useState, useEffect } from "react";
import { useAuth, AuthProvider, setJwtToken, getJwtToken } from "./context/AuthProvider";

export const Home = () => {
  const { value } = useAuth();
  const [contactsList, setContactsList] = useState([]);
  useEffect(() => {
    const home = async () => {
      const queryParameters = new URLSearchParams(window.location.search);
      const google_token = queryParameters.get("token");
      // set token if it's found
      if ((getJwtToken() != 'null') || (google_token != null)) {
        // we gound something valid?
        if (google_token != null) setJwtToken(google_token);
          value.onLogin();
      } else {
        try {
          // try to login
          if (!value.isAuthenticated) {
            fetch('https://localhost:8000/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            }).then(response => response.json())
              .then(data => {
                // Redirect the user to Google's OAuth page
                window.location.href = data.url;
              })
              .catch(error => console.error('Error fetching OAuth URL:', error));
            }
        } catch (error) {
        console.error('Error fetching data: ', error);
        }
      }
    };
    home();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <>
      <h2>This is the default home landing page. You aren't logged in yet if you can't access the Landing page.</h2>
    </>
  );
};