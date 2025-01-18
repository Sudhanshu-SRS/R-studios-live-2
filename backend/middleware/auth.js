import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token; // Retrieve token from cookies
        // console.log('Received Token:', token); // Log the token

        if (!token) {
            return res.json({ success: false, message: 'Not Authorized. Login Again' });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        if (token_decode.id) {
            req.body.userId = token_decode.id; // Attach userId to req.body
        } else {
            return res.json({ success: false, message: 'Not Authorized. Login Again' });
        }

        next();
    } catch (error) {
        console.error('Error in auth middleware:', error.message);
        res.json({ success: false, message: 'Invalid or Expired Token' });
    }
};


export default authUser;
