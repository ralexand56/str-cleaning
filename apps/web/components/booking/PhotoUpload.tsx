'use client'

import { useRef, useState } from 'react'
import { uploadData } from 'aws-amplify/storage'

const MAX_PHOTOS = 10
const MAX_BYTES = 10 * 1024 * 1024

interface Photo {
  id: string
  name: string
  previewUrl: string
  status: 'uploading' | 'done' | 'failed'
  key?: string
}

/**
 * Optional photos (plan §6 step 7). Uploads go straight to S3 under booking-photos/<requestId>/,
 * which guests may write but not read back; admins view them on the job page.
 */
export function PhotoUpload({ requestId, onChange }: { requestId: string; onChange: (keys: string[]) => void }) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function publish(next: Photo[]) {
    onChange(next.filter((p) => p.status === 'done' && p.key).map((p) => p.key!))
  }

  function patch(id: string, change: Partial<Photo>) {
    setPhotos((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...change } : p))
      publish(next)
      return next
    })
  }

  async function addFiles(files: FileList | null) {
    if (!files) return
    setMessage('')
    const room = MAX_PHOTOS - photos.length
    const chosen = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (chosen.length > room) setMessage(`You can add up to ${MAX_PHOTOS} photos.`)
    for (const file of chosen.slice(0, room)) {
      if (file.size > MAX_BYTES) {
        setMessage(`${file.name} is over 10 MB, so we skipped it.`)
        continue
      }
      const id = crypto.randomUUID()
      const safe = file.name.replace(/[^\w.-]+/g, '_').slice(-60) || 'photo.jpg'
      const key = `booking-photos/${requestId}/${id.slice(0, 8)}-${safe}`
      setPhotos((prev) => [...prev, { id, name: file.name, previewUrl: URL.createObjectURL(file), status: 'uploading' }])
      try {
        await uploadData({ path: key, data: file, options: { contentType: file.type } }).result
        patch(id, { status: 'done', key })
      } catch (err) {
        console.error('Photo upload failed', err)
        patch(id, { status: 'failed' })
      }
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  function remove(id: string) {
    setPhotos((prev) => {
      const next = prev.filter((p) => p.id !== id)
      publish(next)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-marcellus text-sm opacity-60 max-w-lg">
        Optional, but it helps a lot: photos of the kitchen, bathrooms and any problem areas let us confirm your price without a visit.
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {photos.map((p) => (
          <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden border border-dark-brown/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.previewUrl} alt={p.name} className={`w-full h-full object-cover ${p.status === 'done' ? '' : 'opacity-40'}`} />
            {p.status !== 'done' && (
              <span className="absolute inset-x-0 bottom-0 bg-stone/90 text-center font-marcellus text-[11px] py-1">
                {p.status === 'uploading' ? 'Uploading…' : 'Failed'}
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(p.id)}
              aria-label={`Remove ${p.name}`}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-dark-brown text-stone text-sm leading-none cursor-pointer border-none"
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <label className="aspect-square rounded-xl border border-dashed border-dark-brown/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-dark-brown/60 font-marcellus text-xs text-center px-2">
            <span className="text-2xl leading-none">+</span>
            Add photos
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      {message && <p className="font-marcellus text-xs opacity-60">{message}</p>}
    </div>
  )
}
