import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

const AudioCtx = createContext(null)

export const songData = [
  { title: 'GO!', artist: 'CORTIS', cover: '/song1-cover.jpg', audio: '/song1.mp3', lyricsUrl: '/song1-lyrics.txt' },
  { title: 'What You Want', artist: 'CORTIS', cover: '/song2-cover.jpg', audio: '/song2.mp3', lyricsUrl: '/song2-lyrics.txt' },
  { title: 'FaSHioN', artist: 'CORTIS', cover: '/song3-cover.jpg', audio: '/song3.mp3', lyricsUrl: '/song3-lyrics.txt' },
  { title: 'JoyRide', artist: 'CORTIS', cover: '/song4-cover.jpg', audio: '/song4.mp3', lyricsUrl: '/song4-lyrics.txt' },
  { title: 'Lullaby', artist: 'CORTIS', cover: '/song5-cover.jpg', audio: '/song5.mp3', lyricsUrl: '/song5-lyrics.txt' },
]

export function AudioProvider({ children }) {
  const audioRef = useRef(null)
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [lyrics, setLyrics] = useState([])
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1)

  const formatTime = useCallback((t) => {
    if (!t || !isFinite(t)) return '0:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }, [])

  const handlePlay = useCallback((i) => {
    const song = songData[i]
    if (!song?.audio) return
    if (currentSong === i && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
      return
    }
    setCurrentSong(i)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.src = song.audio
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [currentSong, isPlaying])

  const switchSong = useCallback((i) => {
    if (i === currentSong) return
    const song = songData[i]
    if (!song?.audio) return
    setCurrentSong(i)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = song.audio
    }
    setIsPlaying(false)
  }, [currentSong])

  const handleSeek = useCallback((e) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    audio.currentTime = pos * duration
    setCurrentTime(audio.currentTime)
  }, [duration])

  useEffect(() => {
    const song = currentSong !== null ? songData[currentSong] : null
    if (!song?.lyricsUrl) { setLyrics([]); return }
    setLyrics([])
    setCurrentLyricIndex(-1)
    fetch(song.lyricsUrl).then(r => r.text()).then(text => {
      const lines = text.split('\n').filter(Boolean)
      const parsed = []
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/^\[(\d+):(\d+):(\d+)\]\[(\d+):(\d+):(\d+)\](.+)/)
        if (m) {
          const start = +m[1] * 60 + +m[2] + +m[3] / 100
          const end = +m[4] * 60 + +m[5] + +m[6] / 100
          const korean = m[7].trim()
          const chinese = i + 1 < lines.length ? lines[i + 1] : ''
          parsed.push({ start, end, korean, chinese })
          i++
        }
      }
      setLyrics(parsed)
    }).catch(() => setLyrics([]))
  }, [currentSong])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleEnd = () => { setIsPlaying(false); setCurrentLyricIndex(-1); setCurrentTime(0) }
    const handleTime = () => {
      setCurrentTime(audio.currentTime)
      if (lyrics.length > 0) {
        const t = audio.currentTime
        let idx = -1
        for (let j = 0; j < lyrics.length; j++) {
          if (t >= lyrics[j].start && t < lyrics[j].end) { idx = j; break }
        }
        if (idx === -1) {
          for (let j = lyrics.length - 1; j >= 0; j--) {
            if (t >= lyrics[j].start) { idx = j; break }
          }
        }
        setCurrentLyricIndex(idx)
      }
    }
    const handleMeta = () => setDuration(audio.duration)
    const handleDurChange = () => setDuration(audio.duration)
    audio.addEventListener('ended', handleEnd)
    audio.addEventListener('timeupdate', handleTime)
    audio.addEventListener('loadedmetadata', handleMeta)
    audio.addEventListener('durationchange', handleDurChange)
    return () => {
      audio.removeEventListener('ended', handleEnd)
      audio.removeEventListener('timeupdate', handleTime)
      audio.removeEventListener('loadedmetadata', handleMeta)
      audio.removeEventListener('durationchange', handleDurChange)
    }
  }, [lyrics])

  return (
    <AudioCtx.Provider value={{
      currentSong, isPlaying, currentTime, duration,
      lyrics, currentLyricIndex,
      handlePlay, switchSong, handleSeek, formatTime,
      audioRef,
    }}>
      <audio ref={audioRef} preload="auto" />
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  return useContext(AudioCtx)
}
