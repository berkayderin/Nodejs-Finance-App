const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Harcama hedefi oluşturma
exports.createSpendingGoal = async (req, res) => {
	try {
		const { amount } = req.body
		const userId = req.user.userId

		// Ay başlangıcı için tarih oluştur
		const now = new Date()
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

		// Mevcut ay için hedef var mı kontrol et
		const existingGoal = await prisma.spendingGoal.findFirst({
			where: {
				userId,
				month: monthStart
			}
		})

		if (existingGoal) {
			return res.status(400).json({ message: 'Bu ay için zaten bir harcama hedefiniz bulunmakta.' })
		}

		// Yeni hedef oluştur
		await prisma.spendingGoal.create({
			data: {
				amount: parseFloat(amount),
				month: monthStart,
				user: {
					connect: {
						id: userId
					}
				}
			}
		})

		res.redirect('/panel/dashboard')
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Bir hata oluştu.' })
	}
}

// Mevcut ayın harcama hedefini kontrol et
exports.checkSpendingGoal = async (userId) => {
	try {
		const now = new Date()
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

		// Mevcut ayın hedefini bul
		const currentGoal = await prisma.spendingGoal.findFirst({
			where: {
				userId,
				month: monthStart
			}
		})

		if (!currentGoal) {
			return null
		}

		// Mevcut ayın toplam harcamalarını hesapla
		const monthlyExpenses = await prisma.expense.aggregate({
			where: {
				userId,
				createdAt: {
					gte: monthStart,
					lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
				}
			},
			_sum: {
				amount: true
			}
		})

		const totalExpenses = monthlyExpenses._sum.amount || 0

		return {
			goalAmount: currentGoal.amount,
			currentAmount: totalExpenses,
			isReached: totalExpenses >= currentGoal.amount
		}
	} catch (error) {
		console.error(error)
		return null
	}
}
