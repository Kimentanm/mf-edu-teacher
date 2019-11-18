import Main from '@/views/main'
import appRouters from './appRouters'

export default [
    {
        path: '/login',
        name: 'login',
        meta: {
            hideInMenu: true
        },
        component: () => import('@/views/login.vue')
    },
    {
        path: '/',
        name: '_home',
        redirect: '/home',
        component: Main,
        meta: {},
        children: [
            {
                path: '/home',
                name: 'home',
                meta: {
                    title: '首页',
                    icon: 'md-planet'
                },
                component: () => import('@/views/home/home.vue')
            }
        ]
    },
    ...appRouters,
]
