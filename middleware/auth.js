const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    // Check if not token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Get token from Bearer
    const token = authHeader.split(' ')[1];

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
}; 