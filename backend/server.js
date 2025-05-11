const express = require("express");
const fs = require("fs");
const path = require("path");
const fileUpload = require('express-fileupload');
const app = express();
const session = require("express-session");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
require("dotenv").config();
const {google} = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const nodeMailer = require("nodemailer");
const helmet = require("helmet");
const mongoose = require("mongoose");
const saltRounds = 10;
const mongoConnection = require("./config/db")

// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected successfully'))
// .catch(err => console.error('MongoDB connection error:', err));
mongoConnection()

const User = require('./models/user');
const VerificationCode = require('./models/verification_codes');
const Event = require('./models/event');
const Organizer = require('./models/organizer');
const Vendor = require('./models/vendor');
const UserSettings = require('./models/user_settings');
const EventUser = require('./models/event_users');
const EventQRCode = require('./models/event_qrcodes');

app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 5 * 1024 * 1024 },
}));
const upload_folder = 'uploads';
app.use('/uploaded', express.static(upload_folder));
app.use(
  session({
    secret: "secretk",
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", 
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
    name: "sessionId",
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", 'https://gitbam.vercel.app'],
  credentials: true, // Allow cookies & authentication headers
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"] // Allow these headers
}));
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(406).json({ message: "Unauthorized: Please log in." });
  }
};

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out." });
    }
    res.status(200).json({ message: "Logged out successfully." });
  });
});

// Session checker
app.get("/isLoggedIn", (req, res) => {
  console.log("Session Data:", req.session);
  if (req.session.user) {
    res.status(200).json({ isAuthenticated: true, user: req.session, diff: "fefefe" });
  } else {
    res.status(200).json({ isAuthenticated: false, session: req.session });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  
  if(!username || !password){
    return res.status(400).json({message: "Please enter required details!"});
  }
  
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(403).json({ message: "Invalid Credentials!" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(403).json({ message: "Invalid Credentials!" });
    }
    
    req.session.user = { username: user.username };
    console.log("Session after login:", req.session);
    res.status(200).json({ message: "Login Successful!!", email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/api/user", async (req, res) => {
  const { action, username, password, email, firstname, middlename, lastname, phone } = req.body;

  if (!action) {
    return res.status(400).json({ message: "Action parameter is required (add or update)" });
  }

  if (action === "add") {
    if (!username || !password || !email || !firstname) {
      return res.status(400).json({ message: "All fields are required for adding a user" });
    }
    
    try {
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with that username or email" });
      }
      
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const newUser = new User({
        username,
        password: hashedPassword,
        email,
        firstname,
        middlename,
        lastname
      });
      
      await newUser.save();
      res.status(201).json({ message: "User added successfully" });
      
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).json({ message: "Error encountered", error: error.message });
    }
  } else if (action === "update") {
    if (!username) {
      return res.status(400).json({ message: "Username is required for updating a user" });
    }
    
    try {
      const updateData = {};
      if (email) updateData.email = email;
      if (firstname) updateData.firstname = firstname;
      if (middlename) updateData.middlename = middlename;
      if (lastname) updateData.lastname = lastname;
      if (phone) updateData.phone = phone;
      
      const result = await User.findOneAndUpdate(
        { username },
        updateData,
        { new: true }
      );
      
      if (!result) {
        return res.status(404).json({ message: `User ${username} not found` });
      }
      
      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user information", error: error.message });
    }
  } else {
    res.status(400).json({ message: "Invalid action. Use 'add' or 'update'" });
  }
});

app.get("/api/userinfo", async (req, res) => {
  const { username } = req.query;
  
  if(!username){  
    return res.status(400).json({message: "No username provided!"});
  }
  
  try {
    const user = await User.findOne(
      { username },
      'username email firstname middlename lastname picture'
    );
    
    if (!user) {
      return res.status(403).json({message: `User ${username} does not exist`});
    }
    
    req.session.user = { username: user.username };
    res.status(200).json({ message: "User found", user_info: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/api/settings", async (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: `User ${username} does not exist` });
    }
    
    const settings = await UserSettings.findOne({ username });
    
    if (!settings) {
      return res.status(200).json({ message: "No settings found for user", settings: {} });
    }
    res.status(200).json({ message: "Settings retrieved successfully", settings });
  } catch (err) {
    console.error("Error retrieving settings:", err);
    res.status(500).json({ message: "Error retrieving settings", error: err.message });
  }
});

app.post("/api/update-settings", async (req, res) => {
  try {
    const { 
      username, 
      email_notifications, 
      push_notifications, 
      sms_notifications, 
      theme,
      language,
      profile_visibility,
      data_sharing
    } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: `User ${username} does not exist` });
    }
    
    const settingsData = {
      email_notifications: email_notifications === true,
      push_notifications: push_notifications === true,
      sms_notifications: sms_notifications === true,
      theme: theme || 'light',
      language: language || 'english',
      profile_visibility: profile_visibility || 'public',
      data_sharing: data_sharing === true,
      updated_at: new Date()
    };
    
    const result = await UserSettings.findOneAndUpdate(
      { username },
      { 
        ...settingsData,
        $setOnInsert: { created_at: new Date() } 
      },
      { 
        new: true,
        upsert: true 
      }
    );
    
    res.status(200).json({ 
      message: "Settings updated successfully",
      settings: result
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "An unexpected error occurred", error: error.message });
  }
});

app.post("/api/update-user", async (req, res) => {
  try {
    const { username, email, firstname, middlename, lastname, phone } = req.body;

    if (!username || !email || !firstname) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const updateData = {
      email,
      firstname,
      middlename: middlename || null,
      lastname
    };

    // Handle file upload if there's a picture
    if (req.files && req.files.picture) {
      const uploadedFile = req.files.picture;
      
      // Get file type (you might need a separate package like file-type)
      const fileType = require('file-type');
      const fileTypeResult = await fileType.fromBuffer(uploadedFile.data);
      const accepted_extensions = ['jpg', 'jpeg', 'png', 'gif'];
      
      if (!fileTypeResult || !accepted_extensions.includes(fileTypeResult.ext)) {
        return res.status(400).json({ message: "Only jpg, png, and gif files are allowed" });
      }

      // Ensure directory exists
      if (!fs.existsSync(upload_folder)) {
        fs.mkdirSync(upload_folder, { recursive: true });
      }
      
      const fileName = `${username}_${Date.now()}.${fileTypeResult.ext}`;
      const filePath = `${upload_folder}/${fileName}`;
      
      await uploadedFile.mv(filePath);
      
      updateData.picture = `/uploads/${fileName}`;
    }
    
    const result = await User.findOneAndUpdate(
      { username },
      updateData,
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ message: `User ${username} not found` });
    }
    
    res.status(200).json({ 
      message: "Profile updated successfully",
      picture: updateData.picture // Return the picture path so the frontend can update
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "An unexpected error occurred", error: error.message });
  }
});

app.get("/test", (req, res) => {
  res.status(200).json({message: "hello world from api"});
});

// Google APIs
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});
const client = new OAuth2Client(CLIENT_ID);

app.get("/api/google-client-id", (req, res) => {
  res.json({ client_id: process.env.CLIENT_ID });
  console.log("Sending Google Client ID:", process.env.CLIENT_ID);
});

app.post("/api/googleLogin", async (req, res) => {
  try {
    const { idToken } = req.body;
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleID, given_name, family_name, email, picture } = payload;
    const firstname = given_name;
    const lastname = family_name;
    const usernameFromEmail = email.split("@")[0];

    // Check if the user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - Update picture if changed
      if (user.picture !== picture) {
        user.picture = picture;
        await user.save();
      }
    } else {
      // New user - Insert into database
      user = new User({
        email,
        firstname,
        lastname,
        username: usernameFromEmail,
        picture
      });
      await user.save();
    }

    req.session.user = { username: user.username, email: user.email, picture: user.picture };
    
    return res.status(200).json({
      message: "Login Successful!!",
      username: user.username,
      email: user.email,
      picture: user.picture,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(401).json({ message: "Login unsuccessful" });
  }
});

app.post("/api/sendToEmail", async (req, res) => {
  const { email } = req.body;
  const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  const expiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    
    const transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "kentalbores@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: "No-reply",
      to: email,
      subject: "Test Email",
      text: "Hello, this is a test email using OAuth2! ++++ glitch",
      html: `
        <div style="border: 1px solid; text-align: center;">
            <h1 style="color: rgb(47, 0, 255);">
                Email Sending Practice
            </h1>
            <p>
                ${verificationCode} is your verification Code
            </p>
            <p>This code will expire in 24H.</p>
        </div>
      `
    };
    
    // Update or create verification code
    await VerificationCode.findOneAndUpdate(
      { email },
      { code: verificationCode, expires_at: expiresAt },
      { upsert: true, new: true }
    );
    
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent to", email);
    res.status(200).json({ message: "Email Sent", email: email });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const result = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );
    
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "Password Changed" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Failed to reset password", error: err.message });
  }
});

app.get("/api/verify-code", async (req, res) => {
  const { email, code } = req.query;
  const currentTime = Math.floor(Date.now() / 1000);
  
  try {
    // Delete expired codes
    await VerificationCode.deleteMany({ expires_at: { $lte: currentTime } });
    
    // Find valid code
    const verificationCode = await VerificationCode.findOne({ email, code });
    
    if (!verificationCode) {
      return res.status(403).json({ message: `Invalid Code` });
    }
    
    res.status(200).json({ message: "Verified", email });
  } catch (err) {
    console.error("Code verification error:", err);
    res.status(500).json({ message: "Failed to verify code", error: err.message });
  }
});

// EVENT APIS
app.post("/api/event", async (req, res) => {
  const { 
    event_id, 
    name, 
    date, 
    location, 
    organizer, 
    price, 
    description, 
    category, 
    image, 
    detailImage 
  } = req.body;

  if (!name || !date) {
    return res.status(400).json({ message: "Event name and date are required!" });
  }

  try {
    if (event_id) {
      // Update existing event by event_id
      const result = await Event.findOneAndUpdate(
        { event_id: parseInt(event_id) },
        {
          name,
          date,
          location,
          organizer,
          price,
          description,
          category,
          image,
          detailImage
        },
        { new: true }
      );

      if (!result) {
        return res.status(404).json({ message: "Event not found" });
      }

      return res.status(200).json({ 
        message: "Event updated successfully!",
        event_id: result.event_id
      });
    } else {
      // Create new event
      const highestEvent = await Event.findOne().sort('-event_id');
      const nextEventId = highestEvent ? highestEvent.event_id + 1 : 1;
      
      const newEvent = new Event({
        event_id: nextEventId,
        name,
        date,
        location,
        organizer,
        price,
        description,
        category,
        image,
        detailImage
      });

      const savedEvent = await newEvent.save();
      return res.status(201).json({ 
        message: "Event added successfully!", 
        event_id: savedEvent.event_id 
      });
    }
  } catch (err) {
    console.error("Error handling event:", err);
    return res.status(500).json({ message: "Failed to process event", error: err.message });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find({});
    return res.status(200).json({ events });
  } catch (err) {
    console.error("Error fetching events:", err);
    return res.status(500).json({ message: "Failed to retrieve events", error: err.message });
  }
});

app.get("/api/event/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findOne({ event_id: parseInt(id) });
    
    if (!event) {
      return res.status(404).json({ message: "Event not found!" });
    }
    
    return res.status(200).json({ event });
  } catch (err) {
    console.error("Error fetching event:", err);
    return res.status(500).json({ message: "Failed to retrieve event", error: err.message });
  }
});

// Event-User relationship endpoints
app.post('/api/event-users', async (req, res) => {
  const { event_id, username } = req.body;
  
  try {
    // Verify both event and user exist
    const event = await Event.findOne({ event_id: parseInt(event_id) });
    const user = await User.findOne({ username });
    
    if (!event || !user) {
      return res.status(404).json({ message: "Event or user not found" });
    }
    
    // Check if already registered
    const existingRegistration = await EventUser.findOne({ 
      event_id: parseInt(event_id), 
      username 
    });
    
    if (existingRegistration) {
      return res.status(400).json({ message: "User already registered for this event" });
    }
    
    // Create registration
    const newRegistration = new EventUser({
      event_id: parseInt(event_id),
      username,
      registration_date: new Date()
    });
    
    const savedRegistration = await newRegistration.save();
    res.json({ message: 'User registered to event', id: savedRegistration._id });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:event_id/users', async (req, res) => {
  const { event_id } = req.params;
  
  try {
    // Find all registrations for this event
    const registrations = await EventUser.find({ event_id: parseInt(event_id) });
    
    // Get all usernames
    const usernames = registrations.map(reg => reg.username);
    
    // Fetch user details
    const users = await User.find(
      { username: { $in: usernames } },
      'username email firstname middlename lastname picture'
    );
    
    res.json(users);
  } catch (err) {
    console.error("Error fetching event users:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:username/events', async (req, res) => {
  const { username } = req.params;
  
  try {
    // Find all registrations for this user
    const registrations = await EventUser.find({ username });
    
    // Get all event IDs
    const eventIds = registrations.map(reg => parseInt(reg.event_id));
    
    // Fetch event details
    const events = await Event.find({ event_id: { $in: eventIds } });
    
    res.json(events);
  } catch (err) {
    console.error("Error fetching user events:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/event-users', async (req, res) => {
  const { event_id, username } = req.body;
  
  try {
    const result = await EventUser.findOneAndDelete({ 
      event_id: parseInt(event_id), 
      username 
    });
    
    if (!result) {
      return res.status(404).json({ message: 'No matching registration found' });
    }
    
    res.json({ message: 'User unregistered from event' });
  } catch (err) {
    console.error("Unregistration error:", err);
    res.status(500).json({ error: err.message });
  }
});

//System Time 
app.get('/api/server-time', (req, res) => {
    const now = new Date(); // Server's current system time
    console.log(now);
    res.json({ serverTime: now.toISOString() });
});


// Import routers
const qrcodeRouter = require('./router/qrcode.js');
const aiRouter = require('./router/ai.js');
const notificationsRoutes = require('./router/notification.js');

app.use('/api/notifications', notificationsRoutes)
app.use('/api/ai', aiRouter);
app.use('/api/qrcode', qrcodeRouter);