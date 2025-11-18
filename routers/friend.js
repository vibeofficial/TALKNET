const { searchUsers, sendRequest, getAllRequests, acceptRequest, declineRequest } = require('../controllers/friend');
const { authenticate } = require('../middleware/auth');

const router = require('express').Router();


/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags:
 *       - Friend Request
 *     summary: Search for users by fullname or username
 *     description: Returns a list of users whose fullname or username matches the search value.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - search
 *             properties:
 *               search:
 *                 type: string
 *                 example: "Christopher"
 *                 description: The fullname or username to search for.
 *     responses:
 *       200:
 *         description: Users found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Searched users
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/users', searchUsers);


/**
 * @swagger
 * /send/request/{id}:
 *   get:
 *     summary: Send a friend request to another user
 *     tags: [Friend Request]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to send a friend request to
 *     responses:
 *       200:
 *         description: Friend request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Friend request sent successfully
 *                 request:
 *                   type: object
 *                   description: Newly created friend request document
 *                 data:
 *                   type: object
 *                   properties:
 *                     fullname:
 *                       type: string
 *                       example: John Doe
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     profile:
 *                       type: string
 *                       example: https://example.com/profile.jpg
 *       400:
 *         description: Friend already added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Friend added already
 *       404:
 *         description: User or friend not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Friend not found
 *       500:
 *         description: Server error while sending friend request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot send friend request at this moment
 */
router.get('/send/request/:id', authenticate, sendRequest);


/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get all pending friend requests for the logged-in user
 *     tags: [Friend Request]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all friend requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All friend request
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 672f020bb3df1287d92ac91f
 *                       userId:
 *                         type: string
 *                         example: 672efc9fb3df1287d92ac91a
 *                       friendId:
 *                         type: object
 *                         properties:
 *                           fullname:
 *                             type: string
 *                             example: John Doe
 *                           username:
 *                             type: string
 *                             example: johndoe
 *                           email:
 *                             type: string
 *                             example: johndoe@example.com
 *                           profile:
 *                             type: string
 *                             example: https://example.com/profile.jpg
 *                       status:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         example: 2025-01-01T10:20:30.000Z
 *       404:
 *         description: User not found or logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account is logged out
 *       500:
 *         description: Server error while fetching friend requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot get all friend requests at this moment
 */
router.get('/requests', authenticate, getAllRequests);


/**
 * @swagger
 * /accept/request/{id}:
 *   get:
 *     summary: Accept a pending friend request
 *     tags: [Friend Request]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the friend request to accept
 *         schema:
 *           type: string
 *           example: 673001c2a4d91234b89aa123
 *     responses:
 *       200:
 *         description: Friend request accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Friend request accepted successfully
 *       404:
 *         description: User not logged in OR Friend request not found OR Already accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     loggedOut:
 *                       value: Account is logged out
 *                     notFound:
 *                       value: Friend request not found
 *                     acceptedAlready:
 *                       value: Friend request accepted already
 *       500:
 *         description: Server error while accepting request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot accept friend request at this moment
 */
router.get('/accept/request/:id', authenticate, acceptRequest);


/**
 * @swagger
 * /decline/request/{id}:
 *   get:
 *     summary: Decline a friend request
 *     tags: [Friend Request]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the friend request to decline
 *         schema:
 *           type: string
 *           example: 673001c2a4d91234b89aa123
 *     responses:
 *       200:
 *         description: Friend request declined successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Friend request declined
 *       404:
 *         description: User not logged in OR Request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     loggedOut:
 *                       value: Account is logged out
 *                     notFound:
 *                       value: Friend request not found
 *       500:
 *         description: Server error while declining request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot decline friend request at this moment
 */
router.get('/decline/request/:id', authenticate, declineRequest);


module.exports = router;