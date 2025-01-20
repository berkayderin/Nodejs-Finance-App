const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const path = require('path')

// Excel'e aktarma fonksiyonları
const exportToExcel = async (data, headers, filename) => {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet('Sayfa1')

	worksheet.columns = headers.map((header) => ({
		header: header.label,
		key: header.key,
		width: 20
	}))

	worksheet.addRows(data)

	const buffer = await workbook.xlsx.writeBuffer()
	return buffer
}

// PDF'e aktarma fonksiyonları
const exportToPDF = async (data, headers, filename) => {
	// A4 boyutu ve kenar boşlukları
	const doc = new PDFDocument({
		margin: 50,
		size: 'A4',
		layout: 'portrait',
		bufferPages: true
	})

	const chunks = []
	doc.on('data', (chunk) => chunks.push(chunk))

	// Sayfa numarası ekleme
	let pageNumber = 1
	doc.on('pageAdded', () => {
		pageNumber++
	})

	// Başlık
	doc
		.fontSize(20)
		.fillColor('#2c3e50')
		.text(filename, {
			align: 'center',
			characterSpacing: 0.5
		})
		.moveDown(1)

	// Tarih bilgisi
	doc
		.fontSize(10)
		.fillColor('#7f8c8d')
		.text(new Date().toLocaleDateString('tr-TR'), {
			align: 'right'
		})
		.moveDown(1)

	// Tablo genişliği ve kolon sayısı hesaplama
	const pageWidth = doc.page.width - 100
	const columnCount = headers.length
	const columnWidth = pageWidth / columnCount

	// Tablo başlıkları için arka plan
	doc
		.rect(50, doc.y, pageWidth, 30)
		.fillAndStroke('#34495e', '#2c3e50')

	// Tablo başlıkları
	let startX = 50
	doc.fillColor('#ffffff').fontSize(11)

	headers.forEach((header, index) => {
		// Başlık metni
		doc.text(header.label, startX + 5, doc.y - 25, {
			width: columnWidth - 10,
			align: 'left',
			characterSpacing: 0.5
		})

		startX += columnWidth

		// Dikey çizgi
		if (index < headers.length - 1) {
			doc
				.moveTo(startX, doc.y - 30)
				.lineTo(startX, doc.y)
				.stroke('#ffffff')
		}
	})

	doc.moveDown()

	// Tablo verileri
	let rowY = doc.y
	const rowHeight = 30
	let isEvenRow = false

	data.forEach((row, rowIndex) => {
		// Yeni sayfa kontrolü
		if (rowY + rowHeight > doc.page.height - 70) {
			doc.addPage()
			rowY = 50

			// Yeni sayfada tablo başlıklarını tekrar ekle
			doc
				.rect(50, rowY, pageWidth, 30)
				.fillAndStroke('#34495e', '#2c3e50')

			startX = 50
			doc.fillColor('#ffffff').fontSize(11)

			headers.forEach((header, index) => {
				doc.text(header.label, startX + 5, rowY + 5, {
					width: columnWidth - 10,
					align: 'left',
					characterSpacing: 0.5
				})

				startX += columnWidth

				if (index < headers.length - 1) {
					doc
						.moveTo(startX, rowY)
						.lineTo(startX, rowY + 30)
						.stroke('#ffffff')
				}
			})

			rowY += 40
		}

		// Satır arka planı
		doc
			.rect(50, rowY, pageWidth, rowHeight)
			.fillAndStroke(isEvenRow ? '#f5f6fa' : '#ffffff', '#bdc3c7')

		// Satır verileri
		startX = 50
		doc.fillColor('#2c3e50').fontSize(10)

		headers.forEach((header, index) => {
			const value = row[header.key]?.toString() || '-'

			doc.text(value, startX + 5, rowY + 8, {
				width: columnWidth - 10,
				align: 'left',
				characterSpacing: 0.5
			})

			// Dikey çizgi
			if (index < headers.length - 1) {
				doc
					.moveTo(startX + columnWidth, rowY)
					.lineTo(startX + columnWidth, rowY + rowHeight)
					.stroke('#bdc3c7')
			}

			startX += columnWidth
		})

		rowY += rowHeight
		isEvenRow = !isEvenRow
	})

	// Sayfa numaralarını ekle
	const pages = doc.bufferedPageRange()
	for (let i = 0; i < pages.count; i++) {
		doc.switchToPage(i)
		doc
			.fillColor('#7f8c8d')
			.fontSize(8)
			.text(
				`Sayfa ${i + 1} / ${pages.count}`,
				50,
				doc.page.height - 50,
				{
					align: 'center'
				}
			)
	}

	doc.end()

	return new Promise((resolve) => {
		doc.on('end', () => {
			resolve(Buffer.concat(chunks))
		})
	})
}

// Gelirler için export
exports.exportIncomes = async (req, res) => {
	try {
		const incomes = await prisma.income.findMany({
			where: { userId: req.user.userId },
			orderBy: { date: 'desc' }
		})

		const data = incomes.map((income) => ({
			name: income.name,
			amount: income.amount.toString(),
			date: new Date(income.date).toLocaleDateString('tr-TR'),
			description: income.description || '-'
		}))

		const headers = [
			{ label: 'Gelir Adı', key: 'name' },
			{ label: 'Tutar', key: 'amount' },
			{ label: 'Tarih', key: 'date' },
			{ label: 'Açıklama', key: 'description' }
		]

		if (req.query.format === 'excel') {
			const buffer = await exportToExcel(data, headers, 'Gelirler')
			res.setHeader(
				'Content-Type',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			)
			res.setHeader(
				'Content-Disposition',
				'attachment; filename=gelirler.xlsx'
			)
			return res.send(buffer)
		} else if (req.query.format === 'pdf') {
			const buffer = await exportToPDF(
				data,
				headers,
				'Gelirler Listesi'
			)
			res.setHeader('Content-Type', 'application/pdf')
			res.setHeader(
				'Content-Disposition',
				'attachment; filename=gelirler.pdf'
			)
			return res.send(buffer)
		}

		res.status(400).json({ error: 'Geçersiz format' })
	} catch (error) {
		console.error('Export error:', error)
		res
			.status(500)
			.json({ error: 'Export işlemi sırasında bir hata oluştu' })
	}
}

// Giderler için export
exports.exportExpenses = async (req, res) => {
	try {
		const expenses = await prisma.expense.findMany({
			where: { userId: req.user.userId },
			include: { category: true },
			orderBy: { date: 'desc' }
		})

		const data = expenses.map((expense) => ({
			name: expense.name,
			amount: expense.amount.toString(),
			category: expense.category?.name || '-',
			date: new Date(expense.date).toLocaleDateString('tr-TR'),
			description: expense.description || '-'
		}))

		const headers = [
			{ label: 'Gider Adı', key: 'name' },
			{ label: 'Tutar', key: 'amount' },
			{ label: 'Kategori', key: 'category' },
			{ label: 'Tarih', key: 'date' },
			{ label: 'Açıklama', key: 'description' }
		]

		if (req.query.format === 'excel') {
			const buffer = await exportToExcel(data, headers, 'Giderler')
			res.setHeader(
				'Content-Type',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			)
			res.setHeader(
				'Content-Disposition',
				'attachment; filename=giderler.xlsx'
			)
			return res.send(buffer)
		} else if (req.query.format === 'pdf') {
			const buffer = await exportToPDF(
				data,
				headers,
				'Giderler Listesi'
			)
			res.setHeader('Content-Type', 'application/pdf')
			res.setHeader(
				'Content-Disposition',
				'attachment; filename=giderler.pdf'
			)
			return res.send(buffer)
		}

		res.status(400).json({ error: 'Geçersiz format' })
	} catch (error) {
		console.error('Export error:', error)
		res
			.status(500)
			.json({ error: 'Export işlemi sırasında bir hata oluştu' })
	}
}

// Kategoriler için export
exports.exportCategories = async (req, res) => {
	try {
		const categories = await prisma.category.findMany({
			where: { userId: req.user.userId },
			orderBy: { createdAt: 'desc' }
		})

		const data = categories.map((category) => ({
			name: category.name,
			description: category.description || '-',
			createdAt: new Date(category.createdAt).toLocaleDateString(
				'tr-TR'
			)
		}))

		const headers = [
			{ label: 'Kategori Adı', key: 'name' },
			{ label: 'Açıklama', key: 'description' },
			{ label: 'Oluşturulma Tarihi', key: 'createdAt' }
		]

		if (req.query.format === 'excel') {
			const buffer = await exportToExcel(data, headers, 'Kategoriler')
			res.setHeader(
				'Content-Type',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			)
			res.setHeader(
				'Content-Disposition',
				'attachment; filename=kategoriler.xlsx'
			)
			return res.send(buffer)
		} else if (req.query.format === 'pdf') {
			const buffer = await exportToPDF(
				data,
				headers,
				'Kategoriler Listesi'
			)
			res.setHeader('Content-Type', 'application/pdf')
			res.setHeader(
				'Content-Disposition',
				'attachment; filename=kategoriler.pdf'
			)
			return res.send(buffer)
		}

		res.status(400).json({ error: 'Geçersiz format' })
	} catch (error) {
		console.error('Export error:', error)
		res
			.status(500)
			.json({ error: 'Export işlemi sırasında bir hata oluştu' })
	}
}

// Kullanıcılar için export (sadece admin)
exports.exportUsers = async (req, res) => {
	try {
		if (req.user.role !== 'ADMIN') {
			return res
				.status(403)
				.json({ error: 'Bu işlem için yetkiniz yok' })
		}

		const users = await prisma.user.findMany({
			orderBy: { createdAt: 'desc' }
		})

		const data = users.map((user) => ({
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: new Date(user.createdAt).toLocaleDateString('tr-TR')
		}))

		const headers = [
			{ label: 'Ad Soyad', key: 'name' },
			{ label: 'E-posta', key: 'email' },
			{ label: 'Rol', key: 'role' },
			{ label: 'Kayıt Tarihi', key: 'createdAt' }
		]

		if (req.query.format === 'excel') {
			const buffer = await exportToExcel(
				data,
				headers,
				'Kullanıcılar'
			)
			res.setHeader(
				'Content-Type',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			)
			res.setHeader(
				'Content-Disposition',
				'attachment; filename=kullanicilar.xlsx'
			)
			return res.send(buffer)
		} else if (req.query.format === 'pdf') {
			const buffer = await exportToPDF(
				data,
				headers,
				'Kullanıcılar Listesi'
			)
			res.setHeader('Content-Type', 'application/pdf')
			res.setHeader(
				'Content-Disposition',
				'attachment; filename=kullanicilar.pdf'
			)
			return res.send(buffer)
		}

		res.status(400).json({ error: 'Geçersiz format' })
	} catch (error) {
		console.error('Export error:', error)
		res
			.status(500)
			.json({ error: 'Export işlemi sırasında bir hata oluştu' })
	}
}
