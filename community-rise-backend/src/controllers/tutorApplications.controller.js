import * as service from '../services/tutorApplication.service.js';
import { sendSuccess } from '../utils/response.js';
import serializeTutorApplication from '../utils/serializeTutorApplication.js';

export async function submit(req, res) {
  await service.submitApplication(req.body, req.user);
  sendSuccess(res, {
    status: 201,
    message: "Thank you for applying to volunteer as a tutor. We've emailed you a confirmation and will be in touch soon.",
  });
}

export async function list(req, res) {
  const applications = await service.listApplications(req.query);
  sendSuccess(res, {
    message: 'Tutor applications',
    data: { applications: applications.map(serializeTutorApplication) },
  });
}

export async function update(req, res) {
  const application = await service.updateApplication(req.params.id, req.body, req.user);
  sendSuccess(res, {
    message: 'Application updated',
    data: { application: serializeTutorApplication(application) },
  });
}
