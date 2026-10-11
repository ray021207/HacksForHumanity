'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const RESOURCES = [
	{ href: '/#how-it-works', label: 'How it works' },
	{ href: '/#mission', label: 'Our mission' },
	{ href: '/#faq', label: 'Questions parents ask' }
];

/**
 * Two link groups. The product is one page and one wizard, so a
 * five-column sitemap would be set dressing for routes that don't exist.
 *
 * Only shown on the landing page — the wizard and partner pages are their
 * own focused flows, and a sitemap footer at the bottom of a questionnaire
 * step is just an exit nobody asked for.
 */
export default function Footer() {
	const onLanding = usePathname() === '/';
	if (!onLanding) return null;

	return (
		<footer className="border-line mt-auto border-t">
			<div className="gap-s2 py-s2 lg:py-s1 mx-auto flex w-full max-w-[1360px] flex-col px-2 lg:px-3">
				<div className="gap-s2 flex flex-col sm:flex-row sm:justify-between">
					<div className="flex flex-col gap-1">
						<Link href="/" className="display text-d24 w-fit">
							Kin<span className="text-wordmark-amp">&amp;</span>d
						</Link>
						<p className="text-muted text-d16 max-w-[32ch]">
							Know what to say when it matters.
						</p>
					</div>

					<nav className="gap-s3 flex flex-col sm:flex-row sm:gap-9" aria-label="Footer">
						<div className="flex flex-col gap-2">
							<h2 className="text-d16 font-semibold">Resources</h2>
							<ul className="flex flex-col gap-1">
								{RESOURCES.map((item) => (
									<li key={item.href}>
										<Link
											href={item.href}
											className="text-muted text-d16 hover:text-ink transition-colors"
										>
											{item.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div className="flex flex-col gap-2">
							<h2 className="text-d16 font-semibold">Partners</h2>
							<ul className="flex flex-col gap-1">
								<li>
									<Link
										href="/partners"
										className="text-muted text-d16 hover:text-ink transition-colors"
									>
										Partner program
									</Link>
								</li>
								<li className="text-muted text-d16">For therapy offices</li>
							</ul>
						</div>
					</nav>
				</div>
			</div>
		</footer>
	);
}
