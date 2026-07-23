import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../layout/index.js';
import { EmptyState, Button } from '../../design-system/index.js';
import { Compass } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PageLayout title="Page Not Found" description="The page you are looking for does not exist.">
      <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: 'var(--space-8)' }}>
        <EmptyState
          icon={<Compass size={48} />}
          title="Lost in the block?"
          description="We couldn't find the page you were looking for. It may have been moved or deleted."
          action={
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          }
        />
      </div>
    </PageLayout>
  );
}
