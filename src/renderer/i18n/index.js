export default function loadLanguage() {
    const context = require.context("./languages", false, /([a-z_]+)\.js$/i)
    // 引入 element-ui 语言包
    const context2 = require.context("element-ui/lib/locale/lang", false, /([a-z_]+)\.js$/i)

    const languages = context
        .keys()
        .map((key) => ({ key, name: key.match(/([a-z_-]+)\.js$/i)[1] }))
        .reduce(
            (languages, {key, name}) => {
                console.log(key,name)
                let lang;
                try {
                    lang = Object.assign(context(key).lang, context2(key).default);
                } catch(err) {
                    lang = context(key).lang
                }
                return {
                    ...languages,
                    [name]: lang
                }
            },
            {}
        )

    return languages
}