const util = require('util')
const mime = require('mime-types')
const _ = require('lodash')
const randomize = require('randomatic')
const debug = require('debug')('botium-connector-landbot')

const SimpleRestContainer = require('botium-core/src/containers/plugins/SimpleRestContainer')
const { Capabilities: CoreCapabilities } = require('botium-core')

const URL = 'https://chat.landbot.io/v1/send/'

const Capabilities = {
  LANDBOT_TOKEN: 'LANDBOT_TOKEN'
}

class BotiumConnectorLandbot {
  constructor ({ queueBotSays, caps }) {
    this.queueBotSays = queueBotSays
    this.caps = caps
    this.delegateContainer = null
    this.delegateCaps = null
  }

  Validate () {
    debug('Validate called')

    this.caps = Object.assign({}, this.caps)

    if (!this.caps[Capabilities.LANDBOT_TOKEN]) throw new Error('LANDBOT_TOKEN capability required')

    if (!this.delegateContainer) {
      const customerToken = randomize('0', 10) + '/'
      this.delegateCaps = {
        [CoreCapabilities.SIMPLEREST_URL]: URL + customerToken,
        [CoreCapabilities.SIMPLEREST_METHOD]: 'POST',
        [CoreCapabilities.SIMPLEREST_HEADERS_TEMPLATE]: `{ "Authorization": "Token ${this.caps[Capabilities.LANDBOT_TOKEN]}"}`,
        [CoreCapabilities.SIMPLEREST_BODY_TEMPLATE]:
          `{
            "customer": {
              "name": "{{botium.conversationId}}"
            },
            "message": {
            }
          }`,
        [CoreCapabilities.SIMPLEREST_REQUEST_HOOK]: ({ requestOptions, msg, context }) => {
          const message = requestOptions.body.message
          if (msg.buttons && msg.buttons.length > 0 && (msg.buttons[0].text || msg.buttons[0].payload)) {
            message.type = 'text'
            message.message = msg.buttons[0].text || (_.isString(msg.buttons[0].payload) ? msg.buttons[0].payload : '')
            message.payload = msg.buttons[0].payload
          } else if (msg.media && msg.media.length > 0) {
            debug('The \'MEDIA\' message type is not supported yet.')
          } else {
            message.message = msg.messageText
            message.type = 'text'
          }
        },
        [CoreCapabilities.SIMPLEREST_RESPONSE_HOOK]: ({ botMsg }) => {
          debug(`Response Body: ${util.inspect(botMsg.sourceData, false, null, true)}`)
          const mapMedia = (m) => ({
            mediaUri: m.url,
            mimeType: mime.lookup(m.url) || 'application/unknown',
            altText: false
          })
          if (botMsg.sourceData.messages) {
            const message = botMsg.sourceData.messages[0]
            botMsg.buttons = botMsg.buttons || []
            botMsg.media = botMsg.media || []

            botMsg.messageText = message.message || message.title
            if (message.type === 'text') {

            } else if (message.type === 'image') {
              botMsg.media.push(mapMedia(message))
            } else if (message.type === 'dialog') {
              botMsg.buttons.push(...message.buttons.map((text, index) => ({
                text,
                payload: message.payloads[index]
              })))
            } else if (message.type === 'media_dialog') {
              botMsg.media.push(mapMedia(message))
              botMsg.buttons.push(...message.buttons.map((text, index) => ({
                text,
                payload: message.payloads[index]
              })))
            } else {
              debug(`The '${message.type}' message type is not supported yet.`)
            }
          }
        },
        [CoreCapabilities.SIMPLEREST_INBOUND_SELECTOR_JSONPATH]: '$.body.customer.name',
        [CoreCapabilities.SIMPLEREST_INBOUND_SELECTOR_VALUE]: '{{botium.conversationId}}',
        [CoreCapabilities.SIMPLEREST_IGNORE_EMPTY]: true,
        [CoreCapabilities.SIMPLEREST_INBOUND_ORDER_UNSETTLED_EVENTS_JSONPATH]: '$.body.messages[0].timestamp'
      }
      for (const capKey of Object.keys(this.caps).filter(c => c.startsWith('SIMPLEREST'))) {
        if (!this.delegateCaps[capKey]) this.delegateCaps[capKey] = this.caps[capKey]
      }

      debug(`Validate delegateCaps ${util.inspect(this.delegateCaps)}`)
      this.delegateContainer = new SimpleRestContainer({ queueBotSays: this.queueBotSays, caps: this.delegateCaps })
    }

    debug('Validate delegate')
    return this.delegateContainer.Validate()
  }

  async Build () {
    await this.delegateContainer.Build()
  }

  async Start () {
    await this.delegateContainer.Start()
  }

  async UserSays (msg) {
    await this.delegateContainer.UserSays(msg)
  }

  async Stop () {
    await this.delegateContainer.Stop()
  }

  async Clean () {
    await this.delegateContainer.Clean()
  }
}

module.exports = {
  PluginVersion: 1,
  PluginClass: BotiumConnectorLandbot
}
