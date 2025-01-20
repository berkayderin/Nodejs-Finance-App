const express = require('express')
const {
	createCategory,
	getCategories,
	getCategory,
	updateCategory,
	deleteCategory
} = require('../controllers/categoryController')
const { isAuthenticated } = require('../middleware/auth')

const router = express.Router()

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Yeni kategori oluşturma
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Kategori adı
 *               description:
 *                 type: string
 *                 description: Kategori açıklaması
 *     responses:
 *       201:
 *         description: Kategori başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 */
router.post('/', isAuthenticated, createCategory)

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Kategorileri listele
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kategoriler başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/', isAuthenticated, getCategories)

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Kategori detayını getir
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kategori ID
 *     responses:
 *       200:
 *         description: Kategori detayı başarıyla getirildi
 *       404:
 *         description: Kategori bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/:id', isAuthenticated, getCategory)

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Kategori güncelle
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kategori ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Kategori adı
 *               description:
 *                 type: string
 *                 description: Kategori açıklaması
 *     responses:
 *       200:
 *         description: Kategori başarıyla güncellendi
 *       404:
 *         description: Kategori bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.put('/:id', isAuthenticated, updateCategory)

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Kategori sil
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kategori ID
 *     responses:
 *       200:
 *         description: Kategori başarıyla silindi
 *       404:
 *         description: Kategori bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 */
router.delete('/:id', isAuthenticated, deleteCategory)

module.exports = router
