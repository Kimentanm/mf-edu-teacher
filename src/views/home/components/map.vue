<style lang="less">
  #home-page-map {
    height: 100%;
    width: 100%;
  }
</style>
<template>
  <div id="home-page-map"></div>
</template>

<script>
  import echarts from 'echarts';
  import geoData from '../map-data/get-geography-value.js';
  export default {
    name: 'homeMap',
    props: {
      cityData: Array
    },
    watch: {
      cityData: function () {
        this.init();
      }
    },

    methods: {

      init() {
        let capitaty = [];
        let convertData = function (data) {
          let res = [];
          let objKeys = Object.keys(geoData);
          let handleData = JSON.parse(JSON.stringify(data));
          let len = handleData.length;
          // 将同省的数据合并
          let tmp = {};
          for (let i = 0; i < len; i++) {
            let obj = handleData[i];
            if (obj.province in tmp) {
              tmp[obj.province].value += obj.value;
            } else {
              tmp[obj.province] = obj;
            }
          }

          let result = [];
          for (let key in tmp) {
            result.push(tmp[key]);
          }
          for (let j = 0; j < objKeys.length; j++) {
            let geo = geoData[objKeys[j]];
            for (let i = 0; i < result.length; i++) {
              let geoCoord = geoData[result[i].province];
              if (JSON.stringify(geo) == JSON.stringify(geoCoord)) {
                res.push({
                  name: result[i].province,
                  value: geoCoord.concat(result[i].value),
                });
                capitaty.push(result[i].value);
              } else if (i == result.length - 1) {
                capitaty.push(0);
              }
            }
          }
          return res;
        };

        let map = echarts.init(document.getElementById('home-page-map'));
        const chinaJson = require('../map-data/china.json');
        echarts.registerMap('china', chinaJson);
        map.setOption({
          backgroundColor: '#FFF',
          tooltip: {},
          visualMap: {
            min: 40,
            max: 800,
            seriesIndex: [1],
            inRange: {
              color: ['white', 'blue', 'red']
            }
          },
          geo: {
            map: 'china',
            label: {
              emphasis: {
                show: false
              }
            },
            itemStyle: {
              normal: {
                areaColor: '#EFEFEF',
                borderColor: '#CCC'
              },
              emphasis: {
                areaColor: '#E5E5E5',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 20,
                borderWidth: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          },
          grid: {
            top: 0,
            left: '2%',
            right: '2%',
            bottom: '0',
            containLabel: true
          },
          series: [{
            type: 'scatter',
            coordinateSystem: 'geo',
            data: convertData(this.cityData),
            symbolSize: 20,
            symbol: 'pin',
//                    symbolSize: function (val) {
//                        return val[2] / 300;
//                    },
            label: {
              normal: {
                formatter: '{b}',
                position: 'right',
                show: false
              },
              emphasis: {
                show: true
              }
            },
            itemStyle: {
              normal: {
                color: 'red'
              }
            }
          },
            {
              name: '所在地',
              type: 'map',
              geoIndex: 0,
              data: [
                {name: '北京', value: capitaty[0]},
                {name: '天津', value: capitaty[1]},
                {name: '上海', value: capitaty[2]},
                {name: '重庆', value: capitaty[3]},
                {name: '河北', value: capitaty[4]},
                {name: '河南', value: capitaty[5]},
                {name: '云南', value: capitaty[6]},
                {name: '辽宁', value: capitaty[7]},
                {name: '黑龙江', value: capitaty[8]},
                {name: '湖南', value: capitaty[9]},
                {name: '安徽', value: capitaty[10]},
                {name: '山东', value: capitaty[11]},
                {name: '新疆', value: capitaty[12]},
                {name: '江苏', value: capitaty[13]},
                {name: '浙江', value: capitaty[14]},
                {name: '江西', value: capitaty[15]},
                {name: '湖北', value: capitaty[16]},
                {name: '广西', value: capitaty[17]},
                {name: '甘肃', value: capitaty[18]},
                {name: '山西', value: capitaty[19]},
                {name: '内蒙古', value: capitaty[20]},
                {name: '陕西', value: capitaty[21]},
                {name: '吉林', value: capitaty[22]},
                {name: '福建', value: capitaty[23]},
                {name: '贵州', value: capitaty[24]},
                {name: '广东', value: capitaty[25]},
                {name: '青海', value: capitaty[26]},
                {name: '西藏', value: capitaty[27]},
                {name: '四川', value: capitaty[28]},
                {name: '宁夏', value: capitaty[29]},
                {name: '海南', value: capitaty[30]},
                {name: '台湾', value: capitaty[31]},
                {name: '香港', value: capitaty[32]},
                {name: '澳门', value: capitaty[33]}
              ]
            }
          ]

        });
        window.addEventListener('resize', function () {
          map.resize();
        });
      }
    },
    mounted () {
      this.init();
    }
  };
</script>


