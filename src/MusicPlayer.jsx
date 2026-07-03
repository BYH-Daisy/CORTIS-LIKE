import { useState, useRef } from 'react'

const defaultTracks = [
  { title: '歌曲 1', src: '/music1.mp3' },
  { title: '歌曲 2', src: '/music2.mp3' },
  { title: '歌曲 3', src: '/music3.mp3' },
]

export default function MusicPlayer({ tracks = defaultTracks }) {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)

  const track = tracks[current]

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const next = () => {
    setCurrent((current + 1) % tracks.length)
    setProgress(0)
    setPlaying(false)
  }

  const prev = () => {
    setCurrent((current - 1 + tracks.length) % tracks.length)
    setProgress(0)
    setPlaying(false)
  }

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        src={track.src}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setProgress(audioRef.current.currentTime / (audioRef.current.duration || 1))
          }
        }}
        onEnded={next}
      />
      <div className="music-cover">
        <span className="music-icon">♪</span>
      </div>
      <div className="music-info">
        <div className="music-title">{track.title}</div>
        <div className="music-progress">
          <div className="music-progress-track">
            <div className="music-progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
      <div className="music-controls">
        <button className="music-btn" onClick={prev}>⏮</button>
        <button className="music-btn play-btn" onClick={toggle}>
          {playing ? '⏸' : '▶'}
        </button>
        <button className="music-btn" onClick={next}>⏭</button>
      </div>
    </div>
  )
}
