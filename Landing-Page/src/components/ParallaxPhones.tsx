'use client';

import Phone from './Phone';
import { useScrollDrift } from '@/hooks/useScrollDrift';

/** Base 8: six units of travel at each extreme. */
const AMPLITUDE = 48;

/**
 * The two phones drift in opposite directions as the panel crosses the
 * viewport — left up, right down — so the pair opens like a hinge rather than
 * sliding as one block. The scroll maths, the frame throttle and the
 * reduced-motion opt-out all live in useScrollDrift.
 */
export default function ParallaxPhones() {
	const { panel, up, down } = useScrollDrift(AMPLITUDE);

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
				ref={down}
				className="absolute top-[-14%] right-[2%] w-[300px] rotate-[15deg] transition-[translate] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
			>
				<Phone src="/images/app-voice.png" alt="" />
			</div>
			<div
				ref={up}
				className="absolute top-[20%] right-[22%] w-[300px] rotate-[-4deg] transition-[translate] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
			>
				<Phone src="/images/app-moment.png" alt="" />
			</div>
		</div>
	);
}
