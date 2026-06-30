import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'n59ihvcl',
    dataset: 'production',
  },
  deployment: {
    autoUpdates: true,
  },
})
