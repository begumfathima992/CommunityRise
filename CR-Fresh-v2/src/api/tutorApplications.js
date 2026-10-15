import api from './client';

const body = (request) => request.then((response) => response.data);

export const submitApplication = (payload) => body(api.post('/tutor-applications', payload));

export const listApplications = (status) =>
  body(api.get('/tutor-applications', { params: status ? { status } : undefined }));

export const updateApplication = (id, changes) => body(api.patch(`/tutor-applications/${id}`, changes));
