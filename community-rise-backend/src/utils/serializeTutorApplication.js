// Admin view of a tutor application.
export default function serializeTutorApplication(application) {
  return {
    id: application.id,
    full_name: application.full_name,
    email: application.email,
    phone: application.phone,
    subjects: application.subjects,
    learner_groups: application.learner_groups,
    availability: application.availability,
    delivery: application.delivery,
    experience: application.experience,
    dbs_status: application.dbs_status,
    status: application.status,
    admin_notes: application.admin_notes,
    reviewed_at: application.reviewed_at,
    has_account: Boolean(application.user_id),
    created_at: application.created_at,
  };
}
