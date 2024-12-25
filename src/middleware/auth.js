const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const authMiddleware = async (req, res, next) => {
	try {
		// API istekleri için token kontrolü
		if (req.path.startsWith('/api/')) {
			const token = req.headers.authorization?.split(' ')[1]
			if (!token) {
				return res.status(401).json({ message: "Yetkilendirme token'ı bulunamadı" })
			}

			const decoded = jwt.verify(token, process.env.JWT_SECRET)
			const user = await prisma.user.findUnique({
				where: { id: decoded.userId },
				select: { id: true, name: true, email: true, role: true }
			})

			if (!user) {
				return res.status(401).json({ message: 'Kullanıcı bulunamadı' })
			}

			req.user = {
				userId: user.id,
				name: user.name,
				email: user.email,
				role: user.role
			}
			return next()
		}

		// Web sayfaları için cookie kontrolü
		const token = req.cookies?.token
		if (!token) {
			return res.redirect('/auth/login')
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: { id: true, name: true, email: true, role: true }
		})

		if (!user) {
			return res.redirect('/auth/login')
		}

		req.user = {
			userId: user.id,
			name: user.name,
			email: user.email,
			role: user.role
		}
		next()
	} catch (error) {
		if (req.path.startsWith('/api/')) {
			res.status(401).json({ message: 'Geçersiz token' })
		} else {
			res.redirect('/auth/login')
		}
	}
}

module.exports = authMiddleware
