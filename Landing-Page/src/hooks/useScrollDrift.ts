'use client';

import { useEffect, useRef } from 'react';

/**
 * Scroll-linked drift for a pair of elements inside `panel`: `up` rises as the
 * panel crosses the viewport while `down` sinks, so the pair opens like a hinge
 * rather than sliding as one block.
 *
 * Position is scroll-linked, but the easing belongs to CSS: this only writes a
 * target `translate` and the caller's `transition-[translate]` eases toward it.
 * That lag is the point — a raw scroll-linked transform tracks the wheel exactly
 * and reads mechanical.
 *
 * Returns refs to attach; nothing re-renders, every write goes straight to the
 * style attribute.
 */
export function useScrollDrift(amplitude: number) {
	const panel = useRef<HTMLDivElement>(null);
	const up = useRef<HTMLDivElement>(null);
	const down = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Honour the OS setting: park both elements at rest and never listen.
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

			const shift = progress * amplitude;
			if (up.current) up.current.style.translate = `0 ${-shift}px`;
			if (down.current) down.current.style.translate = `0 ${shift}px`;
		}

		function schedule() {
			// One write per frame; scroll fires far more often than the screen
			// repaints and the extra writes would just be thrown away.
			if (!frame) frame = requestAnimationFrame(update);
		}

		update();
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule, { passive: true });
		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
		};
	}, [amplitude]);

	return { panel, up, down };
}
