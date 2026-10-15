/**
 * Teaching resources content.
 *
 * Resources are requested by email (see REQUEST_EMAIL) until files are
 * published. To make a resource downloadable, add `href: '/files/…pdf'`
 * (or a full URL) to it and the card will show a download link instead.
 */

export const REQUEST_EMAIL = 'help@communityrise.org.uk';

export const TOPICS = [
  {
    id: 'kindness',
    title: 'Kindness and community',
    body: 'What makes a strong community, and how small acts of kindness ripple outwards.',
  },
  {
    id: 'food',
    title: 'Food, money and the cost of living',
    body: 'Understanding food insecurity and rising costs with empathy, without stigma.',
  },
  {
    id: 'wellbeing',
    title: 'Wellbeing and resilience',
    body: 'Naming feelings, coping with worries and looking after each other.',
  },
  {
    id: 'belonging',
    title: 'Belonging and inclusion',
    body: "Celebrating Newham's diversity and making sure everyone feels welcome.",
  },
  {
    id: 'youth',
    title: 'Youth voice and leadership',
    body: 'Helping young people plan projects and speak up for their community.',
  },
  {
    id: 'help',
    title: 'Knowing where to get help',
    body: 'Where to turn for advice and support, and how to help a friend find it.',
  },
];

export const AGE_GROUPS = ['7–11', '11–14', '14–18'];

export const FORMATS = ['Assembly', 'Lesson plan', 'Quick activity', 'Discussion guide', 'Project toolkit'];

export const RESOURCES = [
  {
    id: 'what-makes-a-community',
    title: 'What makes a community?',
    topic: 'kindness',
    ages: '7–11',
    format: 'Assembly',
    duration: '15 minutes',
    summary: 'A short assembly exploring the people and places that hold a community together, with a reflection to close.',
  },
  {
    id: 'small-acts-big-impact',
    title: 'Small acts, big impact',
    topic: 'kindness',
    ages: '7–11',
    format: 'Quick activity',
    duration: '10 minutes',
    summary: 'Pupils plan one act of kindness for the week and track how it spreads.',
  },
  {
    id: 'food-on-the-table',
    title: 'Food on the table',
    topic: 'food',
    ages: '11–14',
    format: 'Lesson plan',
    duration: '50 minutes',
    summary: 'Why some families struggle to afford food, how food banks work, and how to talk about it respectfully.',
  },
  {
    id: 'talking-about-worries',
    title: 'Talking about worries',
    topic: 'wellbeing',
    ages: '11–14',
    format: 'Lesson plan',
    duration: '45 minutes',
    summary: 'A gentle lesson on recognising worry, simple coping strategies and who to talk to.',
  },
  {
    id: 'building-resilience',
    title: 'Bouncing back: building resilience',
    topic: 'wellbeing',
    ages: '14–18',
    format: 'Discussion guide',
    duration: '40 minutes',
    summary: 'Scenario-based discussion on setbacks, support networks and looking after your wellbeing.',
  },
  {
    id: 'everyone-belongs-here',
    title: 'Everyone belongs here',
    topic: 'belonging',
    ages: '11–14',
    format: 'Lesson plan',
    duration: '50 minutes',
    summary: "Exploring identity, culture and belonging through the stories of Newham's many communities.",
  },
  {
    id: 'plan-a-community-project',
    title: 'Plan a community project',
    topic: 'youth',
    ages: '14–18',
    format: 'Project toolkit',
    duration: '3 × 50 minutes',
    summary: 'A step-by-step toolkit for young people to spot a local need, plan a response and share what they achieved.',
  },
  {
    id: 'where-to-turn',
    title: 'Where to turn: help in your community',
    topic: 'help',
    ages: '14–18',
    format: 'Lesson plan',
    duration: '50 minutes',
    summary: 'Mapping local support for housing, money, health and wellbeing, and practising how to ask for help.',
  },
];

export const WORKSHOPS = [
  'Wellbeing and resilience for young people',
  'Kindness in action: volunteering for young people',
  'Food, money and the cost of living',
  'Finding help and advice in Newham',
  'Youth leadership and community projects',
];

export const FAQS = [
  {
    q: 'Who are these resources for?',
    a: 'Teachers, teaching assistants, youth workers and anyone leading sessions with young people aged 7 to 18, including faith and community groups.',
  },
  {
    q: 'Do they fit the curriculum?',
    a: 'They are written with PSHE and citizenship lessons in mind, and work equally well in assemblies, tutor time and youth clubs.',
  },
  {
    q: 'How do I get a resource?',
    a: `Choose "Request this resource" on any card, or email ${REQUEST_EMAIL}, and we will send it to you.`,
  },
  {
    q: 'How do I hear about new resources?',
    a: 'Sign up below and tick the box to receive emails about new teaching resources. You can change this at any time in your account settings.',
  },
  {
    q: 'Can Community Rise run a session at our school or group?',
    a: 'We work with schools and community groups across Newham. Get in touch through our contact page to talk about a workshop.',
  },
];

export const topicTitle = (id) => TOPICS.find((topic) => topic.id === id)?.title ?? id;

export function requestHref(resource) {
  const subject = `Teaching resource request: ${resource.title}`;
  const body = `Hello Community Rise,\n\nPlease could you send me "${resource.title}" (${resource.format}, ages ${resource.ages}).\n\nName:\nSchool or organisation:\n\nThank you.`;
  return `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
