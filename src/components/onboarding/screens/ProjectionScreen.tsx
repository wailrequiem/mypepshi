import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { OnboardingHeader } from "../OnboardingHeader";

interface ProjectionScreenProps {
  onNext: () => void;
  totalSteps: number;
  currentStep: number;
  projectedImprovement?: number;
  onBack?: () => void;
}

export function ProjectionScreen({ 
  onNext, 
  totalSteps, 
  currentStep,
  projectedImprovement = 49,
  onBack
}: ProjectionScreenProps) {
  const [animateChart, setAnimateChart] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateChart(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Chart data points - Week 1, 2, 3
  const dataPoints = [
    { x: 60, y: 110, week: "Week 1", label: "You will feel it" },
    { x: 150, y: 85, week: "Week 2", label: "You will see it" },
    { x: 240, y: 45, week: "Week 3", label: "Other will start notice it" },
  ];

  return (
    <PageContainer className="px-6 py-8 safe-top safe-bottom">
      <OnboardingHeader 
        current={currentStep} 
        total={totalSteps} 
        onBack={onBack}
        showBack={!!onBack}
      />
      
      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-muted-foreground text-sm mb-2">
            Based on your face scan and answers:
          </p>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            You will improve your attractiveness
          </h1>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold text-gradient">
              +{projectedImprovement}%
            </span>
            <span className="text-foreground font-medium">in 8 weeks*</span>
          </div>
          <p className="text-muted-foreground/60 text-xs mt-2">
            You will feel it — enough for others to notice
          </p>
        </motion.div>

        {/* Progress chart - Reference design match */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-black/50 rounded-3xl p-6 border border-border/30"
        >
          <svg 
            className="w-full h-64" 
            viewBox="0 0 300 160" 
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Drop shadow for speech bubbles */}
              <filter id="bubbleShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Vertical guide lines */}
            {dataPoints.map((point) => (
              <line
                key={`vline-${point.x}`}
                x1={point.x}
                y1={20}
                x2={point.x}
                y2={130}
                stroke="#ffffff"
                strokeWidth="1"
                opacity="0.1"
              />
            ))}

            {/* Bottom horizontal axis line */}
            <line
              x1="30"
              y1="130"
              x2="270"
              y2="130"
              stroke="#ffffff"
              strokeWidth="1"
              opacity="0.15"
            />

            {/* Smooth curve through points */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: animateChart ? 1 : 0 }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
              d={`M ${dataPoints[0].x},${dataPoints[0].y} C ${dataPoints[0].x + 40},${dataPoints[0].y - 10} ${dataPoints[1].x - 40},${dataPoints[1].y + 5} ${dataPoints[1].x},${dataPoints[1].y} C ${dataPoints[1].x + 40},${dataPoints[1].y - 5} ${dataPoints[2].x - 40},${dataPoints[2].y + 10} ${dataPoints[2].x},${dataPoints[2].y}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots and labels */}
            {dataPoints.map((point, index) => {
              // Calculate label position with clamping
              const labelWidth = point.label.length * 6 + 20;
              let labelX = point.x;
              
              // Clamp to chart bounds
              if (labelX - labelWidth / 2 < 20) {
                labelX = 20 + labelWidth / 2;
              } else if (labelX + labelWidth / 2 > 280) {
                labelX = 280 - labelWidth / 2;
              }
              
              const labelY = point.y - 30;
              const tailX = point.x;

              return (
                <motion.g
                  key={point.x}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: animateChart ? 1 : 0, 
                    scale: animateChart ? 1 : 0 
                  }}
                  transition={{ delay: 0.8 + index * 0.2, type: "spring", stiffness: 200 }}
                >
                  {/* Speech bubble */}
                  <g filter="url(#bubbleShadow)">
                    {/* Bubble background */}
                    <rect
                      x={labelX - labelWidth / 2}
                      y={labelY - 10}
                      width={labelWidth}
                      height={20}
                      rx="10"
                      fill="white"
                    />
                    
                    {/* Tail triangle */}
                    <path
                      d={`M ${tailX - 4},${labelY + 10} L ${tailX},${labelY + 16} L ${tailX + 4},${labelY + 10} Z`}
                      fill="white"
                    />
                    
                    {/* Label text */}
                    <text
                      x={labelX}
                      y={labelY + 2}
                      textAnchor="middle"
                      fill="black"
                      fontSize="11"
                      fontWeight="500"
                    >
                      {point.label}
                    </text>
                  </g>

                  {/* Hollow white ring dot */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="7"
                    fill="#000000"
                    stroke="white"
                    strokeWidth="2.5"
                  />
                </motion.g>
              );
            })}

            {/* X-axis labels */}
            {dataPoints.map((point) => (
              <text
                key={`xlabel-${point.x}`}
                x={point.x}
                y={145}
                textAnchor="middle"
                fill="#888888"
                fontSize="10"
                fontWeight="400"
              >
                {point.week}
              </text>
            ))}
          </svg>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="pb-4 pt-4"
      >
        <PrimaryButton onClick={onNext}>
          Continue
        </PrimaryButton>
      </motion.div>
    </PageContainer>
  );
}
