export default {
    /**
     * @export
     * @param {Array} data
     * @param {Object} dialog
     * @param {function} fun
     * @returns
     * @feature 消息弹窗通用函数
     */
    MessageBox(dialog, data, fun) {
        return new Promise((resolve, reject) => {
            dialog.showMessageBox({
                type: 'info',
                title: data.title,
                buttons: data.buttons,
                message: data.message
            }, index => {
                if (index === 0) {
                    let tempfun = async () => {
                        try {
                            resolve(await fun)
                        } catch (error) {
                            reject(error)
                        }
                    }
                    tempfun()
                }
            })
        })
    },
    /**
     * @export
     * @param {Array} data
     * @param {Object} dialog
     * @returns
     * @feature 错误消息弹窗
     */
    ErrorMessageBox(dialog, data) {
        return dialog.showErrorBox(
            data.title,
            data.message
        )
    }
}