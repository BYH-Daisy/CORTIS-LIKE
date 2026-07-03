import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import BlurText from './BlurText'
import BubbleMenu from './BubbleMenu'
import Carousel from './Carousel'
import ClickSpark from './ClickSpark'
import { useAudio, songData } from './AudioContext.jsx'
import './App.css'

const images = Array.from({ length: 48 }, (_, i) => `/slides/${i + 1}.jpg`)

const danmakuColors = [
  '#ff5470', '#4fc3f7', '#66bb6a', '#ffd54f',
  '#ce93d8', '#ff8a65', '#4dd0e1', '#f06292',
  '#aed581', '#fff176',
]

const heartEmojis = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🫶', '💕', '✨', '🥰']

function createBullet(text, container) {
  if (!container) return
  const bullet = document.createElement('span')
  bullet.className = 'bullet'
  bullet.textContent = text
  bullet.style.color = danmakuColors[Math.floor(Math.random() * danmakuColors.length)]

  const stage = container.parentElement
  const stageW = stage.clientWidth
  const stageH = stage.clientHeight

  const topMin = stageH * 0.10
  const topMax = stageH * 0.78
  bullet.style.top = (topMin + Math.random() * (topMax - topMin)) + 'px'

  container.appendChild(bullet)

  const textW = Math.max(bullet.offsetWidth || 0, text.length * 12)
  const startX = stageW + 20
  const travel = stageW + textW + 60

  bullet.style.left = startX + 'px'

  const speed = 80 + Math.random() * 120
  const duration = travel / speed
  const startTime = performance.now()

  function animate(now) {
    if (!bullet.isConnected) return
    const progress = Math.min((now - startTime) / 1000 / duration, 1)
    bullet.style.transform = `translateX(${-travel * progress}px)`
    if (progress < 1) requestAnimationFrame(animate)
    else bullet.remove()
  }
  requestAnimationFrame(animate)
}

function spawnHeart(btnEl) {
  if (!btnEl) return
  const el = document.createElement('div')
  el.className = 'heart-float'
  el.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)]

  const rect = btnEl.getBoundingClientRect()
  el.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 140) + 'px'
  el.style.top = (rect.top - 10 + (Math.random() - 0.5) * 30) + 'px'
  el.style.fontSize = (24 + Math.random() * 28) + 'px'

  document.body.appendChild(el)

  const drift = (Math.random() - 0.5) * 140
  const rise = 160 + Math.random() * 220
  const startTime = performance.now()

  function anim(now) {
    const progress = Math.min((now - startTime) / 3000, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    el.style.transform = `translate(${drift * ease}px, ${-rise * ease}px) scale(${1 - ease * 0.5})`
    el.style.opacity = 1 - ease
    if (progress < 1) requestAnimationFrame(anim)
    else el.remove()
  }
  requestAnimationFrame(anim)
}



function Watermark() {
  const dots = useMemo(() => {
    const cols = 6, rows = 3
    const cellW = 100 / cols, cellH = 100 / rows
    const result = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result.push({
          left: cellW * c + Math.random() * cellW * 0.5,
          top: cellH * r + Math.random() * cellH * 0.5,
        })
      }
    }
    return result
  }, [])
  return (
    <div className="watermark-layer">
      {dots.map((d, i) => (
        <img
          key={i}
          className="watermark-dot"
          src="/watermark.png"
          alt=""
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(location.state?.openMenu || false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [likeCounts, setLikeCounts] = useState(() => images.map(() => 0))
  const [songLikes, setSongLikes] = useState(() => songData.map(() => 0))
  const [danmakuList, setDanmakuList] = useState([
    '五小只长长久久！', '最爱烤蹄子', '马婷婷是最棒的小队长！',
    '雨凡跳舞太帅啦！', '猪猪进步超多啊！', '盐盐大声唱！', '阔糯是康阿叽啊！',
  ])
  const [inputValue, setInputValue] = useState('')
  const [slideshowActive, setSlideshowActive] = useState(true)
  const lyricsScrollRef = useRef(null)
  const {
    currentSong, isPlaying, currentTime, duration,
    lyrics, currentLyricIndex,
    handlePlay, switchSong, handleSeek, formatTime,
  } = useAudio()

  const danmakuLayerRef = useRef(null)
  const stageRef = useRef(null)
  const btnLikeRef = useRef(null)
  const songLikeRef = useRef(null)
  const inputRef = useRef(null)
  const spawnIndexRef = useRef(0)
  const currentSlideRef = useRef(currentSlide)
  const sproutRef = useRef(null)

  useEffect(() => {
    if (menuOpen && sproutRef.current) {
      sproutRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [menuOpen])

  useEffect(() => { currentSlideRef.current = currentSlide }, [currentSlide])

  useEffect(() => {
    if (!slideshowActive) return
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [slideshowActive])

  useEffect(() => {
    if (danmakuList.length === 0) return
    const spawn = () => {
      const idx = spawnIndexRef.current % danmakuList.length
      spawnIndexRef.current++
      createBullet(danmakuList[idx], danmakuLayerRef.current)
    }
    spawn()
    const timer = setInterval(spawn, 1500)
    return () => clearInterval(timer)
  }, [danmakuList.length])

  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text) return
    setDanmakuList(prev => {
      const next = [...prev, text]
      return next.length > 20 ? next.slice(1) : next
    })
    createBullet(text, danmakuLayerRef.current)
    setInputValue('')
    inputRef.current?.focus()
  }, [inputValue])

  const doLike = useCallback(() => {
    const slide = currentSlideRef.current
    setLikeCounts(prev => {
      const next = [...prev]
      next[slide]++
      return next
    })
    spawnHeart(btnLikeRef.current)
  }, [])

  const doSongLike = useCallback(() => {
    if (currentSong === null) return
    setSongLikes(prev => {
      const n = [...prev]
      n[currentSong]++
      return n
    })
  }, [currentSong])

  useEffect(() => {
    const el = btnLikeRef.current
    if (!el) return
    let timer = null

    const start = (e) => {
      e.preventDefault()
      doLike()
      timer = setInterval(doLike, 150)
    }
    const stop = () => {
      if (timer) { clearInterval(timer); timer = null }
    }

    el.addEventListener('mousedown', start)
    el.addEventListener('mouseup', stop)
    el.addEventListener('mouseleave', stop)
    el.addEventListener('touchstart', start, { passive: false })
    el.addEventListener('touchend', stop)
    el.addEventListener('touchcancel', stop)

    return () => {
      el.removeEventListener('mousedown', start)
      el.removeEventListener('mouseup', stop)
      el.removeEventListener('mouseleave', stop)
      el.removeEventListener('touchstart', start)
      el.removeEventListener('touchend', stop)
      el.removeEventListener('touchcancel', stop)
      if (timer) clearInterval(timer)
    }
  }, [doLike])

  useEffect(() => {
    const el = songLikeRef.current
    if (!el) return
    let timer = null
    const start = (e) => {
      e.preventDefault()
      doSongLike()
      timer = setInterval(doSongLike, 150)
    }
    const stop = () => { if (timer) { clearInterval(timer); timer = null } }
    el.addEventListener('mousedown', start)
    el.addEventListener('mouseup', stop)
    el.addEventListener('mouseleave', stop)
    el.addEventListener('touchstart', start, { passive: false })
    el.addEventListener('touchend', stop)
    el.addEventListener('touchcancel', stop)
    return () => {
      el.removeEventListener('mousedown', start)
      el.removeEventListener('mouseup', stop)
      el.removeEventListener('mouseleave', stop)
      el.removeEventListener('touchstart', start)
      el.removeEventListener('touchend', stop)
      el.removeEventListener('touchcancel', stop)
      if (timer) clearInterval(timer)
    }
  }, [doSongLike])

  useEffect(() => {
    if (currentLyricIndex >= 0 && lyricsScrollRef.current) {
      const el = lyricsScrollRef.current.children[currentLyricIndex]
      if (el) {
        const container = lyricsScrollRef.current
        const offset = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2
        container.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' })
      }
    }
  }, [currentLyricIndex])



  return (
    <ClickSpark sparkColor="#4caf50" sparkRadius={50} sparkCount={10}>
      <Watermark />
      <section className="cover">
        <img src="/cover.jpg" alt="cover" className="cover-bg" />
        <div className="cover-right-wrap">
          <img src="/cover-right.jpg" alt="" className="cover-right" />
        </div>
        <div className="cover-title">
          <BlurText text="下滑了解更多" className="blur-text" delay={200} animateBy="words" direction="bottom" />
          <span className="cover-arrow">↓</span>
        </div>
        <div className="pop-wrap left"><img src="/pop1.png" alt="" className="pop-img" /></div>
        <div className="pop-wrap right"><img src="/pop2.png" alt="" className="pop-img" /></div>
      </section>

      <section className="sprout-section" ref={sproutRef}>
        <BubbleMenu useFixedPosition={false} open={menuOpen} />
      </section>

      <section className="music-section">
        <div className="music-page">
          <div className="music-left">
            <h2 className="music-heading">EP1 COLOR OUTSIDE THE LINES</h2>
            <Carousel baseWidth={450} pauseOnHover loop round items={songData} onPlay={handlePlay} currentPlayingIndex={isPlaying ? currentSong : null} onActiveIndexChange={(i) => { switchSong(i) }} />
            <div className="player-controls">
              <div className="player-progress" onClick={handleSeek}>
                <div className="player-progress-track">
                  <div className="player-progress-fill" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
                  <div className="player-progress-thumb" style={{ left: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
                </div>
                <div className="player-time">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
            <button ref={songLikeRef} className={`player-like-standalone${currentSong !== null && songLikes[currentSong] > 0 ? ' liked' : ''}`}>
              ♡<span className="player-like-count">{currentSong !== null ? songLikes[currentSong] : 0}</span>
            </button>
          </div>
          <div className="music-right">
            <div className="lyrics-panel">
              <div className="lyrics-header">
                <div className="lyrics-header-title">{currentSong !== null ? songData[currentSong].title : '歌词'}</div>
                {currentSong !== null && songData[currentSong].artist && <div className="lyrics-header-artist">{songData[currentSong].artist}</div>}
              </div>
              <div className="lyrics-scroll" ref={lyricsScrollRef}>
                {lyrics.length > 0 ? lyrics.map((entry, i) => (
                  <div key={i} className={`lyric-block${i === currentLyricIndex ? ' active' : ''}${i >= 0 && i < currentLyricIndex ? ' passed' : ''}${currentLyricIndex < 0 ? ' upcoming' : ''}`}>
                    <p className="lyric-kr">{entry.korean}</p>
                    <p className="lyric-cn">{entry.chinese}</p>
                  </div>
                )) : (
                  <p className="lyric-line">等待歌曲和歌词…</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="danmaku-section">
        <h2 className="danmaku-heading">SHOW YOUR LOVE</h2>
        <div className="container">
          <div
            className="stage"
            ref={stageRef}
          >
            <div className="slides">
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className={i === currentSlide ? 'active' : ''}
                  onClick={() => setSlideshowActive(v => !v)}
                />
              ))}
            </div>
            <div className="danmaku-layer" ref={danmakuLayerRef} />
          </div>

          <div className="bottom-bar">
            <button
              className={'btn-like' + (likeCounts[currentSlide] > 0 ? ' liked' : '')}
              ref={btnLikeRef}
            >
              ♡<span className="count">{likeCounts[currentSlide]}</span>
            </button>
            <div className="like-hint">点赞（长按连发）</div>
            <div className="input-wrap">
              <input
                ref={inputRef}
                type="text"
                placeholder="输入弹幕内容…"
                maxLength={60}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
            </div>
            <button className="btn-send" onClick={handleSend}>➤</button>
          </div>

          <div className="footer-info">Enter 发送 · 点击画面暂停轮播</div>
        </div>
      </section>
      <footer className="site-footer">
        <div>2025计算机思维概论结课作业  2025级广播电视编导文艺编导方向 毕栎涵 202506013014</div>
        <div className="footer-divider"></div>
        <div>本网页所有内容仅为学生作业，不做商用</div>
      </footer>
    </ClickSpark>
  )
}
