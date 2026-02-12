import { generateStaticParamsFor, importPage } from 'nextra/pages'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export default async function Page(props: {
    params: Promise<{ mdxPath: string[] }>
}) {
    const params = await props.params
    const { default: MDXContent } = await importPage(params.mdxPath)
    return <MDXContent {...props} />
}
