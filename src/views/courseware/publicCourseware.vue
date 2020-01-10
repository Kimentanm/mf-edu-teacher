<template>
    <div class="public-courseware">
        <Row style="height: 100%;">
            <Col v-show="!fullScreen" class="height-100 ppt-waterfall" :span="fullScreen ? 0 : 12">
                <Waterfall
                        :list="list"
                        :gutter="10"
                        :width="width"
                        backgroundColor="rgba(255,255,255,0)"
                        @handleClick="handleClick"
                        ref="waterfall">
                    <template slot="item" slot-scope="props">
                        <courseware-card :width="width" :data="props.data"/>
                    </template>
                </Waterfall>
            </Col>
            <!--PPT预览-->
            <Col class="height-100" :span="fullScreen ? 24 : 12" style="transition: all 0.3s ease-in-out 0s;position: absolute;right: 0">
                <div class="ppt-preview">
                    <Card class="height-100" style="position: relative">
                        <Tooltip class="tool-item-btn" content="全屏" placement="top" theme="light" transfer style="position: absolute;top: 88px;right: 15px">
                            <Button @click="fullScreen = !fullScreen" shape="circle" icon="md-expand"/>
                        </Tooltip>
                        <div slot="title">
                            <Avatar icon="ios-person" size="large" />
                            <div class="author-content">
                                <p class="name">Kimen</p>
                                <p class="time">于2020年01月01日分享</p>
                            </div>
                            <div class="title">初一数学</div>
                            <border-angle :width="60" :line-width="22" contentText="预览" :font-size="14"/>
                        </div>
                        <iframe id="my-iframe" :src="baseUrl + pptUrl" frameborder="0"></iframe>
                    </Card>
                </div>
            </Col>
        </Row>
    </div>
</template>

<script>
    import CoursewareCard from './components/coursewareCard';
    import Waterfall from "vue-waterfall-plugin";
    import BorderAngle from "../shared/borderAngle";

    export default {
        name: "public-courseware",
        components: {
            BorderAngle,
            CoursewareCard,
            Waterfall
        },
        data() {
            return {
                baseUrl: 'http://ow365.cn/?i=20293&n=5&furl=',
                pptUrl: 'http://img.kimen.com.cn/桃花模板.pptx',
                width: 300,
                list: [
                    {
                        name: 'test1.png'
                    },
                    {
                        name: 'test2.png'
                    },
                    {
                        name: 'test3.png'
                    },
                    {
                        name: 'test4.png'
                    },
                ],
                fullScreen: false
            }
        },
        props: {},
        watch: {},
        computed: {},
        methods: {
            handleClick() {

            },
        },
        mounted() {
            setTimeout(() => {
                this.$refs.waterfall.calculatePosition();
            }, 100)
        },
        created() {
        }
    }
</script>

<style lang="less">
    .public-courseware {
        height: 100%;

        .ppt-waterfall {
            overflow: auto;
        }

        .ppt-waterfall::-webkit-scrollbar {
            width: 0;
        }

        .author-content {
            display: inline-block;
            vertical-align: top;
            width: calc(100% - 40px);
            padding-left: 16px;

            .name {
                font-size: 16px;
                font-weight: bold;
            }

            .time {
                font-size: 12px;
                color: #c5c8ce;
            }
        }

        .ppt-preview {
            width: 100%;
            height: 100%;

            .ivu-card-head {
                position: relative;

                .title {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 20px;
                    font-weight: bold;
                }
            }

            .ivu-card-body {
                height: ~"calc(100% - 73px)";
                padding: unset;
            }

            iframe {
                height: 100%;
                width: 100%
                /*display: inline-block;*/
                /*width: ~"calc(100% - 40px)";*/
                /*pointer-events: none;*/
            }
        }

        .ppt-tools {

        }
    }
</style>