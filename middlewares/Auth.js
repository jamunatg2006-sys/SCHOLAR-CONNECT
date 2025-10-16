
import jwt from 'jsonwebtoken';
export const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized: JWT token is required' });
    }

    // Support 'Bearer <token>' or raw token
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'replace_this_secret');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Unauthorized: JWT token invalid or expired', error: err.message });
    }
}

