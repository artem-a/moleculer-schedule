/**
 * moleculer-schedule
 * Copyright (c) 2019 Artem A. (https://github.com/artem-a/moleculer-schedule)
 * MIT Licensed
 */

'use strict'

const _ = require('lodash')
const { Job } = require('node-schedule')
const { ServiceSchemaError } = require('moleculer').Errors

module.exports = {
  name: 'schedule',

  methods: {
    getJob (name) {
      return _.find(this.$jobs, { name })
    }
  },

  created () {
    this.$jobs = _.map(this.schema.jobs, ({ name, handler }) => {
      let method

      if (_.isFunction(handler)) {
        method = handler.bind(this)
      } else if (_.hasIn(this, handler) && _.isFunction(this[handler])) {
        method = this[handler]
      } else {
        throw new ServiceSchemaError('Invalid job handler', { name, handler })
      }

      return new Job(name, method)
    })
  },

  started () {
    _.each(this.$jobs, (job, i) => {
      const { rule } = this.schema.jobs[i]
      job.schedule(rule)
    })
  },

  stopped () {
    _.invokeMap(this.$jobs, 'cancel')
  }
}
