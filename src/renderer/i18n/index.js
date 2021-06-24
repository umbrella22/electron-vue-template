export default function loadLanguage() {
    const context = require.context("./languages", false, /([a-z_]+)\.js$/i)

    const languages = context
        .keys()
        .map((key) => ({ key, name: key.match(/([a-z_-]+)\.js$/i)[1] }))
        .reduce(
            (languages, {key, name}) => {
                let lang;
                try {
                    // 引入 element-ui 语言包
                    lang = Object.assign(context(key).lang, require(`element-ui/lib/locale/lang/${name}`).default);
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