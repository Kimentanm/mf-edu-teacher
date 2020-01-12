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
        <img class="content width-100" :src="imgSrc">
        <div class="name">
            <p>初一数学</p>
        </div>
        <div class="tool">
            <Row style="height: 100%">
                <Col span="12" class="tool-item">
                    <Tooltip class="tool-item-btn" content="预览" placement="top" theme="light" transfer>
                        <Button @click="handleClick('preview')" shape="circle" icon="md-eye" type="primary"/>
                    </Tooltip>
                </Col>
                <Col span="12" class="tool-item">
                    <Tooltip class="tool-item-btn" content="收藏" placement="top" theme="light" transfer>
                        <Button @click="handleClick('collect')" shape="circle" icon="ios-heart" :type="data.collect ? 'error' : 'primary'"/>
                    </Tooltip>
                </Col>
            </Row>
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
            handleClick(type) {
                switch (type) {
                    case 'collect' : {
                        this.$set(this.data, 'collect', !this.data.collect);
                        break;
                    }
                    case 'preview' : {
                        this.$emit('preview', this.data);
                        break;
                    }
                    default:
                }
            },
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
        }
    }
</script>

<style lang="less">
    .courseware-card {

        .author-content {
            display: inline-block;
            vertical-align: top;
            width: calc(100% - 40px);
            padding-left: 16px;

            .name {
                line-height: 16px;
                font-size: 16px;
                font-weight: bold;
            }

            .time {
                font-size: 12px;
                color: #c5c8ce;
            }
        }

        .ivu-card-head {
            position: relative;
        }

        .ivu-card-body {
            padding: unset;
        }

        .content {
            cursor: pointer;
        }

        .name {
            padding: 5px 0;

            p {
                text-align: center;
            }
        }

        .tool {
            height: 50px;
            border-top: 1px solid #eee;

            &-item{
                position: relative;
                height: 100%;

                &-btn {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
            }
        }
    }
</style>