import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Start a plan — Kin&d',
	description:
		'Answer a few questions about your family, describe what happened, and get conversation starters for the moment you are in.'
};

// The wizard page itself is a client component, so its metadata lives here.
export default function PlanLayout({ children }: LayoutProps<'/plan'>) {
	return children;
}
