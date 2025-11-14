const { sendMessage } = require("../controllers/message");
const { authenticate } = require("../middleware/auth");

const router = require("express").Router();


/**
 * @swagger
 * /api/v1/send/message/{recieverId}:
 *   post:
 *     summary: Send a message to a specific user
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recieverId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to send the message to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The message text
 *     responses:
 *       201:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Missing receiver ID
 *       404:
 *         description: Sender not found
 *       500:
 *         description: Server error
 */
router.post('/send/message/:recieverId', authenticate, sendMessage);

module.exports = router;