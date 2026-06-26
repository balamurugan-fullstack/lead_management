import { z } from 'zod';
import prisma from '../utils/prisma';

const leadSchemaBase = z.object({
  name: z.string().trim().optional(),
  title: z.string().trim().optional(),
  company: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'won', 'lost', 'converted']).optional(),
  source: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const leadSchema = leadSchemaBase.superRefine((data, ctx) => {
  if (!data.name?.trim() && !data.title?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['name'], message: 'Name is required' });
  }
  if (!data.company?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['company'], message: 'Company is required' });
  }
});

const partialLeadSchema = leadSchemaBase.partial().superRefine((data, ctx) => {
  if (data.name !== undefined && !data.name.trim() && data.title !== undefined && !data.title.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['name'], message: 'Name is required' });
  }
  if (data.company !== undefined && !data.company.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['company'], message: 'Company is required' });
  }
});

export type LeadInput = z.infer<typeof leadSchemaBase>;

const toLeadResponse = (lead: {
  id: number;
  title: string;
  company: string;
  email: string | null;
  phone: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}) => ({
  id: lead.id,
  name: lead.title,
  company: lead.company,
  email: lead.email,
  phone: lead.phone,
  status: lead.status,
  source: lead.source,
  notes: lead.notes,
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
  userId: lead.userId,
});

export const listLeadsForUser = async (userId: number, filters: { search?: string; status?: string; source?: string; page?: number; limit?: number }) => {
  const { search, status, source, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { userId };
  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } },
      { company: { contains: String(search), mode: 'insensitive' } },
      { email: { contains: String(search), mode: 'insensitive' } },
      { phone: { contains: String(search), mode: 'insensitive' } },
      { notes: { contains: String(search), mode: 'insensitive' } },
    ];
  }
  if (status) where.status = String(status);
  if (source) where.source = String(source);

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.lead.count({ where }),
  ]);

  return { leads: leads.map(toLeadResponse), total, page, limit };
};

export const createLeadForUser = async (userId: number, input: unknown) => {
  const data = leadSchema.parse(input);
  const name = (data.name ?? data.title ?? '').trim();
  const company = data.company?.trim() ?? '';
  const created = await prisma.lead.create({
    data: {
      title: name,
      company,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      status: data.status ?? 'new',
      source: data.source?.trim() || null,
      notes: data.notes?.trim() || null,
      userId,
    },
  });

  return toLeadResponse(created);
};

export const getLeadForUser = async (userId: number, leadId: number) => {
  const lead = await prisma.lead.findFirst({ where: { id: leadId, userId } });
  return lead ? toLeadResponse(lead) : null;
};

export const updateLeadForUser = async (userId: number, leadId: number, input: unknown) => {
  const data = partialLeadSchema.parse(input);
  const existing = await prisma.lead.findFirst({ where: { id: leadId, userId } });
  if (!existing) return null;

  const payload = {
    ...(data.name || data.title ? { title: (data.name ?? data.title ?? '').trim() } : {}),
    ...(data.company !== undefined ? { company: data.company?.trim() ?? '' } : {}),
    ...(data.email !== undefined ? { email: data.email?.trim() || null } : {}),
    ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
    ...(data.status ? { status: data.status } : {}),
    ...(data.source !== undefined ? { source: data.source?.trim() || null } : {}),
    ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
  };

  await prisma.lead.update({ where: { id: leadId }, data: payload });
  const updated = await prisma.lead.findUnique({ where: { id: leadId } });
  return updated ? toLeadResponse(updated) : null;
};

export const deleteLeadForUser = async (userId: number, leadId: number) => {
  const existing = await prisma.lead.findFirst({ where: { id: leadId, userId } });
  if (!existing) return false;

  await prisma.lead.delete({ where: { id: leadId } });
  return true;
};

export const getDashboardStatsForUser = async (userId: number) => {
  const [totalLeads, newLeads, contactedLeads, qualifiedLeads, wonLeads, lostLeads] = await Promise.all([
    prisma.lead.count({ where: { userId } }),
    prisma.lead.count({ where: { userId, status: 'new' } }),
    prisma.lead.count({ where: { userId, status: 'contacted' } }),
    prisma.lead.count({ where: { userId, status: 'qualified' } }),
    prisma.lead.count({ where: { userId, status: 'won' } }),
    prisma.lead.count({ where: { userId, status: 'lost' } }),
  ]);

  return { totalLeads, newLeads, contactedLeads, qualifiedLeads, wonLeads, lostLeads };
};
