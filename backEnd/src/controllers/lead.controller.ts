import { Request, Response } from 'express';
import { z } from 'zod';
import {
  createLeadForUser,
  deleteLeadForUser,
  getDashboardStatsForUser,
  getLeadForUser,
  listLeadsForUser,
  updateLeadForUser,
} from '../services/lead.service';

export const getLeads = async (req: Request, res: Response) => {
  try {
    const { search, status, source, page = '1', limit = '10' } = req.query;
    const result = await listLeadsForUser(req.user!.id, {
      search: typeof search === 'string' ? search : undefined,
      status: typeof status === 'string' ? status : undefined,
      source: typeof source === 'string' ? source : undefined,
      page: Number(page),
      limit: Number(limit),
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch leads' });
  }
};

export const createLead = async (req: Request, res: Response) => {
  try {
    const lead = await createLeadForUser(req.user!.id, req.body);
    res.status(201).json(lead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.flatten() });
    }
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to create lead' });
  }
};

export const getLeadById = async (req: Request, res: Response) => {
  try {
    const lead = await getLeadForUser(req.user!.id, Number(req.params.id));
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch {
    res.status(500).json({ message: 'Failed to fetch lead' });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const updated = await updateLeadForUser(req.user!.id, Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: 'Lead not found' });
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.flatten() });
    }
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to update lead' });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteLeadForUser(req.user!.id, Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete lead' });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await getDashboardStatsForUser(req.user!.id);
    res.json(stats);
  } catch {
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};
