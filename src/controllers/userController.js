const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

// Tüm kullanıcıları listele
exports.getUsers = async (req, res) => {
	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						categories: true,
						incomes: true,
						expenses: true
					}
				}
			}
		})

		res.json(users)
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Kullanıcı detayı
exports.getUser = async (req, res) => {
	try {
		const { id } = req.params

		const user = await prisma.user.findUnique({
			where: { id: Number(id) },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						categories: true,
						incomes: true,
						expenses: true
					}
				}
			}
		})

		if (!user) {
			return res.status(404).json({ message: 'Kullanıcı bulunamadı' })
		}

		res.json(user)
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Kullanıcı güncelleme
exports.updateUser = async (req, res) => {
	try {
		const { id } = req.params
		const { email, name, role, password } = req.body

		// Kullanıcı kontrolü
		const userExists = await prisma.user.findUnique({
			where: { id: Number(id) }
		})

		if (!userExists) {
			return res.status(404).json({ message: 'Kullanıcı bulunamadı' })
		}

		// Email kontrolü
		if (email && email !== userExists.email) {
			const emailExists = await prisma.user.findUnique({
				where: { email }
			})

			if (emailExists) {
				return res.status(400).json({ message: 'Bu email adresi zaten kullanımda' })
			}
		}

		const updateData = {
			...(email && { email }),
			...(name && { name }),
			...(role && { role }),
			...(password && { password: await bcrypt.hash(password, 10) })
		}

		const updatedUser = await prisma.user.update({
			where: { id: Number(id) },
			data: updateData,
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				createdAt: true,
				updatedAt: true
			}
		})

		res.json({
			message: 'Kullanıcı başarıyla güncellendi',
			user: updatedUser
		})
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Kullanıcı silme
exports.deleteUser = async (req, res) => {
	try {
		const { id } = req.params

		// Admin kendini silemesin
		if (req.user.userId === Number(id)) {
			return res.status(400).json({ message: 'Kendi hesabınızı silemezsiniz' })
		}

		const user = await prisma.user.findUnique({
			where: { id: Number(id) }
		})

		if (!user) {
			return res.status(404).json({ message: 'Kullanıcı bulunamadı' })
		}

		await prisma.user.delete({
			where: { id: Number(id) }
		})

		res.json({ message: 'Kullanıcı başarıyla silindi' })
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Kullanıcı istatistikleri
exports.getUserStats = async (req, res) => {
	try {
		const { id } = req.params
		const { startDate, endDate } = req.query

		const user = await prisma.user.findUnique({
			where: { id: Number(id) }
		})

		if (!user) {
			return res.status(404).json({ message: 'Kullanıcı bulunamadı' })
		}

		const dateFilter =
			startDate && endDate
				? {
						date: {
							gte: new Date(startDate),
							lte: new Date(endDate)
						}
				  }
				: {}

		const [categories, incomes, expenses] = await Promise.all([
			prisma.category.count({
				where: { userId: Number(id) }
			}),
			prisma.income.aggregate({
				where: {
					userId: Number(id),
					...dateFilter
				},
				_sum: {
					amount: true
				},
				_count: true
			}),
			prisma.expense.aggregate({
				where: {
					userId: Number(id),
					...dateFilter
				},
				_sum: {
					amount: true
				},
				_count: true
			})
		])

		res.json({
			categories,
			incomes: {
				count: incomes._count,
				total: incomes._sum.amount || 0
			},
			expenses: {
				count: expenses._count,
				total: expenses._sum.amount || 0
			},
			balance: (incomes._sum.amount || 0) - (expenses._sum.amount || 0)
		})
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}
