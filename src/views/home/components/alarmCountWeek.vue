<template>
  <div style="width:100%;height:100%;" id="alarm_count_week"></div>
</template>

<script>
  const echarts = require('echarts');
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    grid: {
      top: '3%',
      left: '1.2%',
      right: '1%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLine: {
          lineStyle: {
            type: 'solid',
            color: '#a7c3da',
            width: '1'
          }
        },
        axisLabel: {
          textStyle: {
            color: '#4d6878'
          }
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLine: {
          lineStyle: {
            type: 'solid',
            color: '#a7c3da',
            width: '1'
          }
        },
        axisLabel: {
          textStyle: {
            color: '#4d6878'
          }
        }
      }
    ],
    series: [
      {
        name: '一级报警',
        type: 'line',
        stack: '总量',
//            areaStyle: {normal: {
//                color: '#2d8cf0'
//            }},
        data: [120, 132, 101, 134, 90, 230, 210]
      },
      {
        name: '二级报警',
        type: 'line',
        stack: '总量',
//            areaStyle: {normal: {
//                color: '#10A6FF'
//            }},
        data: [257, 358, 278, 234, 290, 330, 310]
      },
      {
        name: '三级报警',
        type: 'line',
        stack: '总量',
//            areaStyle: {normal: {
//                color: '#0C17A6'
//            }},
        data: [379, 268, 354, 269, 310, 478, 358]
      }
    ]
  };
  export default {
    name: 'alarmCountWeek',
    mounted () {
      const self = this;
      this.$emit('alarmLoading', 0);
      this.$api.get('/home/alarm/last/week').then((res => {
        if (res.data.code === 200) {
          let alarmOneData = [];
          let alarmTwoData = [];
          let alarmThreeData = [];
          res.data.data.map(item => {
            alarmOneData.push(item.alarmOne);
            alarmTwoData.push(item.alarmTwo);
            alarmThreeData.push(item.alarmThree);
          });
          self.$nextTick(() => {
            const alarmCountWeekCharts = echarts.init(document.getElementById('alarm_count_week'));
            option.series[0].data = alarmOneData;
            option.series[1].data = alarmTwoData;
            option.series[2].data = alarmThreeData;
            alarmCountWeekCharts.setOption(option);
            window.addEventListener('resize', function () {
              alarmCountWeekCharts.resize();
            });
          });
        } else {
          self.$Message.error('获取上周每日报警数量统计失败，错误代码：' + res.data.code);
        }
        self.$emit('alarmLoadingEnd', 1);
      }));


    }
  };
</script>