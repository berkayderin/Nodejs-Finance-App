const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Kategori oluşturma
exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body
		const userId = req.user.userId

		const category = await prisma.category.create({
			data: {
				name,
				description,
				user: {
					connect: {
						id: userId
					}
				}
			}
		})

		res.status(201).json(category)
	} catch (error) {
		console.error('Kategori oluşturma hatası:', error)
		res.status(500).json({
			message: 'Sunucu hatası',
			error: error.message
		})
	}
}

// Kategorileri listeleme
exports.getCategories = async (req, res) => {
	try {
		const userId = req.user.userId

		const categories = await prisma.category.findMany({
			where: {
				userId
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		res.json(categories)
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Kategori detayı
exports.getCategory = async (req, res) => {
	try {
		const { id } = req.params
		const userId = req.user.userId

		const category = await prisma.category.findFirst({
			where: {
				id: Number(id),
				userId
			}
		})

		if (!category) {
			return res.status(404).json({ message: 'Kategori bulunamadı' })
		}

		res.json(category)
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Kategori güncelleme
exports.updateCategory = async (req, res) => {
	try {
		const { id } = req.params
		const { name, description } = req.body
		const userId = req.user.userId

		const category = await prisma.category.findFirst({
			where: {
				id: Number(id),
				userId
			}
		})

		if (!category) {
			return res.status(404).json({ message: 'Kategori bulunamadı' })
		}

		const updatedCategory = await prisma.category.update({
			where: { id: Number(id) },
			data: {
				name,
				description
			}
		})

		res.json({
			message: 'Kategori başarıyla güncellendi',
			category: updatedCategory
		})
	} catch (error) {
		if (error.code === 'P2002') {
			return res.status(400).json({
				message: 'Bu isimde bir kategori zaten mevcut'
			})
		}
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}

// Kategori silme
exports.deleteCategory = async (req, res) => {
	try {
		const { id } = req.params
		const userId = req.user.userId

		const category = await prisma.category.findFirst({
			where: {
				id: Number(id),
				userId
			}
		})

		if (!category) {
			return res.status(404).json({ message: 'Kategori bulunamadı' })
		}

		await prisma.category.delete({
			where: { id: Number(id) }
		})

		res.json({ message: 'Kategori başarıyla silindi' })
	} catch (error) {
		res.status(500).json({ message: 'Sunucu hatası', error: error.message })
	}
}
