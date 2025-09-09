export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950" style={{ margin: '0 auto' }}>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
