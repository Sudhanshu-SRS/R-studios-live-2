import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    try {
        // Check both cookie and bearer token
        let token = req.cookies.token;
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized. Login Again'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = decoded.id;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or Expired Token'
        });
    }
};

export default authUser;