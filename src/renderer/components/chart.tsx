import * as echarts from "echarts";
import { useEffect, useRef } from "react";

interface SeriesData {
  name: string;
  data: { date: string; value: number }[];
  color: string;
  gradientColors?: [string, string];
}

interface ChartProps {
  series: SeriesData[];
  title: string;
  unit: string;
}

export function Chart({ series, title, unit }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);
      const option = {
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: series.map((s) => s.name),
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
            data: series[0]?.data.map((item) => item.date) || [],
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
        series: series.map((s) => ({
          name: s.name,
          type: "line",
          symbol: "none",
          sampling: "lttb",
          smooth: true,
          itemStyle: {
            color: s.color,
          },
          areaStyle: s.gradientColors
            ? {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: s.gradientColors[0],
                  },
                  {
                    offset: 1,
                    color: s.gradientColors[1],
                  },
                ]),
              }
            : undefined,
          data: s.data.map((item) => item.value),
          markLine: s.name === "Total PSS" || series.length === 1
            ? {
                data: [
                  {
                    type: "average",
                    name: "平均值",
                  },
                ],
              }
            : undefined,
        })),
      };

      chart.setOption(option);
      const resizeHandler = () => {
        chart.resize();
      };
      window.addEventListener("resize", resizeHandler);

      // return () => {
      //   window.removeEventListener("resize", resizeHandler);
      //   chart.dispose();
      // };
    }
  }, [series, title, unit]);

  return <div ref={chartRef} className="aspect-auto h-[250px] w-full"></div>;
}
