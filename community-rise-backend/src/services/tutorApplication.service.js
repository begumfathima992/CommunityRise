import { Op } from 'sequelize';
import { OPEN_STATUSES } from '../config/tutoring.js';
import { TutorApplication } from '../models/index.js';
import AppError from '../utils/AppError.js';
import { sendTutorApplicationEmails } from './email.service.js';

export async function submitApplication(data, user) {
  const { website, agree_to_checks, consent, ...fields } = data;

  // Honeypot filled in: behave as if accepted, store nothing.
  if (website) return { accepted: true };

  const existing = await TutorApplication.findOne({
    where: { email: fields.email, status: { [Op.in]: OPEN_STATUSES } },
  });
  if (existing) {
    throw new AppError(409, 'We already have an application from this email address and will be in touch soon.', {
      email: ['We already have an application from this email address'],
    });
  }

  const now = new Date();
  const application = await TutorApplication.create({
    ...fields,
    user_id: user?.id ?? null,
    agreed_to_checks_at: now,
    consent_given_at: now,
  });

  sendTutorApplicationEmails(application);
  return { accepted: true, application };
}

export function listApplications({ status } = {}) {
  return TutorApplication.findAll({
    where: status ? { status } : {},
    order: [['created_at', 'DESC']],
    limit: 500,
  });
}

export async function updateApplication(id, changes, reviewer) {
  const application = await TutorApplication.findByPk(id);
  if (!application) throw new AppError(404, 'Application not found');

  const update = {};
  if (changes.status !== undefined) update.status = changes.status;
  if (changes.admin_notes !== undefined) update.admin_notes = changes.admin_notes || null;
  update.reviewed_at = new Date();
  update.reviewed_by = reviewer.id;

  await application.update(update);
  return application;
}
