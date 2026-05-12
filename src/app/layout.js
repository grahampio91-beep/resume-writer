export const metadata = {
  title: 'AI Resume Writer',
  description: 'Professional resumes in 60 seconds',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
