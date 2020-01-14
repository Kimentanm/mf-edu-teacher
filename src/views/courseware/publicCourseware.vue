<template>
    <div class="public-courseware">
        <Row>
            <Col span="24" style="padding: 10px 60px">
                <el-carousel :interval="4000" type="card">
                    <el-carousel-item v-for="(item, index) in list.slice(0, 5)" :key="index">
                        <img class="height-100 width-100" :src="item.coverImg" />
                    </el-carousel-item>
                </el-carousel>
            </Col>
        </Row>
        <Row style="height: 100%;">
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

            <courseware-preview :cur-preview="curPreview" :show="pptPreviewModal" @hideModal="pptPreviewModal = false"/>
        </Row>
    </div>
</template>

<script>
    import CoursewareCard from './components/coursewareCard';
    import Waterfall from "vue-waterfall-plugin";
    import CoursewarePreview from "./components/coursewarePreview";
    import { getAllPublicCourseware } from "@/api/courseware.js"

    export default {
        name: "public-courseware",
        components: {
            CoursewarePreview,
            CoursewareCard,
            Waterfall,
        },
        data() {
            return {
                width: 300,
                list: [],
                curPreview: {},
                pptPreviewModal: false
            }
        },
        props: {},
        watch: {},
        computed: {},
        methods: {
            handlePptPreview(curPreview) {
                this.curPreview = curPreview;
                this.pptPreviewModal = true;
            },
            getAllPublicCourseware() {
                getAllPublicCourseware().then(res => {
                    if (res.code === 200) {
                        this.list = res.data;
                        this.$refs.waterfall.calculatePosition();
                    }
                })
            },
        },
        mounted() {
            this.getAllPublicCourseware();
        },
        created() {

        }
    }
</script>

<style lang="less">
    .public-courseware {
        height: 100%;

        .ppt-waterfall {
            /*overflow: auto;*/
        }

        .ppt-waterfall::-webkit-scrollbar {
            width: 0;
        }
    }
</style>