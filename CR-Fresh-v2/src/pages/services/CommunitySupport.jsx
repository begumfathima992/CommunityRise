import ServicePageLayout from '../../components/ServicePageLayout';
import { IMAGES } from '../../images';

export default function CommunitySupport() {
  return (
    <ServicePageLayout
      eyebrow="Our Services"
      title="Community Support"
      intro="Practical assistance to families facing hardship, including access to food, essential household items, and compassionate guidance through difficult life transitions."
      image={IMAGES.foodbankHandoff}
      imageAlt="Volunteers handing a food donation box to a family"
      points={[
        { title: 'Emergency Food Support', body: 'Access to food and essential household items for families facing an immediate crisis.' },
        { title: 'Guidance Through Transitions', body: 'Compassionate support through job loss, bereavement, or housing insecurity.' },
        { title: 'First Point of Contact', body: 'Often the first point of contact for families in crisis, designed to meet urgent need without delay.' },
        { title: 'No Unnecessary Bureaucracy', body: 'Support is designed to be accessed quickly, without unnecessary forms or red tape.' },
      ]}
      closingNote="Every day that passes without support is a day a family goes without food. This programme exists to close that gap this week, not at some distant point in the future."
    />
  );
}
