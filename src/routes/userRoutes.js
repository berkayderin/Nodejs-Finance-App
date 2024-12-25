const express = require('express')
const { getUsers, getUser, updateUser, deleteUser, getUserStats } = require('../controllers/userController')
const authMiddleware = require('../middleware/auth')
const adminAuth = require('../middleware/adminAuth')

const router = express.Router()

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Tüm kullanıcıları listele
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcılar başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 */
router.get('/', authMiddleware, adminAuth, getUsers)

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Kullanıcı detayını getir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Kullanıcı detayı başarıyla getirildi
 *       404:
 *         description: Kullanıcı bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 */
router.get('/:id', authMiddleware, adminAuth, getUser)

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Kullanıcı güncelle
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Kullanıcı email adresi
 *               name:
 *                 type: string
 *                 description: Kullanıcı adı
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 description: Kullanıcı rolü
 *               password:
 *                 type: string
 *                 description: Yeni şifre
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla güncellendi
 *       404:
 *         description: Kullanıcı bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 */
router.put('/:id', authMiddleware, adminAuth, updateUser)

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Kullanıcı sil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla silindi
 *       404:
 *         description: Kullanıcı bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 */
router.delete('/:id', authMiddleware, adminAuth, deleteUser)

/**
 * @swagger
 * /api/users/{id}/stats:
 *   get:
 *     summary: Kullanıcı istatistiklerini getir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID
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
 *     responses:
 *       200:
 *         description: Kullanıcı istatistikleri başarıyla getirildi
 *       404:
 *         description: Kullanıcı bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 */
router.get('/:id/stats', authMiddleware, adminAuth, getUserStats)

module.exports = router
