import { Helmet } from 'react-helmet-async'

interface SeoHeadProps {
  title: string
  description: string
  canonical: string
  ogTitle?: string
  faqs?: { q: string; a: string }[]
  noIndex?: boolean
}

export default function SeoHead({ title, description, canonical, ogTitle, faqs, noIndex }: SeoHeadProps) {
  const faqSchema = faqs && faqs.length > 0
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      })
    : null

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={ogTitle ?? title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={ogTitle ?? title} />
      <meta name="twitter:description" content={description} />
      {faqSchema && (
        <script type="application/ld+json">{faqSchema}</script>
      )}
    </Helmet>
  )
}
