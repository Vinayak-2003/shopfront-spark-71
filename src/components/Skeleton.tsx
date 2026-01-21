// Reusable skeleton loading component for better UX

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "text";
}

export default function Skeleton({
  className,
  variant = "rect"
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-muted rounded";

  const variantClasses = {
    rect: "w-full h-4",
    circle: "rounded-full w-10 h-10",
    text: "h-4 w-3/4"
  };

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )} 
    />
  );
}