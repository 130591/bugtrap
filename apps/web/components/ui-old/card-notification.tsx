import { Card } from "@/components/ui-old/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui-old/avatar"
import { Badge } from "@/components/ui-old/badge"
import { Button } from "@/components/ui-old/button"

interface NotificationCardProps {
  user: string
  avatarUrl?: string
  fallback: string
  message: string
  comment: string
  timeAgo: string
  expiresIn?: string
  onClose?: () => void
}

export function NotificationCard({
  user,
  avatarUrl,
  fallback,
  message,
  comment,
  timeAgo,
  expiresIn,
  onClose,
}: NotificationCardProps) {
  return (
    <Card className="flex gap-3 p-4 border bg-gray-50 hover:bg-gray-100 transition relative">
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl || ""} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>

        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-1 -right-1 h-5 w-5 mt-2 mr-1 text-gray-400 hover:text-red-500 cursor-pointer"
          onClick={onClose}
        >
          ✕
        </Button>
      </div>

      <div className="flex-1 text-[13px]">
        <p className="text-gray-800">
          <span className="font-semibold">{user}</span> {message}: <span className="text-blue-600">{comment}</span>
        </p>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">{timeAgo}</span>
          {expiresIn && (
            <Badge variant="secondary" className="text-[11px] px-2 py-0.5">Expira em {expiresIn}</Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
