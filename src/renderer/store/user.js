import { defineStore } from 'pinia'
import { resetRouter } from '@/router'
import { usePermissionStore } from './permission'

const store = () => {
    return {
        token: JSON.parse(localStorage.getItem('token')),
        name: JSON.parse(localStorage.getItem('name')),
        roles: JSON.parse(localStorage.getItem('roles'))
    }
}

export const useUserStore = defineStore({
    id: 'user',
    store,
    actions: {
        login(data) {
            return new Promise((resolve, reject) => {
                const { username } = data
                if (username.includes('admin')) {
                    localStorage.setItem("token", "admin");
                    localStorage.setItem("roles", JSON.stringify(["admin"]));
                    localStorage.setItem("name", "Super Admin");
                    this.token = "admin"
                    this.name = "Super Admin"
                    this.roles = ["admin"]
                } else {
                    localStorage.setItem("token", "edit");
                    localStorage.setItem("roles", JSON.stringify(["edit"]));
                    localStorage.setItem("name", "Edit");
                    this.token = "edit"
                    this.name = "Edit"
                    this.roles = ["edit"]
                }
                resolve()
            })

        },
        logOut() {
            return new Promise((resolve, reject) => {
                const { ResetRoutes } = usePermissionStore()
                localStorage.setItem("token", "");
                localStorage.setItem("roles", JSON.stringify([]));
                localStorage.setItem("name", "");
                this.token = ""
                this.name = ""
                this.roles = []
                ResetRoutes()
                resetRouter()
                resolve()
            })
        },
        GetUserInfo() {
            return new Promise((resolve, reject) => {
                resolve(this.roles)
            })
        }
    }
})