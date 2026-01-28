"use client";

interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  height?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "yellow" | "red";
}

export default function ProgressBar({
  percentage,
  showLabel = true,
  height = "md",
  color = "blue",
}: ProgressBarProps) {
  const getColor = () => {
    if (color !== "blue") return color;
    if (percentage >= 75) return "green";
    if (percentage >= 50) return "yellow";
    if (percentage >= 25) return "orange";
    return "red";
  };

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    red: "bg-red-600",
  };

  const actualColor = getColor();

  return (
    <div className="flex items-center gap-3 w-full">
      <div
        className={`flex-1 bg-gray-200 rounded-full ${heightClasses[height]}`}
      >
        <div
          className={`${heightClasses[height]} rounded-full transition-all duration-300 ${colorClasses[actualColor as keyof typeof colorClasses]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-gray-700 min-w-[45px] text-right">
          {percentage}%
        </span>
      )}
    </div>
  );
}
