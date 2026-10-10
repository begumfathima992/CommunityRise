import ServicePageLayout from '../../components/ServicePageLayout';
import { IMAGES } from '../../images';

export default function WellbeingInclusion() {
  return (
    <ServicePageLayout
      eyebrow="Our Services"
      title="Wellbeing & Inclusion"
      intro="Combating isolation among elderly and vulnerable residents through regular community gatherings, structured befriending schemes, and cultural events."
      image={IMAGES.elderlyVisit}
      imageAlt="Volunteers visiting an elderly resident at home"
      points={[
        { title: 'Regular Community Gatherings', body: 'Consistent opportunities to connect, reducing the isolation that many elderly residents experience.' },
        { title: 'Structured Befriending', body: 'One-to-one befriending schemes that provide genuine, reliable companionship.' },
        { title: 'Celebrating Our Diversity', body: 'Cultural events that celebrate the extraordinary diversity of our borough.' },
        { title: 'Loneliness Taken Seriously', body: 'We recognise that loneliness can be as damaging as material poverty, and we treat it with the same urgency.' },
      ]}
      closingNote="Loneliness can be as damaging as material poverty, and we treat it with the same seriousness and urgency."
    />
  );
}
