/** One sprite so stroke weight and cap style stay identical everywhere. */
export type IconName =
	| 'chevron'
	| 'plus'
	| 'minus'
	| 'mic'
	| 'arrow'
	| 'user'
	| 'search'
	| 'close'
	| 'check'
	| 'people'
	| 'lotus'
	| 'speech'
	| 'lock';

export default function Icon({
	name,
	size = 16,
	className = ''
}: {
	name: IconName;
	size?: number;
	className?: string;
}) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			className={className}
		>
			{name === 'chevron' && <path d="m6 9 6 6 6-6" />}
			{name === 'plus' && <path d="M12 5v14M5 12h14" />}
			{name === 'minus' && <path d="M5 12h14" />}
			{name === 'mic' && (
				<>
					<rect x="9" y="2" width="6" height="12" rx="3" />
					<path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
				</>
			)}
			{name === 'arrow' && <path d="M5 12h13M12 5l7 7-7 7" />}
			{name === 'user' && (
				<>
					<circle cx="12" cy="8" r="3.5" />
					<path d="M5 20a7 7 0 0 1 14 0" />
				</>
			)}
			{name === 'search' && (
				<>
					<circle cx="11" cy="11" r="7" />
					<path d="m20 20-3.5-3.5" />
				</>
			)}
			{name === 'close' && <path d="M6 6l12 12M18 6 6 18" />}
			{name === 'check' && <path d="m5 12.5 4.5 4.5L19 7" />}
			{name === 'people' && (
				<>
					<circle cx="12" cy="7" r="2.6" />
					<circle cx="5" cy="10" r="2" />
					<circle cx="19" cy="10" r="2" />
					<path d="M7.5 18a4.5 4.5 0 0 1 9 0M2 19a3.4 3.4 0 0 1 3.4-3M22 19a3.4 3.4 0 0 0-3.4-3" />
				</>
			)}
			{name === 'lotus' && (
				<>
					<path d="M12 20c-4 0-7-2.6-7-6 0-1 .3-1.9.8-2.7M12 20c4 0 7-2.6 7-6 0-1-.3-1.9-.8-2.7" />
					<path d="M12 20c-2.4-1.6-3.8-4-3.8-6.6 0-3 1.4-5.6 3.8-7.4 2.4 1.8 3.8 4.4 3.8 7.4 0 2.6-1.4 5-3.8 6.6Z" />
				</>
			)}
			{name === 'lock' && (
				<>
					<rect x="4.5" y="10.5" width="15" height="10" rx="3" />
					<path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
				</>
			)}
			{name === 'speech' && (
				<>
					<path d="M4 17V8a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H8l-4 3Z" />
					<path d="M19.5 8.5a4.5 4.5 0 0 1 0 7M21.5 6a7.5 7.5 0 0 1 0 12" />
				</>
			)}
		</svg>
	);
}
