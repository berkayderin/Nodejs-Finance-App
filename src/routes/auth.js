const express = require('express')
const { register, login, changePassword } = require('../controllers/authController')
const { isAuthenticated } = require('../middleware/auth')

const router = express.Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Kullanıcı email adresi
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Kullanıcı şifresi
 *               name:
 *                 type: string
 *                 description: Kullanıcı adı
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 description: Kullanıcı rolü (opsiyonel)
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Geçersiz istek
 *       500:
 *         description: Sunucu hatası
 */
router.post('/register', register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Kullanıcı email adresi
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Kullanıcı şifresi
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Geçersiz kimlik bilgileri
 *       500:
 *         description: Sunucu hatası
 */
router.post('/login', login)

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Kullanıcı şifresini değiştirme
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Mevcut şifre
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Yeni şifre
 *     responses:
 *       200:
 *         description: Şifre başarıyla değiştirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Geçersiz şifre
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.put('/change-password', isAuthenticated, changePassword)

module.exports = router
