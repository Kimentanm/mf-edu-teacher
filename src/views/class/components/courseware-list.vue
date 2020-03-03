<template>
    <div id="courseware-list" :style="coursewareWidth">
        <slider ref="slider" :options="options">
            <slideritem  class="courseware-item">
                <div @click="showCourseware('')" class="courseware-item-content add-new-courseware">
                    <Icon class="add-icon" type="md-add"/>
                </div>
            </slideritem>
            <slideritem class="courseware-item" v-for="(item,index) in list" :key="index" :style="item.style">
                <div class="courseware-item-content" :style="{backgroundColor: fileType(item).backgroundColor}" @click="showCourseware(item)">
                    <img :src="fileType(item).icon">
                    <div class="courseware-item-name">{{item.split("/").pop().substring(14)}}</div>
                    <p class="courseware-item-type">{{fileType(item).type}}</p>
                </div>
                <Icon @click="removeCourseware(index)" class="courseware-item-close" type="md-close-circle" />
            </slideritem>
        </slider>
    </div>
</template>

<script>
    import {slider, slideritem} from 'vue-concise-slider'
    import {mapState} from 'vuex';

    export default {
        name: "courseware-list",
        components: {slider, slideritem},
        props: {
            classroomId: Number
        },
        data() {
            return {
                list: [],
                options: {
                    currentPage: 0,
                    tracking: false,
                    thresholdDistance: 100,
                    thresholdTime: 300,
                    infinite: 4,
                    slidesToScroll: 1,
                    loop: false,
                },
                currentUrl: ''
            }
        },
        computed: {
            ...mapState({
                classCourseware: state => state.app.classCourseware
            }),
            coursewareWidth() {
                let result = 'calc(100% - 17px)';
                if (this.currentUrl) {
                    result = 'calc(100% - 56px)';
                }
                return {
                    width: result
                }
            }
        },
        watch: {},
        methods: {
            showCourseware(url) {
                this.currentUrl = url;
                this.$emit('click-item', url)
            },
            removeCourseware(index) {
                if (this.list[index] === this.currentUrl) {
                    this.showCourseware(index - 1 >= 0 ? this.list[index - 1] : '');
                }
                this.list.splice(index, 1);
            },
            refreshList() {
                this.list = this.classCourseware[this.classroomId];
                if (this.list) {
                    this.showCourseware(this.list[this.list.length - 1]);
                }
            },
            fileType(url) {
                let result = {
                    type: '未知课件类型',
                    backgroundColor: '#000',
                    icon: ''
                };
                if (url.endsWith('.mp4')) {
                    result.type = '视频';
                    result.backgroundColor = '#19be6b';
                    result.icon = require('../../../assets/images/video-icon.png');
                } else if (url.endsWith('.pdf')) {
                    result.type = 'PDF';
                    result.backgroundColor = '#2b85e4';
                    result.icon = require('../../../assets/images/pdf-icon.png');
                } else if (url.endsWith('.ppt') || url.endsWith('.pptx')) {
                    result.type = 'PPT';
                    result.backgroundColor = '#ff9900';
                    result.icon = require('../../../assets/images/ppt-icon.png');
                }
                return result;
            },
        },
        mounted() {
            this.refreshList();
        },
        created() {
        }
    }
</script>

<style lang="less">
    #courseware-list {
        height: 30%;
        position: absolute;
        background-color: #ffffff69;
        bottom: 0;
        padding: 0 20px;

        .courseware-item {
            width: 23.5%;
            height: 100%;
            position: relative;
            padding: 15px;

            &-close {
                position: absolute;
                top: 20px;
                right: 20px;
                font-size: 20px;
                color: #fff;
            }

            &-close:hover {
                color: #ed4014;
                cursor: pointer;
            }

            &-content {
                height: 100%;
                width: 100%;
                border: 2px dashed #000;
                border-radius: 10px;

                img {
                    margin-top: 20px;
                    width: 60px;
                    height: 60px;
                }
            }

            &-content:hover {
                border:2px dashed #2d8cf0;
                color: #2d8cf0;
                cursor: pointer;
            }

            &-name {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 26px;
                color: #17233d;
            }

            &-type {
                position: absolute;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 24px;
                font-weight: bold;
                color: #000;
            }
        }

        .add-new-courseware {
            background: #fff;
            color: #000;

            .add-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }
</style>
