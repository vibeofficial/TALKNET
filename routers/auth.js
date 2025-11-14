const { register, verify, forgetPaswword, resetPassword, login, uploadProfile, refreshToken } = require('../controllers/auth');

const router = require('express').Router();
const upload = require('../middleware/multer');


/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and sends an email verification link.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - password
 *               - confirmPassword
 *               - phoneNumber
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: "Christopher Ichiogu"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "mypassword123"
 *               confirmPassword:
 *                 type: string
 *                 example: "mypassword123"
 *               phoneNumber:
 *                 type: string
 *                 example: "09012345678"
 *     responses:
 *       201:
 *         description: User registered successfully. Verification email sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account created successfully
 *
 *       400:
 *         description: Validation error or existing user conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User with provided email or phone-number already exists
 *
 *       500:
 *         description: Server error while creating user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot register user at this moment
 *                 error:
 *                   type: string
 *                   example: Error details message here
 */
router.post('/register', register);


/**
 * @swagger
 * /api/v1/verify/{token}:
 *   get:
 *     summary: Verify user email address
 *     description: >
 *       Verifies the user's account using the token sent to their email.  
 *       If the token is expired, a new verification link is generated and emailed to the user.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verified successfully
 *                 redirect:
 *                   type: string
 *                   example: https://www.google.com
 *
 *       201:
 *         description: Token expired — new verification link sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Link expired. A new link has been sent to email
 *
 *       400:
 *         description: Account already verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account already verified
 *                 redirect:
 *                   type: string
 *                   example: https://www.google.com
 *
 *       404:
 *         description: Token missing or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token not found
 *
 *       500:
 *         description: Server error during verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot verify user at this moment
 *                 error:
 *                   type: string
 *                   example: Error details message
 */
router.get('/verify/:token', verify);


/**
 * @swagger
 * /api/v1/forget/password:
 *   post:
 *     summary: Request a password reset link
 *     description: >
 *       Sends a password reset email containing a tokenized reset link.  
 *       The token expires in 10 minutes.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Reset link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset link sent to email
 *
 *       404:
 *         description: User with provided email not found
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
 *         description: Server error while processing password reset request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot forget user password at this moment
 *                 error:
 *                   type: string
 *                   example: Error details message
 */
router.post('/forget/password', forgetPaswword);


/**
 * @swagger
 * /api/v1/profile:
 *   post:
 *     summary: Upload or update user profile picture and username
 *     description: >
 *       Allows a user to upload a profile image and update their username.  
 *       Accepts multipart/form-data including an image file and text fields.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - profile
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               username:
 *                 type: string
 *                 example: johndoe123
 *               profile:
 *                 type: string
 *                 format: binary
 *                 description: User profile image file
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
 *                   example: User profile has been updated successfully
 *
 *       404:
 *         description: User not found OR username already taken
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     userNotFound:
 *                       value: User not found
 *                     usernameTaken:
 *                       value: Username already taken
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
 *                   example: Cannot upload profile and username at this moment
 *                 error:
 *                   type: string
 *                   example: Error details message
 */
router.post('/profile', upload.single('profile'), uploadProfile);


/**
 * @swagger
 * /api/v1/reset/{token}:
 *   post:
 *     summary: Reset user password
 *     description: >
 *       Resets a user's password using a reset token sent to their email.  
 *       If the token is expired, a new reset link is automatically sent to the user's email.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Password reset JWT token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: NewPass123!
 *               confirmPassword:
 *                 type: string
 *                 example: NewPass123!
 *
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *
 *       201:
 *         description: Reset token expired — new link sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Link expired. A new link has been sent to email
 *
 *       400:
 *         description: Password validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password do not match
 *
 *       404:
 *         description: Token missing or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     tokenMissing:
 *                       value: Token not found
 *                     userNotFound:
 *                       value: User not found
 *
 *       500:
 *         description: Server error while resetting password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot reset user password at this moment
 *                 error:
 *                   type: string
 *                   example: Error details message
 */
router.post('/reset/:token', resetPassword);


/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Login a user using email, username, or phone number
 *     description: >
 *       Authenticates a user using an identifier (email, username, or phone number) and password.  
 *       Returns an access token in the JSON response and sets a refresh token in an HTTP-only cookie.
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email, username, or phone number
 *                 example: johndoe@gmail.com
 *               password:
 *                 type: string
 *                 example: MySecret123!
 *
 *     responses:
 *       200:
 *         description: Login successful — accessToken returned and refreshToken cookie set
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=abcdef123456; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800;
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     fullname:
 *                       type: string
 *                     username:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     profile:
 *                       type: object
 *                     role:
 *                       type: string
 *
 *       400:
 *         description: Incorrect password or login attempts exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 example:
 *                   message: Incorrect password. 2 attempt(s) left
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
 *         description: Server error during login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot login at this moment
 *                 error:
 *                   type: string
 */
router.post('/login', login);


/**
 * @swagger
 * /api/v1/refresh/token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     description: >
 *       Generates a new access token and refresh token using the refresh token stored in HTTP-only cookies.
 *       The refresh token must be valid and must match the one saved for the user.
 *     tags:
 *       - Authentication
 *
 *     responses:
 *       200:
 *         description: New access token and refresh token generated successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=NEW_REFRESH_TOKEN; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800;
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *       401:
 *         description: No refresh token provided or token could not be verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No refresh token provided
 *
 *       403:
 *         description: Invalid or mismatched refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid refresh token
 *
 *       500:
 *         description: Server error while refreshing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot refresh token at this moment
 *                 error:
 *                   type: string
 */
router.post('/refresh/token', refreshToken);

module.exports = router;