const adminAuth = (req, res, next) => {
	if (req.user.role !== 'ADMIN') {
		return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' })
	}
	next()
}

module.exports = adminAuth
