export function TherapistFooter() {
  return (
    <footer
      className="flex-shrink-0 border-t border-iris-900/15 bg-surface-0/80 backdrop-blur-sm px-4 py-2.5 text-center"
      role="contentinfo"
    >
      <p className="font-sans text-[0.6rem] text-text-muted leading-relaxed">
        IRIS is a wellness companion, not a therapist or medical provider.
        If you need immediate help, call{' '}
        <a
          href="tel:988"
          className="text-iris-400 hover:text-iris-300 underline underline-offset-2 transition-colors"
        >
          988
        </a>{' '}
        or{' '}
        <a
          href="tel:911"
          className="text-iris-400 hover:text-iris-300 underline underline-offset-2 transition-colors"
        >
          911
        </a>
        .
      </p>
    </footer>
  )
}
