import * as echarts from "echarts";
import { useEffect, useRef } from "react";

interface ChartProps {
  data: { date: string; value: number }[];
  title: string;
  unit: string;
  color: string;
  gradientColors: [string, string];
}

export function Chart({
  data,
  title,
  unit,
  color,
  gradientColors,
}: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);
      const option = {
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: [title],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
            data: data.map((item) => item.date),
          },
        ],
        yAxis: {
          type: "value",
          min: 0,
          axisLabel: {
            formatter: `{value}${unit}`,
          },
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: "none",
            },
            saveAsImage: {},
          },
        },
        series: [
          {
            name: title,
            type: "line",
            symbol: "none",
            sampling: "lttb",
            smooth: true,
            itemStyle: {
              color: color,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: gradientColors[0],
                },
                {
                  offset: 1,
                  color: gradientColors[1],
                },
              ]),
            },
            data: data.map((item) => item.value),
            markLine: {
              data: [
                {
                  type: "average",
                  name: "平均值",
                },
              ],
            },
          },
        ],
      };

      chart.setOption(option);
      const resizeHandler = () => {
        chart.resize();
      };
      window.addEventListener("resize", resizeHandler);
    }
  }, [data, title, unit, color, gradientColors]);

  return <div ref={chartRef} className="aspect-auto h-[250px] w-full"></div>;
}
