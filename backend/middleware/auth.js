const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const { checkAndReactivateVolunteer } = require('../utils/punishmentSystem');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!req.user.isActive) {
                return res.status(401).json({ message: 'Account is deactivated' });
            }

            // Check if volunteer is suspended and potentially reactivate
            if (req.user.role === 'volunteer') {
                const volunteer = await Volunteer.findOne({ userId: req.user._id });
                if (volunteer) {
                    // Check if suspension has ended
                    await checkAndReactivateVolunteer(volunteer._id);

                    // Re-fetch user to check if reactivated
                    req.user = await User.findById(decoded.id).select('-password');

                    if (!req.user.isActive) {
                        const suspensionMessage = volunteer.suspensionEndDate
                            ? `Account is suspended until ${volunteer.suspensionEndDate.toDateString()}`
                            : 'Account is deactivated';
                        return res.status(401).json({ message: suspensionMessage });
                    }
                }
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
