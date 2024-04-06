class WikipediaSandboxPage {
    // Method to navigate to the Wikipedia Sandbox page
    visit() {
      cy.visit('https://en.wikipedia.org/wiki/Wikipedia:Sandbox');
    }
  
    // Method to click the 'Edit source' button to start editing
    edit() {
      cy.get('#ca-edit').click();
      // The dialog box does not appear immediately
      cy.wait(1000);
      // Check if the welcome dialog appears and click 'Start editing' if it does
      cy.get('body').then(($body) => {
        if ($body.find(".oo-ui-window-content").length > 0) {
          cy.get('.oo-ui-window-content .oo-ui-buttonElement-button').contains('Start editing').click();
        }
      });
    }
  
    // Method to type or replace text in the standard textarea editor
    typeText(text) {
      cy.get('textarea[name="wpTextbox1"]').clear().type(text, { delay: 0 });
    }
  
    // Method to save changes with a provided edit summary
    saveChanges(summary, saveButton = true) {
      if(summary) {
        cy.get('#wpSummary').type(summary);
      }
      
      // Option to change clicks on the "Publish changes" button
      if(saveButton) {
        cy.get('#wpSave').click();
      }
    }
  
    // Method to preview changes without saving them
    previewChanges() {
      cy.get('#wpPreview').click();
    }
  
    // Method to assert that changes were saved successfully by checking for the edit summary
    assertChangesSaved(summary) {
      cy.contains(summary).should('exist');
    }
  
    // Method to cancel editing and assert no changes were saved
    cancelEditing() {
      cy.get('#mw-editform-cancel').click();
      // Confirm navigation if necessary
      cy.on('window:confirm', () => true);
    }

    // Method to assert that changes were saved successfully by checking for the edit summary
    assertChangesCanceled(summary) {
      cy.contains(summary).should('not.exist');
    }

    // Method that checks the number of remaining available characters
    assertAvailableRemainingDigits(numbers) {
      // Waiting for counter update
      cy.wait(500)
      cy.get('#wpSummaryWidget .oo-ui-labelElement-label').should('have.text', numbers);
    }
  }
  
  export default WikipediaSandboxPage;
  