"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, Volume2, VolumeX, Maximize, Upload } from "lucide-react"

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const controlsProgressRef = useRef<HTMLDivElement>(null) // Added ref for controls progress bar
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [lastClickedTime, setLastClickedTime] = useState<number | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false)

  const [customTimestamps, setCustomTimestamps] = useState({
    y: 0,
    u: 0,
    i: 0,
    o: 0,
    p: 0,
  })

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file)
      setVideoSrc(url)
      // Reset player state
      setCurrentTime(0)
      setDuration(0)
      setLastClickedTime(null)
      setIsPlaying(false)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  // Update current time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  // Update duration when metadata loads
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const togglePlayPause = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause()
          setIsPlaying(false)
        } else {
          await videoRef.current.play()
          setIsPlaying(true)
        }
      } catch (error) {
        // Handle play interruption errors silently
        console.log("[v0] Play/pause interrupted:", error)
      }
    }
  }

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickRatio = clickX / rect.width
      const newTime = clickRatio * duration

      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setLastClickedTime(newTime) // Store the clicked timestamp
    }
  }

  const jumpToPercentage = (percentage: number) => {
    if (videoRef.current && duration > 0) {
      const newTime = (percentage / 100) * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setLastClickedTime(newTime) // Update last clicked time for period key
    }
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const handleControlsProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (controlsProgressRef.current && videoRef.current) {
      const rect = controlsProgressRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickRatio = clickX / rect.width
      const newTime = clickRatio * duration

      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setLastClickedTime(newTime) // Store the clicked timestamp
    }
  }

  const jumpToCustomTimestamp = (key: keyof typeof customTimestamps) => {
    if (videoRef.current && duration > 0) {
      const timestamp = customTimestamps[key]
      if (timestamp <= duration) {
        videoRef.current.currentTime = timestamp
        setCurrentTime(timestamp)
        setLastClickedTime(timestamp) // Update last clicked time for period key
      }
    }
  }

  const parseTimeFromInput = (timeString: string): number => {
    const parts = timeString.split(":")
    if (parts.length === 2) {
      const minutes = Number.parseInt(parts[0]) || 0
      const seconds = Number.parseInt(parts[1]) || 0
      return minutes * 60 + seconds
    }
    // Fallback for just seconds
    return Number.parseInt(timeString) || 0
  }

  const formatTimeForInput = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleCustomTimestampChange = (key: keyof typeof customTimestamps, value: string) => {
    const numValue = parseTimeFromInput(value)
    setCustomTimestamps((prev) => ({
      ...prev,
      [key]: Math.max(0, numValue),
    }))
  }

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return // Don't trigger if typing in input

      switch (e.key) {
        case " ":
          e.preventDefault()
          togglePlayPause()
          break
        case ".":
          if (lastClickedTime !== null && videoRef.current) {
            videoRef.current.currentTime = lastClickedTime
            setCurrentTime(lastClickedTime)
            setIsKeyboardNavigating(true)
            setTimeout(() => setIsKeyboardNavigating(false), 2000)
          }
          break
        case "y":
        case "Y":
          e.preventDefault()
          jumpToCustomTimestamp("y")
          setIsKeyboardNavigating(true)
          setTimeout(() => setIsKeyboardNavigating(false), 2000)
          break
        case "u":
        case "U":
          e.preventDefault()
          jumpToCustomTimestamp("u")
          setIsKeyboardNavigating(true)
          setTimeout(() => setIsKeyboardNavigating(false), 2000)
          break
        case "i":
        case "I":
          e.preventDefault()
          jumpToCustomTimestamp("i")
          setIsKeyboardNavigating(true)
          setTimeout(() => setIsKeyboardNavigating(false), 2000)
          break
        case "o":
        case "O":
          e.preventDefault()
          jumpToCustomTimestamp("o")
          setIsKeyboardNavigating(true)
          setTimeout(() => setIsKeyboardNavigating(false), 2000)
          break
        case "p":
        case "P":
          e.preventDefault()
          jumpToCustomTimestamp("p")
          setIsKeyboardNavigating(true)
          setTimeout(() => setIsKeyboardNavigating(false), 2000)
          break
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          e.preventDefault()
          const percentage = Number.parseInt(e.key) * 10
          jumpToPercentage(percentage)
          setIsKeyboardNavigating(true)
          setTimeout(() => setIsKeyboardNavigating(false), 2000)
          break
      }
    },
    [lastClickedTime, duration, customTimestamps], // Added customTimestamps to dependencies
  )

  // Set up keyboard event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  }, [handleKeyPress])

  // Format time display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="w-full bg-card overflow-hidden shadow-lg">
      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />

      {/* Video Element */}
      <div className="relative bg-black">
        {videoSrc ? (
          <video
            ref={videoRef}
            className="w-full h-auto max-h-[80vh]"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            src={videoSrc}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-[50vh] flex items-center justify-center bg-muted">
            <div className="text-center">
              <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No video loaded</p>
              <Button onClick={triggerFileUpload} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </div>
          </div>
        )}

        {/* Progress Bar Overlay - Always visible when video is loaded */}
        {videoSrc && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div
              ref={progressRef}
              className="w-full h-2 bg-black/50 rounded-full cursor-pointer relative"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-150"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
              {lastClickedTime !== null && duration > 0 && (
                <div
                  className="absolute top-0 w-1 h-full bg-red-500 rounded-full opacity-80"
                  style={{ left: `${(lastClickedTime / duration) * 100}%` }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {(!isKeyboardNavigating || document.fullscreenElement) && (
        <div className="p-4 bg-card">
          {/* Control Buttons and Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={triggerFileUpload} className="p-2">
                <Upload className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={togglePlayPause} className="p-2" disabled={!videoSrc}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleMute} className="p-2" disabled={!videoSrc}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  disabled={!videoSrc}
                  className="w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>

              <div className="text-sm text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {lastClickedTime !== null && (
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  Last: {formatTime(lastClickedTime)}
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="p-2" disabled={!videoSrc}>
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t bg-muted/30">
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Custom Timestamps (MM:SS)</h3>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(customTimestamps).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <label className="text-xs font-medium text-muted-foreground uppercase">{key} key</label>
              <Input
                type="text"
                value={formatTimeForInput(value)}
                onChange={(e) => handleCustomTimestampChange(key as keyof typeof customTimestamps, e.target.value)}
                className="w-full text-center text-sm"
                placeholder="0:00"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
