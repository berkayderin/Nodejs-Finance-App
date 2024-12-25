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

		// API isteği ise JSON yanıt dön
		if (req.path.startsWith('/api/')) {
			return res.json({
				message: 'Giriş başarılı',
				token,
				role: user.role
			})
		}

		// Web form isteği ise cookie ayarla ve yönlendir
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 24 * 60 * 60 * 1000 // 24 saat
		})

		res.redirect('/panel')
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

exports.changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body
		const userId = req.user.userId

		// Kullanıcıyı bul
		const user = await prisma.user.findUnique({
			where: { id: userId }
		})

		if (!user) {
			return res.status(404).json({ message: 'Kullanıcı bulunamadı' })
		}

		// Mevcut şifreyi kontrol et
		const validPassword = await bcrypt.compare(currentPassword, user.password)
		if (!validPassword) {
			return res.status(400).json({ message: 'Mevcut şifre yanlış' })
		}

		// Yeni şifreyi hashle
		const hashedNewPassword = await bcrypt.hash(newPassword, 10)

		// Şifreyi güncelle
		await prisma.user.update({
			where: { id: userId },
			data: {
				password: hashedNewPassword,
				updatedAt: new Date()
			}
		})

		res.json({ message: 'Şifre başarıyla değiştirildi' })
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

exports.logout = (req, res) => {
	res.clearCookie('token')
	res.redirect('/auth/login')
}

// Web routes için login işlemi
exports.webLogin = async (req, res) => {
	try {
		const { email, password } = req.body

		const user = await prisma.user.findUnique({
			where: { email }
		})

		if (!user) {
			return res.render('auth/login', { error: 'Geçersiz email veya şifre' })
		}

		const validPassword = await bcrypt.compare(password, user.password)
		if (!validPassword) {
			return res.render('auth/login', { error: 'Geçersiz email veya şifre' })
		}

		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET)
		res.cookie('token', token, { httpOnly: true })
		res.redirect('/panel')
	} catch (error) {
		res.render('auth/login', { error: 'Sunucu hatası' })
	}
}

// Web routes için register işlemi
exports.webRegister = async (req, res) => {
	try {
		const { email, password, name } = req.body

		const userExists = await prisma.user.findUnique({
			where: { email }
		})

		if (userExists) {
			return res.render('auth/register', { error: 'Bu email adresi zaten kullanımda' })
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				name,
				role: 'USER'
			}
		})

		res.redirect('/auth/login')
	} catch (error) {
		res.render('auth/register', { error: 'Sunucu hatası' })
	}
}
