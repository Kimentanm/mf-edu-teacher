<template>
    <div :style="styleObj">
        <Table :columns="columns" :data="cityData"></Table>
    </div>
</template>

<script>
export default {
    name: 'mapDataTable',
    data () {
        return {
            columns: [
                {
                    title: '学生姓名',
                    key: 'name',
                },
                {
                    title: '年级',
                    key: 'grade'
                },
                {
                    title: '城市',
                    key: 'city',
                    sortable: true
                }
            ]
        };
    },
    props: {
        cityData: Array,
        styleObj: Object,
    },
      methods: {
        projDetail(index) {
          this.$router.push({
            params: {
              projId: this.cityData[index].projId,
            },
            name: 'data_proj_display',
          });
        },
      }
};
</script>
