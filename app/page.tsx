import VideoPlayer from "@/components/video-player"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <VideoPlayer />
      </div>
    </main>
  )
}
