// //server.js
require("dotenv/config")
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const nodemailer = require("nodemailer");
const { type } = require("os");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
// Initialize the Express app
const port = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(bodyParser.json());

const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const streamifier = require("streamifier");
const { url } = require("inspector");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "document",
    allowedFormats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage: storage });

cloudinary.config({
  cloud_name: "dygueetvc",
  api_key: "427358345394463",
  api_secret: "hH5AUqdzvhNz8s7kZoGL2QTf6RQ",
});

const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://meenakumarimaligeli:Meena%40123@cluster0.ba469xs.mongodb.net/taskBoard",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const Schema = mongoose.Schema;

const usedTokenSchema = new Schema({
  token: String,
  createdAt: { type: Date, expires: "1h", default: Date.now }, // Token expires after 1 hour
});
const UsedToken = mongoose.model("UsedToken", usedTokenSchema);

// Organization schema
const organizationSchema = new Schema({
  id: String,
  name: String,
  email: String,

  projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
});

const ruleSchema = new Schema({
  name: { type: String, required: true },
  trigger: { type: String, required: true }, // e.g., 'cardMoved', 'taskUpdated'
  conditions: [
    {
      field: { type: String }, // e.g., 'status', 'label'
      operator: { type: String }, // e.g., 'equals', 'contains'
      value: { type: Schema.Types.Mixed }, // e.g., 'completed', 'urgent'
    },
  ],
  actions: [
    {
      type: { type: String, required: true }, // e.g., 'moveCard', 'sendNotification'
      params: Schema.Types.Mixed, // Additional parameters for actions
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

//project schema
const projectSchema = new Schema(
  {
    id: String,
    name: String,
    description: String,
    projectManager: String,
    teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    organization: { type: Schema.Types.ObjectId, ref: "Organization" },
    createdBy: String,
    updatedBy: String,
    deletedBy: String,

    startDate: { type: Date },

    bgUrl: { type: String },
    repository: { type: String, default: "" },
    repoName: { type: String, default: "" },
  },
  {
    timestamps: {
      createdAt: "createdDate",
      updatedAt: "updatedDate",
      deletedDate: "deletedDate",
    },
  }
);
const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // userEmail: { type: String },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  // type: {
  //   type: String,
  //   enum: ['TASK_ASSIGNED', 'TASK_RENAMED'],
  //   required: true
  // },
  type: { type: String, required: true },
  assignedByEmail: {
    type: String,
    required: true,
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  readStatus: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

//teams schema
const teamSchema = new Schema(
  {
    id: String,
    name: String,
    organization: { type: Schema.Types.ObjectId, ref: "Organization" },
    slug: { type: String },

    users: [
      { user: { type: Schema.Types.ObjectId, ref: "User" }, role: String },
    ],
    addedBy: String,
    removedBy: String,
  },
  {
    timestamps: { addedDate: "addedDate", removedDate: "removedDate" },
  }
);
const activitySchema = new Schema(
  {
    commentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

//cards schema
const cardSchema = new Schema(
  {
    name: String,
    description: String,
    assignedTo: { type: String },
    status: {
      type: String,
      enum: ["inprogress", "completed", "pending"],
      default: "pending",
    },

    createdDate: { type: Date },
    updatedDate: [{ type: Date }],
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    assignDate: { type: Date },
    dueDate: { type: Date },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    createdBy: String,
    updatedBy: [{ type: String }],
    movedBy: [{ type: String }],
    movedDate: [{ type: Date }],
    deletedBy: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // Add comments field
  },
  {
    timestamps: { deletedDate: "deletedDate" },
  }
);

// Comment schema
const commentSchema = new Schema(
  {
    comment: { type: String, required: true },
    commentBy: { type: String, required: true },
    card: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
  },
  {
    timestamps: true,
  }
);

// Task schema
const taskSchema = new Schema(
  {
    id: String,
    name: String,
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    card: [{ type: Schema.Types.ObjectId, ref: "Card" }],
    createdBy: String,
    updatedBy: String,
    movedBy: [{ type: String }],
    deletedBy: String,
    movedDate: [{ type: Date }],
  },
  {
    timestamps: {
      createdAt: "createdDate",
      updatedAt: "updatedDate",
    },
  }
);

// User schema
const userSchema = new Schema({
  id: String,
  name: String,
  email: String,
  password: String,
  role: { type: String },
  organization: { type: Schema.Types.ObjectId, ref: "Organization" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, default: "unverify" },
});

// Audit log schema
const auditLogSchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ["Project", "Task", "Card", "Team"],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true },
    actionType: {
      type: String,
      enum: ["create", "update", "delete", "move"],
      required: true,
    },
    actionDate: { type: Date, default: Date.now },
    performedBy: { type: String }, // Use ObjectId and reference the User model

    changes: [
      {
        field: { type: String },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed },
      },
    ],
    projectId: { type: Schema.Types.ObjectId, ref: "Project" }, // Add projectId reference
    // Optional fields to store taskId and cardId
    taskId: { type: Schema.Types.ObjectId, ref: "Task" },
    cardId: { type: Schema.Types.ObjectId, ref: "Card" },
  },
  {
    timestamps: true,
  }
);

// Creating models
const User = mongoose.model("User", userSchema);
const Task = mongoose.model("Task", taskSchema);
const Team = mongoose.model("Team", teamSchema);
const Project = mongoose.model("Project", projectSchema);
const Organization = mongoose.model("Organization", organizationSchema);
const Card = mongoose.model("Card", cardSchema);
const AuditLog = mongoose.model("AuditLog", auditLogSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Activity = mongoose.model("Activity", activitySchema);
const Notification = mongoose.model("Notification", NotificationSchema);
const Rule = mongoose.model("Rule", ruleSchema);
module.exports = {
  User,
  Task,
  Team,
  Project,
  Organization,
  Card,
  AuditLog,
  Comment,
  Activity,
  Notification,
  Rule
};

const tempOrganizationSchema = new Schema({
  name: String,
  email: String,
  projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
});

const TempOrganization = mongoose.model(
  "TempOrganization",
  tempOrganizationSchema
);

const tempUserSchema = new Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String },
  organization: { type: Schema.Types.ObjectId, ref: "TempOrganization" },
  status: { type: String },
});
const TempUser = mongoose.model("TempUser", tempUserSchema);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Create a transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "thinkailabs111@gmail.com",
    pass: "zwvu hhtq cavs zkmr",
  },
});

// // Send Registration Email with Token Function
const sendRegistrationEmail = (email, name, token) => {
  const link = `http://13.235.16.113/success?token=${token}`;
  const mailOptions = {
    from: "thinkailabs111@gmail.com",
    to: email,
    subject: "Registration Successful",
    text: `Dear ${name},\n\nYour registration was successful. Please click the following link to complete your registration and login: ${link}\n\nBest Regards,\nTeam`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending registration email:", error);
    } else {
      console.log("Registration email sent:", info.response);
    }
  });
};

//organisation register
app.post("/register", async (req, res) => {
  const {
    organizationName,
    organizationEmail,
    userName,
    userEmail,
    userPassword,
  } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await TempUser.findOne({ email: userEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Create the organization first
    const newOrganization = new TempOrganization({
      name: organizationName,
      email: organizationEmail,
      projects: [],
    });

    await newOrganization.save();

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Create the user with the organization reference and role 'admin'
    const newUser = new TempUser({
      name: userName,
      email: userEmail,
      password: hashedPassword, // Save the hashed password
      organization: newOrganization._id,
      role: "ADMIN",
      status: "verified",
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { email: userEmail, role: "ADMIN", userId: newUser._id },
      secretKey,
      { expiresIn: "3d" }
    );

    // Store the token in UsedToken collection
    const usedToken = new UsedToken({ token });
    await usedToken.save();

    // Send registration email with token
    sendRegistrationEmail(userEmail, userName, token);

    res.status(201).json({
      message: "Organization and user registered successfully",
      organization: newOrganization,
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error registering organization and user" });
  }
});

// Validate email token and store data permanently
app.get("/validate-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, secretKey);
    const { email, userId } = decoded;

    const tempUser = await TempUser.findOne({ _id: userId, email });
    const tempOrganization = await TempOrganization.findOne({
      _id: tempUser.organization,
    });

    if (tempUser && tempOrganization) {
      const newOrganization = new Organization({
        name: tempOrganization.name,
        email: tempOrganization.email,
        projects: tempOrganization.projects,
      });

      await newOrganization.save();

      const newUser = new User({
        name: tempUser.name,
        email: tempUser.email,
        password: tempUser.password,
        organization: newOrganization._id,
        role: tempUser.role,
        status: tempUser.status,
      });

      await newUser.save();

      await TempUser.deleteOne({ _id: userId });
      await TempOrganization.deleteOne({ _id: tempOrganization._id });

      res.status(200).json({ message: "Email validated successfully" });
    } else {
      res.status(400).json({ message: "Invalid token or user does not exist" });
    }
  } catch (error) {
    console.error("Error validating token:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

//mail search
app.get("/api/users/search", authenticateToken, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email query parameter is required" });
    }

    const users = await User.find({
      email: { $regex: email, $options: "i" },
      organization: req.user.organizationId,
    }).select("email");

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Fetch users for an organization
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find({ organization: req.user.organizationId });
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// User data name route
app.get("/api/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select(
      "username email"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    console.log(user.email);
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete user
app.delete(
  "/api/deleteUser/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const userId = req.params.id;

      // Find the user in the database before deleting to get the email or GitHub username
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Attempt to remove the user from the GitHub organization
      try {
        // If using the email to identify users in GitHub, make sure to convert it to a username if necessary
        const githubUsername = user.name; // Assuming email is used; replace with GitHub username if stored separately

        const githubResponse = await axios.delete(
          `https://api.github.com/orgs/Tail-Demo/memberships/${githubUsername}`,
          {
            headers: {
              Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        console.log(
          "GitHub membership deletion response:",
          githubResponse.data
        );
      } catch (error) {
        console.error(
          "Error removing user from GitHub organization:",
          error.response ? error.response.data : error.message
        );
        // Optionally, decide whether to proceed with deleting the user from the database if GitHub deletion fails
        return res.status(500).json({
          message:
            "User deletion failed on GitHub but proceeded in the database",
        });
      }

      // Delete the user from the database
      await User.findByIdAndDelete(userId);

      res
        .status(200)
        .json({
          message: "User deleted successfully from both database and GitHub",
        });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  }
);

// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate("organization");
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign(
          {
            email: user.email,
            role: user.role,
            organizationId: user.organization._id,
          },
          secretKey,
          { expiresIn: "1h" } // Token expires in 1 hour
        );
        res.json({ success: true, token });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Secret Key for JWT
const secretKey = crypto.randomBytes(32).toString("hex");

// Middleware for authenticating token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
// Middleware for authorizing based on role
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}
// Get user role route
app.get("/api/role", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select(
      "role organization"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      role: user.role,
      organizationId: user.organization,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
// Add user
app.post(
  "/api/addUser",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    const { name, email, role } = req.body;

    try {
      if (!name || !email || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newUser = new User({
        name,
        email,
        role: "USER",
        organization: req.user.organizationId,
        status: "unverify", // Set default status as 'unverify'
      });

      await newUser.save();

      const token = jwt.sign({ email, role, userId: newUser._id }, secretKey, {
        expiresIn: "3d",
      });
      const resetLink = `http://13.235.16.113/reset-password?token=${token}`;

      sendResetEmail(email, resetLink);

      // Add the user to the GitHub organization
      try {
        const githubResponse = await axios.put(
          `https://api.github.com/orgs/Tail-Demo/memberships/${name}`,
          {
            role: "member", // Use 'member' or 'admin' depending on the role you want to assign
          },
          {
            headers: {
              Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        console.log("GitHub membership response:", githubResponse.data);
      } catch (error) {
        console.error(
          "Error adding user to GitHub organization:",
          error.response ? error.response.data : error.message
        );
        // Handle the error but do not fail the entire request
        return res.status(500).json({
          message: "User added to the organization but not to GitHub",
          user: newUser,
        });
      }

      res.status(201).json({
        message: "User added successfully and added to GitHub",
        user: newUser,
      });
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).json({ message: "Error adding user" });
    }
  }
);

// app.post("/api/addUser",authenticateToken,authorizeRoles("ADMIN"),async (req, res) => {
//     const { name, email, role } = req.body;

//     try {
//       if (!name || !email || !role) {
//         return res.status(400).json({ message: "All fields are required" });
//       }

//       const newUser = new User({
//         name,
//         email,
//         role: "USER",
//         organization: req.user.organizationId,
//         status: "unverify", // Set default status as 'Pending'
//       });

//       await newUser.save();

//       const token = jwt.sign({ email, role, userId: newUser._id }, secretKey, {
//         expiresIn: "3d",
//       });
//       const resetLink = `http://13.235.16.113/reset-password?token=${token}`;

//       sendResetEmail(email, resetLink);

//       res
//         .status(201)
//         .json({ message: "User added successfully", user: newUser });
//     } catch (error) {
//       console.error("Error adding user:", error);
//       res.status(500).json({ message: "Error adding user" });
//     }
//   }
// );

// Send Email Function
const sendResetEmail = (email, link) => {
  const mailOptions = {
    from: "thinkailabs111@gmail.com",
    to: email,
    subject: "Password Reset",
    text: `Please click on the following link to reset your password: ${link}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};
// //reset password
app.post("/resetPassword", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const usedToken = await UsedToken.findOne({ token });
    if (usedToken) {
      return res
        .status(401)
        .json({ message: "This reset link has already been used or expired" });
    }

    const decoded = jwt.verify(token, secretKey);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { password: hashedPassword, status: "Verified" },
      { new: true }
    ); // Update status to 'Verified'

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newUsedToken = new UsedToken({ token });
    await newUsedToken.save();

    res.status(200).json({ message: "Password reset successfully", user });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token has expired" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Error resetting password" });
    }
  }
});

//projects
// Function to send emails
const sendEmail = (email, subject, text) => {
  const mailOptions = {
    from: "thinkailabs111@gmail.com",
    to: email,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

//create projects

app.post("/api/projects", async (req, res) => {
  const {
    organizationId,
    name,
    description,
    projectManager,
    startDate,
    createdBy,
    teams,
  } = req.body;

  try {
    console.log("Received request to create project:", req.body);

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      console.log("Organization not found");
      return res.status(404).json({ message: "Organization not found" });
    }

    const projectManagerUser = await User.findOne({ email: projectManager });
    if (!projectManagerUser) {
      console.log("Project manager not found");
      return res.status(404).json({ message: "Project manager not found" });
    }

    const createProjectUser = await User.findOne({ email: createdBy });
    if (!createProjectUser) {
      console.log("Creator not found");
      return res.status(404).json({ message: "Creator not found" });
    }

    // Validate that all team IDs exist and fetch team names
    let teamNames = [];
    if (teams && teams.length > 0) {
      const existingTeams = await Team.find({ _id: { $in: teams } });
      if (existingTeams.length !== teams.length) {
        console.log("Some teams not found");
        return res.status(404).json({ message: "Some teams not found" });
      }
      teamNames = existingTeams.map((team) => team.slug); // Ensure you use the 'slug' if GitHub API needs the slug
    }
    console.log("Team names:", teamNames); // Add a log to check team names

    const newProject = new Project({
      name,
      description,
      projectManager,
      organization: organization._id,
      teams: teams || [],
      tasks: [],
      startDate,
      createdBy,
      bgUrl: "",
      repository: "", // Initialize repository field
      repoName: "", // Initialize repoName field
    });

    await newProject.save();
    console.log("New project created:", newProject);

    const auditLog = new AuditLog({
      entityType: "Project",
      entityId: newProject._id,
      actionType: "create",
      actionDate: new Date(),
      performedBy: createProjectUser.name,
      changes: [],
    });

    await auditLog.save();
    console.log("Audit log created:", auditLog);

    organization.projects.push(newProject._id);
    await organization.save();
    console.log("Organization updated with new project");

    // Update teams with the new project
    if (teams && teams.length > 0) {
      await Team.updateMany(
        { _id: { $in: teams } },
        { $push: { projects: newProject._id } }
      );
      console.log("Teams updated with new project");
    }

    const token = jwt.sign(
      {
        projectId: newProject._id,
        name: newProject.name,
        description: newProject.description,
        projectManager: newProject.projectManager,
      },
      secretKey,
      { expiresIn: "1h" }
    );

    const link = `http://13.235.16.113/project?token=${token}`;
    const emailText = `Dear Project Manager,\n\nA new project has been created.\n\nProject Name: ${name}\nDescription: ${description}\n\nPlease click the following link to view the project details: ${link}\n\nBest Regards,\nTeam`;

    await sendEmail(projectManager, "New Project Created", emailText);
    console.log("Email sent to project manager");

    // Create GitHub repository
    const repoName = `${organization.name}-${newProject.name}-repo`
      .replace(/\s+/g, "-")
      .toLowerCase();
    let githubResponse;
    try {
      githubResponse = await axios.post(
        "https://api.github.com/orgs/Tail-Demo/repos",
        {
          name: repoName,
          private: true,
          description: `Repository for ${organization.name} project ${newProject.name}`,
        },
        {
          headers: {
            Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("GitHub repository created:", githubResponse.data);

      // Update project with repository info
      newProject.repository = githubResponse.data.html_url;
      newProject.repoName = repoName;
      await newProject.save();
      console.log(
        "Project repository URL and repo name updated:",
        newProject.repository,
        newProject.repoName
      );
    } catch (error) {
      console.error(
        "Error creating GitHub repository:",
        error.response ? error.response.data : error.message
      );
      return res
        .status(500)
        .json({
          message: "Error creating GitHub repository",
          error: error.message,
        });
    }

    // Assign team to the repository
    if (teamNames && teamNames.length > 0) {
      for (const teamName of teamNames) {
        try {
          const teamAssignResponse = await axios.put(
            `https://api.github.com/orgs/Tail-Demo/teams/${teamName}/repos/Tail-Demo/${repoName}`,
            { permission: "push" }, // 'push' gives write access, you can change to 'admin' for admin access
            {
              headers: {
                Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                Accept: "application/vnd.github.v3+json",
              },
            }
          );
          console.log(
            `Team ${teamName} assigned to GitHub repository:`,
            teamAssignResponse.data
          );
        } catch (error) {
          console.error(
            `Error assigning team ${teamName} to GitHub repository:`,
            error.response ? error.response.data : error.message
          );
          return res
            .status(500)
            .json({
              message: `Error assigning team ${teamName} to GitHub repository`,
              error: error.message,
            });
        }
      }
    }

    res.status(201).json({
      message:
        "Project created, email sent to project manager, GitHub repository created, and team assigned",
      project: newProject,
      projectManagerStatus: projectManagerUser.status,
      repository: githubResponse.data,
      repoName, // Include repo name in the response
      teamNames, // Include team names in the response
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res
      .status(500)
      .json({ message: "Error creating project", error: error.message });
  }
});

app.put(
  "/api/projects/:projectId/bgImage",
  authenticateToken,
  async (req, res) => {
    try {
      const projectId = req.params.projectId;
      console.log(projectId);
      const { bgUrl } = req.body;

      const result = await cloudinary.uploader.upload(bgUrl, {
        folder: "document",
      });

      const cloudinaryUrl = result.secure_url;

      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { bgUrl: cloudinaryUrl },
        { new: true }
      );

      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      res
        .status(200)
        .json({
          message: "Background image URL updated successfully",
          project: updatedProject,
        });
    } catch (error) {
      console.error("Error updating background image:", error);
      res.status(500).json({ message: "Error updating background image" });
    }
  }
);

//custom image
app.put(
  "/api/projects/:projectId/customImages",
  authenticateToken,
  async (req, res) => {
    try {
      const projectId = req.params.projectId;
      console.log(projectId);
      const { imageUrl } = req.body;

      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { $push: { customImages: imageUrl } },
        { new: true }
      );

      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      res
        .status(200)
        .json({
          message: "Custom image URL added successfully",
          project: updatedProject,
        });
    } catch (error) {
      console.error("Error adding custom image:", error);
      res.status(500).json({ message: "Error adding custom image" });
    }
  }
);

//status
app.get("/api/user-status", async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ status: user.status });
  } catch (error) {
    console.error("Error fetching user status:", error);
    res.status(500).json({ message: "Error fetching user status" });
  }
});
// // Endpoint to display projects based on organization ID
app.get(
  "/api/projects/:organizationId",
  authenticateToken,
  async (req, res) => {
    const { organizationId } = req.params;
    const userEmail = req.user.email;
    const userRole = req.user.role;

    try {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      let projects;
      if (userRole === "ADMIN") {
        // Admins can see all projects
        projects = await Project.find({ organization: organizationId });
      } else {
        // Find the user
        const user = await User.findOne({ email: userEmail });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Find projects where the user is either the project manager or part of a team
        projects = await Project.find({
          organization: organizationId,
          $or: [
            { projectManager: userEmail },
            { teams: { $in: await Team.find({ "users.user": user._id }) } },
          ],
        });
      }

      res.status(200).json({ projects });
    } catch (error) {
      console.error("Error retrieving projects:", error);
      res.status(500).json({ message: "Error retrieving projects" });
    }
  }
);

app.put("/api/projects/:projectId", authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { name, description, updatedBy } = req.body; // Include updatedBy in the request body

    // Find the user by email to get their ObjectId and email
    const updatedByUser = await User.findOne({ email: updatedBy });
    if (!updatedByUser) {
      return res.status(404).json({ message: "User not found for updatedBy" });
    }

    // Find the existing project to get the old values
    const oldProject = await Project.findById(projectId);
    if (!oldProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { name, description, updatedBy },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Prepare changes array for audit log
    const changes = [];
    if (oldProject.name !== name) {
      changes.push({
        field: "name",
        oldValue: oldProject.name,
        newValue: name,
      });
    }
    if (oldProject.description !== description) {
      changes.push({
        field: "description",
        oldValue: oldProject.description,
        newValue: description,
      });
    }

    // Create a new audit log entry
    const newAuditLog = new AuditLog({
      entityType: "Project",
      entityId: projectId,
      actionType: "update",
      actionDate: new Date(),
      performedBy: updatedByUser.name, // Use the ObjectId of the user
      changes: changes,
    });

    await newAuditLog.save();

    // Check if the project name has changed and send an email if it has
    if (oldProject.name !== name) {
      const projectManager = oldProject.projectManager;
      const emailText = `Dear Project Manager,\n\nThe project name has been changed.\n\nOld Project Name: ${oldProject.name}\nNew Project Name: ${name}\n\nBest Regards,\nTeam`;
      sendEmail(projectManager, "Project Name Changed", emailText);
    }

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Error updating project" });
  }
});

// Delete a project
app.delete("/api/projects/:projectId", authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Find the project to be deleted
    const deletedProject = await Project.findById(projectId);
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Remove the project reference from the organization
    await Organization.updateOne(
      { _id: deletedProject.organization },
      { $pull: { projects: projectId } }
    );

    // Remove the project reference from the teams
    if (deletedProject.teams && deletedProject.teams.length > 0) {
      await Team.updateMany(
        { _id: { $in: deletedProject.teams } },
        { $pull: { projects: projectId } }
      );
    }

    // Delete the project from the database
    await Project.findByIdAndDelete(projectId);

    // Construct the repository name
    const organization = await Organization.findById(
      deletedProject.organization
    );
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const repoName = `${organization.name}-${deletedProject.name}-repo`
      .replace(/\s+/g, "-")
      .toLowerCase();

    console.log("Attempting to delete GitHub repository:", repoName);

    // Attempt to delete the GitHub repository
    try {
      const githubResponse = await axios.delete(
        `https://api.github.com/repos/Tail-Demo/${repoName}`,
        {
          headers: {
            Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      console.log("GitHub repository deleted:", githubResponse.data);
    } catch (error) {
      console.error(
        "Error deleting GitHub repository:",
        error.response ? error.response.data : error.message
      );
      return res
        .status(500)
        .json({
          message: "Error deleting GitHub repository",
          error: error.message,
        });
    }

    res
      .status(200)
      .json({
        message:
          "Project and associated GitHub repository deleted successfully",
      });
  } catch (error) {
    console.error("Error deleting project:", error);
    res
      .status(500)
      .json({ message: "Error deleting project", error: error.message });
  }
});

//tasks
//add task

app.post(
  "/api/projects/:projectId/tasks",
  authenticateToken,
  async (req, res) => {
    const { projectId } = req.params;
    const { name, createdBy, createdDate } = req.body;

    try {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const createdByUser = await User.findOne({ email: createdBy });
      if (!createdByUser) {
        return res
          .status(404)
          .json({ message: "User not found for createdBy" });
      }

      const newTask = new Task({
        name,
        project: projectId,
        createdBy,
        createdDate,
      });

      await newTask.save();

      project.tasks.push(newTask._id);
      await project.save();

      // Create a new audit log entry
      const newAuditLog = new AuditLog({
        entityType: "Task",
        entityId: newTask._id,
        actionType: "create",
        actionDate: new Date(),
        performedBy: createdByUser.name,
        projectId,
        changes: [
          {
            field: "name",
            oldValue: null,
            newValue: name,
          },
          {
            field: "project",
            oldValue: null,
            newValue: projectId,
          },
          {
            field: "createdBy",
            oldValue: null,
            newValue: createdBy,
          },
          {
            field: "createdDate",
            oldValue: null,
            newValue: createdDate,
          },
        ],
      });

      await newAuditLog.save();

      // Fetch the updated list of tasks
      const updatedProject = await Project.findById(projectId).populate(
        "tasks"
      );
      const updatedTasks = updatedProject.tasks.map((task) => ({
        id: task._id,
        name: task.name,
        cards: task.cards || [],
      }));

      // Emit event for real-time update with the full updated task list
      io.emit("tasksUpdated", { projectId, tasks: updatedTasks });

      res.status(201).json({
        message: "Task created successfully",
        task: newTask,
        tasks: updatedTasks, // Include the updated task list in the response
      });
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Error creating task" });
    }
  }
);

//get task
app.get(
  "/api/projects/:projectId/tasks",
  authenticateToken,
  async (req, res) => {
    const { projectId } = req.params;

    try {
      const project = await Project.findById(projectId).populate("tasks");
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const tasks = project.tasks.map((task) => ({
        id: task._id,
        name: task.name,
        cards: task.cards || [],
      }));

      res.status(200).json({ tasks, bgUrl: project.bgUrl });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Error fetching tasks" });
    }
  }
);
//move tasks
app.put(
  "/api/projects/:projectId/tasks/:taskId/move",
  authenticateToken,
  async (req, res) => {
    const { projectId, taskId } = req.params;
    const { newIndex, movedBy, movedDate } = req.body;

    try {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const taskIndex = project.tasks.indexOf(taskId);
      if (taskIndex === -1) {
        return res.status(404).json({ message: "Task not found in project" });
      }

      // Remove task from current position and insert at new position
      project.tasks.splice(taskIndex, 1);
      project.tasks.splice(newIndex, 0, taskId);

      // Update the task with movedBy and movedDate
      const task = await Task.findById(taskId);
      if (task) {
        task.movedBy.push(movedBy);
        task.movedDate.push(movedDate);
        await task.save();
      }

      await project.save();

      // Create a new audit log entry
      const movedByUser = await User.findOne({ email: movedBy });
      if (!movedByUser) {
        return res.status(404).json({ message: "User not found for movedBy" });
      }

      const newAuditLog = new AuditLog({
        projectId: projectId,
        entityType: "Task",
        entityId: taskId,
        actionType: "move",
        actionDate: movedDate,
        performedBy: movedByUser.name, // Save the email of the user
        changes: [
          {
            field: "index",
            oldValue: taskIndex,
            newValue: newIndex,
          },
          {
            field: "movedBy",
            oldValue: null,
            newValue: movedBy,
          },
          {
            field: "movedDate",
            oldValue: null,
            newValue: movedDate,
          },
        ],
      });

      await newAuditLog.save();

      // Emit event for real-time update
      io.emit("taskMoved", { projectId, taskId, newIndex });

      res.status(200).json({ message: "Task moved successfully" });
    } catch (error) {
      console.error("Error moving task:", error);
      res.status(500).json({ message: "Error moving task" });
    }
  }
);

//delelte column
app.delete(
  "/api/projects/:projectId/tasks/:taskId",
  authenticateToken,
  async (req, res) => {
    const { projectId, taskId } = req.params;
    const { deletedBy, deletedDate } = req.body;

    try {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const taskIndex = project.tasks.indexOf(taskId);
      if (taskIndex === -1) {
        return res.status(404).json({ message: "Task not found in project" });
      }

      // Remove the task from the project's task list
      project.tasks.splice(taskIndex, 1);
      await project.save();

      // Mark the task as deleted instead of deleting it
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      task.deletedBy = deletedBy;
      task.deletedDate = deletedDate;
      await task.save();

      // Create a new audit log entry
      const deletedByUser = await User.findOne({ email: deletedBy });
      if (!deletedByUser) {
        return res
          .status(404)
          .json({ message: "User not found for deletedBy" });
      }

      const newAuditLog = new AuditLog({
        projectId: projectId,
        entityType: "Task",
        entityId: taskId,
        actionType: "delete",
        actionDate: deletedDate,
        performedBy: deletedByUser.name, // Save the email of the user
        changes: [
          {
            field: "deletedBy",
            oldValue: null,
            newValue: deletedBy,
          },
          {
            field: "deletedDate",
            oldValue: null,
            newValue: deletedDate,
          },
        ],
      });

      await newAuditLog.save();

      // Emit event for real-time update
      io.emit("taskDeleted", { projectId, taskId });

      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Error deleting task" });
    }
  }
);
// Update (rename) task
app.put(
  "/api/projects/:projectId/tasks/:taskId",
  authenticateToken,
  async (req, res) => {
    const { projectId, taskId } = req.params;
    const { name, updatedBy, updatedDate } = req.body;

    try {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const oldName = task.name;

      task.name = name;
      task.updatedBy = updatedBy;
      task.updatedDate = updatedDate;
      await task.save();

      // Create a new audit log entry
      const updatedByUser = await User.findOne({ email: updatedBy });
      if (!updatedByUser) {
        return res
          .status(404)
          .json({ message: "User not found for updatedBy" });
      }

      const newAuditLog = new AuditLog({
        projectId: projectId,
        entityType: "Task",
        entityId: taskId,
        actionType: "update",
        actionDate: updatedDate,
        performedBy: updatedByUser.name, // Save the email of the user
        changes: [
          {
            field: "name",
            oldValue: oldName,
            newValue: name,
          },
          {
            field: "updatedBy",
            oldValue: null,
            newValue: updatedBy,
          },
          {
            field: "updatedDate",
            oldValue: null,
            newValue: updatedDate,
          },
        ],
      });

      await newAuditLog.save();

      // Emit event for real-time update
      io.emit("taskRenamed", { projectId, taskId, newName: name });

      res.status(200).json({ message: "Task updated successfully", task });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Error updating task" });
    }
  }
);

//cards
//create card
app.post("/api/tasks/:taskId/cards", authenticateToken, async (req, res) => {
  const { taskId } = req.params;

  const { name, description, assignedTo, assignDate, dueDate, createdBy } =
    req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newCard = new Card({
      name,
      description,
      assignedTo,
      assignDate,
      dueDate,
      task: taskId,
      project: task.project,
      createdDate: new Date(),
      createdBy,
    });

    await newCard.save();
    task.card.push(newCard._id);
    await task.save();

    // Create audit log entry for card creation
    const createdByUser = await User.findOne({ email: createdBy });
    if (!createdByUser) {
      return res.status(404).json({ message: "User not found for createdBy" });
    }

    const newAuditLog = new AuditLog({
      entityType: "Card",
      entityId: newCard._id,
      actionType: "create",
      actionDate: new Date(),
      performedBy: createdByUser.name,
      projectId: task.project,
      taskId: task._id,
      changes: [
        { field: "name", oldValue: null, newValue: name },
        // Add other relevant changes if needed
      ],
    });

    await newAuditLog.save();

    // Log creation in comments
    const newComment = new Comment({
      comment: `card created by ${createdByUser.name}`,
      commentBy: createdByUser.name,
      card: newCard._id,
    });
    await newComment.save();
    newCard.comments.push(newComment._id);
    await newCard.save();

    // Create notification
    const assignedUser = await User.findOne({ email: assignedTo });
    if (!assignedUser) {
      return res.status(404).json({ message: "Assigned user not found" });
    }

    const newNotification = new Notification({
      userId: assignedUser._id,
      projectId: task.project,
      // message: `Task "${name}" assigned to you`,
      // message: `"${createdByUser.email}" assigned Task "${name}" to you`,
      message: ` is assigned to the "${name}" task on Project "${project.name}" `,
      type: "TASK_ASSIGNED",
      cardId: newCard._id,
      assignedByEmail: createdByUser.name,
    });
    await newNotification.save();
    // console.log("newnotifications", newNotification);

    // Emit event for real-time update
    io.emit("cardCreated", { taskId, card: newCard });

    res
      .status(201)
      .json({ message: "Card created successfully", card: newCard });
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({ message: "Error creating card" });
  }
});

app.post("/api/notifications", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    console.log("Requested notifications for userId:", userId);

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Fetch notifications for the specified userId
    const notifications = await Notification.find({ userId }, "message");
    console.log("Fetched notifications for user:", userId, notifications);

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});
app.patch(
  "/api/notifications/:notificationId",
  authenticateToken,
  async (req, res) => {
    const { notificationId } = req.params;
    const { readStatus } = req.body;

    try {
      // Find the notification by ID
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      // Update readStatus
      notification.readStatus = readStatus;
      await notification.save();

      res
        .status(200)
        .json({ message: "Notification updated successfully", notification });
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
app.post("/api/notifications/unread", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const notifications = await Notification.find({
      userId,
      readStatus: false,
    }).sort({ createdAt: -1 }); // Sort notifications by creation date, most recent first

    res.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//card move
app.put("/api/cards/:cardId/move", authenticateToken, async (req, res) => {
  const { cardId } = req.params;
  const { sourceTaskId, destinationTaskId, movedBy, movedDate } = req.body;

  try {
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const sourceTask = await Task.findById(sourceTaskId);
    if (!sourceTask) {
      return res.status(404).json({ message: "Source task not found" });
    }

    const destinationTask = await Task.findById(destinationTaskId);
    if (!destinationTask) {
      return res.status(404).json({ message: "Destination task not found" });
    }

    // Create comment
    const movedByUser = await User.findOne({ email: movedBy });
    if (!movedByUser) {
      return res.status(404).json({ message: "User not found for movedBy" });
    }
    const cardIndex = sourceTask.card.indexOf(cardId);
    if (cardIndex === -1) {
      return res.status(404).json({ message: "Card not found in source task" });
    }
    sourceTask.card.splice(cardIndex, 1);
    await sourceTask.save();

    destinationTask.card.push(cardId);
    await destinationTask.save();

    card.task = destinationTaskId;
    if (!card.movedBy) {
      card.movedBy = [];
    }
    card.movedBy.push(movedBy);
    card.movedDate.push(movedDate);

    await card.save();

    // Create audit log entry for card move
    const newAuditLog = new AuditLog({
      entityType: "Card",
      entityId: cardId,
      actionType: "move",
      actionDate: movedDate,
      performedBy: movedByUser.name,
      projectId: sourceTask.project, // Include projectId from source task
      sourceTaskId,
      destinationTaskId,
      changes: [
        { field: "task", oldValue: sourceTaskId, newValue: destinationTaskId },
        { field: "movedBy", oldValue: null, newValue: movedBy },
        { field: "movedDate", oldValue: null, newValue: movedDate },
      ],
    });

    await newAuditLog.save();

    const project = await Project.findById(sourceTask.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const assignedUser = await User.findOne({ email: card.assignedTo });
    if (!assignedUser) {
      return res.status(404).json({ message: "Assigned user not found" });
    }

    const newComment = new Comment({
      comment: `Card moved by ${movedByUser.name} from task ${sourceTask.name} to task ${destinationTask.name}`,
      commentBy: movedByUser.name,
      card: card._id,
    });
    await newComment.save();
    card.comments.push(newComment._id);
    await card.save();

    // Create notification
    const newNotification = new Notification({
      userId: assignedUser._id,
      projectId: sourceTask.project,
      // message: `${card.name} is moved from "${sourceTask.name}" to "${destinationTask.name}"`,
      message: ` is moved task "${card.name}" from "${sourceTask.name}" to "${destinationTask.name}" on Project "${project.name}"`,
      type: "CARD_MOVED",
      assignedByEmail: movedByUser.name,
      cardId: card._id,
    });

    await newNotification.save();

    // Emit event
    io.emit("cardMoved", { cardId, sourceTaskId, destinationTaskId });

    res.status(200).json({ message: "Card moved successfully", card });
  } catch (error) {
    console.error("Error moving card:", error);
    res.status(500).json({ message: "Error moving card" });
  }
});

app.put(
  "/api/tasks/:taskId/cards/:cardId",
  authenticateToken,
  async (req, res) => {
    const { taskId, cardId } = req.params;
    const { name, description, updatedBy, updatedDate, comment } = req.body;

    try {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const card = await Card.findById(cardId);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      // Update card details
      const oldName = card.name;
      const oldDescription = card.description;
      card.name = name;
      card.description = description;

      // Create audit log entry for card update
      const updatedByUser = await User.findOne({ email: updatedBy });
      if (!updatedByUser) {
        return res.status(404).json({ message: "User not found" });
      }
      // Update updatedBy and updatedDate fields
      if (!card.updatedBy) {
        card.updatedBy = [];
      }
      card.updatedBy.push(updatedBy);
      if (!card.updatedDate) {
        card.updatedDate = [];
      }
      card.updatedDate.push(updatedDate);

      // Save comment if provided
      if (comment) {
        const newComment = new Comment({
          comment: comment,
          commentBy: updatedByUser.name,
          card: card._id,
        });
        await newComment.save();
        card.comments.push(newComment._id);
      }

      await card.save();

      const newAuditLog = new AuditLog({
        entityType: "Card",
        entityId: cardId,
        actionType: "update",
        actionDate: updatedDate,
        performedBy: updatedByUser.name,
        projectId: task.project,
        taskId: taskId,
        changes: [
          { field: "name", oldValue: oldName, newValue: name },
          {
            field: "description",
            oldValue: oldDescription,
            newValue: description,
          },
          { field: "updatedBy", oldValue: null, newValue: updatedBy },
          { field: "updatedDate", oldValue: null, newValue: updatedDate },
        ],
      });

      await newAuditLog.save();

      // Only add the "Card updated" comment if no specific comment was provided
      if (!comment) {
        const updateComment = new Comment({
          comment: `Card updated by ${updatedByUser.name}`,
          commentBy: updatedByUser.name,
          card: card._id,
        });
        await updateComment.save();
        card.comments.push(updateComment._id);
        await card.save();
      }

      //notification
      // Create notification
      const project = await Project.findById(task.project);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assignedUser = await User.findOne({ email: card.assignedTo });
      if (!assignedUser) {
        return res.status(404).json({ message: "Assigned user not found" });
      }

      const notificationMessage = ` has renamed the task "${oldName}" to "${name}" on Project "${project.name}"`;

      const newNotification = new Notification({
        userId: assignedUser._id,
        projectId: task.project,
        message: notificationMessage,
        type: "TASK_RENAMED",
        cardId: card._id,
        assignedByEmail: updatedByUser.name,
      });

      await newNotification.save();

      // Emit event for real-time update
      io.emit("cardUpdated", {
        taskId,
        cardId,
        newName: name,
        newDescription: description,
      });

      res.status(200).json({ message: "Card updated successfully", card });
    } catch (error) {
      console.error("Error updating card:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get cards with comments
app.get("/api/tasks/:taskId/cards", authenticateToken, async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId).populate({
      path: "card",
      populate: {
        path: "comments",
        model: "Comment",
      },
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const cards = task.card.map((card) => ({
      id: card._id,
      name: card.name,
      description: card.description,
      assignedTo: card.assignedTo,
      status: card.status,
      createdDate: moment(card.createdDate)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss"), // Adjust timezone and format as per requirement
      assignDate: moment(card.assignDate)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss"), // Adjust timezone and format as per requirement
      dueDate: moment(card.dueDate)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss"), // Adjust timezone and format as per requirement
      comments: card.comments.map((comment) => ({
        id: comment._id,
        comment: comment.comment,
        commentBy: comment.commentBy,
        createdAt: moment(comment.createdAt)
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss"), // Adjust timezone and format as per requirement
      })),
    }));

    res.status(200).json({ cards });
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ message: "Error fetching cards" });
  }
});

// Delete a card from a task

app.delete(
  "/api/tasks/:taskId/cards/:cardId",
  authenticateToken,
  async (req, res) => {
    const { taskId, cardId } = req.params;
    const { deletedBy, deletedDate } = req.body;

    try {
      // Find the task
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Find the card
      const card = await Card.findById(cardId);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      // Check if the card is part of the task
      const cardIndex = task.card.indexOf(cardId); // Change 'task.card' to 'task.cards'
      if (cardIndex === -1) {
        return res.status(404).json({ message: "Card not found in task" });
      }

      // Find the user who deleted the card
      const deletedByUser = await User.findOne({ email: deletedBy });
      if (!deletedByUser) {
        return res
          .status(404)
          .json({ message: "User not found for deletedBy" });
      }

      // Create audit log entry for card deletion
      const newAuditLog = new AuditLog({
        entityType: "Card",
        entityId: cardId,
        actionType: "delete",
        actionDate: deletedDate,
        performedBy: deletedByUser.name,
        projectId: task.project,
        taskId,
        changes: [
          { field: "deletedBy", oldValue: null, newValue: deletedBy },
          { field: "deletedDate", oldValue: null, newValue: deletedDate },
        ],
      });

      await newAuditLog.save();

      // Remove the card from the task
      task.card.splice(cardIndex, 1);
      await task.save();

      // Delete the card from the database
      await Card.findByIdAndDelete(cardId);

      const assignedUser = await User.findOne({ email: card.assignedTo });
      if (!assignedUser) {
        return res.status(404).json({ message: "Assigned user not found" });
      }

      const project = await Project.findById(task.project);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Create a notification for the card deletion
      // const notification = new Notification({
      //   userId: assignedUser._id,
      //   projectId: task.project,
      //   // message: `Card with ID ${cardId} has been deleted.`,
      //   message: `${deletedByUser.name} has been deleted task "${card.name}" on project "${project.name}".`,
      //   type: 'CARD_DELETED',
      //   assignedByEmail: deletedBy,
      //   cardId,
      //   readStatus: false,
      // });

      // await notification.save();

      // Emit a socket event for card deletion
      io.emit("cardDeleted", { taskId, cardId });

      // Respond with success message
      res.status(200).json({ message: "Card deleted successfully" });
    } catch (error) {
      console.error("Error deleting card:", error);
      res.status(500).json({ message: "Error deleting card" });
    }
  }
);

app.put("/api/cards/:cardId/status", authenticateToken, async (req, res) => {
  const { cardId } = req.params;
  const { status, updatedBy, updatedDate } = req.body;

  try {
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const oldStatus = card.status;
    card.status = status;

    // Update updatedBy and updatedDate fields
    if (!card.updatedBy) {
      card.updatedBy = [];
    }
    card.updatedBy.push(updatedBy);
    if (!card.updatedDate) {
      card.updatedDate = [];
    }
    card.updatedDate.push(updatedDate);

    await card.save();

    const newAuditLog = new AuditLog({
      entityType: "Card",
      entityId: cardId,
      actionType: "update",
      actionDate: updatedDate,
      performedBy: updatedBy,
      projectId: card.project, // Include projectId in the audit log
      taskId: card.task, // Include taskId in the audit log
      changes: [{ field: "status", oldValue: oldStatus, newValue: status }],
    });

    await newAuditLog.save();

    // Log status update in comments
    const statusComment = new Comment({
      comment: `Card status updated to ${status} by ${updatedBy}`,
      commentBy: updatedBy,
      card: card._id,
    });
    await statusComment.save();
    card.comments.push(statusComment._id);
    await card.save();

    // Emit event for real-time update
    io.emit("cardStatusUpdated", { cardId, newStatus: status });

    res.status(200).json({ message: "Card status updated successfully", card });
  } catch (error) {
    console.error("Error updating card status:", error);
    res.status(500).json({ message: "Error updating card status" });
  }
});

//teams related apis
app.post(
  "/api/projects/:projectId/teams/addUser",
  authenticateToken,
  async (req, res) => {
    const { projectId } = req.params;
    const { email, teamName, addedBy, addedDate } = req.body; // Removed addedDate since we'll generate it

    try {
      const project = await Project.findById(projectId).populate("teams");
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      let team = project.teams.find((team) => team.name === teamName);
      if (!team) {
        team = new Team({
          name: teamName,
          users: [],
          addedBy,
          addedDate: new Date(),
        });
        await team.save();
        console.log("addedBy", addedBy);

        project.teams.push(team._id);
        await project.save();
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the user has an 'ADMIN' role
      if (user.role === "ADMIN") {
        return res
          .status(400)
          .json({ message: "Admin users cannot be added to teams" });
      }

      // Check if the user status is 'unverify'
      if (user.status === "unverify") {
        return res.status(400).json({
          message:
            "This user email is not verified. Please verify the email before adding into team.",
        });
      }

      const userInTeam = team.users.find(
        (u) => u.user.toString() === user._id.toString()
      );
      if (userInTeam) {
        return res.status(400).json({ message: "User is already in the team" });
      }

      team.users.push({ user: user._id, role: "USER" });
      await team.save();

      res
        .status(200)
        .json({ message: "User added to team successfully", team });
    } catch (error) {
      console.error("Error adding user to team:", error);
      res.status(500).json({ message: "Error adding user to team" });
    }
  }
);
// Endpoint to get all users under all teams based on project ID
app.get(
  "/api/projects/:projectId/teams/users",
  authenticateToken,
  async (req, res) => {
    const { projectId } = req.params;

    try {
      const project = await Project.findById(projectId).populate({
        path: "teams",
        populate: {
          path: "users.user",
          model: "User",
        },
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const users = [];
      project.teams.forEach((team) => {
        team.users.forEach((user) => {
          users.push({
            name: user.user.name,
            email: user.user.email,
            role: user.role,
            team: team.name,
          });
        });
      });

      res.status(200).json({ users });
    } catch (error) {
      console.error("Error fetching team users:", error);
      res.status(500).json({ message: "Error fetching team users" });
    }
  }
);
// Endpoint to get users under a specific team based on project ID and team name
app.get(
  "/api/projects/:projectId/teams/:teamName/users",
  authenticateToken,
  async (req, res) => {
    const { projectId, teamName } = req.params;
    try {
      const project = await Project.findById(projectId).populate({
        path: "teams",
        match: { name: teamName },
        populate: {
          path: "users.user",
          model: "User",
        },
      });

      if (!project || project.teams.length === 0) {
        return res.status(404).json({ message: "Team not found" });
      }

      const team = project.teams[0];
      const users = team.users.map((user) => ({
        name: user.user.name,
        email: user.user.email,
        role: user.role,
        team: team.name,
      }));

      res.status(200).json({ users });
    } catch (error) {
      console.error("Error fetching team users:", error);
      res.status(500).json({ message: "Error fetching team users" });
    }
  }
);

// Endpoint to delete a user from a team
app.delete(
  "/api/projects/:projectId/teams/:teamName/users",
  authenticateToken,
  async (req, res) => {
    const { projectId, teamName } = req.params;
    const { email, removedBy } = req.body;

    try {
      const project = await Project.findById(projectId).populate("teams");
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const team = project.teams.find((t) => t.name === teamName);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userIndex = team.users.findIndex(
        (u) => u.user.toString() === user._id.toString()
      );
      if (userIndex === -1) {
        return res.status(404).json({ message: "User not found in the team" });
      }

      team.users.splice(userIndex, 1);
      await team.save();
      console.log("removedBy", removedBy);
      res
        .status(200)
        .json({ message: "User removed from team successfully", removedBy });
    } catch (error) {
      console.error("Error removing user from team:", error);
      res.status(500).json({ message: "Error removing user from team" });
    }
  }
);

//teams inside organization

// Create a team inside an organization and a GitHub organization

app.post(
  "/api/organizations/:organizationId/teams",
  authenticateToken,
  async (req, res) => {
    const { organizationId } = req.params;
    const { teamName, addedBy } = req.body;

    try {
      const organization = await Organization.findById(organizationId).populate(
        "teams"
      );
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      let team = organization.teams.find((team) => team.name === teamName);
      if (team) {
        return res
          .status(400)
          .json({ message: "Team with this name already exists" });
      }

      team = new Team({
        name: teamName,
        users: [],
        addedBy,
        addedDate: new Date(),
      });

      // Save the team to get an ID before updating with GitHub slug
      await team.save();

      organization.teams.push(team._id);
      await organization.save();

      // Create a team in the GitHub organization
      const githubTeamResponse = await axios.post(
        `https://api.github.com/orgs/Tail-Demo/teams`,
        {
          name: teamName,
          privacy: "closed",
        },
        {
          headers: {
            Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("GitHub team created:", githubTeamResponse.data);

      // Update the team with the GitHub slug
      team.slug = githubTeamResponse.data.slug;
      await team.save();

      res.status(200).json({
        message: "Team created successfully",
        team,
        githubTeam: githubTeamResponse.data,
      });
    } catch (error) {
      console.error("Error creating team:", error);
      res
        .status(500)
        .json({ message: "Error creating team", error: error.message });
    }
  }
);

app.get(
  "/api/organizations/:organizationId/teams",
  authenticateToken,
  async (req, res) => {
    const { organizationId } = req.params;

    try {
      const organization = await Organization.findById(organizationId).populate(
        "teams"
      );
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      const teams = organization.teams;

      res.status(200).json({ teams });
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Error fetching teams" });
    }
  }
);
// Delete team inside organization
app.delete(
  "/api/organizations/:organizationId/teams/:teamId",
  authenticateToken,
  async (req, res) => {
    const { organizationId, teamId } = req.params;

    try {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      const teamIndex = organization.teams.indexOf(teamId);
      if (teamIndex === -1) {
        return res
          .status(404)
          .json({ message: "Team not found in this organization" });
      }

      // Remove the team from the organization
      organization.teams.splice(teamIndex, 1);
      await organization.save();

      // Delete the team
      await Team.findByIdAndDelete(teamId);

      // Delete the team from the GitHub organization
      const githubTeamResponse = await axios.delete(
        `https://api.github.com/orgs/Tail-Demo/teams/${team.name}`,
        {
          headers: {
            Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("GitHub team deleted:", githubTeamResponse.data);

      res
        .status(200)
        .json({ message: "Team deleted successfully from MongoDB and GitHub" });
    } catch (error) {
      console.error("Error deleting team:", error);
      res
        .status(500)
        .json({ message: "Error deleting team", error: error.message });
    }
  }
);
// Edit team inside organization
app.put(
  "/api/organizations/:organizationId/teams/:teamId",
  authenticateToken,
  async (req, res) => {
    const { organizationId, teamId } = req.params;
    const { teamName } = req.body;

    try {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      const oldTeamName = team.name;
      team.name = teamName;
      await team.save();

      // Update the team name in the GitHub organization
      const githubTeamResponse = await axios.patch(
        `https://api.github.com/orgs/Tail-Demo/teams/${oldTeamName}`,
        {
          name: teamName,
        },
        {
          headers: {
            Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("GitHub team updated:", githubTeamResponse.data);

      res
        .status(200)
        .json({
          message: "Team updated successfully",
          team,
          githubTeam: githubTeamResponse.data,
        });
    } catch (error) {
      console.error("Error updating team:", error);
      res
        .status(500)
        .json({ message: "Error updating team", error: error.message });
    }
  }
);

//create users inside teams
app.post(
  "/api/organizations/:organizationId/teams/:teamId/users",
  authenticateToken,
  async (req, res) => {
    const { organizationId, teamId } = req.params;
    const { email, role } = req.body;

    try {
      // Find the organization
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Find the team
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check if the team belongs to the organization
      if (!organization.teams.includes(team._id)) {
        return res
          .status(400)
          .json({ message: "Team does not belong to this organization" });
      }

      // Find the user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the user has an 'ADMIN' role
      if (user.role === "ADMIN") {
        return res
          .status(400)
          .json({ message: "Admin users cannot be added to teams" });
      }

      // Check if the user status is 'unverify'
      if (user.status === "unverify") {
        return res.status(400).json({
          message:
            "This user email is not verified. Please verify the email before adding into team.",
        });
      }

      // Check if the user is already in the team
      const userInTeam = team.users.find(
        (u) => u.user.toString() === user._id.toString()
      );
      if (userInTeam) {
        return res.status(400).json({ message: "User is already in the team" });
      }

      // Add the user to the team in MongoDB
      team.users.push({ user: user._id, role: role || "USER" });
      await team.save();

      // Add the user to the GitHub team
      const githubTeamResponse = await axios.put(
        `https://api.github.com/orgs/Tail-Demo/teams/${team.name}/memberships/${user.name}`,
        {},
        {
          headers: {
            Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("GitHub team membership updated:", githubTeamResponse.data);

      res.status(200).json({
        message:
          "User added to team successfully in MongoDB and GitHub. Invitation email sent.",
        team,
        githubTeam: githubTeamResponse.data,
      });
    } catch (error) {
      console.error("Error adding user to team:", error);
      res
        .status(500)
        .json({ message: "Error adding user to team", error: error.message });
    }
  }
);

app.get(
  "/api/organizations/:organizationId/teams/:teamId/users",
  authenticateToken,
  async (req, res) => {
    const { organizationId, teamId } = req.params;

    try {
      // Find the organization
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Find the team and populate its users
      const team = await Team.findById(teamId).populate(
        "users.user",
        "name email status"
      );
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check if the team belongs to the organization
      if (!organization.teams.includes(team._id)) {
        return res
          .status(400)
          .json({ message: "Team does not belong to this organization" });
      }

      // Format the user data
      const users = team.users.map((user) => ({
        id: user.user._id,
        name: user.user.name,
        email: user.user.email,
        role: user.role,
        status: user.user.status,
      }));

      res.status(200).json({ teamName: team.name, users });
    } catch (error) {
      console.error("Error fetching team users:", error);
      res.status(500).json({ message: "Error fetching team users" });
    }
  }
);

app.delete(
  "/api/organizations/:organizationId/teams/:teamId/users/:userId",
  authenticateToken,
  async (req, res) => {
    const { organizationId, teamId, userId } = req.params;
    const { removedBy } = req.body;

    try {
      // Find the organization
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Find the team
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check if the team belongs to the organization
      if (!organization.teams.includes(team._id)) {
        return res
          .status(400)
          .json({ message: "Team does not belong to this organization" });
      }

      // Find the user in the team
      const userIndex = team.users.findIndex(
        (u) => u.user.toString() === userId
      );
      if (userIndex === -1) {
        return res.status(404).json({ message: "User not found in the team" });
      }

      // Remove the user from the team in MongoDB
      team.users.splice(userIndex, 1);

      // Add removal information
      team.removedBy = removedBy;
      team.removedDate = new Date();
      await team.save();

      // Find the user in MongoDB
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove the user from the GitHub team
      const githubTeamResponse = await axios.delete(
        `https://api.github.com/orgs/Tail-Demo/teams/${team.name}/memberships/${user.name}`,
        {
          headers: {
            Authorization: `token ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("GitHub team membership deleted:", githubTeamResponse.data);

      res
        .status(200)
        .json({
          message: "User removed from team successfully in MongoDB and GitHub",
          removedBy,
        });
    } catch (error) {
      console.error(
        "Error removing user from team:",
        error.response ? error.response.data : error.message
      );
      res
        .status(500)
        .json({
          message: "Error removing user from team",
          error: error.message,
        });
    }
  }
);

app.get(
  "/api/projects/:projectId/users/search",
  authenticateToken,
  async (req, res) => {
    const { projectId } = req.params;
    const { email } = req.query;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email query parameter is required" });
    }

    try {
      const project = await Project.findById(projectId).populate({
        path: "teams",
        populate: {
          path: "users.user",
          model: "User",
        },
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const matchingUsers = [];
      project.teams.forEach((team) => {
        team.users.forEach((user) => {
          if (user.user.email.toLowerCase().includes(email.toLowerCase())) {
            matchingUsers.push({
              name: user.user.name,
              email: user.user.email,
              role: user.role,
              team: team.name,
            });
          }
        });
      });

      if (matchingUsers.length === 0) {
        return res.status(404).json({
          message:
            "No users found within the project teams with the given email",
        });
      }

      res.status(200).json({ users: matchingUsers });
    } catch (error) {
      console.error("Error searching project team users:", error);
      res.status(500).json({ message: "Error searching project team users" });
    }
  }
);

app.get(
  "/api/projects/:projectId/teams",
  authenticateToken,
  async (req, res) => {
    const { projectId } = req.params;

    try {
      const project = await Project.findById(projectId).populate({
        path: "teams",
        populate: {
          path: "users.user",
          select: "email role", // Select only email and role fields
        },
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Transform the data to match the frontend requirements
      const teams = project.teams.map((team) => ({
        name: team.name,
        members: team.users.map((user) => ({
          email: user.user.email,
          role: user.role,
        })),
      }));

      res.status(200).json({ teams });
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Error fetching teams" });
    }
  }
);

// Fetch users for an organization
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find({ organization: req.user.organizationId });
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.get(
  "/api/overview/:organizationId",
  authenticateToken,
  async (req, res) => {
    const { organizationId } = req.params;
    const userEmail = req.user.email;
    const userRole = req.user.role;

    try {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Get user count of the organization
      const userCount = await User.countDocuments({
        organization: organizationId,
      });

      let projects;
      if (userRole === "ADMIN") {
        projects = await Project.find({
          organization: organizationId,
        }).populate("teams");
      } else {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const userTeams = await Team.find({ "users.user": user._id });
        projects = await Project.find({
          organization: organizationId,
          $or: [
            { projectManager: userEmail },
            { teams: { $in: userTeams.map((team) => team._id) } },
          ],
        }).populate("teams");
      }

      const totalProjects = projects.length;

      // Get all task IDs for these projects
      const projectIds = projects.map((project) => project._id);
      const tasks = await Task.find({ project: { $in: projectIds } });

      // Get total number of tasks
      const totalTasks = tasks.length;

      // Aggregate cards across all tasks
      const totalCardsResult = await Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $unwind: "$card" },
        {
          $lookup: {
            from: "cards",
            localField: "card",
            foreignField: "_id",
            as: "cards",
          },
        },
        { $unwind: "$cards" },
        { $group: { _id: null, totalCards: { $sum: 1 } } },
      ]);
      const totalCards =
        totalCardsResult.length > 0 ? totalCardsResult[0].totalCards : 0;

      const projectDetails = await Promise.all(
        projects.map(async (project) => {
          const projectTasks = tasks.filter((task) =>
            task.project.equals(project._id)
          );
          const teams = await Team.find({
            _id: { $in: project.teams },
          }).populate("users.user");

          // Calculate total cards and their statuses for this project
          const projectCardsResult = await Task.aggregate([
            { $match: { project: project._id } },
            { $unwind: "$card" },
            {
              $lookup: {
                from: "cards",
                localField: "card",
                foreignField: "_id",
                as: "cards",
              },
            },
            { $unwind: "$cards" },
            {
              $group: {
                _id: "$cards.status",
                count: { $sum: 1 },
              },
            },
          ]);

          // Initialize card counts
          let totalPendingCards = 0;
          let totalInProgressCards = 0;
          let totalCompletedCards = 0;

          projectCardsResult.forEach((card) => {
            if (card._id === "pending") totalPendingCards = card.count;
            if (card._id === "inprogress") totalInProgressCards = card.count;
            if (card._id === "completed") totalCompletedCards = card.count;
          });

          // Calculate in-progress and pending tasks
          const totalInProgressTasks = projectTasks.filter((task) =>
            task.card.some((card) => card.status === "inprogress")
          ).length;
          const totalPendingTasks = projectTasks.filter((task) =>
            task.card.some((card) => card.status === "pending")
          ).length;

          return {
            id: project._id,
            name: project.name,
            projectMembers: teams.flatMap((team) =>
              team.users.map((user) => user.user)
            ),
            totalTasks: projectTasks.length,
            totalInProgressTasks,
            totalPendingTasks,
            totalCards:
              totalPendingCards + totalInProgressCards + totalCompletedCards,
            totalPendingCards,
            totalInProgressCards,
            totalCompletedCards,
          };
        })
      );

      res.json({
        totalProjects,
        totalTasks,
        totalMembers: userCount,
        totalCards,
        projects: projectDetails,
      });
    } catch (error) {
      console.error("Error retrieving overview data:", error);
      res.status(500).json({ message: "Error retrieving overview data" });
    }
  }
);

app.get(
  "/api/calendar/:organizationId",
  authenticateToken,
  async (req, res) => {
    const { organizationId } = req.params;
    const userEmail = req.user.email;
    const userRole = req.user.role;

    try {
      let assignedCards;
      if (userRole === "ADMIN") {
        assignedCards = await Card.find()
          .populate({
            path: "project",
            match: { organization: organizationId },
            select: "_id name projectManager",
          })
          .populate("task", "name");
      } else {
        // Find projects where the user is the project manager
        const managedProjects = await Project.find({
          organization: organizationId,
          projectManager: userEmail,
        }).select("_id");

        const managedProjectIds = managedProjects.map((project) => project._id);

        assignedCards = await Card.find({
          $or: [
            { assignedTo: userEmail },
            { project: { $in: managedProjectIds } },
          ],
        })
          .populate({
            path: "project",
            match: { organization: organizationId },
            select: "_id name projectManager",
          })
          .populate("task", "name");
      }

      const events = assignedCards
        .filter((card) => card.project && card.task)
        .flatMap((card) => [
          {
            id: `${card._id}-assign`,
            date: card.assignDate,
            projectId: card.project._id,
            projectName: card.project.name,
            taskId: card.task._id,
            taskName: card.task.name,
            cardId: card._id,
            cardName: card.name,
            assignedTo: card.assignedTo,
            createdDate: card.createdDate,
            status: card.status,
            type: "Assign Date",
          },
        ])
        .filter((event) => event.date);

      res.json(events);
    } catch (error) {
      console.error("Error retrieving calendar data:", error);
      res.status(500).json({ message: "Error retrieving calendar data" });
    }
  }
);

app.get("/api/projects/:projectId/audit-logs", async (req, res) => {
  try {
    const { projectId } = req.params;
    const auditLogs = await AuditLog.find({
      $or: [
        { projectId }, // Project-related actions
        { entityId: projectId, entityType: "Project" }, // Specific project actions
      ],
    }).populate("performedBy", "name email");

    if (!auditLogs || auditLogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No audit logs found for this project" });
    }

    res.status(200).json(auditLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected endpoint!", user: req.user });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
