import Image from 'next/image';

/**
 * The supplied screens arrive already framed — bezel, notch, status bar and
 * drop shadow are baked into the PNG, on a transparent surround. So this draws
 * no chrome of its own; a CSS bezel here would sit outside the rendered one and
 * read as a double frame.
 *
 * All three renders share a 499:1024 ratio, which is what reserves the space
 * before the image loads.
 */
export default function Phone({
	src,
	alt,
	className = ''
}: {
	src: string;
	alt: string;
	className?: string;
}) {
	return (
		<div className={`relative aspect-[499/1024] ${className}`}>
			<Image src={src} alt={alt} fill sizes="(min-width: 1024px) 320px, 240px" />
		</div>
	);
}
