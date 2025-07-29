import type {User} from "#api";

export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSanctumUser<User>()
    if (!user.value?.is_admin) {
        return navigateTo('/')
    }
})