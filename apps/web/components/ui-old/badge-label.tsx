interface LabelBadgeProps {
  mainLabel: string
  otherCount?: number
  colorClass?: string
}

export const LabelBadge = ({
  mainLabel,
  otherCount = 0,
  colorClass = "bg-blue-500",
}: LabelBadgeProps) => {
  return (
    <div className="flex items-center">
      <div
        className={`relative px-2 py-1 text-white text-xs font-medium ${colorClass} text-[11px] rounded-l-md`}
        style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%)" }}
      >
        {mainLabel}
        {otherCount > 0 && (
          <span className="ml-1 opacity-80">+{otherCount}</span>
        )}
      </div>
    </div>
  )
}
