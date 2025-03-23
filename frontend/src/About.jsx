import React from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import "./all.css"; // Ensure this file contains the background styling

const teamMembers = [
    {
      name: "Kent Albores",
      role: "Backend Developer",
      description: "Code is poetry. Security is my game.",
      image: "https://scontent.fceb1-2.fna.fbcdn.net/v/t39.30808-6/481241678_1473054963651863_3560908371330843425_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeER71eDgAf_QYS2RrbgjohsscJJJZn1XKyxwkklmfVcrJPTKxkB2EjJqgjDcgjwrtMB5qy_A9Kaox_cOwjuVq7Y&_nc_ohc=1l-LasNWM3UQ7kNvgFQOt0N&_nc_oc=AdkOvk4dp7XOoU5UVOsXrwUGkp0P4bm0uDx0tj4aAGs24mYcfiWHHRSNIIfH5S7_0W4Hr1uhXePMJb21HrQS92uB&_nc_zt=23&_nc_ht=scontent.fceb1-2.fna&_nc_gid=etzieXKMCJpCXvU-n1-JgQ&oh=00_AYFLdbPDyCu1P9uM9aStbH1tVdFyaDB9BAwHmDuD9kLQzg&oe=67E5B9C9",
    },
    {
      name: "Frank Oliver Bentoy",
      role: "Web Developer",
      description: "Bringing designs to life, one line of code at a time.",
      image: "https://scontent.fceb1-5.fna.fbcdn.net/v/t39.30808-6/480812643_1616201275929231_3210467683300692989_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeEltF4FXTcgsFVk6Lr2qqPtLcQmZM-2gBktxCZkz7aAGXV7_1YZY843vRgEnSJf23hM7FiPZ1cwLdDVocer7qKT&_nc_ohc=-KbiUK68LSUQ7kNvgEm86ze&_nc_oc=Adm54Tcxo9xzBZ_FJTn2BBQu40WEccSEZkxMwZ66lNqnqeWk_vRrwUf34t0pGCa03DDKS0cB_NvdxCG_ljwSfz8T&_nc_zt=23&_nc_ht=scontent.fceb1-5.fna&_nc_gid=nuTnXKEq39bYVwAtiZALng&oh=00_AYF5-WUsIgWgjZi3T5m4cIAvhpShn2BPjqv6I99637qI4w&oe=67E5E3B9",
    },
    {
      name: "Theus Gabriel Mendez",
      role: "Android Developer",
      description:
        "Life isn't about avoiding thunderstorms, it's about learning how to dance in the rain.",
      image: "https://scontent.fceb1-2.fna.fbcdn.net/v/t1.6435-9/55441090_2276877279035206_8975035979828035584_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeG7FmxKMfMkGf-jqN0-HkEpOVSWWBMj6-Q5VJZYEyPr5LJqTEsM-0K4RtQU_jAAI-UWnlkxrEoTX8VLRX4wNQPW&_nc_ohc=377Axo_iExQQ7kNvgGeYXZ0&_nc_oc=AdlA9SeF6ZIsUsB3fvLQ8YH9MuIDxLGsCSLxvfK0vEnc1InTueuD6I5q7dpfwLWLP17qOJTwvoP3vYvzW2KPuZNv&_nc_zt=23&_nc_ht=scontent.fceb1-2.fna&_nc_gid=qsYmvMBF8YmnFBNcWxewhA&oh=00_AYFODXz43hTIOgfpR42XsBAWyXRbknxt0TcCAS0iZm6mWQ&oe=68078948",
    },
  ];

const About = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 3,
        position: "relative", 
      }}
    >
      {/* Back Button */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* Page Title */}
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Meet Our Team
      </Typography>
      <Typography variant="body1" textAlign="center" mb={3}>
        Innovators shaping the future with technology.
      </Typography>

      {/* Team Members List */}
      <Box sx={{ overflowY: "auto", maxHeight: "70vh", width: "100%", maxWidth: 600 }}>
        {teamMembers.map((member, index) => (
          <Card
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              padding: 2,
              marginBottom: 2,
              borderRadius: 2,
              boxShadow: 3,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Avatar
              src={member.image}
              alt={member.name}
              sx={{ width: 80, height: 80, marginRight: 2 }}
            />
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {member.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {member.role}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {member.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default About;
