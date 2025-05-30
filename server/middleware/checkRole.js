module.exports = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Autentikasi diperlukan' });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Akses ditolak' });
            }

            next();
        } catch (error) {
            console.error('CheckRole middleware error:', error);
            return res.status(500).json({ message: 'Terjadi kesalahan saat memeriksa role' });
        }
    };
}; 