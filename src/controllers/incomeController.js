const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Gelir oluşturma
exports.createIncome = async (req, res) => {
	try {
		const { name, amount, description, date } = req.body
		const userId = req.user.id

		const income = await prisma.income.create({
			data: {
				name,
				amount: Number(amount),
				description,
				date: new Date(date),
				userId
			}
		})

		res.status(201).json({
			message: 'Gelir başarıyla oluşturuldu',
			income
		})
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Gelirleri listeleme
exports.getIncomes = async (req, res) => {
	try {
		const userId = req.user.userId
		const { startDate, endDate, categoryId } = req.query

		const where = {
			userId,
			...(startDate &&
				endDate && {
					date: {
						gte: new Date(startDate),
						lte: new Date(endDate)
					}
				}),
			...(categoryId && { categoryId: Number(categoryId) })
		}

		const incomes = await prisma.income.findMany({
			where,
			include: {
				category: true
			},
			orderBy: {
				date: 'desc'
			}
		})

		const total = await prisma.income.aggregate({
			where,
			_sum: {
				amount: true
			}
		})

		res.json({
			incomes,
			total: total._sum.amount || 0
		})
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
				id: Number(id),
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
		const { amount, description, date, categoryId } = req.body
		const userId = req.user.userId

		const income = await prisma.income.findFirst({
			where: {
				id: Number(id),
				userId
			}
		})

		if (!income) {
			return res.status(404).json({ message: 'Gelir bulunamadı' })
		}

		if (categoryId) {
			const category = await prisma.category.findFirst({
				where: {
					id: Number(categoryId),
					userId
				}
			})

			if (!category) {
				return res.status(404).json({ message: 'Kategori bulunamadı' })
			}
		}

		const updatedIncome = await prisma.income.update({
			where: { id: Number(id) },
			data: {
				amount: amount ? Number(amount) : undefined,
				description,
				date: date ? new Date(date) : undefined,
				categoryId: categoryId ? Number(categoryId) : undefined
			},
			include: {
				category: true
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
				id: Number(id),
				userId
			}
		})

		if (!income) {
			return res.status(404).json({ message: 'Gelir bulunamadı' })
		}

		await prisma.income.delete({
			where: { id: Number(id) }
		})

		res.json({ message: 'Gelir başarıyla silindi' })
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}
