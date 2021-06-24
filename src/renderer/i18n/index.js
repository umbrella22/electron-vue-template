export default function loadLanguage() {
    const context = require.context("./languages", false, /([a-z_]+)\.js$/i)

    const languages = context
        .keys()
        .map((key) => ({ key, name: key.match(/([a-z_]+)\.js$/i)[1] }))
        .reduce(
            (languages, {key, name}) => ({
                ...languages,
                [name]: context(key).lang
            }),
            {}
        )

    return {context, languages}
}