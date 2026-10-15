/**
 * Volunteer tutor options and page content.
 * Option keys must match community-rise-backend/src/config/tutoring.js.
 */

export const SUBJECT_GROUPS = [
  {
    id: 'academic',
    title: 'Academic tuition',
    body: 'Help children and young people with schoolwork, from primary basics to GCSE revision, or help adults improve their English.',
    subjects: [
      { value: 'maths', label: 'Maths' },
      { value: 'english', label: 'English' },
      { value: 'science', label: 'Science' },
      { value: 'esol', label: 'English for speakers of other languages (ESOL)' },
      { value: 'homework_help', label: 'Homework help (all subjects)' },
    ],
  },
  {
    id: 'it',
    title: 'IT and digital skills',
    body: 'Help people get online with confidence, build skills for work, or take their first steps in coding.',
    subjects: [
      { value: 'digital_basics', label: 'Digital basics (computers, phones, email)' },
      { value: 'online_safety', label: 'Staying safe online' },
      { value: 'office_skills', label: 'Office skills (Word, Excel, Google Docs)' },
      { value: 'coding', label: 'Coding (Scratch, Python)' },
      { value: 'web_development', label: 'Web development' },
      { value: 'it_careers', label: 'IT careers and CV support' },
    ],
  },
];

export const SUBJECTS = SUBJECT_GROUPS.flatMap((group) => group.subjects);

export const LEARNER_GROUPS = [
  { value: 'children_5_11', label: 'Children (5–11)' },
  { value: 'young_people_11_16', label: 'Young people (11–16)' },
  { value: 'young_people_16_18', label: 'Young people (16–18)' },
  { value: 'adults', label: 'Adults' },
  { value: 'women', label: "Women's groups" },
];

export const AVAILABILITY = [
  { value: 'weekday_daytime', label: 'Weekday daytime' },
  { value: 'weekday_evening', label: 'Weekday evenings' },
  { value: 'weekend', label: 'Weekends' },
];

export const DELIVERY = [
  { value: 'online', label: 'Online' },
  { value: 'in_person', label: 'In person in Newham' },
  { value: 'either', label: 'Either' },
];

export const DBS_STATUS = [
  { value: 'enhanced_update_service', label: 'I have an enhanced DBS check on the Update Service' },
  { value: 'enhanced_other', label: 'I have an enhanced DBS check, not on the Update Service' },
  { value: 'none', label: "I don't have a current DBS check" },
];

export const APPLICATION_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
];

const toMap = (options) => Object.fromEntries(options.map((o) => [o.value, o.label]));
export const LABELS = {
  subjects: toMap(SUBJECTS),
  learner_groups: toMap(LEARNER_GROUPS),
  availability: toMap(AVAILABILITY),
  delivery: toMap(DELIVERY),
  dbs_status: toMap(DBS_STATUS),
  status: toMap(APPLICATION_STATUSES),
};
export const labelList = (field, values = []) => values.map((v) => LABELS[field][v] ?? v).join(', ');

export const BENEFITS = [
  { title: 'Flexible', body: 'Online or in person, weekdays or weekends: as little as an hour a week.' },
  { title: 'Training and support', body: 'Safeguarding training, an induction, and a chance to shadow a session before you start.' },
  { title: 'Certificate and reference', body: 'A volunteering certificate, and a reference for your CV or teaching applications.' },
  { title: 'Real impact', body: 'Help a child catch up, an adult find work, or a family get online, right here in Newham.' },
];

export const STEPS = [
  { title: 'Apply', body: 'Tell us what you could teach and when. It takes about five minutes.' },
  { title: 'Have a chat', body: 'We call or video-call you for an informal conversation about your skills and availability.' },
  { title: 'Checks', body: 'We ask for two references and arrange an enhanced DBS check if you do not already have one.' },
  { title: 'Training', body: 'Complete safeguarding training and shadow one of our sessions.' },
  { title: 'Start teaching', body: 'We match you with learners or a class, and support you as you go.' },
];

export const SAFEGUARDING = [
  'Every tutor has an enhanced DBS check and two references before teaching.',
  'All tutors complete safeguarding training as part of their induction.',
  'Children are never taught one-to-one without another adult present or able to see the session.',
  'Online sessions run through Community Rise, not personal accounts or numbers.',
];

export const TUTOR_FAQS = [
  {
    q: 'Do I need a teaching qualification?',
    a: 'No. Good subject knowledge, patience and reliability matter most. Qualified teachers and IT professionals are very welcome, and we provide training and support for everyone.',
  },
  {
    q: 'How much time do I need to give?',
    a: 'As little as an hour a week. We plan sessions in blocks so learners have consistency, and we fit around your availability.',
  },
  {
    q: 'Can I tutor online?',
    a: 'Yes. Many sessions run online. You can also teach in person in Newham, or do both.',
  },
  {
    q: 'What if I do not have a DBS check?',
    a: 'That is fine. We will arrange an enhanced DBS check for you as part of joining.',
  },
  {
    q: 'Will I get a certificate?',
    a: 'Yes. Volunteer tutors receive a volunteering certificate, and we are happy to provide a reference.',
  },
];
