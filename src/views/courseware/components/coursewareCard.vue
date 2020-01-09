<template>
    <Card class="courseware-card">
        <div slot="title">
            <Avatar icon="ios-person" size="large"/>
            <div class="author-content">
                <p class="name">Kimen</p>
                <p class="time">于2020年01月01日分享</p>
            </div>
            <border-angle :width="50" :line-width="18" content-text="公有"/>
        </div>
        <img class="content" :style="{width: width - 2 + 'px'}" :src="imgSrc">
        <div class="footer">
            <p>初一数学</p>
        </div>
    </Card>
</template>

<script>
    import BorderAngle from "../../shared/borderAngle";
    export default {
        name: "courseware-card",
        components: { BorderAngle },
        data() {
            return {}
        },
        props: {
            data: Object,
            width: Number
        },
        watch: {},
        computed: {
            imgSrc() {
                if (this.data) {
                    return require('../../../assets/test/' + this.data.name);
                }
            }
        },
        methods: {
            randomNum(minNum, maxNum) {
                switch (arguments.length) {
                    case 1:
                        return parseInt(Math.random() * minNum + 1, 10);
                    case 2:
                        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
                    default:
                        return 0;
                }
            }
        },
        created() {
            console.log(this.imgSrc);
        }
    }
</script>

<style lang="less">
    .courseware-card {

        .ivu-card-head {
            position: relative;
        }

        .ivu-card-body {
            padding: unset;
        }

        .content {
            cursor: pointer;
        }

        .footer {
            padding: 5px 0;

            p {
                text-align: center;
            }
        }
    }
</style>