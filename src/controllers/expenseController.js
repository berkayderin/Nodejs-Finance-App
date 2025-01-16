const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Gider oluşturma
exports.createExpense = async (req, res) => {
	try {
		const { name, amount, description, date, categoryId } = req.body
		const userId = req.user.userId

		if (!userId) {
			return res.status(401).json({ message: 'Kullanıcı kimliği bulunamadı' })
		}

		// Kategori kontrolü
		const category = await prisma.category.findFirst({
			where: {
				id: categoryId,
				userId
			}
		})

		if (!category) {
			return res.status(404).json({ message: 'Kategori bulunamadı' })
		}

		const expense = await prisma.expense.create({
			data: {
				name,
				amount: parseFloat(amount),
				description,
				date: new Date(date),
				user: {
					connect: {
						id: userId
					}
				},
				category: {
					connect: {
						id: categoryId
					}
				}
			},
			include: {
				category: true
			}
		})

		res.status(201).json({
			message: 'Gider başarıyla oluşturuldu',
			expense
		})
	} catch (error) {
		console.error('Gider oluşturma hatası:', error)
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Giderleri listeleme
exports.getExpenses = async (req, res) => {
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
			...(categoryId && { categoryId })
		}

		const expenses = await prisma.expense.findMany({
			where,
			include: {
				category: true
			},
			orderBy: {
				date: 'desc'
			}
		})

		// Direkt expenses array'ini dönüyoruz
		res.json(expenses)
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Gider detayı
exports.getExpense = async (req, res) => {
	try {
		const { id } = req.params
		const userId = req.user.userId

		const expense = await prisma.expense.findFirst({
			where: {
				id,
				userId
			},
			include: {
				category: true
			}
		})

		if (!expense) {
			return res.status(404).json({ message: 'Gider bulunamadı' })
		}

		res.json(expense)
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Gider güncelleme
exports.updateExpense = async (req, res) => {
	try {
		const { id } = req.params
		const { amount, description, date, categoryId } = req.body
		const userId = req.user.userId

		const expense = await prisma.expense.findFirst({
			where: {
				id,
				userId
			}
		})

		if (!expense) {
			return res.status(404).json({ message: 'Gider bulunamadı' })
		}

		if (categoryId) {
			const category = await prisma.category.findFirst({
				where: {
					id: categoryId,
					userId
				}
			})

			if (!category) {
				return res.status(404).json({ message: 'Kategori bulunamadı' })
			}
		}

		const updatedExpense = await prisma.expense.update({
			where: { id },
			data: {
				amount: amount ? Number(amount) : undefined,
				description,
				date: date ? new Date(date) : undefined,
				categoryId: categoryId || undefined
			},
			include: {
				category: true
			}
		})

		res.json({
			message: 'Gider başarıyla güncellendi',
			expense: updatedExpense
		})
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Gider silme
exports.deleteExpense = async (req, res) => {
	try {
		const { id } = req.params
		const userId = req.user.userId

		const expense = await prisma.expense.findFirst({
			where: {
				id,
				userId
			}
		})

		if (!expense) {
			return res.status(404).json({ message: 'Gider bulunamadı' })
		}

		await prisma.expense.delete({
			where: { id }
		})

		res.json({ message: 'Gider başarıyla silindi' })
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}
