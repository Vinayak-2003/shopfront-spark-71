// Reusable loading spinner component with enhanced animations

import { Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  variant?: "spinner" | "dots" | "ring";
}

export default function LoadingSpinner({ 
  size = "md", 
  className,
  text,
  variant = "spinner"
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <Circle 
                key={i} 
                className={cn(
                  "animate-bounce text-primary", 
                  sizeClasses[size],
                  i === 1 && "animation-delay-100",
                  i === 2 && "animation-delay-200"
                )} 
              />
            ))}
          </div>
        );
      case "ring":
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <div className={cn(
              "absolute inset-0 border-4 border-muted rounded-full"
            )}></div>
            <div className={cn(
              "absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"
            )}></div>
          </div>
        );
      case "spinner":
      default:
        return (
          <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        );
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      {renderSpinner()}
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}