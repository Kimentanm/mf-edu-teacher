<template>
    <Modal v-model="pptPreviewModal"
           :class-name="previewModalClass" width="50%"
           :closable="false"
           :fullscreen="fullScreen"
           :mask-closable="false"
           footer-hide>
        <!--PPT预览-->
        <div class="ppt-preview">
            <Card class="height-100" style="position: relative">
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
                <div class="ppt-preview-tool">
                    <Row style="height: 100%">
                        <Col span="8" class="ppt-preview-tool-item">
                            <Tooltip class="ppt-preview-tool-item-btn" content="退出" placement="top" theme="light" transfer>
                                <Button @click="handleClick('exit')" shape="circle" icon="md-exit" type="primary"/>
                            </Tooltip>
                        </Col>
                        <Col span="8" class="ppt-preview-tool-item">
                            <Tooltip class="ppt-preview-tool-item-btn" content="全屏" placement="top" theme="light" transfer>
                                <Button @click="fullScreen = !fullScreen" shape="circle" icon="md-expand" type="primary"/>
                            </Tooltip>
                        </Col>
                        <Col span="8" class="ppt-preview-tool-item">
                            <Tooltip class="ppt-preview-tool-item-btn" content="收藏" placement="top" theme="light" transfer>
                                <Button @click="handleClick('collect')" shape="circle" icon="ios-heart" :type="curPreview.collect ? 'error' : 'primary'"/>
                            </Tooltip>
                        </Col>
                    </Row>
                </div>
            </Card>
        </div>
    </Modal>
</template>

<script>
    import BorderAngle from "../../shared/borderAngle";

    export default {
        name: "courseware-preview",
        components: {
            BorderAngle
        },
        data() {
            return {
                pptPreviewModal: false,
                fullScreen: false,
                baseUrl: 'http://ow365.cn/?i=20293&n=5&furl=',
                pptUrl: '',
            }
        },
        props: {
            curPreview: Object,
            show: Boolean
        },
        watch: {
            show(val) {
                this.pptPreviewModal = val
            },
        },
        computed: {
            previewModalClass() {
                return this.fullScreen ? 'courseware-preview courseware-preview-fullscreen' : 'courseware-preview'
            }
        },
        methods: {
            handleClick(type) {
                switch (type) {
                    case 'collect' : {
                        this.$set(this.curPreview, 'collect', !this.curPreview.collect);
                        break;
                    }
                    case 'exit' : {
                        this.pptPreviewModal = false;
                        this.$emit('hideModal')
                        break;
                    }
                    default:
                }
            },
        },
        created() {
            this.pptPreviewModal = this.show;
            this.pptUrl = this.curPreview.url;
        }
    }
</script>

<style lang="less">

    .courseware-preview {

        .ivu-modal {
            height: 60%;
            transition: all 0.3s ease-in-out 0s;
        }

        .ivu-modal-content {
            height: 100%;

            .ivu-modal-body {
                height: 100%;
                padding: unset;
            }
        }

        .ppt-preview {
            width: 100%;
            height: 100%;

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
                height: ~"calc(100% - 123px)";
                padding: unset;
            }

            iframe {
                height: 100%;
                width: 100%
                /*display: inline-block;*/
                /*width: ~"calc(100% - 40px)";*/
                /*pointer-events: none;*/
            }

            &-tool {
                height: 50px;
                margin-top: -5px;

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
    }

    .courseware-preview-fullscreen {
        .ivu-modal {
            height: 100%;
        }
    }
</style>