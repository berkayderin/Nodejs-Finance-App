const adminAuth = (req, res, next) => {
	try {
		if (req.user.role !== 'ADMIN') {
			return res.status(403).json({
				message: 'Bu işlem için admin yetkisi gerekiyor'
			})
		}
		next()
	} catch (error) {
		res.status(403).json({ message: 'Yetkilendirme hatası' })
	}
}

module.exports = adminAuth
