type ArticleContentBodyShellProps = {
  children: React.ReactNode
}

export const ArticleContentBodyShell = ({ children }: ArticleContentBodyShellProps) => {
  return <div className="space-y-4">{children}</div>
}
