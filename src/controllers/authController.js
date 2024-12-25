const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

exports.register = async (req, res) => {
	try {
		const { email, password, name, role } = req.body

		// Email kontrolü
		const userExists = await prisma.user.findUnique({
			where: { email }
		})

		if (userExists) {
			return res.status(400).json({ message: 'Bu email adresi zaten kullanımda' })
		}

		// Şifre hashleme
		const hashedPassword = await bcrypt.hash(password, 10)

		// Kullanıcı oluşturma
		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				name,
				role: role === 'ADMIN' ? 'ADMIN' : 'USER'
			}
		})

		// JWT token oluşturma
		const token = jwt.sign(
			{
				userId: user.id,
				role: user.role
			},
			process.env.JWT_SECRET,
			{ expiresIn: '24h' }
		)

		res.status(201).json({
			message: 'Kullanıcı başarıyla oluşturuldu',
			token,
			role: user.role
		})
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body

		// Kullanıcı kontrolü
		const user = await prisma.user.findUnique({
			where: { email }
		})

		if (!user) {
			return res.status(401).json({ message: 'Geçersiz email veya şifre' })
		}

		// Şifre kontrolü
		const validPassword = await bcrypt.compare(password, user.password)
		if (!validPassword) {
			return res.status(401).json({ message: 'Geçersiz email veya şifre' })
		}

		// JWT token oluşturma
		const token = jwt.sign(
			{
				userId: user.id,
				role: user.role
			},
			process.env.JWT_SECRET,
			{ expiresIn: '24h' }
		)

		res.json({
			message: 'Giriş başarılı',
			token,
			role: user.role
		})
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}
