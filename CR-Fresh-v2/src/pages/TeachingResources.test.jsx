import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import * as authApi from '../api/auth';
import * as usersApi from '../api/users';
import { AuthProvider } from '../context/AuthContext';
import { DonationModalProvider } from '../context/DonationModalContext';
import { RESOURCES } from '../data/teachingResources';
import { TEST_USER, apiError } from '../test/utils';
import TeachingResources from './TeachingResources';

vi.mock('../api/auth', () => ({ me: vi.fn(), logout: vi.fn() }));
vi.mock('../api/users', () => ({ updatePreferences: vi.fn() }));

beforeAll(() => {
  // jsdom lacks these browser APIs used by RevealBox and the topic links.
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.scrollIntoView = () => {};
});

beforeEach(() => {
  vi.mocked(authApi.me).mockRejectedValue(apiError(401, { success: false }));
});

function renderPage() {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/get-involved/teaching-resources']}>
      <AuthProvider>
        <DonationModalProvider>
          <TeachingResources />
        </DonationModalProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
  return user;
}

const resultsSection = () => document.getElementById('find-resources');
const resultTitles = () =>
  within(resultsSection())
    .queryAllByRole('heading', { level: 3 })
    .map((h) => h.textContent);

describe('Teaching resources page', () => {
  test('shows the sign-up heading with sign-up and log-in links for visitors', async () => {
    renderPage();
    const heading = await screen.findByRole('heading', { name: 'Sign-up to hear about the newest teaching resources' });
    const band = heading.closest('.signup-band');
    // react-bootstrap renders <Button as={Link}> as an <a role="button">.
    expect(await within(band).findByRole('button', { name: 'Sign up for updates' })).toHaveAttribute(
      'href',
      '/register?interest=teaching-resources',
    );
    expect(within(band).getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
  });

  test('lists every resource and filters by keyword, topic and age', async () => {
    const user = renderPage();
    await screen.findByRole('heading', { name: 'Find a resource' });
    expect(resultTitles()).toHaveLength(RESOURCES.length);

    await user.type(screen.getByLabelText('Search all resources'), 'food bank');
    expect(resultTitles()).toEqual(['Food on the table']);

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await user.selectOptions(screen.getByLabelText('Topic'), 'wellbeing');
    expect(resultTitles()).toEqual(['Talking about worries', 'Bouncing back: building resilience']);

    await user.selectOptions(screen.getByLabelText('Age group'), '14–18');
    expect(resultTitles()).toEqual(['Bouncing back: building resilience']);
    expect(screen.getByText('1 resource match your search')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Search all resources'), 'zzzz');
    expect(screen.getByText('No resources match your search.')).toBeInTheDocument();
  });

  test('topic cards filter the resource list', async () => {
    const user = renderPage();
    await screen.findByRole('heading', { name: 'Resources by topic' });
    const topicButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent.includes('about Belonging and inclusion'));
    await user.click(topicButton);
    expect(screen.getByLabelText('Topic')).toHaveValue('belonging');
    expect(resultTitles()).toEqual(['Everyone belongs here']);
  });

  test('resource cards offer a pre-filled email request', async () => {
    renderPage();
    const link = (await screen.findAllByRole('link', { name: /Request this resource: Food on the table/ }))[0];
    expect(link.getAttribute('href')).toMatch(/^mailto:help@communityrise\.org\.uk\?subject=Teaching%20resource%20request/);
  });

  test('logged-in users can opt in with one click', async () => {
    vi.mocked(authApi.me).mockResolvedValue({ success: true, data: { user: TEST_USER } });
    vi.mocked(usersApi.updatePreferences).mockResolvedValue({
      success: true,
      message: "You're signed up to hear about new teaching resources.",
      data: { user: { ...TEST_USER, teaching_updates_opt_in: true } },
    });
    const user = renderPage();

    await user.click(await screen.findByRole('button', { name: 'Email me new teaching resources' }));
    expect(usersApi.updatePreferences).toHaveBeenCalledWith({ teaching_updates: true });
    expect(await screen.findByText(/You're signed up, Amina/)).toBeInTheDocument();
  });

  test('already opted-in users see confirmation', async () => {
    vi.mocked(authApi.me).mockResolvedValue({
      success: true,
      data: { user: { ...TEST_USER, teaching_updates_opt_in: true } },
    });
    renderPage();
    expect(await screen.findByText(/You're signed up, Amina/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Change your email preferences' })).toHaveAttribute('href', '/account');
  });
});
