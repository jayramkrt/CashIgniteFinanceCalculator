import { Helmet } from 'react-helmet-async'

interface SeoHeadProps {
  title: string
  description: string
  canonical: string
  ogTitle?: string
}

export default function SeoHead({ title, description, canonical, ogTitle }: SeoHeadProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={ogTitle ?? title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={ogTitle ?? title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}
