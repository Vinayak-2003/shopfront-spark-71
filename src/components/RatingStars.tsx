import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export default function RatingStars({
  rating,
  size = "md",
  interactive = false,
  onRatingChange,
  className = ""
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index);
    }
  };

  return (
    <div className={`flex ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:fill-yellow-400 hover:text-yellow-400" : ""}`}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
}