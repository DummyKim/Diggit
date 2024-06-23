document.getElementById('miner_stop').addEventListener('click', function() {
  const staticImage = document.getElementById('miner_stop');
  const animatedGif = document.getElementById('miner_motion');
  const soundEffect = document.getElementById('soundEffect');


  staticImage.style.display = 'none'; // 정적 이미지를 숨깁니다.
  animatedGif.src = 'img/miner_motion.gif'; // GIF의 실제 경로를 설정합니다.
  animatedGif.style.display = 'block'; // GIF를 보이게 합니다.
  soundEffect.play();

  // 2초 후에 GIF를 다시 숨깁니다.
  setTimeout(() => {
    animatedGif.style.display = 'none';
    staticImage.style.display = 'block'; // 정적 이미지를 다시 보이게 합니다.
    animatedGif.src = ""; // GIF의 src를 비워 다시 로드를 방지합니다.
    soundEffect.pause(); // 소리 재생을 중지합니다.
    soundEffect.currentTime = 0; // 소리 파일의 재생 위치를 초기화합니다.
  }, 1580);
});