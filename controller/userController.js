const bcrypt = require('bcryptjs');
const User = require('../model/userModal'); 
const Article = require('../model/articleModel')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

// const registerUser = async (req, res) => {
//   const { name, email,phoneNumber,dob,password } = req.body;
//   console.log(req.body,"/////////");
  

//   try {
//     // Check if the user with the same email already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Already registered, please login' });
//     }

//     // Encrypt the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create a new user
//     const user = new User({ name, email, phoneNumber, dob, password: hashedPassword });
    
//     // Save the user to the database
//     await user.save();

//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

const registerUser = async(req,res)=>{
    const { name, phoneNumber, email, dob, password, preferences } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      phoneNumber,
      email,
      dob,
      password: hashedPassword,
      preferences,
    });
    
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Create a token (optional, depending on your authentication strategy)
      const token = jwt.sign({ userId: user._id, userName:user.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
      console.log(token,"token///////");
      
  
      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          // Add any other user info you want to return
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  const createArticle = async(req,res)=>{
    console.log(req.body);
    console.log(req.user.userId,"//////////id ");
    const { title, description, images, tags, category } = req.body;

    try {

        console.log(  title,
            description,
            images,
            tags,
            category,
             req.user.userId,"//////////////heheh");

        // Create the article
        const newArticle = new Article({
            title,
            description,
            images,
            tags,
            category,
            author: req.user.userId,  // Assuming you have authentication middleware to get user
        });

        

        const savedArticle = await newArticle.save();
        res.status(201).json(savedArticle);  // Send the newly created article in response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
    
  }

//   const getArticles = async(req,res)=>{
//     try {
//         console.log("haiaai");
        
//         const articles = await Article.find(); // Fetch all articles
//         console.log(articles,"articlesssss");
        
//         res.status(200).json(articles);
//     } catch (error) {
//         console.error("Error fetching articles:", error);
//         res.status(500).json({ message: 'Failed to fetch articles' });
//     }
//   }

const getArticles = async (req, res) => {
    try {
      console.log("Fetching articles...");
  
      const userId = req.user.userId;
      console.log(`Current user ID: ${userId}`);
  
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const userPreferences = user.preferences.map(pref => pref.toLowerCase()); // Convert to lowercase
      console.log(`Lowercase user preferences: ${JSON.stringify(userPreferences)}`);
  
      // Convert userId to ObjectId for comparison
      const userIdObj = new mongoose.Types.ObjectId(userId);
  
      const articles = await Article.find({
        $and: [
          { category: { $in: userPreferences } },
          { author: { $ne: userIdObj } }
        ]
      });
  
      console.log(`Articles found: ${articles.length}`);
      
      res.status(200).json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: 'Failed to fetch articles' });
    }
  }
  


  const getArticleDetails = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the article by ID
        const article = await Article.findById(id);
        
        // Check if the article exists
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Return the article details
        return res.status(200).json(article);
    } catch (error) {
        console.error("Error fetching article:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};


const handleReaction = async (req, res) => {
    const { id } = req.params; // Article ID from URL
    const { reaction } = req.body; // Reaction should be 'like' or 'dislike'
    const userId = req.user.userId; // Assuming you have user authentication

    try {
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        if (reaction === 'like') {
            // Remove from dislikes if exists
            article.dislikes = article.dislikes.filter(user => user.toString() !== userId);
            // Add user to likes if not already liked
            if (!article.likes.includes(userId)) {
                article.likes.push(userId);
            }
        } else if (reaction === 'dislike') {
            // Remove from likes if exists
            article.likes = article.likes.filter(user => user.toString() !== userId);
            // Add user to dislikes if not already disliked
            if (!article.dislikes.includes(userId)) {
                article.dislikes.push(userId);
            }
        }

        await article.save();
        
        // Return the counts of likes and dislikes
        res.status(200).json({ 
            likes: article.likes.length, 
            dislikes: article.dislikes.length 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getUserArticles = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming you get the user ID from authentication middleware
        // const articles = await Article.find({ user: userId }); // Find articles where `user` matches the logged-in user
        const articles = await Article.find({ author: userId });

        if (!articles) {
            return res.status(404).json({ message: 'No articles found' });
        }

        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteArticle = async (req, res) => {
    try {
        const articleId = req.params.id;
        const userId = req.user._id;

        // Find the article and check if it belongs to the user
        const article = await Article.findOne({ _id: articleId, user: userId });

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Delete the article
        await Article.findByIdAndDelete(articleId);
        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateArticle = async (req, res) => {
    try {
        const articleId = req.params.id;
        const userId = req.user._id;

        // Extract data from the request
        const { title, description, images } = req.body;

        // Update the article fields
        const updatedArticle = await Article.findByIdAndUpdate(
            articleId,
            {
                title: title || undefined, // Set to undefined if not provided
                description: description || undefined,
                images: images || undefined, // Ensure this matches your database field
            },
            { new: true, runValidators: true } // Return the updated document and run validation
        );

        if (!updatedArticle) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.json({ message: 'Article updated successfully', article: updatedArticle });
    } catch (error) {
        console.error('Error updating article:', error); // Log the error for debugging
        res.status(500).json({ message: 'Server error', error });
    }
};



const getArticleById = async (req, res) => {
    try {
        const articleId = req.params.id; // Get the article ID from the request parameters

        // Find the article by ID
        const article = await Article.findById(articleId) // Populate the author field if needed

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.json(article); // Send the article data as response
    } catch (error) {
        console.error('Error fetching article by ID:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};



const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming you have user ID from the token
        const user = await User.findById(userId).select('-password'); // Exclude password from the response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from token
        const { name, phone } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, phone },
            { new: true, select: '-password' } // Return the updated user without password
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from token
        const { newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = await bcrypt.hash(newPassword, 10); // Hash new password
        await user.save();
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const verifyPassword = async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from token
        const { password } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        res.json({ valid: isMatch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};






module.exports = {
    registerUser,
    loginUser,
    createArticle,
    getArticles,
    getArticleDetails,
    handleReaction,
    getUserArticles,
    deleteArticle,
    updateArticle,
    getArticleById,
    verifyPassword,
    changePassword,
    updateUserProfile,
    getUserProfile
};


