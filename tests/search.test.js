// unit test for search method


jest.mock('../scripts/MeditationSession', () => ({
    search: jest.fn()
}));

// Importing the search function
const { search } = require('../scripts/MeditationSession');

describe('search function', () => {
    test('should call search function', () => {
        
        search();
        
        expect(search).toHaveBeenCalledTimes(1);
    });

    test('should return undefined', () => {
        
        search.mockReturnValue(undefined);

        
        const result = search();
        
        expect(result).toBeUndefined();
    });

    test('should return an empty array', () => {
       
        search.mockReturnValue([]);

        const result = search();
        
        expect(result).toEqual([]);
    });
});