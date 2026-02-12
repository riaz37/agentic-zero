import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
    title: {
        default: 'Agentic Zero',
        template: '%s — Agentic Zero',
    },
    description:
        'Transform any website into an autonomous concierge experience. The Zero-Interaction Web Framework.',
}

const navbar = (
    <Navbar
        logo={
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                🧠 Agentic Zero
            </span>
        }
        projectLink="https://github.com/riaz37/agentic-zero"
    />
)

const footer = (
    <Footer>
        MIT {new Date().getFullYear()} © Agentic Zero.
    </Footer>
)

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" dir="ltr" suppressHydrationWarning>
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <body>
                <Layout
                    navbar={navbar}
                    pageMap={await getPageMap()}
                    docsRepositoryBase="https://github.com/riaz37/agentic-zero/tree/main/apps/docs"
                    footer={footer}
                >
                    {children}
                </Layout>
            </body>
        </html>
    )
}
