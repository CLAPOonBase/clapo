"use client";

import React, { useState, useMemo } from "react";

type Period = "day" | "month" | "year";

const WIDTH = 100;
const HEIGHT = 50;
const PADDING = 2;

const DualLineChart: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("day");

  const generateData = (
    period: Period
  ): { yesData: number[]; noData: number[] } => {
    const dataPoints = period === "day" ? 24 : period === "month" ? 30 : 12;
    const yesData: number[] = [];
    const noData: number[] = [];

    for (let i = 0; i < dataPoints; i++) {
      const baseYes = 60 + Math.sin(i * 0.3) * 20 + Math.random() * 15;
      const baseNo = 40 + Math.cos(i * 0.2) * 15 + Math.random() * 10;

      yesData.push(Math.max(10, Math.min(95, baseYes)));
      noData.push(Math.max(5, Math.min(90, baseNo)));
    }

    return { yesData, noData };
  };

  const { yesData, noData } = useMemo(
    () => generateData(selectedPeriod),
    [selectedPeriod]
  );

  const createPath = (
    data: number[],
    width: number,
    height: number
  ): string => {
    const xStep = (width - PADDING * 2) / (data.length - 1);
    const yScale = (height - PADDING * 2) / 100;
    let path = `M${PADDING},${height - PADDING - data[0] * yScale}`;

    for (let i = 1; i < data.length; i++) {
      const x = PADDING + i * xStep;
      const y = height - PADDING - data[i] * yScale;
      path += ` L${x},${y}`;
    }

    return path;
  };

  const createFillPath = (
    data: number[],
    width: number,
    height: number
  ): string => {
    const path = createPath(data, width, height);
    return `${path} L${width - PADDING},${height - PADDING} L${PADDING},${
      height - PADDING
    } Z`;
  };

  const getTimeLabels = (period: Period): string[] => {
    switch (period) {
      case "day":
        return ["00:00", "06:00", "12:00", "18:00", "24:00"];
      case "month":
        return ["Week 1", "Week 2", "Week 3", "Week 4"];
      case "year":
        return ["Jan", "Mar", "Jun", "Sep", "Dec"];
      default:
        return [];
    }
  };

  const getCurrentValues = (): { yes: string; no: string } => {
    const yesValue = yesData[yesData.length - 1];
    const noValue = noData[noData.length - 1];
    return { yes: yesValue.toFixed(1), no: noValue.toFixed(1) };
  };

  const currentValues = getCurrentValues();
  const timeLabels = getTimeLabels(selectedPeriod);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-white text-[8px] font-medium">
              Fed maintain rate {currentValues.yes}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-white text-[8px] font-medium">
              Cut {currentValues.yes}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-white text-[8px] font-medium">
              cut {currentValues.no}%
            </span>
          </div>
        </div>

        <div className="flex absolute bottom-0 left-[40%] bg-dark-800">
          {(["day", "month", "year"] as Period[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 mb-1 text-xs font-medium rounded transition-all duration-200 ${
                selectedPeriod === period
                  ? "text-white bg-black "
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full h-48 mt-2">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="yesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="noGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((value) => {
            const y = HEIGHT - PADDING - (value * (HEIGHT - PADDING * 2)) / 100;
            return (
              <line
                key={value}
                x1={PADDING}
                y1={y}
                x2={WIDTH - PADDING}
                y2={y}
                stroke="#334155"
                strokeWidth="0.2"
                opacity="0.5"
              />
            );
          })}

          <path
            d={createFillPath(noData, WIDTH, HEIGHT)}
            fill="url(#noGradient)"
          />
          <path
            d={createFillPath(yesData, WIDTH, HEIGHT)}
            fill="url(#yesGradient)"
          />
          <path
            d={createPath(noData, WIDTH, HEIGHT)}
            stroke="#f97316"
            strokeWidth="0.6"
            fill="none"
          />
          <path
            d={createPath(yesData, WIDTH, HEIGHT)}
            stroke="#10b981"
            strokeWidth="0.6"
            fill="none"
          />

          {yesData.map((value, index) => {
            const x =
              PADDING + (index * (WIDTH - PADDING * 2)) / (yesData.length - 1);
            const y = HEIGHT - PADDING - (value * (HEIGHT - PADDING * 2)) / 100;
            return (
              <circle
                key={`yes-${index}`}
                cx={x}
                cy={y}
                r="0.8"
                fill="#10b981"
              />
            );
          })}

          {noData.map((value, index) => {
            const x =
              PADDING + (index * (WIDTH - PADDING * 2)) / (noData.length - 1);
            const y = HEIGHT - PADDING - (value * (HEIGHT - PADDING * 2)) / 100;
            return (
              <circle
                key={`no-${index}`}
                cx={x}
                cy={y}
                r="0.8"
                fill="#f97316"
              />
            );
          })}
        </svg>

        <div className="absolute bottom-2 left-2 text-xs text-gray-400">
          {selectedPeriod.toUpperCase()} VIEW
        </div>
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          ANALYTICS
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        {timeLabels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
    </div>
  );
};

export default DualLineChart;
