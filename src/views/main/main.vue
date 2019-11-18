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
    import SideMenu from './components/side-menu'

    export default {
        name: "main",
        components: {HeaderBar, SideMenu},
        data() {
            return {
                isCollapsed: false,
                routeName: ''
            }
        },
        props: {},
        watch: {
            '$route'(val) {
                this.routeName = val.name;
                console.log(this.routeName);
            },
        },
        computed: {
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
            }
        },
        mounted() {
            this.processMenuList()
        },
        created() {
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