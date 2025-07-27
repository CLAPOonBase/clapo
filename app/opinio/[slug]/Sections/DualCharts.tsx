"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart
} from "recharts";

type Period = "day" | "month" | "year";
type ChartType = "line" | "bar" | "candle";

type DataPoint = {
  name: string;
  fedMaintain: number;
  rateCut: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

const DualCharts: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("day");
  const [chartType, setChartType] = useState<ChartType>("line");

  const generateData = (period: Period): DataPoint[] => {
    const dataPoints = period === "day" ? 24 : period === "month" ? 30 : 12;
    const data: DataPoint[] = [];

    for (let i = 0; i < dataPoints; i++) {
      const baseYes = 60 + Math.sin(i * 0.3) * 20 + Math.random() * 15;
      const baseNo = 40 + Math.cos(i * 0.2) * 15 + Math.random() * 10;

      const yesValue = Math.max(10, Math.min(95, baseYes));
      const noValue = Math.max(5, Math.min(90, baseNo));

      const open = yesValue + (Math.random() - 0.5) * 10;
      const close = yesValue + (Math.random() - 0.5) * 8;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;

      data.push({
        name: getTimeLabel(i, period),
        fedMaintain: Number(yesValue.toFixed(1)),
        rateCut: Number(noValue.toFixed(1)),
        open: Number(Math.max(5, open).toFixed(1)),
        high: Number(Math.min(100, high).toFixed(1)),
        low: Number(Math.max(0, low).toFixed(1)),
        close: Number(Math.max(5, close).toFixed(1))
      });
    }

    return data;
  };

  const getTimeLabel = (index: number, period: Period): string => {
    switch (period) {
      case "day":
        return `${String(index).padStart(2, "0")}:00`;
      case "month":
        return `Day ${index + 1}`;
      case "year":
        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return months[index] || `M${index + 1}`;
      default:
        return `${index}`;
    }
  };

  const chartData = useMemo(() => generateData(selectedPeriod), [selectedPeriod]);

  const getCurrentValues = () => {
    const lastData = chartData[chartData.length - 1];
    return {
      fedMaintain: lastData.fedMaintain,
      rateCut: lastData.rateCut
    };
  };

  const currentValues = getCurrentValues();

  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === "fedMaintain"
                ? "Fed Maintain"
                : entry.name === "rateCut"
                ? "Rate Cut"
                : entry.name}
              : {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CandlestickChart = ({ data }: { data: DataPoint[] }) => (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "#9CA3AF" }}
          interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "#9CA3AF" }}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        {data.map((entry, index) => {
          const isGreen = entry.close >= entry.open;
          return (
            <g key={index}>
              <rect
                x={(index / data.length) * 100 + "%"}
                y={(100 - Math.max(entry.open, entry.close)) + "%"}
                width="2%"
                height={Math.abs(entry.close - entry.open) + "%"}
                fill={isGreen ? "#10B981" : "#EF4444"}
                opacity={0.8}
              />
              <line
                x1={(index / data.length) * 100 + "%"}
                y1={(100 - entry.high) + "%"}
                x2={(index / data.length) * 100 + "%"}
                y2={(100 - entry.low) + "%"}
                stroke={isGreen ? "#10B981" : "#EF4444"}
                strokeWidth={1}
              />
            </g>
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cutGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rateCut"
                stroke="#F97316"
                strokeWidth={2}
                fill="url(#cutGradient)"
                dot={{ fill: "#F97316", r: 2 }}
                activeDot={{ r: 4, fill: "#F97316" }}
              />
              <Area
                type="monotone"
                dataKey="fedMaintain"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#fedGradient)"
                dot={{ fill: "#10B981", r: 2 }}
                activeDot={{ r: 4, fill: "#10B981" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="fedMaintain"
                fill="#10B981"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
              <Bar
                dataKey="rateCut"
                fill="#F97316"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "candle":
        return <CandlestickChart data={chartData} />;
    }
  };

  return (
    <div className="w-full relative pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            <span className="text-gray-300 text-sm font-medium">
              Fed Maintain Rate {currentValues.fedMaintain}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-gray-300 text-sm font-medium">
              Rate Cut {currentValues.rateCut}%
            </span>
          </div>
        </div>

        <div className="flex absolute bottom-0 left-1/2 -translate-x-1/2 items-center space-x-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(["line", "bar", "candle"] as ChartType[]).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-1.5 py-1 md:px-3 md:py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  chartType === type
                    ? "text-white bg-gray-700 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-gray-750"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex bg-gray-800 rounded-lg p-1">
            {(["day", "month", "year"] as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-1.5 py-1 md:px-3 md:py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  selectedPeriod === period
                    ? "text-white bg-gray-700 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-gray-750"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full h-80">
        {renderChart()}

        <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-mono">
          {selectedPeriod.toUpperCase()} VIEW
        </div>
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-mono">
          {chartType.toUpperCase()} CHART
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-4 px-4">
        <span>Start</span>
        <span>Current Period</span>
        <span>End</span>
      </div>
    </div>
  );
};

export default DualCharts;
