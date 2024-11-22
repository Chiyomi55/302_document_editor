import { useMemo } from "react"
import markdownit from 'markdown-it'

interface MarkdownViewerProps {
    content: string
    className?: string
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
    const md = useMemo(() => {
        const instance = new markdownit({
            html: true,
            linkify: true,
            typographer: true,
            breaks: true
        })

        instance.disable('fence')
        return instance
    }, [])

    const processedContent = useMemo(() => {
        return content
            ?.replace(/^```\w*\n/, '')
            .replace(/```$/, '')
            .trim()
    }, [content])

    return (
        <div
            className={`prose prose-sm p-5 [&_*]:text-foreground max-w-max`}
            dangerouslySetInnerHTML={{
                __html: md?.render(processedContent || '')
            }}
        />
    )
}