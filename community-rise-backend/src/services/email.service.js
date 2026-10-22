import env from '../config/env.js';
import { mailer, sendInBackground } from './mailer.service.js';
import {
  contactEmail,
  passwordResetEmail,
  tutorApplicationNotificationEmail,
  tutorApplicationReceivedEmail,
  verificationEmail,
} from '../templates/emails.js';
import { AVAILABILITY, DBS_STATUS, DELIVERY, LEARNER_GROUPS, TUTOR_SUBJECTS, labelsFor } from '../config/tutoring.js';

const teamInbox = () => env.CONTACT_RECIPIENT || env.GMAIL_USER;

const linkTo = (pathname, token) => {
  const url = new URL(pathname, env.appUrl);
  url.searchParams.set('token', token);
  return url.toString();
};

export function sendVerificationEmail(user, token) {
  const content = verificationEmail({ fullName: user.full_name, url: linkTo('/verify-email', token) });
  sendInBackground({ to: user.email, ...content }, { type: 'email_verification', userId: user.id });
}

export function sendPasswordResetEmail(user, token) {
  const content = passwordResetEmail({ fullName: user.full_name, url: linkTo('/reset-password', token) });
  sendInBackground({ to: user.email, ...content }, { type: 'password_reset', userId: user.id });
}

// Awaited: the contact form reports delivery failures back to the visitor.
export function sendContactMessage({ name, email, reason, message }) {
  return mailer.sendMail({
    from: { name: 'Community Rise Website' },
    to: teamInbox(),
    replyTo: email,
    ...contactEmail({ name, email, reason, message }),
  });
}

export function sendTutorApplicationEmails(application) {
  sendInBackground(
    { to: application.email, ...tutorApplicationReceivedEmail({ fullName: application.full_name }) },
    { type: 'tutor_application_received', applicationId: application.id },
  );

  const details = [
    ['Name', application.full_name],
    ['Email', application.email],
    ['Phone', application.phone],
    ['Subjects', labelsFor(TUTOR_SUBJECTS, application.subjects).join(', ')],
    ['Learners', labelsFor(LEARNER_GROUPS, application.learner_groups).join(', ')],
    ['Availability', labelsFor(AVAILABILITY, application.availability).join(', ')],
    ['Teaching', DELIVERY[application.delivery]],
    ['DBS', DBS_STATUS[application.dbs_status]],
    ['Experience', application.experience],
  ];
  sendInBackground(
    {
      to: teamInbox(),
      replyTo: application.email,
      ...tutorApplicationNotificationEmail({
        application,
        details,
        reviewUrl: new URL('/admin/tutor-applications', env.appUrl).toString(),
      }),
    },
    { type: 'tutor_application_notification', applicationId: application.id },
  );
}
