describe('VideoModal - closeModal', () => {
  it('hides modal and clears videoFrame src', () => {
    const videoModal = new VideoModal('modal', 'videoFrame', 'close', '.video-card');
    videoModal.closeModal();

    expect(videoModal.modal.style.display).toBe("none");
    expect(videoModal.videoFrame.src).toBe("");
  });
});
