import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

// Image imports (Vite asset handling)
import reviewMarcus from "@/assets/review-marcus.png";
import reviewAlex from "@/assets/review-alex.png";
import reviewJordan from "@/assets/review-jordan.png";

interface Review {
  id: string;
  beforeSrc: string;
  afterSrc: string;
  rating: number;
  usedMonths: number;
  text: string;
  name: string;
  age: number;
}

const reviews: Review[] = [
  {
    id: "1",
    beforeSrc: reviewMarcus,
    afterSrc: reviewMarcus,
    rating: 5,
    usedMonths: 3,
    text: "My skin cleared up completely and my jawline is way more defined. People keep asking what I changed. This literally transformed how I see myself.",
    name: "Marcus",
    age: 24
  },
  {
    id: "2",
    beforeSrc: reviewAlex,
    afterSrc: reviewAlex,
    rating: 5,
    usedMonths: 2,
    text: "I was skeptical at first but the results speak for themselves. Lost face fat, better skin texture, and way more confidence. Best decision I made this year.",
    name: "Alex",
    age: 26
  },
  {
    id: "3",
    beforeSrc: reviewJordan,
    afterSrc: reviewJordan,
    rating: 5,
    usedMonths: 4,
    text: "The acne that plagued me for years is finally gone. My face structure looks sharper and I actually like taking photos now. Life-changing honestly.",
    name: "Jordan",
    age: 22
  }
];

export function BeforeAfterReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth;
      const index = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(index);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "fill-accent text-accent"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="mb-8">
      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-full snap-start"
          >
            <div className="glass rounded-2xl p-5 border border-border/50">
              {/* Title */}
              <h3 className="text-sm font-bold text-primary mb-4 tracking-wide uppercase">
                ⭐ Star Reviews
              </h3>

              {/* Review Image */}
              <div className="mb-4">
                <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-surface border border-border relative flex items-center justify-center">
                  {review.id === "1" || review.id === "2" || review.id === "3" ? (
                    <img
                      src={review.beforeSrc}
                      alt="Transformation"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-muted/60 to-muted flex items-center justify-center">
                      <span className="text-5xl opacity-70">😐</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center justify-between mb-3">
                <StarRating rating={review.rating} />
                <span className="text-[10px] text-muted-foreground">
                  Used MyPepMaxx for {review.usedMonths} {review.usedMonths === 1 ? "month" : "months"}
                </span>
              </div>

              {/* Review Text */}
              <p className="text-sm text-foreground/90 leading-relaxed mb-3 italic">
                "{review.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {review.name}, {review.age}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {reviews.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const container = scrollContainerRef.current;
              if (container) {
                container.scrollTo({
                  left: index * container.offsetWidth,
                  behavior: "smooth"
                });
              }
            }}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex
                ? "w-6 bg-primary"
                : "w-1.5 bg-muted-foreground/30"
            }`}
            aria-label={`Go to review ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
