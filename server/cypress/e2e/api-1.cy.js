describe('GET /customers API Tests', () => {
  describe('Default behavior (no query parameters)', () => {
    it('should return customers with default pagination and correct structure', () => {
      cy.request('/customers').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('customers')
        expect(response.body).to.have.property('pageInfo')
        expect(response.body.customers).to.be.an('array')
        expect(response.body.customers.length).to.be.at.most(10)
        expect(response.body.pageInfo.currentPage).to.eq(1)
      })
    })

    it('should return customers and pageInfo with correct structure', () => {
      cy.request('/customers').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.headers['content-type']).to.include('application/json')
        
        const customer = response.body.customers[0]
        
        // Verify customer structure
        expect(customer).to.have.property('id')
        expect(customer).to.have.property('name')
        expect(customer).to.have.property('employees')
        expect(customer).to.have.property('size')
        expect(customer).to.have.property('industry')
        
        // contactInfo can be null or object
        if (customer.contactInfo !== null) {
          expect(customer.contactInfo).to.have.property('name')
          expect(customer.contactInfo).to.have.property('email')
        }
        
        // address can be null or object
        if (customer.address !== null) {
          expect(customer.address).to.have.property('street')
          expect(customer.address).to.have.property('city')
          expect(customer.address).to.have.property('state')
          expect(customer.address).to.have.property('zipCode')
          expect(customer.address).to.have.property('country')
        }
        
        // Verify pageInfo structure
        expect(response.body.pageInfo).to.have.property('currentPage')
        expect(response.body.pageInfo).to.have.property('totalPages')
        expect(response.body.pageInfo).to.have.property('totalCustomers')
        expect(response.body.pageInfo.currentPage).to.be.a('number')
        expect(response.body.pageInfo.totalPages).to.be.a('number')
        expect(response.body.pageInfo.totalCustomers).to.be.a('number')
      })
    })
  })

  describe('Pagination parameters', () => {
    it('should handle pagination with page and limit parameters', () => {
      cy.request('/customers?page=2').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.pageInfo.currentPage).to.eq(2)
      })

      cy.request('/customers?limit=5').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.customers.length).to.be.at.most(5)
      })

      cy.request('/customers?page=3&limit=15').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.pageInfo.currentPage).to.eq(3)
        expect(response.body.customers.length).to.be.at.most(15)
      })
    })

    it('should return 400 for invalid pagination parameters', () => {
      cy.request({
        url: '/customers?page=-1',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400)
      })

      cy.request({
        url: '/customers?limit=-5',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400)
      })

      cy.request({
        url: '/customers?page=abc',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400)
      })

      cy.request({
        url: '/customers?limit=xyz',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400)
      })
    })
  })

  describe('Size filter parameter', () => {
    const sizeTestCases = [
      { size: 'Small', minEmployees: 0, maxEmployees: 100 },
      { size: 'Medium', minEmployees: 100, maxEmployees: 1000 },
      { size: 'Enterprise', minEmployees: 1000, maxEmployees: 10000 },
      { size: 'Large Enterprise', minEmployees: 10000, maxEmployees: 50000 },
      { size: 'Very Large Enterprise', minEmployees: 50000, maxEmployees: Infinity }
    ]

    sizeTestCases.forEach(({ size, minEmployees, maxEmployees }) => {
      it(`should filter customers by ${size} size`, () => {
        cy.request(`/customers?size=${size}`).then((response) => {
          expect(response.status).to.eq(200)
          response.body.customers.forEach((customer) => {
            expect(customer.size).to.eq(size)
            expect(customer.employees).to.be.at.least(minEmployees)
            if (maxEmployees !== Infinity) {
              expect(customer.employees).to.be.lessThan(maxEmployees)
            }
          })
        })
      })
    })

    it('should return 400 for invalid size parameter', () => {
      cy.request({
        url: '/customers?size=InvalidSize',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400)
      })
    })
  })

  describe('Industry filter parameter', () => {
    const industries = ['Logistics', 'Retail', 'Technology', 'HR', 'Finance']

    industries.forEach((industry) => {
      it(`should filter customers by ${industry} industry`, () => {
        cy.request(`/customers?industry=${industry}`).then((response) => {
          expect(response.status).to.eq(200)
          response.body.customers.forEach((customer) => {
            expect(customer.industry).to.eq(industry)
          })
        })
      })
    })

    it('should return 400 for invalid industry parameter', () => {
      cy.request({
        url: '/customers?industry=InvalidIndustry',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400)
      })
    })
  })

  describe('Combined filters', () => {
    it('should apply size, industry, and pagination filters together', () => {
      cy.request('/customers?size=Medium&industry=Technology').then((response) => {
        expect(response.status).to.eq(200)
        response.body.customers.forEach((customer) => {
          expect(customer.size).to.eq('Medium')
          expect(customer.industry).to.eq('Technology')
          expect(customer.employees).to.be.at.least(100)
          expect(customer.employees).to.be.lessThan(1000)
        })
      })

      cy.request('/customers?page=2&limit=10&size=Medium&industry=Technology').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.pageInfo.currentPage).to.eq(2)
        expect(response.body.customers.length).to.be.at.most(10)
        response.body.customers.forEach((customer) => {
          expect(customer.size).to.eq('Medium')
          expect(customer.industry).to.eq('Technology')
        })
      })

      cy.request('/customers?page=1&limit=20&size=Small').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.pageInfo.currentPage).to.eq(1)
        expect(response.body.customers.length).to.be.at.most(20)
        response.body.customers.forEach((customer) => {
          expect(customer.size).to.eq('Small')
        })
      })

      cy.request('/customers?page=1&limit=15&industry=Finance').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.pageInfo.currentPage).to.eq(1)
        expect(response.body.customers.length).to.be.at.most(15)
        response.body.customers.forEach((customer) => {
          expect(customer.industry).to.eq('Finance')
        })
      })
    })
  })

  describe('Data validation', () => {
    it('should verify customer data integrity and structure', () => {
      const validIndustries = ['Logistics', 'Retail', 'Technology', 'HR', 'Finance']
      
      cy.request('/customers?limit=50').then((response) => {
        expect(response.status).to.eq(200)
        
        const ids = response.body.customers.map(c => c.id)
        const uniqueIds = [...new Set(ids)]
        expect(ids.length).to.eq(uniqueIds.length)
        
        response.body.customers.forEach((customer) => {
          const { employees, size, industry } = customer
          
          // Verify size classification
          if (employees < 100) {
            expect(size).to.eq('Small')
          } else if (employees >= 100 && employees < 1000) {
            expect(size).to.eq('Medium')
          } else if (employees >= 1000 && employees < 10000) {
            expect(size).to.eq('Enterprise')
          } else if (employees >= 10000 && employees < 50000) {
            expect(size).to.eq('Large Enterprise')
          } else {
            expect(size).to.eq('Very Large Enterprise')
          }
          
          // Verify industry is valid
          expect(validIndustries).to.include(industry)
        })
      })
    })

    it('should verify optional fields structure when present', () => {
      cy.request('/customers?limit=50').then((response) => {
        expect(response.status).to.eq(200)
        
        const customersWithContact = response.body.customers.filter(c => c.contactInfo !== null)
        const customersWithAddress = response.body.customers.filter(c => c.address !== null)
        
        if (customersWithContact.length > 0) {
          customersWithContact.forEach((customer) => {
            expect(customer.contactInfo).to.have.property('name').that.is.a('string')
            expect(customer.contactInfo).to.have.property('email').that.is.a('string').and.include('@')
          })
        }
        
        if (customersWithAddress.length > 0) {
          customersWithAddress.forEach((customer) => {
            expect(customer.address).to.have.property('street').that.is.a('string')
            expect(customer.address).to.have.property('city').that.is.a('string')
            expect(customer.address).to.have.property('state').that.is.a('string')
            expect(customer.address).to.have.property('zipCode').that.is.a('string')
            expect(customer.address).to.have.property('country').that.is.a('string')
          })
        }
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle edge case scenarios gracefully', () => {
      cy.request('/customers?page=9999').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.customers).to.be.an('array')
      })

      cy.request('/customers?limit=1000').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.customers).to.be.an('array')
      })

      cy.request({
        url: '/customers?industry=technology',
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400]).to.include(response.status)
      })

      cy.request({
        url: '/customers?size=Small&size=Medium',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400])
      })
    })
  })
})
