import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { useTheme } from '@/store/useTheme'
import { useMemo } from 'react'

const PALETTE = [
  ['#0A84FF', '#5E5CE6'], // Blue to Indigo
  ['#64D2FF', '#0A84FF'], // Sky to Blue
  ['#30D158', '#28CD41'], // Green
  ['#FFD60A', '#FF9F0A'], // Yellow to Orange
  ['#FF375F', '#FF2D55'], // Pink/Red
  ['#BF5AF2', '#AF52DE'], // Purple
]

export function SegmentPie({ data }: { data: { name: string; value: number }[] }) {
  const dark = useTheme((s) => s.dark)
  
  const option = useMemo(() => {
    const hasData = data.some(d => d.value > 0)
    const displayData = hasData ? data : [{ name: '暂无数据', value: 1 }]
    
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        padding: [10, 15],
        backgroundColor: dark ? 'rgba(31, 31, 31, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: dark ? '#333' : '#eee',
        borderWidth: 1,
        textStyle: {
          color: dark ? '#fff' : '#333',
          fontSize: 12
        },
        extraCssText: 'box-shadow: 0 10px 30px rgba(0,0,0,0.2); border-radius: 12px; backdrop-filter: blur(8px);'
      },
      series: [
        {
          name: '人群分布',
          type: 'pie',
          radius: ['60%', '85%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: dark ? '#111' : '#fff',
            borderWidth: 3
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            scale: true,
            scaleSize: 5,
            label: {
              show: true,
              fontSize: 15,
              fontWeight: '900',
              formatter: '{b}\n{d}%',
              color: dark ? '#fff' : '#111'
            },
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          labelLine: {
            show: false
          },
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: (idx: number) => idx * 100,
          data: displayData.map((d, i) => ({
            ...d,
            itemStyle: {
              color: hasData ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: PALETTE[i % PALETTE.length][0] },
                { offset: 1, color: PALETTE[i % PALETTE.length][1] }
              ]) : (dark ? '#2a2a2a' : '#e6e6ea')
            }
          }))
        }
      ]
    }
  }, [data, dark])

  return <ReactECharts option={option} style={{ height: '200px', width: '100%' }} />
}

export function StageFunnelChart({ data }: { data: { name: string; value: number }[] }) {
  const dark = useTheme((s) => s.dark)

  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}: <b style="font-size:14px; margin-left:8px;">{c}</b>',
        padding: [10, 15],
        backgroundColor: dark ? 'rgba(31, 31, 31, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: dark ? '#333' : '#eee',
        textStyle: {
          color: dark ? '#fff' : '#333',
        },
        extraCssText: 'box-shadow: 0 10px 30px rgba(0,0,0,0.2); border-radius: 12px; backdrop-filter: blur(8px);'
      },
      series: [
        {
          name: '转化漏斗',
          type: 'funnel',
          left: '15%',
          top: 10,
          bottom: 10,
          width: '70%',
          min: 0,
          maxSize: '100%',
          sort: 'descending',
          gap: 6,
          label: {
            show: true,
            position: 'inside',
            formatter: '{b}',
            color: '#fff',
            fontSize: 12,
            fontWeight: '600'
          },
          itemStyle: {
            borderColor: 'transparent',
            borderWidth: 0,
            borderRadius: 12,
            shadowBlur: 15,
            shadowColor: 'rgba(0,0,0,0.15)',
            shadowOffsetY: 5
          },
          emphasis: {
            label: {
              fontSize: 14,
              fontWeight: '900'
            },
            itemStyle: {
              shadowBlur: 25,
              shadowColor: 'rgba(0,0,0,0.25)'
            }
          },
          animationEasing: 'cubicOut',
          animationDuration: 1000,
          data: data.map((d, i) => ({
            ...d,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: PALETTE[i % PALETTE.length][0] },
                { offset: 1, color: PALETTE[i % PALETTE.length][1] }
              ])
            }
          }))
        }
      ]
    }
  }, [data, dark])

  return <ReactECharts option={option} style={{ height: '260px', width: '100%' }} />
}

export function IntentTrendChart({ data }: { data: { date: string; value: number }[] }) {
  const dark = useTheme((s) => s.dark)

  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      grid: {
        top: 20,
        bottom: 30,
        left: 30,
        right: 10
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: dark ? 'rgba(31, 31, 31, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: dark ? '#333' : '#eee',
        textStyle: { color: dark ? '#fff' : '#333' },
        extraCssText: 'box-shadow: 0 10px 30px rgba(0,0,0,0.2); border-radius: 12px; backdrop-filter: blur(8px);',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#0A84FF',
            width: 2,
            type: 'dashed'
          }
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(d => d.date),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: dark ? '#888' : '#666',
          fontSize: 10,
          margin: 15
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            color: dark ? '#222' : '#f0f0f0',
            type: 'dashed'
          }
        },
        axisLabel: {
          color: dark ? '#888' : '#666',
          fontSize: 10
        }
      },
      series: [
        {
          name: '意向值',
          type: 'line',
          smooth: 0.4,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 4,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#0A84FF' },
              { offset: 1, color: '#5E5CE6' }
            ]),
            shadowBlur: 10,
            shadowColor: 'rgba(10, 132, 255, 0.3)',
            shadowOffsetY: 5
          },
          itemStyle: {
            color: '#0A84FF',
            borderColor: dark ? '#111' : '#fff',
            borderWidth: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(10, 132, 255, 0.25)' },
              { offset: 1, color: 'rgba(10, 132, 255, 0)' }
            ])
          },
          emphasis: {
            scale: true,
            itemStyle: {
              shadowBlur: 15,
              shadowColor: 'rgba(10, 132, 255, 0.5)'
            }
          },
          animationDuration: 1500,
          data: data.map(d => d.value)
        }
      ]
    }
  }, [data, dark])

  return <ReactECharts option={option} style={{ height: '180px', width: '100%' }} />
}

export function ConversionGauge({ value }: { value: number }) {
  const dark = useTheme((s) => s.dark)

  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          center: ['50%', '75%'],
          radius: '110%',
          min: 0,
          max: 100,
          splitNumber: 8,
          axisLine: {
            lineStyle: {
              width: 6,
              color: [
                [value / 100, '#0A84FF'],
                [1, dark ? '#2a2a2a' : '#e6e6ea']
              ]
            }
          },
          pointer: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            offsetCenter: [0, '-10%'],
            valueAnimation: true,
            formatter: function (value: number) {
              return '{value|' + Math.round(value) + '}{unit|%}';
            },
            rich: {
              value: {
                fontSize: 24,
                fontWeight: 'bold',
                color: dark ? '#fff' : '#111'
              },
              unit: {
                fontSize: 12,
                color: '#888',
                padding: [0, 0, -8, 2]
              }
            }
          },
          data: [{ value }]
        }
      ]
    }
  }, [value, dark])

  return <ReactECharts option={option} style={{ height: '80px', width: '120px' }} />
}

export function IntentRadarChart({ data }: { data: { name: string; value: number; max: number }[] }) {
  const dark = useTheme((s) => s.dark)

  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      radar: {
        indicator: data.map(d => ({ name: d.name, max: d.max })),
        shape: 'circle',
        splitNumber: 4,
        axisName: {
          color: dark ? '#888' : '#666',
          fontSize: 10,
          fontWeight: '500'
        },
        splitLine: {
          lineStyle: {
            color: dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
          }
        },
        splitArea: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
          }
        }
      },
      series: [
        {
          name: '意图维度',
          type: 'radar',
          lineStyle: {
            width: 2,
            color: '#0A84FF'
          },
          data: [
            {
              value: data.map(d => d.value),
              name: '当前全景',
              symbol: 'none',
              itemStyle: {
                color: '#0A84FF'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(10, 132, 255, 0.4)' },
                  { offset: 1, color: 'rgba(10, 132, 255, 0.1)' }
                ])
              }
            }
          ]
        }
      ]
    }
  }, [data, dark])

  return <ReactECharts option={option} style={{ height: '180px', width: '100%' }} />
}
