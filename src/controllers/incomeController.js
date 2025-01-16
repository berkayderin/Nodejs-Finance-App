const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Gelir oluşturma
exports.createIncome = async (req, res) => {
	try {
		const { name, amount, description, date } = req.body
		const userId = req.user.userId

		if (!userId) {
			return res.status(401).json({ message: 'Kullanıcı kimliği bulunamadı' })
		}

		const income = await prisma.income.create({
			data: {
				name,
				amount: parseFloat(amount),
				description,
				date: new Date(date),
				user: {
					connect: {
						id: userId
					}
				}
			}
		})

		res.status(201).json({
			message: 'Gelir başarıyla oluşturuldu',
			income
		})
	} catch (error) {
		console.error('Gelir oluşturma hatası:', error)
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Gelirleri listeleme
exports.getIncomes = async (req, res) => {
	try {
		const userId = req.user.userId
		const { startDate, endDate } = req.query

		const where = {
			userId,
			...(startDate &&
				endDate && {
					date: {
						gte: new Date(startDate),
						lte: new Date(endDate)
					}
				})
		}

		const incomes = await prisma.income.findMany({
			where,
			orderBy: {
				date: 'desc'
			}
		})

		res.json(incomes)
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Gelir detayı
exports.getIncome = async (req, res) => {
	try {
		const { id } = req.params
		const userId = req.user.userId

		const income = await prisma.income.findFirst({
			where: {
				id,
				userId
			},
			include: {
				category: true
			}
		})

		if (!income) {
			return res.status(404).json({ message: 'Gelir bulunamadı' })
		}

		res.json(income)
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Gelir güncelleme
exports.updateIncome = async (req, res) => {
	try {
		const { id } = req.params
		const { name, amount, description, date } = req.body
		const userId = req.user.userId

		const income = await prisma.income.findFirst({
			where: {
				id,
				userId
			}
		})

		if (!income) {
			return res.status(404).json({ message: 'Gelir bulunamadı' })
		}

		const updatedIncome = await prisma.income.update({
			where: { id },
			data: {
				name,
				amount: amount ? parseFloat(amount) : undefined,
				description,
				date: date ? new Date(date) : undefined
			}
		})

		res.json({
			message: 'Gelir başarıyla güncellendi',
			income: updatedIncome
		})
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Gelir silme
exports.deleteIncome = async (req, res) => {
	try {
		const { id } = req.params
		const userId = req.user.userId

		const income = await prisma.income.findFirst({
			where: {
				id,
				userId
			}
		})

		if (!income) {
			return res.status(404).json({ message: 'Gelir bulunamadı' })
		}

		await prisma.income.delete({
			where: { id }
		})

		res.json({ message: 'Gelir başarıyla silindi' })
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}
