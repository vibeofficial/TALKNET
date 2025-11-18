const { getUsers, getUser, changePassword, updateProfile } = require('../controllers/user');
const { authenticate } = require('../middleware/auth');

const router = require('express').Router();
const upload = require('../middleware/multer');


/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - User
 *     description: Retrieves all users with role "user". Sensitive fields are excluded.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All users
 *                 total:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64fa1ef03c892b91c03e5d72
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       email:
 *                         type: string
 *                         example: johndoe@gmail.com
 *                       username:
 *                         type: string
 *                         example: johndoe123
 *                       profile:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: https://res.cloudinary.com/xyz/image/upload/profile.jpg
 *                           publicId:
 *                             type: string
 *                             example: profile_abc123
 *
 *       500:
 *         description: Server error while retrieving users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot get users at this moment
 *                 error:
 *                   type: string
 *                   example: An unexpected error occurred
 */
router.get('/users', getUsers);


/**
 * @swagger
 * /api/v1/user/{id}:
 *   get:
 *     summary: Get a single user
 *     tags:
 *       - User
 *     description: Retrieves a user by ID. Sensitive fields are excluded.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *           example: 64fa1ef03c892b91c03e5d72
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get user
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64fa1ef03c892b91c03e5d72
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: johndoe@gmail.com
 *                     username:
 *                       type: string
 *                       example: johndoe123
 *                     profile:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         url:
 *                           type: string
 *                           example: https://res.cloudinary.com/app/profile.jpg
 *                         publicId:
 *                           type: string
 *                           example: profile_abc123
 *
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *
 *       500:
 *         description: Server error while retrieving user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot get user at this moment
 *                 error:
 *                   type: string
 *                   example: An unexpected error occurred
 */
router.get('/user/:id', getUser);


/**
 * @swagger
 * /api/v1/change/password:
 *   post:
 *     summary: Change user password
 *     tags:
 *       - User
 *     description: Allows an authenticated user to change their password.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - newPassword
 *               - confirmPassowrd
 *             properties:
 *               password:
 *                 type: string
 *                 description: Current password
 *                 example: oldPassword123
 *               newPassword:
 *                 type: string
 *                 description: New password to set
 *                 example: NewPassword@2024
 *               confirmPassowrd:
 *                 type: string
 *                 description: Confirm new password
 *                 example: NewPassword@2024
 *
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *
 *       400:
 *         description: Incorrect password or password mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     incorrect:
 *                       summary: Incorrect password
 *                       value: Incorrect password.
 *                     mismatch:
 *                       summary: Password mismatch
 *                       value: Password do not match
 *
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *
 *       500:
 *         description: Server error while changing password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot change password at this moment
 *                 error:
 *                   type: string
 *                   example: An unexpected error occurred
 */
router.post('/change/password', authenticate, changePassword);


/**
 * @swagger
 * /api/v1/update/profile:
 *   put:
 *     summary: Update user profile
 *     description: >
 *       Allows an authenticated user to update their username, phone number, and profile image.  
 *       If a profile image is uploaded, the old image is removed from Cloudinary.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: New username
 *                 example: johndoe123
 *               phoneNumber:
 *                 type: string
 *                 description: New phone number
 *                 example: 08012345678
 *               profile:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file
 *
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User profile updated successfully
 *
 *       400:
 *         description: Username/phone number already exists or session timeout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     conflict:
 *                       summary: Username/phone already exists
 *                       value: User with provided username or phone-number already exists
 *                     session:
 *                       summary: Session timeout
 *                       value: Session timeout
 *
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *
 *       500:
 *         description: Server error while updating profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot update profile at this moment
 *                 error:
 *                   type: string
 *                   example: An unexpected error occurred
 */
router.put('/update/profile', authenticate, upload.single('profile'), updateProfile);


module.exports = router;