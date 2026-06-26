import { z } from 'zod';
import prisma from '../utils/prisma';

const leadSchema = z.object({
  title: z.string().min(2),
  company: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  value: z.number().optional(),
  notes: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const listLeadsForUser = async (userId: number, filters: { search?: string; status?: string; source?: string; page?: number; limit?: number }) => {
  const { search, status, source, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { userId };
  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } },
      { company: { contains: String(search), mode: 'insensitive' } },
      { email: { contains: String(search), mode: 'insensitive' } },
    ];
  }
  if (status) where.status = String(status);
  if (source) where.source = String(source);

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.lead.count({ where }),
  ]);

  return { leads, total, page, limit };
};

export const createLeadForUser = async (userId: number, input: unknown) => {
  const data = leadSchema.parse(input);
  return prisma.lead.create({
    data: {
      ...data,
      userId,
      email: data.email || null,
      value: data.value ?? null,
    },
  });
};

export const getLeadForUser = async (userId: number, leadId: number) => {
  return prisma.lead.findFirst({ where: { id: leadId, userId } });
};

export const updateLeadForUser = async (userId: number, leadId: number, input: unknown) => {
  const data = leadSchema.partial().parse(input);
  const existing = await prisma.lead.findFirst({ where: { id: leadId, userId } });
  if (!existing) return null;

  await prisma.lead.update({ where: { id: leadId }, data });
  return prisma.lead.findUnique({ where: { id: leadId } });
};

export const deleteLeadForUser = async (userId: number, leadId: number) => {
  const existing = await prisma.lead.findFirst({ where: { id: leadId, userId } });
  if (!existing) return false;

  await prisma.lead.delete({ where: { id: leadId } });
  return true;
};

export const getDashboardStatsForUser = async (userId: number) => {
  const [totalLeads, newLeads, contactedLeads, convertedLeads] = await Promise.all([
    prisma.lead.count({ where: { userId } }),
    prisma.lead.count({ where: { userId, status: 'new' } }),
    prisma.lead.count({ where: { userId, status: 'contacted' } }),
    prisma.lead.count({ where: { userId, status: 'converted' } }),
  ]);

  return { totalLeads, newLeads, contactedLeads, convertedLeads };
};
