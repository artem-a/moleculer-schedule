'use strict'

const schedule = require('node-schedule')
const { ServiceBroker, Errors } = require('moleculer')
const Schedule = require('../../src')

describe('Test Schedule constructor', () => {
  const broker = new ServiceBroker({ logger: false })

  const schema = {
    mixins: [Schedule],
    jobs: [{
      name: 'hello',
      rule: '*/1 * * * * *',
      handler: 'hello'
    }],
    methods: {
      hello: jest.fn()
    }
  }
  const service = broker.createService(schema)

  beforeAll(() => broker.start())
  afterAll(() => broker.stop())

  it('should be created', () => {
    expect(service).toBeDefined()
  })

  it('should have $jobs initialised', () => {
    expect(service.$jobs).toBeDefined()
    expect(service.$jobs.length).toBe(1)
    expect(service.$jobs[0]).toBeInstanceOf(schedule.Job)
    expect(service.$jobs[0].name).toBe(schema.jobs[0].name)
  })

  it('should have handler to be invoked on time', done => {
    setTimeout(() => {
      expect(schema.methods.hello).toHaveBeenCalledTimes(1)
      done()
    }, 1000)
  })
})

describe('Test Schedule invalid job handler', () => {
  const broker = new ServiceBroker({ logger: false })
  const schema = {
    mixins: [Schedule],
    jobs: [{ name: 'invalid', handler: null }]
  }

  it('should have an error with invalid handler type', () => {
    expect(() => broker.createService(schema))
      .toThrow(Errors.ServiceSchemaError)
  })
})

describe('Test Schedule getJob method', () => {
  const broker = new ServiceBroker({ logger: false })
  const service = broker.createService({
    mixins: [Schedule],
    jobs: [
      { name: 'foo', handler: jest.fn() },
      { name: 'bar', handler: jest.fn() }
    ]
  })

  it('should be found by name', () => {
    const job = service.getJob('foo')
    expect(job).not.toBeNull()
    expect(job).toBeInstanceOf(schedule.Job)
  })
})

describe('Test Schedule stopped handler', () => {
  const broker = new ServiceBroker({ logger: false })
  const service = broker.createService({
    mixins: [Schedule],
    jobs: [{ name: 'test', handler: jest.fn() }]
  })

  service.$jobs[0].cancel = jest.fn()

  it('should call the job cancel after stopping the broker', async () => {
    await broker.start()
    await broker.stop()

    expect(service.$jobs[0].cancel).toHaveBeenCalledTimes(1)
  })
})
