const express = require('express')
const { createIncome, getIncomes, getIncome, updateIncome, deleteIncome } = require('../controllers/incomeController')
const { isAuthenticated } = require('../middleware/auth')

const router = express.Router()

/**
 * @swagger
 * /api/incomes:
 *   post:
 *     summary: Yeni gelir oluşturma
 *     tags: [Incomes]
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
 *                 description: Gelir tutarı
 *               description:
 *                 type: string
 *                 description: Gelir açıklaması
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Gelir tarihi
 *               categoryId:
 *                 type: integer
 *                 description: Kategori ID
 *     responses:
 *       201:
 *         description: Gelir başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Kategori bulunamadı
 */
router.post('/', isAuthenticated, createIncome)

/**
 * @swagger
 * /api/incomes:
 *   get:
 *     summary: Gelirleri listele
 *     tags: [Incomes]
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
 *         description: Gelirler başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/', isAuthenticated, getIncomes)

/**
 * @swagger
 * /api/incomes/{id}:
 *   get:
 *     summary: Gelir detayını getir
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Gelir ID
 *     responses:
 *       200:
 *         description: Gelir detayı başarıyla getirildi
 *       404:
 *         description: Gelir bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/:id', isAuthenticated, getIncome)

/**
 * @swagger
 * /api/incomes/{id}:
 *   put:
 *     summary: Gelir güncelle
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Gelir ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Gelir tutarı
 *               description:
 *                 type: string
 *                 description: Gelir açıklaması
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Gelir tarihi
 *               categoryId:
 *                 type: integer
 *                 description: Kategori ID
 *     responses:
 *       200:
 *         description: Gelir başarıyla güncellendi
 *       404:
 *         description: Gelir veya kategori bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.put('/:id', isAuthenticated, updateIncome)

/**
 * @swagger
 * /api/incomes/{id}:
 *   delete:
 *     summary: Gelir sil
 *     tags: [Incomes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Gelir ID
 *     responses:
 *       200:
 *         description: Gelir başarıyla silindi
 *       404:
 *         description: Gelir bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.delete('/:id', isAuthenticated, deleteIncome)

module.exports = router
