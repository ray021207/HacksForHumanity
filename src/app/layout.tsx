import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { DM_Serif_Display } from 'next/font/google';
import './globals.css';
import Footer from '@/components/Footer';
import Nav from '@/components/Nav';

// DM Serif Text, downloaded from Google Fonts and committed to src/fonts, so
// the build needs no network for fonts at all.
//
// Google's "latin" subset, which is Basic Latin PLUS General Punctuation
// (U+2000-206F) — so curly quotes and em dashes in a display heading render in
// the face rather than dropping to the Georgia fallback. It does NOT cover
// latin-ext; accented copy would fall back.
const dmSerifText = localFont({
	src: [
		{
			path: '../fonts/dm-serif-text-latin-400-normal.woff2',
			weight: '400',
			style: 'normal'
		},
		{
			path: '../fonts/dm-serif-text-latin-400-italic.woff2',
			weight: '400',
			style: 'italic'
		}
	],
	variable: '--font-dm-serif-text',
	display: 'swap'
});

// The body sans is deliberately NOT a webfont — see the note in globals.css.

// DM Serif Display, for the /plan wizard's headlines specifically — a
// different face from the landing page's DM Serif Text (wider, no italic
// companion needed here). Self-hosted at build time by next/font like the
// local one above.
const dmSerifDisplay = DM_Serif_Display({
	subsets: ['latin'],
	weight: '400',
	variable: '--font-dm-serif-display',
	display: 'swap'
});

export const metadata: Metadata = {
	title: 'Kin&d: Kin and Kind',
	description:
		'Personalized guidance for the conversations you want to have with your child.'
};

/**
 * One shell for the whole product: the landing page, the plan wizard and the
 * partner pages all sit inside the same header and footer. The wizard used to
 * be a separate app with its own palette; it now inherits these tokens like
 * every other route.
 */
export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html lang="en" className={`${dmSerifText.variable} ${dmSerifDisplay.variable} h-full`}>
			<body className="flex min-h-full flex-col antialiased">
				<Nav />
				{children}
				<Footer />
			</body>
		</html>
	);
}
