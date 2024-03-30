const { VideoModal } = require('./videopage');

describe('VideoModal - closeModal', () => {
  beforeEach(() => {
    document.getElementById = jest.fn((id) => {
      if (id === 'modal') return { style: { display: '' } }; // Mock modal element
      if (id === 'videoFrame') return { src: '' }; // Mock videoFrame element
      return null; 
    });

    document.getElementsByClassName = jest.fn(className => {
      if (className === 'close') return [{ onclick: jest.fn() }];
      return [];
    });

    document.querySelectorAll = jest.fn(selector => {
      if (selector === '.video-card') return [{ addEventListener: jest.fn() }];
      return [];
    });
  });

  it('hides modal and clears videoFrame src', () => {
    const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
    videoModal.openModal('https://www.example.com'); 
    videoModal.closeModal(); 

    expect(videoModal.modal.style.display).toBe('none');
    expect(videoModal.videoFrame.src).toBe('');
  });
});
