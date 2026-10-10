'use client';

import { useEffect, useRef } from 'react';

type Drift = {
	/** Pixels of vertical travel at each extreme of the crossing. */
	shift: number;
	/** Degrees of rotation added at each extreme, on top of the resting angle. */
	tilt: number;
	/** Resting angle of the rising element, in degrees. */
	upAngle: number;
	/** Resting angle of the sinking element, in degrees. */
	downAngle: number;
};

/**
 * Scroll-linked drift for a pair of elements inside `panel`: `up` rises as the
 * panel crosses the viewport while `down` sinks, and each rotates a little
 * further from the other as it goes.
 *
 * The rotation is the part that makes it read. Translating alone moved the pair
 * in lockstep at a fixed angle, which looks like one rigid block being nudged
 * rather than two objects with their own weight.
 *
 * Position is scroll-linked, but the easing belongs to CSS: this only writes
 * target `translate` and `rotate` values, and the caller's transition eases
 * toward them. That lag earns its keep twice — a raw scroll-linked transform
 * tracks the wheel exactly and reads mechanical, and the 400ms tail is what
 * keeps the pair moving for a beat after the wheel stops instead of freezing
 * dead with it.
 *
 * Returns refs to attach; nothing re-renders, every write goes straight to the
 * style attribute.
 */
export function useScrollDrift({ shift, tilt, upAngle, downAngle }: Drift) {
	const panel = useRef<HTMLDivElement>(null);
	const up = useRef<HTMLDivElement>(null);
	const down = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Honour the OS setting: leave both elements on the resting angle their
		// Tailwind class already sets, and never listen.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let frame = 0;

		function update() {
			frame = 0;
			const el = panel.current;
			if (!el) return;

			const rect = el.getBoundingClientRect();
			const vh = window.innerHeight;

			// -1 while the panel is still below the fold, 0 as it centres, +1 once
			// it has climbed past the top. Normalising by (vh + height) spreads the
			// travel across the whole crossing, not just the middle.
			const raw = (vh / 2 - (rect.top + rect.height / 2)) / ((vh + rect.height) / 2);
			const progress = Math.max(-1, Math.min(1, raw));

			if (up.current) {
				up.current.style.translate = `0 ${-progress * shift}px`;
				up.current.style.rotate = `${upAngle - progress * tilt}deg`;
			}
			if (down.current) {
				down.current.style.translate = `0 ${progress * shift}px`;
				down.current.style.rotate = `${downAngle + progress * tilt}deg`;
			}
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
	}, [shift, tilt, upAngle, downAngle]);

	return { panel, up, down };
}
