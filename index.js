// require('dotenv').config();

// const express = require("express");
// const cors = require('cors');
// const mongoose = require("mongoose");
// const User = require("./models/User");
// const Post = require("./models/Post");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
// const multer = require("multer");
// const fs = require("fs");
// const uploadMiddleware = multer({ dest: "uploads/" });
// const app = express();
// const salt = bcrypt.genSaltSync(10);
// const secret = process.env.JWT_SECRET;

// // app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
// // const allowedOrigins = ['https://superb-paprenjak-d79f58.netlify.app'];

// // app.use(cors({
// //   origin: function(origin, callback){
// //     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
// //       callback(null, true);
// //     } else {
// //       callback(new Error('Not allowed by CORS'));
// //     }
// //   }
// // }));
// // const cors = require('cors');

// // List of allowed origins
// const allowedOrigins = ['https://profound-sprinkles-22fdf2.netlify.app'];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true // Allow credentials
// }));

// // Handle preflight requests
// app.options('*', cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));


// app.use(express.json());
// app.use(cookieParser());
// app.use("/uploads", express.static(__dirname + "/uploads"));

// mongoose.connect(process.env.MONGODB_URI);

// // Middleware to authenticate token
// function authenticateToken(req, res, next) {
//   const { token } = req.cookies;
//   if (!token) {
//     return res.status(401).json({ error: "Token not provided" });
//   }

//   jwt.verify(token, secret, {}, (err, user) => {
//     if (err) return res.status(403).json({ error: "Invalid or expired token" });
//     req.user = user;
//     next();
//   });
// }

// app.post("/register", async (req, res) => {
//   const { username, email, password } = req.body;
//   try {
//     // Check if the user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: "Email is already registered" });
//     }

//     // Create a new user
//     const userDoc = await User.create({
//       username,
//       email,
//       password: bcrypt.hashSync(password, salt),
//     });

//     res.json(userDoc);
//   } catch (e) {
//     res.status(400).json(e);
//   }
// });

// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;
//   const userDoc = await User.findOne({ username });
//   if (userDoc && userDoc.password) {
//     const passOk = bcrypt.compareSync(password, userDoc.password);
//     if (passOk) {
//       //logged in
//       jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
//         if (err) throw err;
//         res.cookie("token", token).json({
//           id: userDoc._id,
//           username,
//         });
//       });
//     } else {
//       res.status(400).json("wrong credential");
//     }
//   } else {
//     res.status(400).json("wrong credential");
//   }
// });

// app.get("/profile", authenticateToken, (req, res) => {
//   res.json(req.user);
// });

// app.post("/logout", (req, res) => {
//   res.cookie("token", "").json("ok");
// });

// // app.post("/post", authenticateToken, uploadMiddleware.single("file"), async (req, res) => {
// //   const { originalname, path } = req.file;
// //   const parts = originalname.split(".");
// //   const ext = parts[parts.length - 1];
// //   const newPath = path + "." + ext;
// //   fs.renameSync(path, newPath);

// //   const { title, summary, content } = req.body;
// //   const postDoc = await Post.create({
// //     title,
// //     summary,
// //     content,
// //     cover: newPath,
// //     author: req.user.id,
// //   });
// //   res.json(postDoc);
// // });
// app.post("/post", authenticateToken, uploadMiddleware.single("file"), async (req, res) => {
//   let newPath = null;

//   if (req.file) {
//     const { originalname, path } = req.file;
//     const parts = originalname.split(".");
//     const ext = parts[parts.length - 1];
//     newPath = path + "." + ext;
//     fs.renameSync(path, newPath);
//   }

//   const { title, summary, content } = req.body;

//   try {
//     const postDoc = await Post.create({
//       title,
//       summary,
//       content,
//       cover: newPath || '', // Default to an empty string if no file was uploaded
//       author: req.user.id,
//     });
//     res.json(postDoc);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to create post' });
//   }
// });

// app.put("/post", authenticateToken, uploadMiddleware.single("file"), async (req, res) => {
//   let newPath = null;
//   if (req.file) {
//     const { originalname, path } = req.file;
//     const parts = originalname.split(".");
//     const ext = parts[parts.length - 1];
//     newPath = path + "." + ext;
//     fs.renameSync(path, newPath);
//   }

//   const { id, title, summary, content } = req.body;
//   const postDoc = await Post.findById(id);
//   const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(req.user.id);
//   if (!isAuthor) {
//     return res.status(400).json("you are not the author");
//   }

//   await postDoc.updateOne({
//     title,
//     summary,
//     content,
//     cover: newPath ? newPath : postDoc.cover,
//   });
//   res.json(postDoc);
// });

// app.delete("/post/:id", authenticateToken, async (req, res) => {
//   const { id } = req.params;
//   try {
//     const postDoc = await Post.findById(id);
//     if (!postDoc) {
//       return res.status(404).json("Post not found");
//     }

//     const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(req.user.id);
//     if (!isAuthor) {
//       return res.status(403).json("You are not the author of this post");
//     }

//     // Delete the post cover image if it exists
//     if (postDoc.cover) {
//       fs.unlinkSync(postDoc.cover);
//     }

//     // Delete the post document
//     await Post.findByIdAndDelete(id);
//     res.json("Post deleted successfully");
//   } catch (error) {
//     console.error("Error deleting the post:", error);
//     res.status(500).json("Internal Server Error");
//   }
// });

// app.get("/post", async (req, res) => {
//   res.json(
//     await Post.find()
//       .populate("author", ["username"])
//       .sort({ createdAt: -1 })
//       .limit(20)
//   );
// });

// app.get("/post/:id", async (req, res) => {
//   const { id } = req.params;
//   const postDoc = await Post.findById(id).populate("author", ["username"]);
//   res.json(postDoc);
// });

// app.listen(8000, () => {
//   console.log("Server is running on http://localhost:8000");
// });


require('dotenv').config();

const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const path = require('path');

const app = express();
const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET;

// Define allowed origins
const allowedOrigins = ['https://profound-sprinkles-22fdf2.netlify.app'];

// Set up CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow credentials (cookies)
}));

// Handle preflight requests
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware for parsing JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Serve static files with CORS headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Optional: Apply CORS headers directly to static files if needed
app.use('/uploads', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://profound-sprinkles-22fdf2.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  jwt.verify(token, secret, {}, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// Set up multer for file uploads
const uploadMiddleware = multer({ dest: "uploads/" });

// Route to register a new user
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Create a new user
    const userDoc = await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, salt),
    });

    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

// Route to log in a user
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });

  if (userDoc && userDoc.password) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie("token", token, { httpOnly: true, sameSite: 'None', secure: true }).json({
          id: userDoc._id,
          username,
        });
      });
    } else {
      res.status(400).json("Wrong credentials");
    }
  } else {
    res.status(400).json("Wrong credentials");
  }
});

// Route to get user profile
app.get("/profile", authenticateToken, (req, res) => {
  res.json(req.user);
});

// Route to log out a user
app.post("/logout", (req, res) => {
  res.cookie("token", "", { expires: new Date(0), httpOnly: true, sameSite: 'None', secure: true }).json("ok");
});

// Route to create a new post
app.post("/post", authenticateToken, uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;

  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  }

  const { title, summary, content } = req.body;

  try {
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath || '', // Default to an empty string if no file was uploaded
      author: req.user.id,
    });
    res.json(postDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Route to update a post
app.put("/post", authenticateToken, uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  }

  const { id, title, summary, content } = req.body;
  const postDoc = await Post.findById(id);
  const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(req.user.id);
  if (!isAuthor) {
    return res.status(403).json("You are not the author");
  }

  await postDoc.updateOne({
    title,
    summary,
    content,
    cover: newPath ? newPath : postDoc.cover,
  });
  res.json(postDoc);
});

// Route to delete a post
app.delete("/post/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const postDoc = await Post.findById(id);
    if (!postDoc) {
      return res.status(404).json("Post not found");
    }

    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(req.user.id);
    if (!isAuthor) {
      return res.status(403).json("You are not the author of this post");
    }

    // Delete the post cover image if it exists
    if (postDoc.cover) {
      fs.unlinkSync(postDoc.cover);
    }

    // Delete the post document
    await Post.findByIdAndDelete(id);
    res.json("Post deleted successfully");
  } catch (error) {
    console.error("Error deleting the post:", error);
    res.status(500).json("Internal Server Error");
  }
});

// Route to get all posts
app.get("/post", async (req, res) => {
  res.json(
    await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

// Route to get a single post by ID
app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

// Start the server
app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});

