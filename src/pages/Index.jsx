import React, { useState, useEffect } from "react";
import { Box, Button, Container, FormControl, FormLabel, Heading, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:1337/api";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingEventId, setEditingEventId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchEvents();
    }
  }, []);

  const register = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          email: `${name}@example.com`,
          password: "password",
        }),
      });

      if (response.ok) {
        toast({
          title: "Registration successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Registration failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const login = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: name,
          password: "password",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        fetchEvents();
      } else {
        toast({
          title: "Login failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setEvents([]);
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.data);
      } else {
        toast({
          title: "Failed to fetch events",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const createEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            name,
            description,
          },
        }),
      });

      if (response.ok) {
        setName("");
        setDescription("");
        fetchEvents();
        toast({
          title: "Event created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed to create event",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const updateEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/events/${editingEventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            name,
            description,
          },
        }),
      });

      if (response.ok) {
        setName("");
        setDescription("");
        setEditingEventId(null);
        fetchEvents();
        toast({
          title: "Event updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed to update event",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchEvents();
        toast({
          title: "Event deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed to delete event",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={8}>Event Management</Heading>

      {!isLoggedIn ? (
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <Button onClick={register}>Register</Button>
          <Button onClick={login}>Login</Button>
        </Stack>
      ) : (
        <>
          <Stack spacing={4} mb={8}>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormControl>
            {editingEventId ? <Button onClick={updateEvent}>Update Event</Button> : <Button onClick={createEvent}>Create Event</Button>}
          </Stack>

          <Stack spacing={4}>
            {events.map((event) => (
              <Box key={event.id} p={4} borderWidth={1} borderRadius="md">
                <Heading size="md">{event.attributes.name}</Heading>
                <Text>{event.attributes.description}</Text>
                <Stack direction="row" mt={4}>
                  <Button
                    leftIcon={<FaEdit />}
                    onClick={() => {
                      setName(event.attributes.name);
                      setDescription(event.attributes.description);
                      setEditingEventId(event.id);
                    }}
                  >
                    Edit
                  </Button>
                  <Button leftIcon={<FaTrash />} onClick={() => deleteEvent(event.id)}>
                    Delete
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>

          <Button mt={8} onClick={logout}>
            Logout
          </Button>
        </>
      )}
    </Container>
  );
};

export default Index;
