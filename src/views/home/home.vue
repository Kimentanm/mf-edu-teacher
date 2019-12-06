<template>
    <div class="home">
        <Row>
            <Col span="8">
                <Row>
                    <Card>
                        <Row type="flex" class="user-info">
                            <Col span="12">
                                <Row class-name="made-child-con-middle" type="flex" align="middle">
                                    <Avatar :src="userAvator" :size="100"/>
                                </Row>
                            </Col>
                            <Col span="12" style="padding-left:6px;">
                                <Row class-name="made-child-con-middle" type="flex" align="middle">
                                    <div class="card-user-info-name">
                                        <p>{{ userName }}</p>
                                        <p>数学组</p>
                                    </div>
                                </Row>
                            </Col>
                        </Row>
                    </Card>
                </Row>
                <Row class="marT10">
                    <Card>
                        <p slot="title" class="card-title">
                            <Icon class="marR10" color="#dd5a43" size="20"
                                  type="android-checkbox-outline"></Icon>
                            待办事项
                        </p>
                        <a type="text" slot="extra" @click.prevent="addNewToDoItem">
                            <Icon type="md-add" size="20"></Icon>
                        </a>
                        <Modal
                                v-model="showAddNewTodo"
                                title="添加新的待办事项"
                                @on-ok="addNew"
                                @on-cancel="cancelAdd">
                            <Row type="flex" justify="center">
                                <Input v-model="newToDoItemValue" icon="compose" placeholder="请输入..."
                                       style="width: 300px"/>
                            </Row>
                            <Row slot="footer">
                                <Button type="text" @click="cancelAdd">取消</Button>
                                <Button type="primary" @click="addNew">确定</Button>
                            </Row>
                        </Modal>
                        <div class="to-do-list-con">
                            <div class="height-100">
                                <CheckboxGroup v-for="item in toDoList" :key="item.id" v-model="draftItem"
                                               @on-change="changeItemStatus(item.id)">
                                    <Checkbox class="to-do-list-item-text" :label="item.title"></Checkbox>
                                </CheckboxGroup>
                            </div>
                        </div>
                    </Card>
                </Row>
            </Col>
            <Col span="16" class-name="padL5">
                <Row :gutter="10">
                    <Col span="6">
                        <infor-card
                                id-name="user_created_count"
                                :end-val="39"
                                iconType="md-ionitron"
                                color="#2d8cf0"
                                intro-text="我的学生"/>
                    </Col>
                    <Col span="6">
                        <infor-card
                                id-name="visit_count"
                                :end-val="143"
                                iconType="md-bookmarks"
                                color="#64d572"
                                intro-text="我的课件"/>
                    </Col>
                    <Col span="6">
                        <a @click="showClass">
                            <infor-card
                                    id-name="collection_count"
                                    :end-val="5"
                                    iconType="md-laptop"
                                    color="#ffd572"
                                    intro-text="待上课"/>
                        </a>
                    </Col>
                    <Col span="6">
                        <infor-card
                                id-name="transfer_count"
                                :end-val="538"
                                iconType="md-thumbs-up"
                                color="#f25e43"
                                intro-text="已上课"/>
                    </Col>
                    <Spin size="large" fix v-if="countCardLoading"/>
                </Row>
                <Row class="marT10">
                    <Card :gutter="10">
                        <p slot="title" class="card-title">
                            <Icon class="marR10" color="#69aa46" size="20" type="map"></Icon>
                            学生地理分布
                        </p>
                        <div class="map-con">
                            <Col span="10">
                                <map-data-table :cityData="projCapacity"/>
                            </Col>
                            <Col span="14" class="map-incon">
                                <Row type="flex" justify="center" align="middle" style="height: 100%">
                                    <home-map :city-data="projCapacity"/>
                                </Row>
                            </Col>
                        </div>
                    </Card>
                    <Spin size="large" fix v-if="mapLoading"/>
                </Row>
            </Col>
        </Row>

        <Modal v-model="classRoomSelectModal" title="请选择教室" width="300px">
            <Tree :data="classRoomData" :render="renderContent"/>
            <div slot="footer">
                <Button @click="classRoomSelectModal = false">取消</Button>
            </div>
            <Spin size="large" fix v-if="classRoomLoading"/>
        </Modal>
    </div>
</template>

<script>
    import cityData from './map-data/get-city-value.js';
    import homeMap from './components/map.vue';
    import dataSourcePie from './components/dataSourcePie.vue';
    import quantityWeek from './components/quantityWeek.vue';
    import alarmCountWeek from './components/alarmCountWeek.vue';
    import countUp from './components/countUp.vue';
    import inforCard from './components/inforCard.vue';
    import mapDataTable from './components/mapDataTable.vue';
    import toDoListItem from './components/toDoListItem.vue';
    import quantityToday from './components/quantityToday.vue';
    import { getClassRoomListByTeacher } from '@/api/home.js'

    export default {
        name: "home",
        components: {
            quantityWeek,
            quantityToday,
            homeMap,
            dataSourcePie,
            alarmCountWeek,
            countUp,
            inforCard,
            mapDataTable,
            toDoListItem
        },
        data() {
            return {
                homeWelcomeSeen: false,
                homeSeen: false,
                toDoList: [
                    {
                        title: '给刘婷写课后评价'
                    }
                ],
                draftItem: [],
                count: {
                    newAddNode: 0,
                    alarmOne: 0,
                    alarmTwo: 0,
                    alarmThree: 0
                },
                cityData: cityData,
                projCapacity: [{'name': '刘婷', 'grade': '一年级', 'city': '苏州', 'province': '江苏省'}],
                showAddNewTodo: false,
                newToDoItemValue: '',
                roleName: '',
                mapLoading: false,
                countCardLoading: false,
                alarmClassifyLoading: false,
                quantityLoading: false,
                quantityWeekLoading: false,
                alarmCountWeekLoading: false,
                classRoomData: [
                    {
                        title: '所有教室',
                        expand: true,
                        children: [],
                        render: (h, { root, node, data }) => {
                            return h('span', [
                                h('Icon', {
                                    props: {
                                        type: 'md-archive',
                                        size: 16
                                    },
                                    style: {
                                        marginRight: '8px'
                                    }
                                }),
                                h('span', data.title)
                            ]);
                        }
                    }
                ],
                classRoomSelectModal: false,
                classRoomLoading: false
            }
        },
        props: {},
        watch: {},
        computed: {
            userIdentity() {
                return this.$store.state.user.userIdentity
            },
            userAvator() {
                return this.userIdentity.imageUrl
            },
            userName() {
                return this.$store.state.user.userIdentity.name;
            },
        },
        methods: {
            renderContent(h, { root, node, data }) {
                return h('a', {
                    on: {
                        click: () => {
                            this.classRoomSelectModal = false;
                            this.goToClass({classroomId: data.id});
                        }
                    }
                }, [h('Icon', {
                        props: {
                            type: 'ios-book',
                            size: 16
                        },
                        style: {
                            marginRight: '8px'
                        }
                    }),
                    h('span', data.title)
                ]);
            },
            showClass() {
                this.classRoomSelectModal = true;
                this.getClassRoomListByTeacher();
            },
            getClassRoomListByTeacher() {
                this.classRoomLoading = true;
                this.classRoomData[0].children = [];
                getClassRoomListByTeacher().then(res => {
                    if (res.code === 200) {
                        res.data.forEach(item => {
                            this.classRoomData[0].children.push({
                                title: item.className + " （ " + item.student?.realName + " ）",
                                id: item.id
                            })
                        })
                    } else {
                        this.$Message.error("获取教室列表失败，请联系管理员");
                    }
                    this.classRoomLoading = false;
                }).catch(err => {
                    this.classRoomLoading = false;
                })
            },
            goToClass(params) {
                this.$router.push({
                    name: 'class',
                    params: params
                })
            },
            addNew() {
                // let self = this;
                // self.getToDoList();
                // if (this.newToDoItemValue.length !== 0) {
                //     let params = {
                //         userId: this.$store.state.user.userIdentity.id,
                //         title: this.newToDoItemValue,
                //         status: 'DRAFT'
                //     };
                //     this.$api.get('/to/do/list/add', {params: params}).then(function (res) {
                //         if (res.data.code === 200) {
                //             self.$Message.success('待办事项添加成功');
                //             self.getToDoList();
                //         } else {
                //             self.$Message.error('待办事项添加失败');
                //         }
                //     });
                //     setTimeout(() => {
                //         this.newToDoItemValue = '';
                //     }, 200);
                //     this.showAddNewTodo = false;
                // } else {
                //     this.$Message.error('请输入待办事项内容');
                // }
                // self.getToDoList();
            },
            cancelAdd() {
                this.showAddNewTodo = false;
                this.newToDoItemValue = '';
            },
            addNewToDoItem() {
                this.showAddNewTodo = true;
            },
            changeItemStatus(data) {
                // let self = this;
                // let params = {
                //     id: data
                // };
                // this.$api.get('/to/do/list/complete', {params: params}).then(function (res) {
                //     if (res.data.code === 200) {
                //         self.$Message.success('待办事项已完成');
                //         self.draftItem = [];
                //     } else {
                //         self.$Message.error('待办事项标记完成错误');
                //     }
                //     self.getToDoList();
                // })
            },
        },
        created() {
        }
    }
</script>

<style lang="less">
    @import "./home.less";
    @import "./components/styles/to-do-list-item.less";
    .home {
        height: 100%;
        width: 100%;

        .user-info-card {
            height: 200px;
        }
    }
</style>