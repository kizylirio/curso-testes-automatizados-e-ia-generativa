/// <reference types="cypress" />

describe('API - /customers', () => {
  const apiUrl = Cypress.env('API_URL')

  it('returns a list of all customers when no query parameters are provided', () => {
    cy.request('GET', `${apiUrl}/customers`)
      .then(({ status, body }) => {
        expect(status).to.equal(200)
        expect(body.customers).to.have.length(10)
        expect(body.pageInfo.currentPage).to.equal(1)
        expect(body.pageInfo.totalPages).to.be.a('number')
        expect(body.pageInfo.totalCustomers).to.be.a('number')
      })
  })

  it('returns a list of customers for a specific page and limit', () => {
    const page = 2
    const limit = 5
    cy.request('GET', `${apiUrl}/customers?page=${page}&limit=${limit}`)
      .then(({ status, body }) => {
        expect(status).to.equal(200)
        expect(body.customers).to.have.length(limit)
        expect(body.pageInfo.currentPage).to.equal(page)
      })
  })

  it('filters customers by size', () => {
    const size = 'Small'
    cy.request('GET', `${apiUrl}/customers?size=${size}`)
      .then(({ status, body }) => {
        expect(status).to.equal(200)
        body.customers.forEach(customer => {
          expect(customer.size).to.equal(size)
        })
      })
  })

  it('filters customers by industry', () => {
    const industry = 'Technology'
    cy.request('GET', `${apiUrl}/customers?industry=${industry}`)
      .then(({ status, body }) => {
        expect(status).to.equal(200)
        body.customers.forEach(customer => {
          expect(customer.industry).to.equal(industry)
        })
      })
  })

  it('filters customers by all available parameters', () => {
    const page = 3
    const limit = 3
    const size = 'Enterprise'
    const industry = 'Retail'
    cy.request('GET', `${apiUrl}/customers?page=${page}&limit=${limit}&size=${size}&industry=${industry}`)
      .then(({ status, body }) => {
        expect(status).to.equal(200)
        expect(body.customers).to.have.length.at.most(limit)
        expect(body.pageInfo.currentPage).to.equal(page)
        body.customers.forEach(customer => {
          expect(customer.size).to.equal(size)
          expect(customer.industry).to.equal(industry)
        })
      })
  })

  it('returns a 400 for an invalid page', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/customers?page=-1`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.equal(400)
    })
  })

  it('returns a 400 for an invalid limit', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/customers?limit=abc`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.equal(400)
    })
  })

  it('returns a 400 for an invalid size', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/customers?size=Tiny`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.equal(400)
    })
  })

  it('returns a 400 for an invalid industry', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/customers?industry=Agriculture`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.equal(400)
    })
  })
})
