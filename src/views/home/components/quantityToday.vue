<template>
  <div style="width:100%;height:100%;" id="quantity_today"></div>
</template>

<script>
  import echarts from 'echarts';

  const option = {
    tooltip: {
      formatter: '{a} <br/>{c} {b} kW·h'
    },
    series: [
      {
        name: '充电',
        type: 'gauge',
        min: 0,
        max: 100,
        data: [{value: 50, name: '充电'}],
        center: ['25%', '50%'],
        radius: '80%',
        title: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            width: 20
          }
        },
        splitLine: {
          length: 20
        }
      },
      {
        name: '放电',
        type: 'gauge',
        min: 0,
        max: 100,
        data: [{value: 50, name: '放电'}],
        center: ['75%', '50%'],
        radius: '80%',
        title: {
          show: false,
//                    offsetCenter: [0, '80px']
        },
        axisLine: {
          lineStyle: {
            width: 20
          }
        },
        splitLine: {
          length: 20
        }
      }
    ]
  };

  export default {
    name: 'quantityToday',
    mounted () {
      const self = this;
      this.$emit('quantityLoading', 0);
      this.$api.get('/home/meter/today').then((res => {
        if (res.data.code === 200) {
          self.$nextTick(() => {
            let quantityToday = echarts.init(document.getElementById('quantity_today'));
            let chargeValue = (res.data.data.chargeValue).toFixed(0) - 0;
            let dischargeValue = (res.data.data.dischargeValue).toFixed(0) - 0;
            let setSeries = self.setOption(chargeValue);
            option.series[0].data = setSeries[0];
            option.series[0].detail = {
              formatter: [
                '{a|充电}',
                setSeries[1],
              ].join('\n'),
              rich: {
                a: {
                  fontSize: 14,
                  lineHeight: 30,
                },
                b: {
                  fontSize: 16,
                },

              },
              fontSize: 14,
              offsetCenter: [0, '70%']
            };
            let dischargeSeries = self.setOption(dischargeValue);
            option.series[1].data = dischargeSeries[0];
            option.series[1].detail = {
              formatter: [
                '{a|放电}',
                setSeries[1],
              ].join('\n'),
              rich: {
                a: {
                  fontSize: 14,
                  lineHeight: 30,
                },
                b: {
                  fontSize: 16,
                },

              },
              fontSize: 14,
              offsetCenter: [0, '70%']
            };
            quantityToday.setOption(option);
            window.addEventListener('resize', function () {
              quantityToday.resize();
            });
          });
        } else {
          self.$Message.error('获取今日充放电统计失败，错误代码：' + res.data.code);
        }
        self.$emit('quantityLoadingEnd', 1);
      }));
    },

    methods: {
      setOption(data) {
        let seriesData = [];
        let str = '';
        if (data > 0) {
          let length = data.toString().length;
          let pow = Math.pow(10, length - 2);
          let value = data / pow;
          let helpData = {
            name: '×' + pow,
            value: value,
          };
          seriesData.push(helpData);
          str = '×' + pow + 'kw·h ';
        } else {
          let helpData = {
            name: '',
            value: data,
          };
          seriesData.push(helpData);
          str = '0 kw·h ';
        }
        return [seriesData, str];
      }
    }
  };
</script>
