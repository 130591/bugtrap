interface AvatarInitialsProps {
  name: string
  color?: string
}

export const AvatarInitials = ({ name, color = 'bg-blue-500' }: AvatarInitialsProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${color} text-[10px]`}
      title={name}
    >
      {initials}
    </div>
  )
}
