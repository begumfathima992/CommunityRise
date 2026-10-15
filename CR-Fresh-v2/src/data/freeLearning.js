/**
 * Free tuition and IT courses currently offered by Community Rise.
 * Edit this list as courses change; the request form's course options
 * come from here.
 */

export const PROGRAMMES = [
  {
    id: 'academic',
    title: 'Free academic tuition',
    body: 'Support with schoolwork and exam preparation, from primary school through to GCSE.',
    courses: [
      { value: 'tuition_maths', label: 'Maths' },
      { value: 'tuition_english', label: 'English' },
      { value: 'tuition_science', label: 'Science' },
      { value: 'tuition_homework', label: 'Homework support (all subjects)' },
    ],
  },
  {
    id: 'it',
    title: 'Free IT courses',
    body: 'Practical computer skills for everyday life and work, from complete beginner upwards. A certificate is awarded on completion.',
    courses: [
      { value: 'it_digital_basics', label: 'Digital basics (computers, phones, email)' },
      { value: 'it_online_safety', label: 'Staying safe online' },
      { value: 'it_office_skills', label: 'Office skills (Word, Excel, Google Docs)' },
      { value: 'it_coding', label: 'Introduction to coding (Python)' },
    ],
  },
];

export const COURSES = PROGRAMMES.flatMap((programme) => programme.courses);
export const courseLabel = (value) => COURSES.find((course) => course.value === value)?.label ?? value;

export const HIGHLIGHTS = [
  'Free of charge',
  'Taught by an experienced instructor and IT engineer',
  'Online or in person in Newham',
  'Certificates for completed IT courses',
];

export const LEARNER_OPTIONS = [
  { value: 'myself', label: 'Myself' },
  { value: 'child', label: 'My child' },
];

export const CHILD_AGE_GROUPS = [
  { value: 'primary', label: 'Primary school (ages 5–11)' },
  { value: 'secondary_ks3', label: 'Secondary, Years 7–9 (ages 11–14)' },
  { value: 'secondary_gcse', label: 'GCSE, Years 10–11 (ages 14–16)' },
  { value: 'post_16', label: 'Sixth form or college (16–18)' },
];

export const MODE_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'in_person', label: 'In person in Newham' },
  { value: 'either', label: 'Either' },
];

export const labelOf = (options, value) => options.find((option) => option.value === value)?.label ?? value;
