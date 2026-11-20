import { Router } from 'express';
import {
  createInquiry,
  createPackage,
  deleteInquiry,
  deletePackage,
  getAdminStats,
  getDestinations,
  getInquiries,
  getPackages,
  subscribeNewsletter,
  updateInquiryStatus,
  updatePackage,
} from '../store';
import {
  requireAdminAuth,
  signAdminToken,
  verifyAdminCredentials,
} from '../middleware/auth';
import {
  validateEmail,
  validateInquiryPayload,
  validatePackagePayload,
} from '../../src/utils/travelLogic';
import type { InquiryStatus } from '../../src/types/travel';

export const apiRouter = Router();

// Public: Destinations
apiRouter.get('/destinations', async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const destinations = await getDestinations(search);
    res.json({ data: destinations });
  } catch (err) {
    console.error('[API] GET /destinations error:', err);
    res.status(500).json({ error: 'Unable to load destinations.' });
  }
});

// Public: Tour Packages with filtering
apiRouter.get('/packages', async (req, res) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

    const packages = await getPackages({ category, search, minPrice, maxPrice });
    res.json({ data: packages });
  } catch (err) {
    console.error('[API] GET /packages error:', err);
    res.status(500).json({ error: 'Unable to load packages.' });
  }
});

// Public: Submit Booking / Quick Inquiry
apiRouter.post('/inquiries', async (req, res) => {
  try {
    const validation = validateInquiryPayload(req.body ?? {});
    if (!validation.valid) {
      res.status(400).json({ error: 'Please correct the highlighted fields.', fieldErrors: validation.errors });
      return;
    }

    const created = await createInquiry(req.body);
    res.status(201).json({
      data: created,
      message: 'Your travel inquiry has been received. A Flytrox specialist will reach out shortly.',
    });
  } catch (err) {
    console.error('[API] POST /inquiries error:', err);
    res.status(500).json({ error: 'Could not save your inquiry. Please try again.' });
  }
});

// Public: Newsletter Subscription
apiRouter.post('/newsletter', async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    if (!validateEmail(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const result = await subscribeNewsletter(email);
    if (result.alreadySubscribed) {
      res.status(200).json({
        alreadySubscribed: true,
        message: 'This email is already subscribed to Flytrox travel updates.',
      });
      return;
    }

    res.status(201).json({
      alreadySubscribed: false,
      message: 'Welcome aboard! You are subscribed to seasonal fares and curated holiday offers.',
    });
  } catch (err) {
    console.error('[API] POST /newsletter error:', err);
    res.status(500).json({ error: 'Unable to complete subscription right now.' });
  }
});

// Admin: JWT Login
apiRouter.post('/admin/login', async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email.trim() || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const ok = await verifyAdminCredentials(email, password);
    if (!ok) {
      res.status(401).json({ error: 'Invalid admin email or password.' });
      return;
    }

    const token = signAdminToken(email);
    res.json({ token, admin: { email: email.trim().toLowerCase() } });
  } catch (err) {
    console.error('[API] POST /admin/login error:', err);
    res.status(500).json({ error: 'Sign-in service error.' });
  }
});

// Protected Admin Routes
apiRouter.get('/admin/stats', requireAdminAuth, async (_req, res) => {
  try {
    const stats = await getAdminStats();
    res.json({ data: stats });
  } catch (err) {
    console.error('[API] GET /admin/stats error:', err);
    res.status(500).json({ error: 'Unable to fetch dashboard statistics.' });
  }
});

apiRouter.get('/admin/inquiries', requireAdminAuth, async (_req, res) => {
  try {
    const inquiries = await getInquiries();
    res.json({ data: inquiries });
  } catch (err) {
    console.error('[API] GET /admin/inquiries error:', err);
    res.status(500).json({ error: 'Unable to fetch inquiries.' });
  }
});

apiRouter.patch('/admin/inquiries/:id', requireAdminAuth, async (req, res) => {
  try {
    const status = req.body?.status as InquiryStatus;
    if (status !== 'New' && status !== 'Contacted' && status !== 'Booked') {
      res.status(400).json({ error: 'Status must be New, Contacted, or Booked.' });
      return;
    }
    const updated = await updateInquiryStatus(req.params.id, status);
    if (!updated) {
      res.status(404).json({ error: 'Inquiry not found.' });
      return;
    }
    res.json({ data: updated });
  } catch (err) {
    console.error('[API] PATCH /admin/inquiries/:id error:', err);
    res.status(500).json({ error: 'Unable to update inquiry status.' });
  }
});

apiRouter.delete('/admin/inquiries/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await deleteInquiry(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Inquiry not found.' });
      return;
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error('[API] DELETE /admin/inquiries/:id error:', err);
    res.status(500).json({ error: 'Unable to delete inquiry.' });
  }
});

apiRouter.post('/admin/packages', requireAdminAuth, async (req, res) => {
  try {
    const validation = validatePackagePayload(req.body ?? {});
    if (!validation.valid) {
      res.status(400).json({ error: 'Invalid package fields.', fieldErrors: validation.errors });
      return;
    }
    const created = await createPackage(req.body);
    res.status(201).json({ data: created });
  } catch (err) {
    console.error('[API] POST /admin/packages error:', err);
    res.status(500).json({ error: 'Unable to create package.' });
  }
});

apiRouter.put('/admin/packages/:id', requireAdminAuth, async (req, res) => {
  try {
    const validation = validatePackagePayload(req.body ?? {});
    if (!validation.valid) {
      res.status(400).json({ error: 'Invalid package fields.', fieldErrors: validation.errors });
      return;
    }
    const updated = await updatePackage(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Package not found.' });
      return;
    }
    res.json({ data: updated });
  } catch (err) {
    console.error('[API] PUT /admin/packages/:id error:', err);
    res.status(500).json({ error: 'Unable to update package.' });
  }
});

apiRouter.delete('/admin/packages/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await deletePackage(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Package not found.' });
      return;
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error('[API] DELETE /admin/packages/:id error:', err);
    res.status(500).json({ error: 'Unable to delete package.' });
  }
});
