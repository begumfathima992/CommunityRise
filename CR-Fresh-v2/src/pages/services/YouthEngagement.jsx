import ServicePageLayout from '../../components/ServicePageLayout';
import { IMAGES } from '../../images';

export default function YouthEngagement() {
  return (
    <ServicePageLayout
      eyebrow="Our Services"
      title="Youth Engagement"
      intro="Safe, structured spaces for young people to learn new skills, build genuine confidence, and access mentorship from positive role models."
      image={IMAGES.youthTutoring}
      imageAlt="A volunteer tutoring a young person in a classroom"
      points={[
        { title: 'Safe, Structured Spaces', body: 'Environments designed specifically for young people to learn, grow, and be heard.' },
        { title: 'Real Mentorship', body: 'Access to mentorship from positive role models who understand the realities young people face.' },
        { title: 'Skills for the Future', body: 'Practical skill-building that opens doors to real opportunity and purpose.' },
        { title: 'A Path Away From Exclusion', body: 'Helping steer the next generation away from exclusion and exploitation, towards genuine opportunity.' },
      ]}
      closingNote="Steering the next generation away from exclusion, exploitation, and despair, and towards real opportunity and purpose."
    />
  );
}
