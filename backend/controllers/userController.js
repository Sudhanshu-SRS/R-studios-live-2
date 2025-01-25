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
      subject: "WELCOME TO R-Studio",
      text: `Hello ${name}, Welcome to R-Studio. We are happy to have you with us. Your Accout Has Been Created With Email id: ${email} and Phone Number: ${phone}`,
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
            subject: "R-Studio Email Verification OTP",
            html: `
            <html>
                <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f9;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #2c3e50;">Hello ${user.name},</h2>
                        <p style="font-size: 16px; color: #555;">
                            Thank you for signing up with R-Studio! To complete your registration, please use the following OTP:
                        </p>
                        <h3 style="font-size: 24px; color: #e74c3c; font-weight: bold; text-align: center;">${otp}</h3>
                        <p style="font-size: 16px; color: #555;">
                            This OTP will expire in 15 minutes. If you did not request this, please ignore this message.
                        </p>
                        <p style="font-size: 14px; color: #777; text-align: center;">
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

    console.log('Stored OTP:', user.verifyotp);
    console.log('Received OTP:', otp);
    console.log('OTP Expiry (Stored):', user.verifyotpExpireAt);
    console.log('Current Time (Milliseconds):', Date.now());
    
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

    console.log('User verification status updated:', user.isAccountVerified);

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
      subject: "R-Studio Password Reset Otp",
      text: `Hello ${user.name || "user"}, Your Password Reset OTP is ${otp}. This OTP will expire in 15 minutes.`,
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

export {
  loginUser,
  registerUser,
  adminLogin,
  logout,
  sendverifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
  getUserProfile,
  updateUserProfile, // Add this line
};
