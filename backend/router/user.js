const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const UserSettings = require('../models/user_settings');
const Organizer = require('../models/organizer');
const Vendor = require('../models/vendor');
const Service = require('../models/service');
const saltRounds = 10;

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(406).json({ message: "Unauthorized: Please log in." });
  }
};

// Logout route
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out." });
    }
    res.status(200).json({ message: "Logged out successfully." });
  });
});

// Session checker
router.get("/isLoggedIn", (req, res) => {
  console.log("Session Data:", req.session);
  if (req.session.user) {
    res.status(200).json({ isAuthenticated: true, user: req.session, diff: "fefefe" });
  } else {
    res.status(200).json({ isAuthenticated: false, session: req.session });
  }
});

router.get('/my-role/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ role: user.role });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
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

// Create or update user
router.post("/", async (req, res) => {
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

// Get user info
router.get("/info", async (req, res) => {
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

// Get user settings
router.get("/settings", async (req, res) => {
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

// Update user settings
router.post("/update-settings", async (req, res) => {
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

// Update user profile
router.post("/update-user", async (req, res) => {
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
      
      // Get file type
      const fileType = require('file-type');
      const fileTypeResult = await fileType.fromBuffer(uploadedFile.data);
      const accepted_extensions = ['jpg', 'jpeg', 'png', 'gif'];
      
      if (!fileTypeResult || !accepted_extensions.includes(fileTypeResult.ext)) {
        return res.status(400).json({ message: "Only jpg, png, and gif files are allowed" });
      }

      // Ensure directory exists
      const upload_folder = 'uploads';
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
      picture: updateData.picture
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "An unexpected error occurred", error: error.message });
  }
});

// Update user role
router.post("/role", async (req, res) => {
  const { username, role } = req.body;
  
  // Validate that username is provided
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  
  // Validate role values - handle both string and array input
  const validRoles = ['guest', 'organizer', 'vendor'];
  
  if (Array.isArray(role)) {
    // If role is an array, validate each value
    for (const r of role) {
      if (!validRoles.includes(r)) {
        return res.status(400).json({ 
          message: `Invalid role: '${r}'. Each role must be one of: guest, organizer, vendor`
        });
      }
    }
  } else if (typeof role === 'string') {
    // If role is a string, validate it
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role: '${role}'. Must be one of: guest, organizer, vendor`
      });
    }
  } else {
    // If role is missing or has an invalid type
    return res.status(400).json({ 
      message: "Role must be a string or an array of strings (guest, organizer, vendor)"
    });
  }
  
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Store the current roles for comparison
    const previousRoles = Array.isArray(user.role) ? [...user.role] : [user.role];
    
    // Handle updating the user role
    if (Array.isArray(role)) {
      // If an array is provided, update with that array directly
      user.role = role;
    } else {
      // Handle legacy single role update
      // If user.role is already an array, we need to add the new role if not present
      if (Array.isArray(user.role)) {
        if (!user.role.includes(role)) {
          // Add the new role to the existing array
          user.role.push(role);
        }
      } else {
        // Convert to array if it was a string
        user.role = [role];
      }
    }
    
    // Save the user with updated roles
    await user.save();
    console.log("User roles updated successfully:", user.role);
    
    // Check for newly added roles to create profiles
    const updatedRoles = Array.isArray(user.role) ? user.role : [user.role];
    const warnings = [];
    
    // Check if organizer role was added
    if (updatedRoles.includes('organizer') && !previousRoles.includes('organizer')) {
      try {
        const existingProfile = await Organizer.findOne({ user: user._id });
        if (!existingProfile) {
          const newOrganizerProfile = new Organizer({
            user: user._id,
            name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || username,
            type: 'individual',
            description: ''
          });
          await newOrganizerProfile.save();
          console.log("Created new organizer profile for user:", username);
        }
      } catch (orgErr) {
        console.error("Error creating organizer profile:", orgErr);
        warnings.push("Failed to create organizer profile: " + orgErr.message);
      }
    }
    
    // Check if vendor role was added
    if (updatedRoles.includes('vendor') && !previousRoles.includes('vendor')) {
      try {
        const existingVendorProfile = await Vendor.findOne({ user: user._id });
        if (!existingVendorProfile) {
          const newVendorProfile = new Vendor({
            user: user._id,
            name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || username,
            description: '',
            address: ''
          });
          await newVendorProfile.save();
          console.log("Created new vendor profile for user:", username);
        }
      } catch (vendErr) {
        console.error("Error creating vendor profile:", vendErr);
        warnings.push("Failed to create vendor profile: " + vendErr.message);
      }
    }
    
    // Return success response with warnings if any
    const response = { 
      message: "User role updated successfully",
      username,
      role: user.role
    };
    
    if (warnings.length > 0) {
      response.warnings = warnings;
    }
    
    res.status(200).json(response);
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ message: "Failed to update user role", error: err.message });
  }
});

router.post('/check-email', async (req, res) => {
  const { email } = req.body;  // Assuming the email is sent in the request body
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ exists: true, username: existingUser.username });
    }
    res.status(200).json({ exists: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
