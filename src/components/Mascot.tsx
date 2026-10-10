export type MascotName = 'ghost' | 'star' | 'block';

/**
 * Each character drifts on its own clock. The delays are NEGATIVE, so every
 * one of them starts part-way into the cycle instead of all three lurching
 * off the same first frame — which is what gives a trio its loose, unchoreo-
 * graphed feel. The motion itself is defined once as `drift` in globals.css.
 */
const DRIFT_DELAY: Record<MascotName, string> = {
	ghost: '-0.6s',
	star: '-3.1s',
	block: '-5.4s'
};

/**
 * The drifting group every character's artwork sits in.
 *
 * It has to be a group INSIDE the svg rather than the svg itself: callers
 * position these with their own transform utilities (the trio nudges each
 * character with -rotate-6, translate-y and so on) and an animation on the
 * same element would win outright and flatten that arrangement.
 *
 * `fill-box` makes the rotation turn about the artwork's own centre; the SVG
 * default origin is the user-space corner, which swings the whole shape
 * through an arc instead of rocking it in place.
 */
const DRIFT_CLASS = 'animate-drift origin-center [transform-box:fill-box]';

/**
 * The three kin&d characters: a ghost, a star and a rounded block.
 *
 * They are vector rather than the source renders on purpose. They show up at
 * everything from 24px in a heading to 120px in the pricing block, and a PNG
 * big enough for the largest of those is a wasteful download for the smallest.
 * Vector also means one `color`-free component can sit on the cream canvas,
 * the accent card and the mesh gradient without a halo from a baked-in
 * background.
 *
 * Gradient ids are static, not generated. Several instances on one page do
 * produce duplicate ids, which browsers resolve to the first definition, and
 * since every definition here is identical that is a no-op. All of them use
 * the default objectBoundingBox units, so each shape still gets the gradient
 * mapped to its own box.
 */
export default function Mascot({
	name,
	size = 48,
	className = ''
}: {
	name: MascotName;
	size?: number;
	className?: string;
}) {
	const common = {
		width: size,
		height: size,
		'aria-hidden': true as const,
		className
	};

	if (name === 'ghost') {
		return (
			<svg {...common} viewBox="0 0 96 120" fill="none">
				<defs>
					<linearGradient id="kd-ghost-body" x1="0.18" y1="0.05" x2="0.78" y2="1">
						<stop offset="0" stopColor="#ffffff" />
						<stop offset="0.52" stopColor="#f4eff3" />
						<stop offset="1" stopColor="#d6c7d4" />
					</linearGradient>
					<radialGradient id="kd-shine" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
						<stop offset="1" stopColor="#ffffff" stopOpacity="0" />
					</radialGradient>
				</defs>

				<g className={DRIFT_CLASS} style={{ animationDelay: DRIFT_DELAY.ghost }}>
				{/* Up the left side, over the dome, then three scallops back along
				    the hem. The dips alternate so the hem reads as cloth rather
				    than as a row of identical teeth. */}
				<path
					d="M12 96V48C12 25.9 28.1 8 48 8C67.9 8 84 25.9 84 48V96C80 104 76 108 72 108C68 108 64 104 60 96C56 104 52 108 48 108C44 108 40 104 36 96C32 104 28 108 24 108C20 108 16 104 12 96Z"
					fill="url(#kd-ghost-body)"
				/>
				<ellipse
					cx="31"
					cy="36"
					rx="11"
					ry="16"
					transform="rotate(-24 31 36)"
					fill="url(#kd-shine)"
				/>
				{/* Both pupils on one line — they used to sit 4 units apart, which
				    read as a squint rather than as a face looking at you. */}
				<ellipse cx="38" cy="54" rx="5.2" ry="7" fill="#140a16" />
				<ellipse cx="58" cy="54" rx="5.2" ry="7" fill="#140a16" />
				</g>
			</svg>
		);
	}

	if (name === 'star') {
		return (
			<svg {...common} viewBox="0 0 112 112" fill="none">
				<defs>
					<linearGradient id="kd-star-body" x1="0.2" y1="0.08" x2="0.82" y2="0.95">
						<stop offset="0" stopColor="#f7d2c1" />
						<stop offset="0.5" stopColor="#efa98d" />
						<stop offset="1" stopColor="#d97f60" />
					</linearGradient>
					<radialGradient id="kd-shine" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
						<stop offset="1" stopColor="#ffffff" stopOpacity="0" />
					</radialGradient>
				</defs>

				<g className={DRIFT_CLASS} style={{ animationDelay: DRIFT_DELAY.star }}>
				{/* The points are rounded by stroking the path in its own fill
				    colour with a round join, which is a good deal less arithmetic
				    than arcing ten corners by hand and stays correct at any size. */}
				<path
					d="M46.3 17.2 L62.6 39.8 L89.9 34.8 L73.5 57.2 L86.6 81.7 L60.2 73.0 L41.0 93.1 L41.2 65.3 L16.1 53.2 L42.6 44.8 Z"
					fill="url(#kd-star-body)"
					stroke="url(#kd-star-body)"
					strokeWidth="16"
					strokeLinejoin="round"
				/>
				<ellipse
					cx="46"
					cy="40"
					rx="10"
					ry="14"
					transform="rotate(-28 46 40)"
					fill="url(#kd-shine)"
				/>
				<ellipse cx="50" cy="57" rx="4.6" ry="6.4" fill="#140a16" />
				<ellipse cx="66" cy="57" rx="4.6" ry="6.4" fill="#140a16" />
				</g>
			</svg>
		);
	}

	return (
		<svg {...common} viewBox="0 0 112 112" fill="none">
			<defs>
				<linearGradient id="kd-block-body" x1="0.15" y1="0.05" x2="0.85" y2="0.95">
					<stop offset="0" stopColor="#fbdcee" />
					<stop offset="0.5" stopColor="#f3b4dd" />
					<stop offset="1" stopColor="#e27cc2" />
				</linearGradient>
				<radialGradient id="kd-shine" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
					<stop offset="1" stopColor="#ffffff" stopOpacity="0" />
				</radialGradient>
			</defs>

			{/* The tilt stays an attribute on the outer group: a CSS animation on
			    the same element would replace it. */}
			<g transform="rotate(-9 56 56)">
				<g className={DRIFT_CLASS} style={{ animationDelay: DRIFT_DELAY.block }}>
				<rect x="10" y="10" width="92" height="92" rx="32" fill="url(#kd-block-body)" />
				<ellipse
					cx="36"
					cy="34"
					rx="13"
					ry="17"
					transform="rotate(-32 36 34)"
					fill="url(#kd-shine)"
				/>
				<ellipse cx="44" cy="56" rx="5" ry="7" fill="#140a16" />
				<ellipse cx="68" cy="56" rx="5" ry="7" fill="#140a16" />
				</g>
			</g>
		</svg>
	);
}

/** The three of them huddled, as on the premium screen. */
export function MascotTrio({ size = 108, className = '' }: { size?: number; className?: string }) {
	return (
		<div className={`flex items-end justify-center ${className}`} aria-hidden="true">
			<Mascot name="block" size={size * 0.62} className="translate-y-[6%] -rotate-6" />
			<Mascot name="ghost" size={size * 0.72} className="-ml-[6%]" />
			<Mascot name="star" size={size * 0.56} className="-ml-[8%] translate-y-[12%]" />
		</div>
	);
}
