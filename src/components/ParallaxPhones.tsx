'use client';

import Phone from './Phone';
import { useScrollDrift } from '@/hooks/useScrollDrift';

/** Base 8: six units of vertical travel at each extreme. */
const SHIFT = 48;
/** Degrees the pair opens by at each extreme. Small on purpose — past about
    six it stops reading as drift and starts reading as a spin. */
const TILT = 4;
/** Resting angles, matched to the comp. These must stay in sync with the
    rotate-[] classes below, which hold the pose before JS runs and under
    reduced motion. */
const UP_ANGLE = -4;
const DOWN_ANGLE = 15;

export default function ParallaxPhones() {
	const { panel, up, down } = useScrollDrift({
		shift: SHIFT,
		tilt: TILT,
		upAngle: UP_ANGLE,
		downAngle: DOWN_ANGLE
	});

	return (
		<div
			ref={panel}
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 hidden lg:block"
		>
			{/* `translate` and `rotate` are separate CSS properties, so the hook can
			    drive both without either clobbering the other — which is exactly
			    what writing a single `transform` here would do. */}
			<div
				ref={down}
				className="absolute top-[-14%] right-[2%] w-[300px] rotate-[15deg] transition-[translate,rotate] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
			>
				<Phone src="/images/app-voice.png" alt="" />
			</div>
			<div
				ref={up}
				className="absolute top-[20%] right-[22%] w-[300px] rotate-[-4deg] transition-[translate,rotate] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
			>
				<Phone src="/images/app-moment.png" alt="" />
			</div>
		</div>
	);
}
