const bcrypt = require('bcryptjs');
const User = require('../model/userModal'); 
const Article = require('../model/articleModel')
const jwt = require('jsonwebtoken')

const registerUser = async (req, res) => {
  const { name, email,phoneNumber,dob,password } = req.body;
  console.log(req.body,"/////////");
  

  try {
    // Check if the user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Already registered, please login' });
    }

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = new User({ name, email, phoneNumber, dob, password: hashedPassword });
    
    // Save the user to the database
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

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

  const getArticles = async(req,res)=>{
    try {
        console.log("haiaai");
        
        const articles = await Article.find(); // Fetch all articles
        console.log(articles,"articlesssss");
        
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

module.exports = {
    registerUser,
    loginUser,
    createArticle,
    getArticles,
    getArticleDetails,
    handleReaction
};


