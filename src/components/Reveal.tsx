'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Settles its children into place the first time they scroll into view.
 *
 * The motion itself is the `.reveal` rule in globals.css; this only decides
 * when. One observer per instance, disconnected on the first intersection,
 * because a landing section that has already arrived should never animate
 * again on the way back up — re-triggering reads as a glitch, not as polish.
 *
 * `rootMargin` pulls the trigger line 10% up from the bottom of the viewport
 * so a section starts moving once it is properly on screen rather than the
 * instant its first pixel clears the fold.
 */
export default function Reveal({
	children,
	delay = 0,
	className = ''
}: {
	children: ReactNode;
	/** Milliseconds to hold before starting, for staggering siblings. */
	delay?: number;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [shown, setShown] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const io = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				setShown(true);
				io.disconnect();
			},
			{ rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
		);

		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			data-shown={shown}
			className={`reveal ${className}`}
			style={delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
		>
			{children}
		</div>
	);
}
