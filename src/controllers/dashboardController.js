const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getDashboardStats = async (req, res) => {
	try {
		const userId = req.user.userId
		const now = new Date()
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
		const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

		// Mevcut ayın harcama hedefini al
		const currentGoal = await prisma.spendingGoal.findFirst({
			where: {
				userId,
				month: monthStart
			}
		})

		// Aylık gelir ve giderleri al
		const monthlyIncomes = await prisma.income.findMany({
			where: {
				userId,
				createdAt: {
					gte: monthStart,
					lte: monthEnd
				}
			}
		})

		const monthlyExpenses = await prisma.expense.findMany({
			where: {
				userId,
				createdAt: {
					gte: monthStart,
					lte: monthEnd
				}
			},
			include: {
				category: true
			}
		})

		// Toplam gelir ve giderleri hesapla
		const totalIncome = monthlyIncomes.reduce((sum, income) => sum + income.amount, 0)
		const totalExpense = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)

		// Kategori bazlı gider dağılımını hesapla
		const categoryData = monthlyExpenses.reduce((acc, expense) => {
			const categoryName = expense.category.name
			if (!acc[categoryName]) {
				acc[categoryName] = 0
			}
			acc[categoryName] += expense.amount
			return acc
		}, {})

		// Son 6 ayın verilerini al
		const last6Months = Array.from({ length: 6 }, (_, i) => {
			const date = new Date()
			date.setMonth(date.getMonth() - i)
			return date
		}).reverse()

		const monthlyData = {
			labels: last6Months.map((date) => {
				return new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(date)
			}),
			incomes: await Promise.all(
				last6Months.map(async (date) => {
					const start = new Date(date.getFullYear(), date.getMonth(), 1)
					const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
					const sum = await prisma.income.aggregate({
						where: {
							userId,
							createdAt: {
								gte: start,
								lte: end
							}
						},
						_sum: {
							amount: true
						}
					})
					return sum._sum.amount || 0
				})
			),
			expenses: await Promise.all(
				last6Months.map(async (date) => {
					const start = new Date(date.getFullYear(), date.getMonth(), 1)
					const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
					const sum = await prisma.expense.aggregate({
						where: {
							userId,
							createdAt: {
								gte: start,
								lte: end
							}
						},
						_sum: {
							amount: true
						}
					})
					return sum._sum.amount || 0
				})
			)
		}

		res.json({
			monthlyData,
			categoryData: {
				labels: Object.keys(categoryData),
				data: Object.values(categoryData)
			},
			totalStats: {
				income: totalIncome,
				expense: totalExpense
			},
			spendingGoal: currentGoal
		})
	} catch (error) {
		console.error('Dashboard istatistikleri alınırken hata:', error)
		res.status(500).json({ message: 'Sunucu hatası' })
	}
}
