import ServicePageLayout from '../../components/ServicePageLayout';
import { IMAGES } from '../../images';

export default function AdviceSignposting() {
  return (
    <ServicePageLayout
      eyebrow="Our Services"
      title="Advice & Signposting"
      intro="Helping residents navigate housing applications, welfare benefits, and local authority processes, so that no one feels lost or abandoned within a complex system."
      image={IMAGES.foodbankHall}
      imageAlt="Volunteers at a community food bank helping local residents"
      points={[
        { title: 'Housing Applications', body: 'Clear, practical guidance through housing application processes that can otherwise feel impossible to navigate alone.' },
        { title: 'Welfare Benefits', body: 'Help understanding and accessing the welfare support residents are legally entitled to.' },
        { title: 'Local Authority Processes', body: 'Support engaging with local authority systems, from initial enquiry through to resolution.' },
        { title: 'Signposting to Specialists', body: 'Where a need falls outside our direct remit, we connect residents to the right specialist service.' },
      ]}
      closingNote="No one feels lost or abandoned within a complex system that can otherwise feel impossible to navigate alone."
    />
  );
}
