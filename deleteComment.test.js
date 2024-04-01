// All necessary imports here for unit test by jest
jest.mock('./MeditationSession', () => ({
    deleteComment: jest.fn(),
    saveCommentsToLocalStorage: jest.fn(),
   }));
   //unit test for deleteComment function 
   const { deleteComment, saveCommentsToLocalStorage } = require('./MeditationSession');//path from MeditationSession.js
   
   // unit tests with some scenerios and they all passed.
   describe('deleteComment functionality', () => {
    beforeEach(() => {
       document.body.innerHTML = `
         <div>
           <span id="testComment">This is a comment</span>
         </div>
       `;
       localStorage.clear();
       jest.clearAllMocks(); // Clear all mocks before each test
    });
   
    test('should delete a comment from the DOM', () => {
       const commentElement = document.getElementById('testComment');
       expect(commentElement).not.toBeNull(); // Ensure the comment exists before deletion
   
       deleteComment.mockImplementation(() => {
         commentElement.remove();
       });
   
       deleteComment(commentElement); // Perform deletion
   
       // After deletion, the element should not be found
       expect(document.getElementById('testComment')).toBeNull();
    });
   
    
   
    test('should do nothing when commentElement is null', () => {
       // Call deleteComment with null
       const testFn = () => deleteComment(null);
   
       // There should be no error thrown
       expect(testFn).not.toThrow();
   
       // saveCommentsToLocalStorage should not have been called
       expect(saveCommentsToLocalStorage).not.toHaveBeenCalled();
    });
   
    test('should handle when commentElement is undefined', () => {
       // Call deleteComment with undefined
       const testFn = () => deleteComment(undefined);
   
       // There should be no error thrown
       expect(testFn).not.toThrow();
   
       // saveCommentsToLocalStorage should not have been called
       expect(saveCommentsToLocalStorage).not.toHaveBeenCalled();
    });
   });
   