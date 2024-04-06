# Wikipedia Automated Testing Suite with Cypress

## Overview

This repository contains an automated testing package to test the basic functionality of the Wikipedia website. When writing tests, the Cypress framework was used.
## Included Tests

The testing suite includes the following specifications, with each test aimed at verifying a key aspect of the Wikipedia platform:

- **Authentication (`authentication.cy.js`)**: Tests the login/logout functionality, ensuring user authentication works as expected.
- **Editing (`editing.cy.js`)**: Validates the ability of users to edit and save content, maintaining the collaborative essence of Wikipedia.
- **Language Selection (`language.cy.js`)**: Ensures the site's multilingual features function correctly, allowing users to switch languages seamlessly.
- **Navigation (`navigation.cy.js`)**: Assesses the website's navigational elements for reliability in guiding users through content.
- **Search Functionality (`search.cy.js`)**: Confirms the effectiveness of the search tool in finding relevant articles and information.

For an illustrative look into the test execution process, video links for each test will be provided below:
- **Authentication**: [authentication.cy.js](https://drive.google.com/file/d/1HEdLtU9QIPqgfUttVDN5L_xJxsUeF07K/view?usp=drive_link)
- **Editing**: [editing.cy.js](https://drive.google.com/file/d/1BsEh6ZodfIkK-gN-B2qoNJTDHyAfdhBd/view?usp=drive_link)
- **Language Selection**: [language.cy.js](https://drive.google.com/file/d/127CzOgqsI49imbDdy5z6L9UZNUkQ3LtI/view?usp=drive_link)
- **Navigation**: [navigation.cy.js](https://drive.google.com/file/d/1DfTntporm7_srdChKinrzjcqzfxHGb6Z/view?usp=drive_link)
- **Search Functionality**: [search.cy.js](https://drive.google.com/file/d/1b7oyh880acmAFY3SGq0-zXCNIIpF0cLF/view?usp=drive_link)
  
## Quick Start

Ensure you have Node.js installed to work with this suite. Follow these steps to set up the testing environment on your local machine:

1. **Clone the Repository**: Get a local copy of the codebase to start running the tests.
 - `git clone https://github.com/testomut/WikiAutoTestsCypress`
2. **Install Dependencies**: Navigate to the project directory and install the necessary packages.
 - `npm install`

### Running Tests

Execute the tests with predefined npm scripts designed to streamline the testing process:

- **Run All Tests**: `npm run tests` – Runs the full suite, managing reports automatically.
- **Individual Test Execution**: Utilize `npx cypress open` for a GUI selection of specific tests.

## Resources

- **Test Design Document**: [AuraWikiCypressTestCases](https://docs.google.com/spreadsheets/d/19my7IRcpZLbWiFUoFfTQ4UOh8tItjYjsKIeG1dPXy68/edit?usp=sharing)
- **Test Report**: [View Report](https://testomut.github.io/WikiAutoTestsCypress/)


