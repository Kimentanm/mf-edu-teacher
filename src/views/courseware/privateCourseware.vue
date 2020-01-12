<template>
    <div class="private-courseware">
        <Card>
            <div slot="title" class="private-courseware-title">
                <Icon type="ios-bookmarks" :size="32"/>
                <h1>我的课件</h1>
            </div>
            <Button slot="extra">上传我的课件</Button>
            <Collapse v-model="value1">
                <Panel name="1">
                    私有课件
                    <div slot="content">
                        <Row>
                            <Col class="height-100 ppt-waterfall" span="24">
                                <Waterfall
                                        :list="list"
                                        :gutter="10"
                                        :width="width"
                                        backgroundColor="rgba(255,255,255,0)"
                                        ref="waterfall">
                                    <template slot="item" slot-scope="props">
                                        <courseware-card :width="width" :data="props.data" @preview="handlePptPreview"/>
                                    </template>
                                </Waterfall>
                            </Col>
                            <Col span="24" style="text-align: center">
                                <Button>查看更多</Button>
                            </Col>
                        </Row>
                    </div>
                </Panel>
                <Panel name="2">
                    公有课件
                    <div slot="content">
                        <Row>
                            <Col class="height-100 ppt-waterfall" span="24">
                                <Waterfall
                                        :list="list"
                                        :gutter="10"
                                        :width="width"
                                        backgroundColor="rgba(255,255,255,0)"
                                        ref="waterfall2">
                                    <template slot="item" slot-scope="props">
                                        <courseware-card :width="width" :data="props.data" @preview="handlePptPreview"/>
                                    </template>
                                </Waterfall>
                            </Col>
                            <Col span="24" style="text-align: center">
                                <Button>查看更多</Button>
                            </Col>
                        </Row>
                    </div>
                </Panel>
            </Collapse>
        </Card>

        <courseware-preview :cur-preview="curPreview" :show="pptPreviewModal" @hideModal="pptPreviewModal = false" />
    </div>
</template>

<script>
    import CoursewareCard from './components/coursewareCard';
    import Waterfall from "vue-waterfall-plugin";
    import CoursewarePreview from "./components/coursewarePreview";

    export default {
        name: "private-courseware",
        components: {
            CoursewarePreview,
            CoursewareCard, Waterfall
        },
        data() {
            return {
                value1: '1',
                width: 230,
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
                    {
                        name: 'test1.png'
                    },
                    {
                        name: 'test2.png'
                    },
                    {
                        name: 'test3.png'
                    },
                ],
                curPreview: {},
                pptPreviewModal: false
            }
        },
        props: {},
        watch: {},
        computed: {
            imgSrc(name) {
                return require('../../assets/test/' + name);
            },
        },
        methods: {
            handlePptPreview(curPreview) {
                this.curPreview = curPreview;
                this.pptPreviewModal = true;
            }
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
    .private-courseware {

        &-title {
            h1 {
                margin-left: 10px;
                display: inline-block;
            }
        }
    }
</style>