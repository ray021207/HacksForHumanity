import Link from 'next/link';
import Icon from './Icon';
import { PLAN_HREF } from '@/lib/app-url';

/**
 * The closing CTA, sitting in the same mesh gradient as the app's start screen.
 *
 * Three layers, bottom to top:
 *   1. the panel-2 wash at 50%, filling the whole section — it is what pulls
 *      the mesh back towards the page instead of letting it read as a sticker;
 *   2. four soft ellipses in the mesh tints;
 *   3. one blur over that whole layer, not per-ellipse — blurring each one
 *      separately would keep their edges distinct where they overlap, which is
 *      exactly the seam a mesh gradient is not supposed to have.
 *
 * The ellipse layer is inset NEGATIVE so it spills past every edge before the
 * section clips it. Blur inside the box instead and the corners wash out to
 * flat panel-2, because there is no colour outside the frame to pull in.
 */
export default function BottomCta() {
	return (
		<section className="bg-panel-2/50 rounded-panel relative isolate overflow-hidden">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -inset-[25%] -z-10 blur-[100px]"
			>
				<span className="bg-mesh-mint/65 absolute top-[6%] left-[4%] h-[62%] w-[44%] rounded-full" />
				<span className="bg-mesh-lilac/65 absolute top-[2%] right-[8%] h-[58%] w-[40%] rounded-full" />
				<span className="bg-mesh-pink/60 absolute right-[14%] bottom-[4%] h-[66%] w-[52%] rounded-full" />
				<span className="bg-mesh-peach/55 absolute bottom-[10%] left-[10%] h-[48%] w-[36%] rounded-full" />
			</div>

			<div className="gap-s3 py-s2 lg:py-s1 flex flex-col items-center px-3 text-center lg:px-6">
				<h2 className="display text-d32 sm:text-d40 lg:text-d56 max-w-[20ch]">
					Tell us what&rsquo;s going on
				</h2>
				<p className="text-muted text-d16 max-w-[44ch]">
					We&rsquo;ll help you find the first words.
				</p>

				<Link
					href={PLAN_HREF}
					className="bg-ink rounded-pill text-d16 shadow-bar flex items-center gap-1 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
				>
					<Icon name="arrow" size={18} />
					Get started
				</Link>

				<p className="text-muted text-d16">Not therapy. Just a gentle place to start.</p>
			</div>
		</section>
	);
}
