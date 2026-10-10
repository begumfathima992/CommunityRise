import { useState, useEffect } from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import { useDonationModal } from '../context/DonationModalContext';
import { useCountUp } from '../hooks/useCountUp';

const TIERS = [
  { amount: 20, impact: 'Provides emergency food support to a struggling family this very week.' },
  { amount: 50, impact: 'Funds a full advice session helping someone secure housing support they are legally entitled to.' },
  { amount: 100, impact: 'Sponsors a place on our youth mentorship programme for a full month.' },
];

function AnimatedAmount({ amount, active }) {
  const animated = useCountUp(amount, { trigger: active, duration: 450 });
  return <>&pound;{active ? animated : amount}</>;
}

export default function DonationModal() {
  const { isOpen, initialTier, closeModal } = useDonationModal();
  const [selected, setSelected] = useState(initialTier);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected(initialTier);
      setConfirmed(false);
    }
  }, [isOpen, initialTier]);

  return (
    <Modal show={isOpen} onHide={closeModal} centered size="lg">
      <Modal.Header closeButton style={{ background: 'var(--sky-deep)', color: 'var(--white)', border: 'none' }}>
        <Modal.Title style={{ fontFamily: 'var(--font-heading)' }}>
          {confirmed ? 'Thank you!' : 'Support Community Rise'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '32px' }}>
        {confirmed ? (
          <div>
            <p style={{ fontSize: 18 }}>
              You've chosen to give <strong>&pound;{TIERS[selected].amount}</strong> today. In a live
              version of this site, you'd now be taken to a secure payment page.
            </p>
            <p style={{ color: 'var(--muted)' }}>{TIERS[selected].impact}</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--muted)', marginBottom: 22 }}>
              Choose an amount to see exactly what it funds.
            </p>
            <Row className="g-3">
              {TIERS.map((t, i) => (
                <Col xs={4} key={t.amount}>
                  <Button
                    onClick={() => setSelected(i)}
                    className="w-100"
                    style={{
                      padding: '16px 0',
                      fontWeight: 700,
                      fontSize: 20,
                      borderRadius: 10,
                      background: selected === i ? 'var(--navajo)' : 'var(--pale)',
                      borderColor: selected === i ? 'var(--navajo)' : 'var(--line)',
                      color: 'var(--ink)',
                    }}
                  >
                    <AnimatedAmount amount={t.amount} active={selected === i} />
                  </Button>
                </Col>
              ))}
            </Row>
            <div style={{
              marginTop: 22, padding: '18px 20px', background: 'var(--pale)',
              borderRadius: 10, borderLeft: '4px solid var(--sky)',
            }}>
              <p style={{ margin: 0 }}>{TIERS[selected].impact}</p>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer style={{ border: 'none', padding: '0 32px 28px' }}>
        {confirmed ? (
          <Button className="btn-sky" onClick={closeModal}>Close</Button>
        ) : (
          <>
            <Button variant="link" onClick={closeModal} style={{ color: 'var(--muted)' }}>
              Cancel
            </Button>
            <Button className="btn-navajo" onClick={() => setConfirmed(true)}>
              Give &pound;{TIERS[selected].amount} today
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
