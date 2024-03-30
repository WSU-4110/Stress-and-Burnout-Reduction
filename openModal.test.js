describe('VideoModal - openModal', () => {
  it('sets videoFrame src and displays modal', () => {
    const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
    const fakeUrl = 'https://example.com';
    videoModal.openModal(fakeUrl);

    expect(videoModal.videoFrame.src).toContain(fakeUrl);
    expect(videoModal.modal.style.display).toBe("block");
  });
});
