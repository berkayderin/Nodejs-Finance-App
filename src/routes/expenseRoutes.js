const express = require('express')
const {
	createExpense,
	getExpenses,
	getExpense,
	updateExpense,
	deleteExpense
} = require('../controllers/expenseController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Yeni gider oluşturma
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - date
 *               - categoryId
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Gider tutarı
 *               description:
 *                 type: string
 *                 description: Gider açıklaması
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Gider tarihi
 *               categoryId:
 *                 type: integer
 *                 description: Kategori ID
 *     responses:
 *       201:
 *         description: Gider başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Kategori bulunamadı
 */
router.post('/', authMiddleware, createExpense)

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Giderleri listele
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Başlangıç tarihi
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Bitiş tarihi
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Kategori ID'sine göre filtreleme
 *     responses:
 *       200:
 *         description: Giderler başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/', authMiddleware, getExpenses)

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Gider detayını getir
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Gider ID
 *     responses:
 *       200:
 *         description: Gider detayı başarıyla getirildi
 *       404:
 *         description: Gider bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/:id', authMiddleware, getExpense)

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Gider güncelle
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Gider ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Gider tutarı
 *               description:
 *                 type: string
 *                 description: Gider açıklaması
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Gider tarihi
 *               categoryId:
 *                 type: integer
 *                 description: Kategori ID
 *     responses:
 *       200:
 *         description: Gider başarıyla güncellendi
 *       404:
 *         description: Gider veya kategori bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.put('/:id', authMiddleware, updateExpense)

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Gider sil
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Gider ID
 *     responses:
 *       200:
 *         description: Gider başarıyla silindi
 *       404:
 *         description: Gider bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.delete('/:id', authMiddleware, deleteExpense)

module.exports = router
