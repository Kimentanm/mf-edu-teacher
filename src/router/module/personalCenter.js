import Main from '@/views/main'

export default {
    path: '/own',
    name: 'own',
    component: Main,
    meta: {},
    children: [
        {
            path: '/personalCenter',
            name: 'personalCenter',
            meta: {
                title: '个人中心',
                icon: 'md-planet'
            },
            component: () => import('@/views/personalCenter/personalCenter.vue')
        }
    ]
}   