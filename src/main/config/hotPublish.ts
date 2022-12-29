import { hotPublishUrl, hotPublishConfigName } from './const'
interface hotPublish {
    url: string;
    configName: string;
}

export const hotPublishConfig: hotPublish = {
    url: hotPublishUrl,
    configName: hotPublishConfigName
}