'use client';

import Link from 'next/link';
import Icon from './Icon';
import MobileSheet from './MobileSheet';
import SearchBar from './SearchBar';
import { useSearch } from './SearchContext';
import { useCollapseOnScroll } from '@/hooks/useCollapseOnScroll';
import { useScrolledPast } from '@/hooks/useScrolledPast';

export default function Nav() {
	const search = useSearch();
	const { compact, setCompact } = search;

	const scrolled = useScrolledPast(8);
	useCollapseOnScroll({ collapsed: compact, setCollapsed: setCompact });

	const account = (
		<button
			type="button"
			aria-label="Account"
			className="bg-field hover:bg-panel-2 text-ink rounded-pill grid size-5 shrink-0 place-items-center transition-colors"
		>
			<Icon name="user" size={18} />
		</button>
	);

	return (
		<>
			<header
				className={`bg-canvas sticky top-0 z-50 transition-shadow duration-200 ${
					scrolled ? 'shadow-[0_1px_0_0_var(--color-line)]' : ''
				}`}
			>
				<div className="mx-auto w-full max-w-[1360px] px-2 lg:px-3">
					{/* Desktop: two rows that merge into one once the bar collapses. */}
					<div className="hidden lg:block">
						{search.expanded ? (
							<>
								<div className="flex items-center justify-between py-2">
									<Link href="/" className="display text-d24">
										Kin&amp;d
									</Link>
									{account}
								</div>
								<div className="pb-3">
									<SearchBar />
								</div>
							</>
						) : (
							<div className="flex items-center gap-3 py-2">
								<Link href="/" className="display text-d24 shrink-0">
									Kin&amp;d
								</Link>
								<div className="min-w-0 flex-1">
									<SearchBar />
								</div>
								{account}
							</div>
						)}
					</div>

					{/* Mobile: the bar is a single trigger. Tapping it hands off to the
					    full-screen sheet, where the three fields stack. */}
					<div className="lg:hidden">
						{search.compact ? (
							<div className="flex items-center gap-2 py-2">
								<Link href="/" className="display text-d24 shrink-0">
									Kin&amp;d
								</Link>
								<button
									type="button"
									onClick={() => search.openSheet()}
									className="bg-surface rounded-pill shadow-bar flex min-w-0 flex-1 items-center gap-2 py-1 pr-1 pl-3"
								>
									<span className="text-d16 truncate font-medium">
										{search.summary ?? 'Start a plan'}
									</span>
									<span className="bg-accent rounded-pill ml-auto grid size-4 shrink-0 place-items-center text-white">
										<Icon name="search" size={16} />
									</span>
								</button>
							</div>
						) : (
							<>
								<div className="flex items-center justify-between py-2">
									<Link href="/" className="display text-d24">
										Kin&amp;d
									</Link>
									{account}
								</div>
								<button
									type="button"
									onClick={() => search.openSheet()}
									className="bg-surface rounded-card shadow-bar mb-2 flex w-full items-center gap-2 p-2 text-left"
								>
									<span className="bg-field rounded-pill grid size-5 shrink-0 place-items-center">
										<Icon name="search" size={18} />
									</span>
									<span className="flex min-w-0 flex-col">
										<span className="text-d16 font-semibold">
											{search.summary ?? "Who's at home"}
										</span>
										<span className="text-muted text-d16 truncate">
											Family type · Children · What&apos;s going on
										</span>
									</span>
								</button>
							</>
						)}
					</div>
				</div>
			</header>

			<MobileSheet />
		</>
	);
}
