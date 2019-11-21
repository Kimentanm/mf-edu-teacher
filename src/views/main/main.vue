<template>
    <div class="main">
        <Layout :style="{minHeight: '100vh'}">
            <Header>
                <header-bar :routeName="routeName"></header-bar>
            </Header>
            <Layout>
                <Sider v-if="sidebarHide" class="menu-slider" collapsible :collapsed-width="78" :width="140" v-model="isCollapsed">
                    <side-menu :menuList="menuList" :isCollapsed="isCollapsed"></side-menu>
                </Sider>
                <Layout class="main-layout">
                    <Content :style="{padding: '0 16px 16px'}">
                        <keep-alive>
                            <router-view/>
                        </keep-alive>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    </div>
</template>

<script>
    import {cloneObj, getMenuByRouter} from '@/libs/util'
    import routers from '@/router/routers'
    import {mapMutations} from 'vuex'
    import HeaderBar from './components/header-bar'
    import SideMenu from './components/side-menu';
    import env from '../../config/env';

    export default {
        name: "main",
        components: {HeaderBar, SideMenu},
        data() {
            return {
                isCollapsed: false,
                routeName: '',
                // 如果不需要websocket支持，请关闭此选项
                enableStomp: true,
                // 禁用默认的自动连接，使用onConnectionInactive代替
                stompReconnect: false
            }
        },
        props: {},
        watch: {
            '$route'(val) {
                this.routeName = val.name;
            },
        },
        computed: {
            userId () {
                return this.$store.state.user.userIdentity.id;
            },
            sidebarHide() {
                return this.routeName !== 'class-index'
            },
            menuList() {
                return this.$store.state.app.menuList
            },
        },
        methods: {
            ...mapMutations([
                'setMenuList',
            ]),
            processMenuList() {
                let copy = cloneObj(routers);
                let menuList = getMenuByRouter(copy);
                this.setMenuList(menuList);
            },
            onConnected (frame) {
                this.$stompClient.subscribe('/topic/sendOffer/' + this.userId, this.onMessage, this.onFailed);
                this.$stompClient.subscribe('/topic/sendAnswer/' + this.userId, this.onGetAnswer, this.onFailed);
                this.$stompClient.subscribe('/topic/sendICE/' + this.userId, this.onGetICE, this.onFailed);
            },
            onMessage (data) {
                if (data.body) {
                    this.$bus.emit('on-getOffer', JSON.parse(data.body))
                }
            },
            onGetAnswer (data) {
                if (data.body) {
                    this.$bus.emit('on-getAnswer', JSON.parse(data.body))
                }
            },
            onGetICE(data) {
                if (data.body) {
                    this.$bus.emit('on-getICE', JSON.parse(data.body))
                }
            },
            onFailed (frame) {
                console.log('连接失败：' + frame);
            },
            connectSrv () {
                let url;
                if (env === 'development') {
                    url = 'http://192.168.31.45:8081/mf-edu/endpointVideo';
                } else {
                    url = 'http://111.231.135.83/hsd-server/endpointVideo';
                }
                this.connetWM(url, {}, this.onConnected, this.onConnectionInactive);
            },
            onConnectionInactive (errorEvent) {
                if (errorEvent.type === 'close') {
                    if (this.userId) {
                        setTimeout(this.connectSrv, 5000);
                    }
                }
            },
            disconnect () {
                this.disconnetWM();
            }
        },
        mounted() {
            this.routeName = this.$route.name;
            this.processMenuList();
        },
        created() {
            if (this.enableStomp) {
                this.connectSrv();
            }
        }
    }
</script>

<style lang="less">
    .main {
        .ivu-layout-header {
            padding: 0 16px;
        }

        .layout-con {
            height: 100%;
            width: 100%;
        }

        .menu-item span {
            display: inline-block;
            overflow: hidden;
            width: 69px;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: bottom;
            transition: width .2s ease .2s;
        }

        .menu-item i {
            transform: translateX(0px);
            transition: font-size .2s ease, transform .2s ease;
            vertical-align: middle;
            font-size: 16px;
        }

        .collapsed-menu span {
            width: 0px;
            transition: width .2s ease;
        }

        .collapsed-menu i {
            transform: translateX(5px);
            transition: font-size .2s ease .2s, transform .2s ease .2s;
            vertical-align: middle;
            font-size: 22px;
        }

        .menu-slider {
            background-color: #fff;

            .ivu-layout-sider-trigger {
                background-color: #fff;

                i {
                    color: #515a6e;
                }
            }
        }

        .main-layout {
            background-image: url('../../assets/images/main-layout-background.jpg');
            background-size: cover;
            background-position: center;

            .ivu-layout-content {
                padding: 16px !important;
            }
        }
    }
</style>