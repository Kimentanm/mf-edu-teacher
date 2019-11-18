<template>
        <div style="width:100%;height:100%;" id="data_source_con"></div>
</template>

<script>
const echarts = require('echarts');

export default {
    name: 'dataSourcePie',
    data () {
        return {
        };
    },
    mounted () {
        const self = this;
        this.$emit('loadingStart',0);
        this.$api.get('/home/alarmClassify').then((res => {
            if (res.data.code === 200) {
                let data = [];
                res.data.data.map(item => {
                    let dataItem = {
                        value: '', name: 'ios', itemStyle: {normal: {color: ''}}
                    };
                    dataItem.value = item.value;
                    dataItem.name = item.name;
                    switch (dataItem.name) {
                        case '功率报警' :
                            dataItem.itemStyle.normal.color = '#8bcf86';break;
                        case '电流报警' :
                            dataItem.itemStyle.normal.color = '#ffd58f';break;
                        case 'SOC报警' :
                            dataItem.itemStyle.normal.color = '#abd5f2';break;
                        case '电压报警' :
                            dataItem.itemStyle.normal.color = '#ab8df2';break;
                        case '温度报警' :
                            dataItem.itemStyle.normal.color = '#e14f60';break;
                        default:
                    }
                    data.push(dataItem);
                });
                self.$nextTick(() => {
                    var dataSourcePie = echarts.init(document.getElementById('data_source_con'));
                    const option = {
                        tooltip: {
                            trigger: 'item',
                            formatter: '{a} <br/>{b} : {c} ({d}%)'
                        },
                        legend: {
                            orient: 'vertical',
                            left: 'right',
                            data: ['功率报警', '电流报警', 'SOC报警', '电压报警', '温度报警']
                        },
                        series: [
                            {
                                name: '报警类别',
                                type: 'pie',
                                radius: '60%',
                                center: ['40%', '50%'],
                                labelLine : {
                                    length: 0,
                                },
                                data: data,
                                itemStyle: {
                                    emphasis: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }
                            }
                        ]
                    };
                    dataSourcePie.setOption(option);
                    window.addEventListener('resize', function () {
                        dataSourcePie.resize();
                    });
                });
            }else {
                self.$Message.error('获取报警分类统计失败，错误代码：' + res.data.code);
            }
            self.$emit('loadingEnd',1);
        }));
    }
};
</script>
