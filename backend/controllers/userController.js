import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
      const { userId } = req.body;
      const user = await userModel.findById(userId).select('-password');
      
      if (!user) {
          return res.status(404).json({ 
              success: false, 
              message: 'User not found' 
          });
      }

      res.json({ 
          success: true, 
          user: {
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              isAccountVerified: user.isAccountVerified,
              address: user.address || {
                  street: '',
                  city: '',
                  state: '',
                  zipcode: '',
                  country: ''
              }
          }
      });
  } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ 
          success: false, 
          message: 'Server error' 
      });
  }
};
// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { userId, address } = req.body;
        
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { address },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Route for user login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "eMail and Password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id); // Generate token
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure in production
        sameSite: "strict", // Enforce strict CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ success: true, token, message: "Login successful" });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// Route for user register
const registerUser = async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }
  try {
    // checking user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      // phone,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken(user._id); // Generate token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // sending welcome email using nodemailer
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to R-Studio 🎉",
      html: `
        <html>
          <body style="font-family: 'Arial', sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #2C3E50; text-align: center;">Welcome to <span style="color: #00bcd4;">R-Studio</span> 🎉</h2>
              
              <p style="line-height: 1.8;">Hello <strong>${name}</strong>,</p>
              <p style="line-height: 1.8;">We're thrilled to have you join the R-Studio family! Below are your account details:</p>
              
              <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Phone Number:</strong> ${phone}</p>
              </div>
              
              <p style="line-height: 1.8;">Get ready to explore exclusive offers, curated collections, and much more on R-Studio!</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="https://www.rashistudio.com" style="display: inline-block; background-color: #00bcd4; color: white; padding: 12px 25px; font-size: 16px; border-radius: 5px; text-decoration: none;">Visit R-Studio</a>
              </div>
    
              <p style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
                Thank you for choosing R-Studio. We look forward to serving you!
              </p>
            </div>
          </body>
        </html>
      `,
    };
    

    await transporter.sendMail(mailOptions);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Route for Logout
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.json({ success: true, message: "Logout Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//send Verification Otp Message
const sendverifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(`Received request to send OTP for user ID: ${userId}`);

        const user = await userModel.findById(userId);
        if (!user) {
            console.log(`User not found with ID: ${userId}`);
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Check if user is already verified
        if (user.isAccountVerified) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified"
            });
        }

        // Rate limiting: Check OTP requests per day
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        if (user.lastOtpRequestAt && user.lastOtpRequestAt >= todayStart) {
            if (user.otpRequestCount >= 3) {
                return res.status(429).json({
                    success: false,
                    message: "Maximum OTP requests reached for today"
                });
            }
        } else {
            // Reset counter for new day
            user.otpRequestCount = 0;
        }

        // Generate new OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyotp = otp;
        user.verifyotpExpireAt = Date.now() + (15 * 60 * 1000); // 15 minutes
        user.otpRequestCount += 1;
        user.lastOtpRequestAt = new Date();

        await user.save();

        // Send OTP via email
        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: user.email,
          subject: "🔑 R-Studio Email Verification OTP",
          html: `
            <html>
              <head>
                <style>
                  @keyframes fadeIn {
                    from {
                      opacity: 0;
                      transform: translateY(-20px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
        
                  @keyframes pulse {
                    0% {
                      box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4);
                    }
                    70% {
                      box-shadow: 0 0 15px 15px rgba(231, 76, 60, 0);
                    }
                    100% {
                      box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
                    }
                  }
        
                  .container {
                    font-family: 'Arial', sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    animation: fadeIn 1.2s ease-in-out;
                  }
        
                  .otp-box {
                    background-color: #fceaea;
                    border: 2px solid #e74c3c;
                    color: #e74c3c;
                    font-size: 26px;
                    font-weight: bold;
                    text-align: center;
                    padding: 15px;
                    border-radius: 8px;
                    letter-spacing: 3px;
                    animation: pulse 2s infinite;
                  }
        
                  .cta-button {
                    display: block;
                    width: fit-content;
                    margin: 20px auto;
                    padding: 12px 30px;
                    background-color: #2ecc71;
                    color: white;
                    font-size: 16px;
                    font-weight: bold;
                    border-radius: 8px;
                    text-decoration: none;
                    box-shadow: 0 4px 10px rgba(46, 204, 113, 0.4);
                    transition: transform 0.2s ease-in-out;
                    text-align: center;
                  }
        
                  .cta-button:hover {
                    transform: scale(1.05);
                  }
                </style>
              </head>
              <body style="background-color: #f4f4f9; padding: 20px;">
                <div class="container">
                  <h2 style="color: #2c3e50;">Hello ${user.name},</h2>
                  <p style="font-size: 16px; color: #555;">
                    Thank you for signing up with R-Studio! To complete your registration, please use the following OTP:
                  </p>
                  <div class="otp-box">
                    ${otp}
                  </div>
                  <p style="font-size: 16px; color: #555;">
                    This OTP will expire in <strong>15 minutes</strong>. If you did not request this, please ignore this message.
                  </p>
                  <a href="#" class="cta-button">Verify Now</a>
                  <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
                    Best regards,<br/>The R-Studio Team
                  </p>
                </div>
              </body>
            </html>
          `
        };
        

        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: "New verification OTP sent successfully",
            verifyotpExpireAt: user.verifyotpExpireAt,
            remainingAttempts: 3 - user.otpRequestCount
        });

    } catch (error) {
        console.error('Error sending verification OTP:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to send verification OTP"
        });
    }
};




//Verify Email
const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!otp || !userId) {
    return res.status(400).json({ 
      success: false, 
      message: "OTP and userId are required" 
    });
  }
  
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // console.log('Stored OTP:', user.verifyotp);
    // console.log('Received OTP:', otp);
    // console.log('OTP Expiry (Stored):', user.verifyotpExpireAt);
    // console.log('Current Time (Milliseconds):', Date.now());
    
    // Ensure the expiration comparison is done correctly
    if (String(user.verifyotp) !== String(otp)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP" 
      });
    }

    if (user.verifyotpExpireAt < Date.now()) {
      console.log('OTP has expired at:', user.verifyotpExpireAt);
      return res.status(400).json({ 
        success: false, 
        message: "OTP has expired" 
      });
    }

    // Update user verification status
    user.isAccountVerified = true;
    user.verifyotp = "";
    user.verifyotpExpireAt = 0;
    await user.save();

    // console.log('User verification status updated:', user.isAccountVerified);

    return res.status(200).json({ 
      success: true, 
      message: "Email verified successfully",
      user: {
        isAccountVerified: user.isAccountVerified,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during verification" 
    });
  }
};


//authenticated user
const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, message: "User Authenticated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Send Password Reset Otp
const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Please enter email" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "🔑 R-Studio Password Reset OTP",
      html: `
        <html>
          <body style="font-family: 'Arial', sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center;">
              <h2 style="color: #2C3E50;">🔐 Password Reset Request</h2>
    
              <img src="https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif" alt="Password Reset" style="width: 100%; max-width: 250px; border-radius: 10px; margin: 20px auto;" />
    
              <p style="font-size: 16px; line-height: 1.8;">Hello <strong>${user.name || "User"}</strong>,</p>
              <p style="font-size: 16px;">We received a request to reset your R-Studio account password. Please use the OTP below to reset it.</p>
    
              <div style="display: inline-block; padding: 10px 20px; background-color: #00bcd4; color: white; font-size: 22px; font-weight: bold; letter-spacing: 4px; border-radius: 5px; margin: 20px 0;">
                ${otp}
              </div>
    
              <p style="font-size: 14px; color: #666;">This OTP will expire in <strong>15 minutes</strong>.</p>
    
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://www.rashistudio.com/password-reset" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 25px; font-size: 16px; border-radius: 5px; text-decoration: none;">Reset Password Now</a>
              </div>
    
              <p style="margin-top: 30px; font-size: 12px; color: #888;">
                If you didn't request this, please ignore this email or contact support if you have any concerns.
              </p>
            </div>
          </body>
        </html>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      message: "Password Reset Otp Sent Successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Reset User Password
const resetPassword = async (req, res) => {
  const { email, otp, newpassword } = req.body;
  if (!email || !otp || !newpassword) {
    return res.json({
      success: false,
      message: "Email ,Otp And New Password Are Required",
    });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid Otp" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "Otp Expired" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newpassword, salt);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();
    res.json({ success: true, message: "Password Reset Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
const googleAuth = async (req, res) => {
  try {
      const { email, name, googleId } = req.body;

      // Check if user exists
      let user = await userModel.findOne({ email });
      let isNewUser = false;
      if (!user) {
          // Create new user if doesn't exist
          user = new userModel({
              name,
              email,
              password: googleId, // You might want to handle this differently
              isAccountVerified: true // Google accounts are already verified
          });
          await user.save();
          isNewUser = true;
           // Send welcome email
           const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "🎉 Welcome to R-Studio!",
            html: `
              <div style="font-family: 'Arial', sans-serif; color: #333; background-color: #f9f9f9; padding: 40px;">
                <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 10px; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1); padding: 40px; animation: fadeIn 1.5s ease-in-out;">
                  
                  <div style="text-align: center;">
                    <img src="https://media.giphy.com/media/5ntdy5Ban1dIY/giphy.gif" alt="Welcome" style="width: 200px; border-radius: 50%; margin-bottom: 20px;" />
                  </div>
                  
                  <h2 style="color: #2c3e50; text-align: center; font-size: 26px;">🎉 Welcome to R-Studio!</h2>
          
                  <p style="font-size: 16px; color: #555; text-align: center;">
                    Hello <strong>${name}</strong>, <br>
                    We're thrilled to have you with us! You've successfully joined R-Studio using Google Sign-In.
                  </p>
          
                  <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="font-size: 14px; margin: 0; color: #333;">Your account details:</p>
                    <ul style="list-style: none; padding: 0; margin: 10px 0;">
                      <li><strong>Email:</strong> ${email}</li>
                      <li><strong>Name:</strong> ${name}</li>
                    </ul>
                  </div>
          
                  <div style="text-align: center; margin-top: 20px;">
                    <a href="https://rashistudio.com" style="display: inline-block; background-color: #00bcd4; color: white; text-decoration: none; padding: 12px 25px; font-size: 16px; font-weight: bold; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 188, 212, 0.4); transition: transform 0.2s ease-in-out;">
                      Explore Now
                    </a>
                  </div>
          
                  <p style="margin-top: 20px; color: #888; text-align: center;">
                    Thank you for joining our community! We can't wait to see what you'll discover.
                  </p>
          
                  <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
                    If you did not sign up for this account, please contact us immediately.
                  </p>
                </div>
              </div>
          
              <style>
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(-20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              </style>
            `
          };
          

        await transporter.sendMail(mailOptions);
      }

      // Create JWT token
      const token = createToken(user._id);

      res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
          success: true,
          token,
          message: "Google authentication successful"
      });
  } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({
          success: false,
          message: error.message
      });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  googleAuth,
  logout,
  sendverifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  
};
