const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getDashboardStats = async (req, res) => {
	try {
		const userId = req.user.userId
		const currentYear = new Date().getFullYear()

		// Son 6 ayın gelir ve giderlerini al
		const last6Months = Array.from({ length: 6 }, (_, i) => {
			const date = new Date()
			date.setMonth(date.getMonth() - i)
			return date
		}).reverse()

		// Aylık gelirler
		const monthlyIncomes = await prisma.income.groupBy({
			by: ['date'],
			where: {
				userId,
				date: {
					gte: last6Months[0]
				}
			},
			_sum: {
				amount: true
			}
		})

		// Aylık giderler
		const monthlyExpenses = await prisma.expense.groupBy({
			by: ['date'],
			where: {
				userId,
				date: {
					gte: last6Months[0]
				}
			},
			_sum: {
				amount: true
			}
		})

		// Kategori bazlı giderler
		const expensesByCategory = await prisma.expense.groupBy({
			by: ['categoryId'],
			where: {
				userId,
				date: {
					gte: new Date(currentYear, 0, 1)
				}
			},
			_sum: {
				amount: true
			}
		})

		const categories = await prisma.category.findMany({
			where: {
				userId,
				id: {
					in: expensesByCategory.map((e) => e.categoryId)
				}
			}
		})

		// Toplam istatistikler
		const totalStats = await prisma.$transaction([
			prisma.income.aggregate({
				where: {
					userId,
					date: {
						gte: new Date(currentYear, 0, 1)
					}
				},
				_sum: {
					amount: true
				}
			}),
			prisma.expense.aggregate({
				where: {
					userId,
					date: {
						gte: new Date(currentYear, 0, 1)
					}
				},
				_sum: {
					amount: true
				}
			})
		])

		res.json({
			monthlyData: {
				labels: last6Months.map((date) => date.toLocaleDateString('tr-TR', { month: 'long' })),
				incomes: last6Months.map((date) => {
					const income = monthlyIncomes.find((i) => new Date(i.date).getMonth() === date.getMonth())
					return income?._sum.amount || 0
				}),
				expenses: last6Months.map((date) => {
					const expense = monthlyExpenses.find((e) => new Date(e.date).getMonth() === date.getMonth())
					return expense?._sum.amount || 0
				})
			},
			categoryData: {
				labels: categories.map((c) => c.name),
				data: categories.map((c) => {
					const expense = expensesByCategory.find((e) => e.categoryId === c.id)
					return expense?._sum.amount || 0
				})
			},
			totalStats: {
				income: totalStats[0]._sum.amount || 0,
				expense: totalStats[1]._sum.amount || 0
			}
		})
	} catch (error) {
		console.error('Dashboard stats error:', error)
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}
