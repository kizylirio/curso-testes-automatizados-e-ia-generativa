context('Customers API - Success cases', () => {
  const apiBaseUrl = Cypress.env('apiBaseUrl') || 'http://localhost:3001'

  it('returns default customers structure', () => {
    // Arrange

    // Act
    cy.request('GET', `${apiBaseUrl}/customers`).then(({ status, body }) => {
      // Assert
      expect(status).to.equal(200)
      const { customers, pageInfo } = body
      expect(Array.isArray(customers)).to.be.true
      expect(pageInfo).to.have.property('currentPage').that.is.a('number')
      expect(pageInfo).to.have.property('totalPages').that.is.a('number')
      expect(pageInfo).to.have.property('totalCustomers').that.is.a('number')
    })
  })

  it('filters by size Medium and returns only Medium customers with expected employees range', () => {
    // Arrange

    // Act
    cy.request('GET', `${apiBaseUrl}/customers?size=Medium`).then(({ status, body }) => {
      // Assert
      expect(status).to.equal(200)
      const { customers } = body
      customers.forEach(customer => {
        const { size, employees } = customer
        expect(size).to.equal('Medium')
        expect(employees).to.be.at.least(100)
        expect(employees).to.be.below(1000)
      })
    })
  })

  it('filters by industry Technology and returns only Technology customers', () => {
    // Arrange

    // Act
    cy.request('GET', `${apiBaseUrl}/customers?industry=Technology`).then(({ status, body }) => {
      // Assert
      expect(status).to.equal(200)
      const { customers } = body
      customers.forEach(customer => {
        const { industry } = customer
        expect(industry).to.equal('Technology')
      })
    })
  })
})

context('Customers API - Error cases', () => {
  const apiBaseUrl = Cypress.env('apiBaseUrl') || 'http://localhost:3001'

  it('returns 400 for page equal to 0', () => {
    // Arrange

    // Act
    cy.request({ method: 'GET', url: `${apiBaseUrl}/customers?page=0`, failOnStatusCode: false }).then(({ status, body }) => {
      // Assert
      expect(status).to.equal(400)
      const { error } = body
      expect(error).to.be.a('string')
    })
  })

  it('returns 400 for page equal to -1', () => {
    // Arrange

    // Act
    cy.request({ method: 'GET', url: `${apiBaseUrl}/customers?page=-1`, failOnStatusCode: false }).then(({ status, body }) => {
      // Assert
      expect(status).to.equal(400)
      const { error } = body
      expect(error).to.be.a('string')
    })
  })

  it('returns 400 for limit equal to 0', () => {
    // Arrange

    // Act
    cy.request({ method: 'GET', url: `${apiBaseUrl}/customers?limit=0`, failOnStatusCode: false }).then(({ status, body }) => {
      // Assert
      expect(status).to.equal(400)
      const { error } = body
      expect(error).to.be.a('string')
    })
  })

  it('returns 400 for limit equal to -1', () => {
    // Arrange

    // Act
    cy.request({ method: 'GET', url: `${apiBaseUrl}/customers?limit=-1`, failOnStatusCode: false }).then(({ status, body }) => {
      // Assert
      expect(status).to.equal(400)
      const { error } = body
      expect(error).to.be.a('string')
    })
  })

  it('returns 400 for unsupported size value', () => {
    // Arrange

    // Act
    cy.request({ method: 'GET', url: `${apiBaseUrl}/customers?size=Unknown`, failOnStatusCode: false }).then(({ status, body }) => {
      // Assert
      expect(status).to.equal(400)
      const { error } = body
      expect(error).to.be.a('string')
    })
  })

  it('returns 400 for unsupported industry value', () => {
    // Arrange

    // Act
    cy.request({ method: 'GET', url: `${apiBaseUrl}/customers?industry=Unknown`, failOnStatusCode: false }).then(({ status, body }) => {
      // Assert
      expect(status).to.equal(400)
      const { error } = body
      expect(error).to.be.a('string')
    })
  })
})
