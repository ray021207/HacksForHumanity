import type { Metadata } from 'next';
import { Instrument_Serif, Inter } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import { SearchProvider } from '@/components/SearchContext';

// next/font self-hosts both faces at build time: no request to
// fonts.googleapis.com at runtime, and no layout shift while they load.
const instrumentSerif = Instrument_Serif({
	subsets: ['latin'],
	weight: '400',
	style: ['normal', 'italic'],
	variable: '--font-instrument-serif',
	display: 'swap'
});

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	display: 'swap'
});

export const metadata: Metadata = {
	title: 'Kin&d — know what to say when it matters',
	description:
		'Personalized guidance for the conversations you want to have with your child.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`}>
			<body className="antialiased">
				<SearchProvider>
					<Nav />
					{children}
				</SearchProvider>
			</body>
		</html>
	);
}
