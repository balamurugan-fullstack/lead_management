import { Router } from 'express';
import { createLead, deleteLead, getDashboardStats, getLeadById, getLeads, updateLead } from '../controllers/lead.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/leads:
 *   get:
 *     summary: Get leads with search and filters
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of leads
 */
router.get('/', getLeads);

/**
 * @openapi
 * /api/leads:
 *   post:
 *     summary: Create a new lead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, company]
 *             properties:
 *               title:
 *                 type: string
 *               company:
 *                 type: string
 *               status:
 *                 type: string
 *               source:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lead created
 */
router.post('/', createLead);

router.get('/dashboard', getDashboardStats);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;
