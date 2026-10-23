type HeaderProps = {
  title: string
}

function Header({ title }: HeaderProps) {
  return (
    <header className="header">
      <p className="eyebrow">TODAY'S WORKOUT</p>

      <h1>{title}</h1>

      <p className="date">
        {new Intl.DateTimeFormat("ja-JP", {
          month: "long",
          day: "numeric",
          weekday: "short",
        }).format(new Date())}
      </p>
    </header>
  )
}

export default Header
