import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { AgenticClient } from '../components/AgenticClient'
import 'nextra-theme-docs/style.css'

export const metadata = {
    title: 'Agentic Zero - The Zero-Interaction Web Framework',
    description: 'The Agentic Zero SDK — Transform any website into an autonomous concierge experience.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const navbar = (
        <Navbar
            logo={<b>Agentic Zero</b>}
            projectLink="https://github.com/agentic-zero/framework"
        />
    )
    const footer = <Footer>Agentic Zero © {new Date().getFullYear()}</Footer>

    return (
        <html lang="en" dir="ltr" suppressHydrationWarning>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <body>
                <Layout
                    navbar={navbar}
                    pageMap={await getPageMap()}
                    docsRepositoryBase="https://github.com/agentic-zero/framework/tree/main/apps/docs"
                    footer={footer}
                >
                    <AgenticClient>
                        {children}
                    </AgenticClient>
                </Layout>
            </body>
        </html>
    )
}
