const bcrypt = require('bcryptjs');
const User = require('../model/userModal'); 
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

module.exports = {
    registerUser,
    loginUser
};


