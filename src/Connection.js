import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from './AuthService';

const Connection = ({ userId }) => {
  const [connections, setConnections] = useState([]);
  const [newConnection, setNewConnection] = useState({ name: '', link: '' });
  const authenticatedUserId = AuthService.getUserId();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/user/connections/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`
          }
        });
        setConnections(response.data);
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };

    fetchConnections();
  }, [userId]);

  const handleAddConnection = async () => {


    
    // İsim veya bağlantı boşsa uyarı ver
    if (!newConnection.name || !newConnection.link) {
      alert('Both name and link are required.');
      return;
    }
  
    // Link geçerli bir URL değilse uyarı ver
    const validUrlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    if (!validUrlPattern.test(newConnection.link)) {
      alert('Please enter a valid URL.');
      return;
    }
  
    try {
      const response = await axios.post(`http://localhost:8080/api/user/connections`, {
        ...newConnection,
        user: { id: userId }
      }, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`
        }
      });
      setConnections([...connections, response.data]);
      setNewConnection({ name: '', link: '' });
    } catch (error) {
      console.error('Error adding connection:', error);
      alert('Failed to add connection. Please try again.');
    }
  };
  

  const handleDeleteConnection = async (connectionId) => {
    try {
      await axios.delete(`http://localhost:8080/api/user/connections/delete/${connectionId}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`
        }
      });
      setConnections(connections.filter(connection => connection.id !== connectionId));
    } catch (error) {
      console.error('Error deleting connection:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewConnection({
      ...newConnection,
      [name]: value
    });
  };

 
  return (
    <div className='connections-panel'>
      <h3>Connections</h3>
      <ul>
        {connections.map(connection => (
          <li key={connection.id}>
            <a href={connection.link} target="_blank" rel="noopener noreferrer">{connection.name}</a>
            {userId === authenticatedUserId && (
              <button className='connections-cancel-button' onClick={() => handleDeleteConnection(connection.id)}>Delete</button>
            )}
          </li>
        ))}
      </ul>
      {userId === authenticatedUserId && connections.length < 6 && (
        <div>
          <input
            type="text"
            name="name"
            value={newConnection.name}
            onChange={handleChange}
            placeholder="Name"
          />
          <input
            type="text"
            name="link"
            value={newConnection.link}
            onChange={handleChange}
            placeholder="Link"
          />
          <button className='save-button' onClick={handleAddConnection}>Add</button>
        </div>
      )}
    </div>
  );
  
};

export default Connection;
