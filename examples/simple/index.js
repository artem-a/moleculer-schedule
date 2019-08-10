'use strict'

const { ServiceBroker } = require('moleculer')
const Schedule = require('../../index')

// Create broker
const broker = new ServiceBroker({ logger: console })

// Load my service
broker.createService({
  name: 'jobs',

  mixins: [Schedule],

  jobs: [
    {
      rule: '*/5 * * * * *',
      handler: 'hello'
    },
    {
      name: 'date',
      rule: '*/7 * * * * *',
      handler () {
        this.broker.logger.info(new Date())
      }
    }
  ],

  methods: {
    hello () {
      this.broker.logger.info('hello, world!')
    }
  }
})

// Start server
broker.start().catch(broker.logger.error)
