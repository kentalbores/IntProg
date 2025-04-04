import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Register from "./Register";
import Profile from "./Profile";
import ForgotPassword from "./Forgot-Password";
import Event from "./Event";
import About from "./About";
import Settings from "./Settings";

const App = () => {
  //const [username, setUsername] = useState("")
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/Event" element={<Event />} />
        <Route path="/About" element={<About />} />
        <Route path="/Settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
