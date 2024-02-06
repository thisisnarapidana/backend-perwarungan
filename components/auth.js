const db = require('../models');

function cek(allowed = [], isQuery = false) {
    return async (req, res, next) => {
        const session_id = !isQuery? req.headers.authorization : req.query.auth;

        if (!session_id || !session_id.startsWith('Bearer ') && !isQuery) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Bearer token is missing' });
        }

        const token = !isQuery? session_id.split(' ')[1] : session_id;

        try {

            const ses = await db.session.findOne({
                where: { session_id: token, expired: false },
                include: [db.user]
            })

            if (!ses) {
                return res.status(403).json({ success: false, message: 'Forbidden - You must be logged in' });
            }

            req.ses = ses;

            // Check if allowed is not provided or if the user has one of the allowed roles
            if (allowed.length === 0 || allowed.includes(ses.user.role)) {
                next();
            } else {
                return res.status(403).json({ success: false, message: 'Forbidden - Insufficient permissions' });
            }
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Bearer token is invalid' });
        }
    };
}

module.exports = cek;