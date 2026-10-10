'use client';

import { useEffect, useRef } from 'react';
import Phone from './Phone';

/** Base 8: six units of travel at each extreme. */
const AMPLITUDE = 48;

/**
 * The two phones drift in opposite directions as the panel crosses the
 * viewport — left up, right down — so the pair opens like a hinge rather than
 * sliding as one block.
 *
 * Position is scroll-linked, but the easing is time-based: each scroll event
 * sets a new target and `translate` eases toward it over 400ms. That lag is the
 * point. A raw scroll-linked transform tracks the wheel exactly and reads
 * mechanical; letting it trail by a few frames is what makes it feel weighted.
 */
export default function ParallaxPhones() {
	const panel = useRef<HTMLDivElement>(null);
	const left = useRef<HTMLDivElement>(null);
	const right = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Honour the OS setting: park both phones at rest and never listen.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let frame = 0;

		function update() {
			frame = 0;
			const el = panel.current;
			if (!el) return;

			const rect = el.getBoundingClientRect();
			const vh = window.innerHeight;

			// -1 while the panel is still below the fold, 0 as it centres, +1 once
			// it has climbed past the top. Normalising by (vh + height) means the
			// travel is spread across the whole crossing, not just the middle.
			const raw = (vh / 2 - (rect.top + rect.height / 2)) / ((vh + rect.height) / 2);
			const progress = Math.max(-1, Math.min(1, raw));

			const shift = progress * AMPLITUDE;
			if (left.current) left.current.style.translate = `0 ${-shift}px`;
			if (right.current) right.current.style.translate = `0 ${shift}px`;
		}

		function onScroll() {
			// One write per frame; scroll fires far more often than the screen
			// repaints and the extra writes would just be thrown away.
			if (!frame) frame = requestAnimationFrame(update);
		}

		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, []);

	return (
		<div
			ref={panel}
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 hidden lg:block"
		>
			{/* `translate` and `rotate` are separate CSS properties, so the
			    parallax composes with each phone's tilt instead of clobbering it —
			    which is exactly what writing `transform` here would do. */}
			<div
				ref={right}
				className="absolute top-[-14%] right-[2%] w-[300px] rotate-[15deg] transition-[translate] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
			>
				<Phone src="/images/app-voice.png" alt="" />
			</div>
			<div
				ref={left}
				className="absolute top-[20%] right-[22%] w-[300px] rotate-[-4deg] transition-[translate] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
			>
				<Phone src="/images/app-moment.png" alt="" />
			</div>
		</div>
	);
}
