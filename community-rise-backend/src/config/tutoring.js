// Options for volunteer tutor applications. The frontend mirrors these in
// CR-Fresh-v2/src/data/tutoring.js — keep the two in sync.
export const TUTOR_SUBJECTS = {
  maths: 'Maths',
  english: 'English',
  science: 'Science',
  esol: 'English for speakers of other languages (ESOL)',
  homework_help: 'Homework help (all subjects)',
  digital_basics: 'Digital basics (computers, phones, email)',
  online_safety: 'Staying safe online',
  office_skills: 'Office skills (Word, Excel, Google Docs)',
  coding: 'Coding (Scratch, Python)',
  web_development: 'Web development',
  it_careers: 'IT careers and CV support',
};

export const LEARNER_GROUPS = {
  children_5_11: 'Children (5–11)',
  young_people_11_16: 'Young people (11–16)',
  young_people_16_18: 'Young people (16–18)',
  adults: 'Adults',
  women: "Women's groups",
};

export const AVAILABILITY = {
  weekday_daytime: 'Weekday daytime',
  weekday_evening: 'Weekday evenings',
  weekend: 'Weekends',
};

export const DELIVERY = {
  online: 'Online',
  in_person: 'In person in Newham',
  either: 'Either',
};

export const DBS_STATUS = {
  enhanced_update_service: 'Enhanced DBS on the Update Service',
  enhanced_other: 'Enhanced DBS (not on the Update Service)',
  none: 'No current DBS check',
};

export const APPLICATION_STATUSES = ['new', 'contacted', 'approved', 'declined'];
export const OPEN_STATUSES = ['new', 'contacted'];

export const labelsFor = (map, keys) => keys.map((key) => map[key] ?? key);
