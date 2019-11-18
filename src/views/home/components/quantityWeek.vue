<template>
  <div style="width:100%;height:100%;" id="quantity_week"></div>
</template>

<script>
  const echarts = require('echarts');
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      top: 0,
      left: '2%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      axisLine: {
        lineStyle: {
          type: 'solid',
          color: '#a7c3da',//左边线的颜色
          width: '1'//坐标线的宽度
        }
      },
      axisLabel: {
        textStyle: {
          color: '#4d6878'
        }
      }
    },
    yAxis: {
      type: 'category',
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
    },
    series: [
      {
        name: '充电',
        type: 'bar',
        color: '#2d8cf0',
        data: []
      },
      {
        name: '放电',
        type: 'bar',
        data: []
      }
    ]
  };
  export default {
    name: 'quantityWeek',
      props: {
          projId: {
              type: Number,
              default: 0
          }
      },
    data () {
      return {
        //
      };
    },
    mounted () {
      const self = this;
      this.$emit('quantityWeekLoading', 0);
      this.$api.get('/home/meter/weekly/' + this.projId).then((res => {
        if (res.data.code === 200) {
          let chargeData = [];
          let dischargeData = [];
          res.data.data.map(item => {
            let chargeDataItem = {
              value: '', itemStyle: {normal: {color: '#2d8cf0'}}
            };
            let dischargeDataItem = {
              value: '', itemStyle: {normal: {color: '#f0290b'}}
            };
            chargeDataItem.value = item.chargeValue > 0 ? item.chargeValue : 0;
            dischargeDataItem.value = item.dischargeValue > 0 ? item.dischargeValue : 0;
//            chargeDataItem.value = item.chargeValue;
//            dischargeDataItem.value = item.dischargeValue;
            chargeData.push(chargeDataItem)
            dischargeData.push(dischargeDataItem);
          });
          self.$nextTick(() => {
            let quantityWeek = echarts.init(document.getElementById('quantity_week'));
            option.series[0].data = chargeData;
            option.series[1].data = dischargeData;
            quantityWeek.setOption(option);
            window.addEventListener('resize', function () {
              quantityWeek.resize();
            });
          });
        } else {
          self.$Message.error('获取上周充放电统计失败，错误代码：' + res.data.code);
        }
        self.$emit('quantityWeekEnd', 1);
      }));


    }
  };
</script>
