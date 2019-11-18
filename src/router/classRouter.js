import Main from '@/views/main'

export default {
    path: '/class',
    name: 'class',
    meta: {
        hideInMenu: true
    },
    component: Main,
    children: [
        {
            path: 'class-index',
            name: 'class-index',
            meta: {
                icon: 'md-laptop',
                title: '课堂',
                hideInMenu: true
            },
            component: () => import('@/views/class/class.vue')
        }
    ]
}