import Image from 'next/image';

/** CSS bezel so the handoff only ever needs a flat screenshot, never a
    pre-rendered device mockup that would bake in its own corner radius. */
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
		<div className={`rounded-[44px] bg-[#111] p-[10px] shadow-pop ${className}`}>
			<div className="bg-panel-2 relative aspect-[1179/2556] overflow-hidden rounded-[36px]">
				<Image src={src} alt={alt} fill sizes="300px" className="object-cover" />
				<span
					aria-hidden="true"
					className="rounded-pill absolute top-[10px] left-1/2 h-[26px] w-[88px] -translate-x-1/2 bg-[#111]"
				/>
			</div>
		</div>
	);
}
